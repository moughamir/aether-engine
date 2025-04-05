import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import * as CANNON from 'cannon'



import { Entity } from '@aether/shared';

export class EntityManager {
  private supabase: SupabaseClient;
  private redis: Redis;
  private physicsWorld: CANNON.World;

  constructor(supabase: SupabaseClient, redis: Redis) {
    this.supabase = supabase;
    this.redis = redis;
    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0, -9.82, 0);
  }

  async processPhysics(roomStates: any[]) {
    await Promise.all(roomStates.map(async (room) => {
      const physicsState = await this.redis.get(`physics:${room.id}`);
      const bodies = this.loadPhysicsBodies(physicsState || '');

      // Simulation step
      this.physicsWorld.step(1 / 60);

      // Update Redis state
      const newState = bodies.map((body: CANNON.Body) => ({
        id: body.id,
        position: body.position,
        quaternion: body.quaternion
      }));
      await this.redis.set(`physics:${room.id}`, JSON.stringify(newState));
    }));
  }

  private loadPhysicsBodies(state: string) {
    if (!state) return [];

    const bodiesData = JSON.parse(state);
    return bodiesData.map((bodyData: any) => {
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(bodyData.position.x, bodyData.position.y, bodyData.position.z),
        quaternion: new CANNON.Quaternion(
          bodyData.quaternion.x,
          bodyData.quaternion.y,
          bodyData.quaternion.z,
          bodyData.quaternion.w
        )
      });
      body.addShape(new CANNON.Sphere(1));
      this.physicsWorld.addBody(body);
      return body;
    });
  }

  // Add transaction support
  public async createEntity(entity: Entity): Promise<void> {
    try {
      await this.redis.multi()
        .set(`entity:${entity.id}`, JSON.stringify(entity))
        .sadd(`room:${entity.components.roomId}:entities`, entity.id)
        .exec();

      const { error } = await this.supabase
        .from('entities')
        .insert({
          id: entity.id,
          type: entity.type,
          components: entity.components,
          owner_id: entity.components.ownerId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Entity creation failed:', error);
      throw error; // Re-throw for proper error handling
    }
  }

  public async getEntity(id: string): Promise<Entity | null> {
    // Try to get from Redis first
    const entityData = await this.redis.get(`entity:${id}`);

    if (entityData) {
      return JSON.parse(entityData);
    }

    // If not in Redis, try Supabase
    const { data, error } = await this.supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    // Convert from DB format to Entity format
    const entity: Entity = {
      id: data.id,
      type: data.type,
      components: data.components
    };

    // Cache in Redis for next time
    await this.redis.set(`entity:${id}`, JSON.stringify(entity));

    return entity;
  }

  public async updateEntity(id: string, update: Partial<Entity>): Promise<void> {
    // Get current entity
    const entity = await this.getEntity(id);

    if (!entity) {
      throw new Error(`Entity ${id} not found`);
    }

    // Apply updates
    const updatedEntity: Entity = {
      ...entity,
      ...update,
      components: {
        ...entity.components,
        ...(update.components || {})
      }
    };

    // Update in Redis
    await this.redis.set(`entity:${id}`, JSON.stringify(updatedEntity));

    // Update in Supabase
    try {
      await this.supabase
        .from('entities')
        .update({
          type: updatedEntity.type,
          components: updatedEntity.components
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating entity in Supabase:', error);
    }
  }

  public async deleteEntity(id: string): Promise<void> {
    // Get entity to find its room
    const entity = await this.getEntity(id);

    if (entity && entity.components.roomId) {
      // Remove from room's entity set
      await this.redis.srem(`room:${entity.components.roomId}:entities`, id);
    }

    // Remove from Redis
    await this.redis.del(`entity:${id}`);

    // Remove from Supabase
    try {
      await this.supabase
        .from('entities')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error deleting entity from Supabase:', error);
    }
  }

  public update(): void {
    // This method would be called on each game tick
    // It could update entity states, run game logic, etc.
    // For now, it's a placeholder
  }

  // 6. Performance Optimization
  // 1. **Entity Batching**:
  // Update batchUpdate method
  public async batchUpdate(updates: Array<{id: string; update: Partial<Entity>}>): Promise<void> {
    const pipeline = this.redis.pipeline();
    const supabaseUpdates: any[] = []; // Explicitly type the array

    for (const {id, update} of updates) {
      const entity = await this.getEntity(id);
      if (!entity) continue;

      const updatedEntity: Entity = {
        ...entity,
        ...update,
        components: {
          ...entity.components,
          ...(update.components || {})
        }
      };

      pipeline.set(`entity:${id}`, JSON.stringify(updatedEntity));
      supabaseUpdates.push({
        id,
        type: updatedEntity.type,
        components: updatedEntity.components,
        owner_id: updatedEntity.components.ownerId
      });
    }

    await pipeline.exec();
    await this.supabase.from('entities').upsert(supabaseUpdates);
  }
}

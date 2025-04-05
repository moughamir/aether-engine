"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = void 0;
class EntityManager {
    constructor(supabase, redis) {
        Object.defineProperty(this, "supabase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "redis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.supabase = supabase;
        this.redis = redis;
    }
    // Add transaction support
    async createEntity(entity) {
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
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Entity creation failed:', error);
            throw error; // Re-throw for proper error handling
        }
    }
    async getEntity(id) {
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
        const entity = {
            id: data.id,
            type: data.type,
            components: data.components
        };
        // Cache in Redis for next time
        await this.redis.set(`entity:${id}`, JSON.stringify(entity));
        return entity;
    }
    async updateEntity(id, update) {
        // Get current entity
        const entity = await this.getEntity(id);
        if (!entity) {
            throw new Error(`Entity ${id} not found`);
        }
        // Apply updates
        const updatedEntity = {
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
        }
        catch (error) {
            console.error('Error updating entity in Supabase:', error);
        }
    }
    async deleteEntity(id) {
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
        }
        catch (error) {
            console.error('Error deleting entity from Supabase:', error);
        }
    }
    update() {
        // This method would be called on each game tick
        // It could update entity states, run game logic, etc.
        // For now, it's a placeholder
    }
    // 6. Performance Optimization
    // 1. **Entity Batching**:
    async batchUpdate(updates) {
        const pipeline = this.redis.pipeline();
        const supabaseUpdates = [];
        for (const { id, update } of updates) {
            // ... batch processing logic
        }
        await pipeline.exec();
        await this.supabase.from('entities').upsert(supabaseUpdates);
    }
}
exports.EntityManager = EntityManager;

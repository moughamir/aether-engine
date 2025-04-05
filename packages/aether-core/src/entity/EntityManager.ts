import { Entity } from '@aether/shared';
import { AetherApp } from '../AetherApp';
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'eventemitter3';

export class EntityManager extends EventEmitter {
  private app: AetherApp;
  private entities: Map<string, Entity> = new Map();
  
  constructor(app: AetherApp) {
    super();
    this.app = app;
  }
  
  public create(type: string, components: Record<string, any> = {}, id?: string): Entity {
    const entityId = id || uuidv4();
    
    const entity: Entity = {
      id: entityId,
      type,
      components
    };
    
    this.entities.set(entityId, entity);
    this.emit('entityCreated', entity);
    
    return entity;
  }
  
  public get(id: string): Entity | undefined {
    return this.entities.get(id);
  }
  
  public getAll(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  public getByType(type: string): Entity[] {
    return this.getAll().filter(entity => entity.type === type);
  }
  
  public update(deltaTime: number): void {
    // Update all entities
    this.entities.forEach(entity => {
      // Emit update event for each entity
      this.emit('entityUpdate', entity, deltaTime);
    });
  }
  
  public remove(id: string): boolean {
    const entity = this.entities.get(id);
    if (entity) {
      this.entities.delete(id);
      this.emit('entityRemoved', entity);
      return true;
    }
    return false;
  }
  
  public clear(): void {
    this.entities.clear();
    this.emit('entitiesCleared');
  }
}
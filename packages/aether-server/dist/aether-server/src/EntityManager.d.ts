import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { Entity } from '@aether/shared';
export declare class EntityManager {
    private supabase;
    private redis;
    constructor(supabase: SupabaseClient, redis: Redis);
    createEntity(entity: Entity): Promise<void>;
    getEntity(id: string): Promise<Entity | null>;
    updateEntity(id: string, update: Partial<Entity>): Promise<void>;
    deleteEntity(id: string): Promise<void>;
    update(): void;
    batchUpdate(updates: Array<{
        id: string;
        update: Partial<Entity>;
    }>): Promise<void>;
}

import { EntityManager } from '../EntityManager';
import { v4 as uuidv4 } from 'uuid';

describe('EntityManager', () => {
  let em: EntityManager;

  beforeEach(() => {
    em = new EntityManager();
  });

  test('should create entities with ID', () => {
    const entity = em.create('testType');
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe('string');
  });

  test('should create entities with custom ID', () => {
    const customId = uuidv4();
    const entity = em.create('testType', {}, customId);
    expect(entity.id).toBe(customId);
  });

  test('should retrieve entities by ID', () => {
    const entity = em.create('testType');
    const found = em.get(entity.id);
    expect(found).toEqual(entity);
  });

  test('should retrieve all entities', () => {
    em.create('type1');
    em.create('type2');
    expect(em.getAll().length).toBe(2);
  });

  test('should filter entities by type', () => {
    em.create('type1');
    em.create('type2');
    em.create('type1');
    expect(em.getByType('type1').length).toBe(2);
  });

  test('should remove entities', () => {
    const entity = em.create('testType');
    expect(em.remove(entity.id)).toBe(true);
    expect(em.get(entity.id)).toBeUndefined();
  });

  test('should clear all entities', () => {
    em.create('type1');
    em.create('type2');
    em.clear();
    expect(em.getAll().length).toBe(0);
  });
});

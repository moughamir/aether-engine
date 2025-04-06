import { EntityManager } from '../EntityManager';

describe('EntityManager', () => {
  test('should create entities', () => {
    const em = new EntityManager();
    const entity = em.createEntity();
    expect(entity.id).toBeDefined();
  });
});

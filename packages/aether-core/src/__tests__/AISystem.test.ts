import AISystem from '../aiSystem';
import type { AIBehavior, AIState } from '../types';

describe('AISystem', () => {
  let system: AISystem<AIState>;
  let mockBehavior: AIBehavior;
  let initialState: AIState;

  beforeEach(() => {
    initialState = {
      sensors: {},
      currentBehavior: undefined,
    };
    system = new AISystem(initialState);
    mockBehavior = {
      execute: jest.fn(),
      dispose: jest.fn(),
    };
  });

  test('should initialize with state', () => {
    expect(system).toBeDefined();
    expect(initialState.sensors).toEqual({});
  });

  test('should register behaviors', () => {
    system.registerBehavior('test', mockBehavior);
    expect(mockBehavior).toBeDefined();
  });

  test('should process inputs and update state', () => {
    system.processInputs({ vision: 'enemy' });
    expect(initialState.sensors.vision).toBe('enemy');
  });

  test('should update physics state', () => {
    system.onPhysicsUpdate({ position: { x: 10, y: 0, z: 0 } });
    expect(initialState.physicsBody?.position.x).toBe(10);
  });

  test('should execute current behavior', () => {
    initialState.currentBehavior = mockBehavior;
    system.updateAIState();
    expect(mockBehavior.execute).toHaveBeenCalledWith(initialState);
  });

  test('should dispose resources', () => {
    system.registerBehavior('test', mockBehavior);
    system.dispose();
    expect(mockBehavior.dispose).toHaveBeenCalled();
  });
});

import type { AIBehavior, AIState, Disposable } from "./types";

export default class AISystem<T extends AIState> implements Disposable {
  private aiState: T;
  private behaviors: Map<string, AIBehavior> = new Map();

  constructor(initialState: T) {
    this.aiState = initialState;
    this.initializeAIComponents();
  }

  private initializeAIComponents() {
    this.aiState.sensors = {};
  }

  registerBehavior(name: string, behavior: AIBehavior) {
    this.behaviors.set(name, behavior);
  }

  processInputs(inputs: Record<string, any>) {
    // Process sensor inputs and update state
    Object.entries(inputs).forEach(([key, value]) => {
      this.aiState.sensors[key] = value;
    });
  }

  onPhysicsUpdate(bodyState: any) {
    this.aiState.physicsBody = bodyState;
  }

  updateAIState() {
    this.aiState.currentBehavior?.execute(this.aiState);
  }

  dispose() {
    this.behaviors.forEach((behavior) => behavior.dispose());
    this.behaviors.clear();
    this.aiState = null as unknown as T;
  }
}

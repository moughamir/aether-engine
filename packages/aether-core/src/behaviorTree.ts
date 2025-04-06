import type { NodeStatus, Disposable } from "./types";

export abstract class BehaviorNode<T extends object>
  implements BehaviorNode<T>
{
  abstract tick(agent: BaseAgent<T>): NodeStatus;
  dispose() {}
}

export class Selector<T extends object> extends BehaviorNode<T> {
  constructor(private nodes: BehaviorNode<T>[]) {
    super();
  }

  tick(agent: BaseAgent<T>): NodeStatus {
    for (const node of this.nodes) {
      const status = node.tick(agent);
      if (status !== "FAILURE") return status;
    }
    return "FAILURE";
  }
}

export class Sequence<T extends object> extends BehaviorNode<T> {
  constructor(private nodes: BehaviorNode<T>[]) {
    super();
  }

  tick(agent: BaseAgent<T>): NodeStatus {
    for (const node of this.nodes) {
      const status = node.tick(agent);
      if (status !== "SUCCESS") return status;
    }
    return "SUCCESS";
  }
}

export abstract class BaseAgent<T extends object>
  implements BaseAgent<T>, Disposable
{
  private activeTree?: BehaviorNode<T>;

  constructor(
    public state: T,
    private rootNode: BehaviorNode<T>
  ) {}

  update() {
    this.activeTree = this.rootNode;
    return this.activeTree.tick(this);
  }

  dispose() {
    this.activeTree?.dispose();
  }
}

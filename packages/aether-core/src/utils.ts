import { throttle, invariant, debounce, memoize } from "@aether/shared";

/**
 * @deprecated Use the utilities from @aether/shared instead
 */
export class LifecycleUtils {
  /**
   * @deprecated Use throttle from @aether/shared instead
   */
  static throttle = throttle;

  /**
   * @deprecated Use invariant from @aether/shared instead
   */
  static invariant = invariant;

  /**
   * @deprecated Use debounce from @aether/shared instead
   */
  static debounce = debounce;

  /**
   * @deprecated Use memoize from @aether/shared instead
   */
  static memoize = memoize;
}

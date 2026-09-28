import { ActionCreatorTypeMetadata } from './type-helpers';
import {
  checkInvalidActionCreatorInArray,
  checkIsEmpty,
  throwIsEmpty,
} from './utils/validation';

export type ActionCreator<T extends { type: string }> = ((
  ...args: any[]
) => T) &
  ActionCreatorTypeMetadata<T['type']>;

type AsyncActionCreators = {
  request: ActionCreator<{ type: string }>;
  success: ActionCreator<{ type: string }>;
  failure: ActionCreator<{ type: string }>;
  cancel?: ActionCreator<{ type: string }>;
};

type ActionCreatorSource =
  | ActionCreator<{ type: string }>
  | AsyncActionCreators;

type CreatorOf<AC extends ActionCreatorSource> = AC extends ActionCreator<{
  type: string;
}>
  ? AC
  : AC extends AsyncActionCreators
  ? Extract<
      AC[Extract<keyof AC, 'request' | 'success' | 'failure' | 'cancel'>],
      ActionCreator<{ type: string }>
    >
  : never;

/**
 * @description check whether an action matches a creator or an async-action group
 * @description narrows discriminated unions; accepts arrays and a curried form
 */
export function isActionOf<AC extends ActionCreatorSource>(
  actionCreator: AC | AC[],
  action: { type: string }
): action is ReturnType<CreatorOf<AC>>;

/**
 * @description curried guard for a creator, async-action group, or array of either
 */
export function isActionOf<AC extends ActionCreatorSource>(
  actionCreator: AC | AC[]
): (action: { type: string }) => action is ReturnType<CreatorOf<AC>>;

/**
 * implementation
 */
export function isActionOf<AC extends ActionCreatorSource>(
  actionCreatorOrCreators: AC | AC[],
  action?: { type: string }
) {
  if (checkIsEmpty(actionCreatorOrCreators)) {
    throwIsEmpty(1);
  }

  const sources: ActionCreatorSource[] = Array.isArray(actionCreatorOrCreators)
    ? actionCreatorOrCreators
    : [actionCreatorOrCreators];
  const actionCreators: Array<ActionCreator<{ type: string }>> = [];

  sources.forEach(source => {
    if (
      source != null &&
      typeof source === 'object' &&
      'request' in source &&
      'success' in source &&
      'failure' in source
    ) {
      // createAsyncAction includes an undefined cancel property when omitted.
      actionCreators.push(source.request, source.success, source.failure);
      if (source.cancel !== undefined) {
        actionCreators.push(source.cancel);
      }
    } else {
      actionCreators.push(source as ActionCreator<{ type: string }>);
    }
  });

  actionCreators.forEach(checkInvalidActionCreatorInArray);

  const assertFn = (_action: { type: string }) =>
    actionCreators.some(
      actionCreator => _action.type === actionCreator.getType!()
    );

  if (action === undefined) {
    return assertFn;
  }
  return assertFn(action);
}

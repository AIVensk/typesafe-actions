import { createAction } from './create-action';
import { createAsyncAction } from './create-async-action';
import { isActionOf } from './is-action-of';
import { ActionType } from './type-helpers';

const fetch = createAsyncAction('REQUEST', 'SUCCESS', 'FAILURE')<
  string,
  number[],
  Error
>();
const cancellable = createAsyncAction('START', 'DONE', 'ERROR', 'CANCEL')<
  void,
  number,
  Error,
  string
>();
const other = createAction('OTHER')<boolean>();
const allActions = [fetch.request('id'), fetch.success([1]), other(true)];

describe('isActionOf async-action groups', () => {
  it('matches all phases and rejects unrelated actions in both call forms', () => {
    [
      fetch.request('id'),
      fetch.success([1]),
      fetch.failure(new Error()),
    ].forEach(action => {
      expect(isActionOf(fetch, action)).toBe(true);
      expect(isActionOf(fetch)(action)).toBe(true);
    });
    expect(isActionOf(fetch, other(true))).toBe(false);
    expect(isActionOf(fetch)(other(true))).toBe(false);
  });

  it('matches cancellation only for the group that declares it', () => {
    expect(isActionOf(cancellable, cancellable.cancel('stop'))).toBe(true);
    expect(isActionOf(fetch, cancellable.cancel('stop'))).toBe(false);
  });

  it('supports groups mixed with creators and multiple async groups', () => {
    expect(isActionOf([fetch, other], other(true))).toBe(true);
    expect(isActionOf([fetch, cancellable], cancellable.success(2))).toBe(true);
    expect(isActionOf([], other(true))).toBe(false);
  });

  it('rejects malformed required creators instead of silently dropping them', () => {
    expect(() => isActionOf({ ...fetch, request: undefined } as any)).toThrow();
    expect(() => isActionOf({ ...fetch, success: {} } as any)).toThrow();
    expect(() => isActionOf({ ...fetch, cancel: null } as any)).toThrow();
    expect(() => isActionOf(null as any)).toThrow('Argument 1 is empty.');
  });
});

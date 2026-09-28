import { createAction } from './create-action';
import { createAsyncAction } from './create-async-action';
import { isActionOf } from './is-action-of';
import * as TH from './type-helpers';

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
const allActions: Array<TH.ActionType<typeof fetch | typeof other>> = [
  fetch.request('id'),
  fetch.success([1]),
  other(true),
];

// @dts-jest:group async groups preserve action unions
{
  const filtered = allActions.filter(isActionOf(fetch));
  // @dts-jest:pass:snap -> (TH.PayloadAction<"REQUEST", string> | TH.PayloadAction<"SUCCESS", number[]> | TH.PayloadAction<"FAILURE", Error>)[]
  filtered;

  const cancelActions: Array<
    TH.ActionType<typeof cancellable | typeof other>
  > = [cancellable.cancel('reason'), other(false)];
  const withCancel = cancelActions.filter(isActionOf(cancellable));
  // @dts-jest:pass:snap -> (TH.PayloadAction<"START", void> | TH.PayloadAction<"DONE", number> | TH.PayloadAction<"ERROR", Error> | TH.PayloadAction<"CANCEL", string>)[]
  withCancel;

  const mixed = allActions.filter(isActionOf([fetch, other]));
  // @dts-jest:pass:snap -> (TH.PayloadAction<"REQUEST", string> | TH.PayloadAction<"SUCCESS", number[]> | TH.PayloadAction<"FAILURE", Error> | TH.PayloadAction<"OTHER", boolean>)[]
  mixed;

  const action = other(true) as TH.ActionType<typeof fetch | typeof other>;
  if (isActionOf(fetch, action)) {
    // @dts-jest:pass:snap -> TH.PayloadAction<"REQUEST", string> | TH.PayloadAction<"SUCCESS", number[]> | TH.PayloadAction<"FAILURE", Error>
    action;
    if (action.type === 'SUCCESS') {
      // @dts-jest:pass:snap -> number[]
      action.payload;
    }
  }
}

// @dts-jest:group rejects incomplete groups at compile time
{
  const filtered = allActions.filter(isActionOf(fetch));
  // @dts-jest:fail:snap -> Type 'PayloadAction<"OTHER", boolean>' is not assignable to type 'PayloadAction<"REQUEST", string> | PayloadAction<"SUCCESS", number[]> | PayloadAction<"FAILURE", Error>'.
  const invalid: typeof filtered = [other(true)];
  // @dts-jest:fail:snap -> Argument of type '{ request: TH.PayloadActionCreator<"REQUEST", string>; }' is not assignable to parameter of type 'AsyncActionCreators | ActionCreator<{ type: string; }> | ActionCreatorSource[]'.
  isActionOf({ request: fetch.request });
  // @dts-jest:fail:snap -> Argument of type '{ success: number; request: TH.PayloadActionCreator<"REQUEST", string>; failure: TH.PayloadActionCreator<"FAILURE", Error>; }' is not assignable to parameter of type 'AsyncActionCreators | ActionCreator<{ type: string; }> | ActionCreatorSource[]'.
  isActionOf({ ...fetch, success: 42 });
}

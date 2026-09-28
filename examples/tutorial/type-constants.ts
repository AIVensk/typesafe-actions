import { action, ActionType, createAsyncAction, isOfType } from '../../src';
import { Todo, TodosState, initialState } from './model';

// Literal constants retain the discriminant used by the reducer and guards.
export const ADD = 'todos/ADD';
export const TOGGLE = 'todos/TOGGLE';
export const FETCH = 'todos/FETCH';
export const FETCH_OK = 'todos/FETCH_OK';
export const FETCH_ERROR = 'todos/FETCH_ERROR';

export const add = (todo: Todo) => action(ADD, todo);
export const toggle = (id: string) => action(TOGGLE, id);
export const fetchTodos = createAsyncAction(FETCH, FETCH_OK, FETCH_ERROR)<
  void,
  Todo[],
  Error
>();
export const actions = { add, toggle, fetchTodos };
export type TodoAction = ActionType<typeof actions>;

export function reducer(
  state: TodosState = initialState,
  next: TodoAction
): TodosState {
  switch (next.type) {
    case ADD:
      return { ...state, items: [...state.items, next.payload] };
    case TOGGLE:
      return {
        ...state,
        items: state.items.map(todo =>
          todo.id === next.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case FETCH:
      return { ...state, loading: true, error: null };
    case FETCH_OK:
      return { ...state, loading: false, items: next.payload };
    case FETCH_ERROR:
      return { ...state, loading: false, error: next.payload.message };
    default:
      return state;
  }
}

export function addedTodos(history: TodoAction[]): Todo[] {
  return history.filter(isOfType(ADD)).map(next => next.payload);
}

// The API and dispatch are injected; no middleware is required by this example.
export async function loadTodos(
  dispatch: (next: TodoAction) => void,
  getTodos: () => Promise<Todo[]>
): Promise<void> {
  dispatch(fetchTodos.request());
  try {
    dispatch(fetchTodos.success(await getTodos()));
  } catch (error) {
    dispatch(
      fetchTodos.failure(
        error instanceof Error ? error : new Error(String(error))
      )
    );
  }
}

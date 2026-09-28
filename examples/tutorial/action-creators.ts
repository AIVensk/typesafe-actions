import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
  isActionOf,
} from '../../src';
import { Todo, TodosState, initialState } from './model';

// v5: the final call creates the typed action creator.
export const add = createAction('todos/ADD')<Todo>();
export const toggle = createAction('todos/TOGGLE')<string>();
export const fetchTodos = createAsyncAction(
  'todos/FETCH',
  'todos/FETCH_OK',
  'todos/FETCH_ERROR'
)<void, Todo[], Error>();
export const actions = { add, toggle, fetchTodos };
export type TodoAction = ActionType<typeof actions>;

export const reducer = createReducer<TodosState, TodoAction>(initialState)
  .handleAction(add, (state, next) => ({
    ...state,
    items: [...state.items, next.payload],
  }))
  .handleAction(toggle, (state, next) => ({
    ...state,
    items: state.items.map(todo =>
      todo.id === next.payload ? { ...todo, completed: !todo.completed } : todo
    ),
  }))
  .handleAction(fetchTodos.request, state => ({
    ...state,
    loading: true,
    error: null,
  }))
  .handleAction(fetchTodos.success, (state, next) => ({
    ...state,
    loading: false,
    items: next.payload,
  }))
  .handleAction(fetchTodos.failure, (state, next) => ({
    ...state,
    loading: false,
    error: next.payload.message,
  }));

export function addedTodos(history: TodoAction[]): Todo[] {
  return history.filter(isActionOf(add)).map(next => next.payload);
}

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

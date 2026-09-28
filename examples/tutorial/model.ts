export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodosState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

export const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
};

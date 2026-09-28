import {
  actions as constantActions,
  addedTodos as constantAddedTodos,
  reducer as constantReducer,
  loadTodos as constantLoadTodos,
  TodoAction,
} from '../examples/tutorial/type-constants';
import {
  actions as creatorActions,
  addedTodos as creatorAddedTodos,
  reducer as creatorReducer,
  loadTodos as creatorLoadTodos,
} from '../examples/tutorial/action-creators';
import { Todo } from '../examples/tutorial/model';

const constants = {
  ...constantActions,
  addedTodos: constantAddedTodos,
  reducer: constantReducer,
  loadTodos: constantLoadTodos,
};
const creators = {
  ...creatorActions,
  addedTodos: creatorAddedTodos,
  reducer: creatorReducer,
  loadTodos: creatorLoadTodos,
};

[constants, creators].forEach(path => {
  describe(
    path === constants ? 'tutorial: type constants' : 'tutorial: creators',
    () => {
      const todo: Todo = {
        id: 'one',
        title: 'Read the tutorial',
        completed: false,
      };

      it('adds, toggles and narrows actions without mutating previous state', () => {
        const first = path.reducer(undefined, path.add(todo));
        const next = path.reducer(first, path.toggle('one'));
        expect(first.items[0].completed).toBe(false);
        expect(next.items[0].completed).toBe(true);
        expect(path.addedTodos([path.add(todo), path.toggle('one')])).toEqual([
          todo,
        ]);
      });

      it('dispatches a typed request and success and clears loading', async () => {
        let state = path.reducer(undefined, path.toggle('missing'));
        const dispatch = (next: TodoAction) => {
          state = path.reducer(state, next);
        };
        const pending = path.loadTodos(dispatch, () => Promise.resolve([todo]));
        expect(state.loading).toBe(true);
        await pending;
        expect(state).toEqual({ items: [todo], loading: false, error: null });
      });

      it('normalizes unknown rejection values and clears loading', async () => {
        const history: TodoAction[] = [];
        await path.loadTodos(
          next => history.push(next),
          () => Promise.reject('offline')
        );
        expect(history[0]).toEqual(path.fetchTodos.request());
        const state = history.reduce(path.reducer, undefined);
        expect(state).toEqual({ items: [], loading: false, error: 'offline' });
      });
    }
  );
});

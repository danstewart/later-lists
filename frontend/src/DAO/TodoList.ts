import { ITodoList, TodoList } from '/Models/TodoList';
import { API as BaseAPI, LocalStorage as BaseLocalStorage } from './Base';

class API extends BaseAPI<ITodoList> {
	endpoint: string = 'http://127.0.0.1:3030/api/lists';
}

class LocalStorage extends BaseLocalStorage<ITodoList> {}

export {
	API as TodoListAPI,
	LocalStorage as TodoListLocalStorage,
};


// Make shift settings config
// Will one day come from the database and be configured per user

import { TodoLocalStorage, TodoAPI } from './DAO/TodoItem';
import { TodoListLocalStorage, TodoListAPI } from './DAO/TodoList';

const DefaultSettings = {
	DAO: {
		Todo: new TodoAPI(),
		TodoList: new TodoListAPI(),
	},
	DateFormat: 'YYYY-MM-DD HH:mm',
}

export { DefaultSettings as Settings };

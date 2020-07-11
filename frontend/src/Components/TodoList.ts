// Collection of `TodoItem`s

import m, { Vnode } from 'mithril';
import { TodoItemBuilder } from '/Components/TodoItem';
import { TodoList } from '/Models/TodoList';

class TodoListBuilder {
	private todos: TodoList;

	constructor(todoList: TodoList) {
		this.todos = todoList;
	}

	view({ attrs }): Vnode {
		return m('div', [
			this.todos.allVisible().map(todo => new TodoItemBuilder(todo).view({ attrs }))
		])
	}
}

export { TodoListBuilder };

// Collection of `TodoItem`s

import m, { Vnode } from 'mithril';
import { TodoItemBuilder } from '/Components/TodoItem';
import { TodoList } from '/Models/TodoList';

class TodoListBuilder {
	private list: TodoList;

	constructor(todoList: TodoList) {
		this.list = todoList;
	}

	view({ attrs }): Vnode {
		return m('div', [
			this.list.all().map(todo => new TodoItemBuilder(todo).view({ attrs }))
		]);
	}
}

export { TodoListBuilder };

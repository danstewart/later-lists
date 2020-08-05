// Collection of `TodoItem`s

import m, { Vnode } from 'mithril';
import { TodoItemBuilder } from './TodoItemBuilder';
import { TodoList } from '/Models/TodoList';

class TodoListBuilder {
	private list: TodoList;

	constructor(todoList: TodoList) {
		this.list = todoList;
	}

	view({ attrs }): Vnode {
		if (!this.list.visible()) return;

		// 1.25rem to match box padding:
		// https://github.com/jgthms/bulma/blob/1083f017a06b44d6f1e315de2b384798e69aeb35/docs/_sass/callout.sass#L5
		return m('div', { style: 'margin-bottom: 1.25rem' }, [
			this.list.all().map(todo => new TodoItemBuilder(todo).view({ attrs }))
		]);
	}
}

export { TodoListBuilder };

import m, { Vnode } from 'mithril';
import { TodoItem } from './TodoItem';
import { Store } from '../store';

interface Todos {
	[id: number]: TodoItem
}

class TodoList {
	private static instance: TodoList;
	private static todos: Todos = {};
	private store: Store;

	constructor() {
		if (TodoList.instance) {
			return TodoList.instance;
		}

		this.store = new Store();
		this.oninit();

		// Whenever a todo changes restore in localStorage
		this.store.subscribe('todos', () => this.save());

		TodoList.instance = this;
	}

	filtered() {
		return this.all().filter(todo => {
			if (todo.archived) return false;

			if (this.store['tagFilter']) {
				if (!todo._tags.has(this.store['tagFilter'])) {
					return false;
				}
			}

			return true;
		});
	}

	edit(id, edit) {
		TodoList.todos[id].update(edit);
	}

	push(todo: TodoItem): TodoList {
		TodoList.todos[todo.id] = todo;
		this.store.publish('todos');
		return this;
	}

	save() {
		localStorage.setItem('todos', JSON.stringify(this.all()))
	}

	all(filter: Function = null): Array<TodoItem> {
		if (filter) {
			return Object.values(TodoList.todos).filter(filter());
		}

		return Object.values(TodoList.todos);
	}

	oninit(): void {
		// Don't init if we already have an instance
		if (TodoList.instance) return;

		const stored = JSON.parse(localStorage.getItem('todos'));

		if (stored) {
			stored.forEach(element => this.push(new TodoItem(element)));
		} else {
			this.push(new TodoItem({ title: 'Example Todo', body: 'This is an example pending todo' }).tag('Example'));
			this.push(new TodoItem({ title: 'Example Todo 2', body: 'This is an example pending todo' }).tag('Example'));
			this.push(new TodoItem({ title: 'Example Todo 3', body: 'This is an example pending todo' }).tag('Example'));
		}

		this.save();
	}

	view({ attrs }): Vnode {
		return m('div', [
			this.filtered().map(todo => todo.view({ attrs }))
		])
	}
}

export {
	TodoList,
}

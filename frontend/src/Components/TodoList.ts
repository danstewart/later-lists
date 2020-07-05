// Collection of `TodoItem`s

import m, { Vnode } from 'mithril';
import { TodoItem } from './TodoItem';
import { Store } from '/store';

import { TodoItemDAO } from './TodoItem/DAO';
import { Settings } from '/settings';

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
		this.storeTags();

		// Whenever a todo changes restore in localStorage
		this.store.subscribe('todos', () => this.save());

		// Whenever a todo changes update the tag list
		this.store.subscribe('todos', () => this.storeTags());

		TodoList.instance = this;
	}

	// All todos in the list that are visible
	allVisible() {
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

	// Helper for editing a specific item in the list
	edit(id, edit) {
		TodoList.todos[id].update(edit);
	}

	// Adds a new item
	push(todo: TodoItem): TodoList {
		TodoList.todos[todo.id] = todo;
		this.store.publish('todos');
		return this;
	}

	// Loads a list from a DAO
	load(dao: TodoItemDAO = Settings.DAO) {
		return dao.fetchAll();
	}

	// Saves a list via the DAO
	save(dao: TodoItemDAO = Settings.DAO) {
		dao.saveAll(this.all());
	}

	// Updates the tags in the memory store
	storeTags() {
		let tags: Set<string> = new Set<string>();

		this.all().filter(t => !t.archived).forEach(todo => {
			Array.from(todo.tags).forEach(tag => tags.add(tag));
		});

		this.store['tags'] = tags;
	}

	// Gets all todos in the list
	all(filter: Function = null): Array<TodoItem> {
		if (filter) {
			return Object.values(TodoList.todos).filter(filter());
		}

		return Object.values(TodoList.todos);
	}

	oninit(): void {
		// Don't init if we already have an instance
		if (TodoList.instance) return;

		const stored = this.load();

		if (stored.length) {
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
			this.allVisible().map(todo => todo.view({ attrs }))
		])
	}
}

export { TodoList };

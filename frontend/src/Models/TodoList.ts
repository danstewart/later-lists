// Collection of `TodoItem`s

import m from 'mithril';
import { ITodo, TodoItem } from '/Models/TodoItem';
import { TodoItemDAO } from '../DAO/TodoItem';
import { Store } from '/store';
import { Settings } from '/settings';

interface ITodos {
	[id: number]: TodoItem
}

class TodoList {
	private static instance: TodoList;
	private static todos: ITodos = {};
	private store: Store;

	constructor() {
		if (TodoList.instance) {
			return TodoList.instance;
		}

		this.store = new Store();

		this.init().then(() => m.redraw());

		// Whenever a todo changes save everything
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
	async load(dao: TodoItemDAO = Settings.DAO): Promise<Array<ITodo>> {
		return dao.fetchAll();
	}

	// Saves a list via the DAO
	async save(dao: TodoItemDAO = Settings.DAO): Promise<any> {
		dao.saveAll(this.all());
		return Promise.resolve();
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

	async init() {
		// Don't init if we already have an instance
		if (TodoList.instance) return;

		let stored = await this.load();

		if (stored.length) {
			stored.forEach(element => this.push(new TodoItem(element)));
		} else {
			this.push(new TodoItem({ title: 'Example Todo', body: 'This is an example pending todo' }).tag('Example'));
			this.push(new TodoItem({ title: 'Example Todo 2', body: 'This is an example pending todo' }).tag('Example'));
			this.push(new TodoItem({ title: 'Example Todo 3', body: 'This is an example pending todo' }).tag('Example'));
			this.save();
		}

		this.storeTags();
		return Promise.resolve();
	}
}

export { TodoList, ITodos };


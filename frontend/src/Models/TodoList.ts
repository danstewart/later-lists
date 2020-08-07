// Collection of `TodoItem`s

import m from 'mithril';
import { ITodo, TodoItem } from '/Models/TodoItem';
import { DAO } from '../DAO/Base';
import { Store } from '/store';
import { v4 as uuidv4 } from 'uuid';
import { Settings } from '/settings';

interface ITodoList {
	id: string,
	name: string,
	todos: Map<string, TodoItem>,
}

const store = new Store();

class TodoList implements ITodoList {
	id: string;
	name: string;
	todos: Map<string, TodoItem>;

	constructor(name: string, id: string = uuidv4()) {
		this.id    = id;
		this.name  = name;
		this.todos = new Map<string, TodoItem>();

		if (!store['lists']) store['lists'] = new Map<string, TodoList>()
		store['lists'].set(this.id, this);
		store.publish('lists');

		// Whenever a todo changes store the lists and save everything
		store.subscribe('todos', () => {
			// let lists = new Set<string>();
			// Array.from(this.todos.values()).filter(t => !t.archived).forEach(t => lists.add(t.list_name));
			// store['lists'] = lists;
			store.publish('lists');
			m.redraw();
		});
	}

	selected() {
		return store['listFilter'] === this.id;
	}

	// All todos in the list that are visible
	visible() {
		if (!store['listFilter']) return true;
		return this.selected();
	}

	// Helper for editing a specific item in the list
	edit(id, edit) {
		this.todos.get(id).update(edit);
	}

	// Adds a new item
	push(todo: TodoItem): TodoList {
		this.todos.set(todo.id, todo);
		// this.store.publish('todos');
		m.redraw();
		return this;
	}

	// Loads a list from a DAO
	async load(dao: DAO<ITodo> = Settings.DAO.Todo): Promise<Array<ITodo>> {
		return dao.fetchAll({ list_id: this.id });
	}

	// Saves a list via the DAO
	async save(dao: DAO<ITodo> = Settings.DAO.Todo): Promise<any> {
		dao.saveAll(this.all());
		return Promise.resolve();
	}

	// Gets all todos in the list
	all(filter: Function = null): Array<TodoItem> {
		if (filter) {
			return Array.from(this.todos.values()).filter(filter());
		}

		return Array.from(this.todos.values());
	}

	async init() {
		// Load todos
		let stored = await this.load();

		if (stored.length) {
			stored.forEach(element => this.push(new TodoItem(element)));
		}

		return Promise.resolve();
	}
}

export { TodoList, ITodoList };


// Collection of `TodoItem`s

import m from 'mithril';
import { ITodo, TodoItem } from '/Models/TodoItem';
import * as DAO from '/Common/DAO';
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

	dao: DAO.DAO<TodoList>;
	initialized: boolean = false;

	constructor() {
		this.dao = DAO.getDefault({ endpoint: 'http://127.0.0.1:3030/api/lists' })
		// this.id    = id;
		// this.name  = name;
		// this.todos = new Map<string, TodoItem>();

		if (!store['lists']) store['lists'] = new Map<string, TodoList>()

		// // Whenever a todo changes store the lists and save everything
		// store.subscribe('todos', () => {
		// 	// let lists = new Set<string>();
		// 	// Array.from(this.todos.values()).filter(t => !t.archived).forEach(t => lists.add(t.list_name));
		// 	// store['lists'] = lists;
		// 	store.publish('lists');
		// 	m.redraw();
		// });
	}

	// Constructor to create a new TodoList
	// or load a prefetched list into an object
	create(name: string, id: string = uuidv4(), todos: Map<string, TodoItem>): TodoList {
		this.id    = id;
		this.name  = name;
		this.todos = todos || new Map<string, TodoItem>();

		this.initialized = true;
		return this;
	}

	async load(id: string): Promise<TodoList> {
		const list = await this.dao.fetchOne(id);

		this.id = list.id;
		this.name = list.name;
		this.todos = list.todos || new Map<string, TodoItem>();

		this.initialized = true;
		return Promise.resolve(this);
	}

	// This feels wrong but I don't know why
	// Guess I'll find out if/when it bites me
	async loadAll() {
		let allLists = await this.dao.fetchAll();
		allLists = await Promise.all(allLists.map(l => new TodoList().load(l.id)));

		return Promise.resolve(allLists);
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

	async save(): Promise<any> {
		// Add this to the store
		store['lists'].set(this.id, this);
		store.publish('lists');

		this.dao.save(this);
		return Promise.resolve();
	}

	// Gets all todos in the list
	all(filter: Function = null): Array<TodoItem> {
		if (filter) {
			return Array.from(this.todos.values()).filter(filter());
		}

		return Array.from(this.todos.values());
	}
}

export { TodoList, ITodoList };


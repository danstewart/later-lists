// Collection of `TodoItem`s

import m from 'mithril';
import { ITodo, TodoItem } from '/Models/TodoItem';
import { DAO } from '../DAO/Base';
import { Store } from '/store';
import { v4 as uuidv4 } from 'uuid';
import { Settings } from '/settings';
import { Dayjs } from 'dayjs';

interface ITodoList {
	id: string,
	name: string,
	todos: {
		[id: string]: TodoItem
	},
}

const store = new Store();

class TodoList {
	id: string;
	name: string;
	todos: {
		[id: string]: TodoItem
	};

	constructor(name: string, id: string = uuidv4()) {
		this.id    = id;
		this.name  = name;
		this.todos = {};

		this.init().then(() => m.redraw());

		if (!store['lists']) store['lists'] = new Set<TodoList>();
		store['lists'].add(this);

		// Whenever a todo changes store the lists and save everything
		/*
		this.store.subscribe('todos', () => {
			let lists = new Set<string>();

			Object.values(this.todos).filter(t => !t.archived).forEach(t => lists.add(t.list));

			this.store['lists'] = lists;
		});
		*/
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
		this.todos[id].update(edit);
	}

	// Adds a new item
	push(todo: TodoItem): TodoList {
		this.todos[todo.id] = todo;
		// this.store.publish('todos');
		m.redraw();
		return this;
	}

	// Loads a list from a DAO
	async load(dao: DAO<ITodo> = Settings.DAO.Todo): Promise<Array<ITodo>> {
		return dao.fetchAll();
	}

	// Saves a list via the DAO
	async save(dao: DAO<ITodo> = Settings.DAO.Todo): Promise<any> {
		dao.saveAll(this.all());
		return Promise.resolve();
	}

	// Gets all todos in the list
	all(filter: Function = null): Array<TodoItem> {
		if (filter) {
			return Object.values(this.todos).filter(filter());
		}

		return Object.values(this.todos);
	}

	async init() {
		// Load todos
		// TODO: Pass the listid to this
		let stored = await this.load();

		if (stored.length) {
			stored.forEach(element => this.push(new TodoItem(element)));
		// } else {
		// 	// Create some example todos
		// 	const lists = [ 'Example', 'Testing', 'Demo' ];
		// 	for (let i=1; i<=20; i++) {
		// 		this.push(new TodoItem({
		// 			title: `Example Todo ${i}`,
		// 			body: 'This is an example pending todo',
		// 			list: lists[Math.floor(Math.random() * lists.length)],
		// 		}));
		// 	}

		// 	this.save();
		}

		return Promise.resolve();
	}
}

export { TodoList, ITodoList };


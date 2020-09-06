import { Store } from '/store';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as uuidv4 } from 'uuid';
import * as DAO from '/Common/DAO';

dayjs.extend(utc);

interface ITodo {
	id?: string,
	title: string,
	body: string,
	list_id: string,
	list_name: string,
	completed?: boolean,
	archived?: boolean,
	created_at?: Dayjs,
}

const store = new Store();

class TodoItem implements ITodo {
	// Stored state
	id: string;
	title: string;
	body: string;
	list_id: string;
	list_name: string;
	completed: boolean;
	archived: boolean;
	created_at: Dayjs;

	fields: Array<string> = ['id', 'name', 'body', 'list_id', 'list_name', 'completed', 'archived', 'created_at'];

	// Front end specific state
	collapsed: boolean = true;
	initialized: boolean = false;
	dao: DAO.DAO<TodoItem>;

	public constructor() {
		this.dao = DAO.getDefault({ endpoint: 'http://127.0.0.1:3030/api/todos' });
	}

	// Constructor to create a new TodoItem
	// or load a prefetched item into an object
	create(args: ITodo) {
		this.id         = args.id || uuidv4();
		this.title      = args.title;
		this.body       = args.body;
		this.list_id    = args.list_id;
		this.list_name  = args.list_name;
		this.completed  = args.completed || false;
		this.archived   = args.archived || false;
		this.created_at = dayjs.utc(args.created_at) || dayjs.utc();

		this.initialized = true;
		return this;
	}

	// Async method to load from database
	async load(id: string) {
		const todo = this.dao.fetchOne(id);

		this.fields.forEach(field => this[field] = todo[field]);

		// TODO
		// this.created_at = dayjs.utc(todo.created_at) || dayjs.utc();

		this.initialized = true;
		return this;
	}

	// Async method to load many from database
	async loadAll(opts: Object) {
		let todos = await this.dao.fetchAll(opts);
		todos = todos.map(t => new TodoItem().create(t));

		return Promise.resolve(todos);
	}

	// Update a todo
	update(args: ITodo) {
		this.fields.forEach(field => {
			if (args[field]) this[field] = args[field];
		})

		this.save();
	}

	// Saves a list via the DAO
	async save(): Promise<any> {
		// Override JSON serialization for DayJS
		this.created_at.toJSON = function() {
			return this.created_at.format("YYYY-MM-DDTHH:mm:ss");
		}

		this.dao.save(this);
		store.publish('todos');
		return Promise.resolve();
	}

	// Change state
	toggleStatus(): void {
		this.completed = !this.completed;
		this.save();
	}

	// Update to be archived
	archive(): void {
		this.archived = true;
		this.save();
	}
}

export { ITodo, TodoItem };

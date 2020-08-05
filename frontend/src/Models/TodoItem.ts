import { Store } from '/store';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as uuidv4 } from 'uuid';
import { Settings } from '/settings';
import { DAO } from '../DAO/Base';

dayjs.extend(utc);

interface ITodo {
	id?: string,
	title: string,
	body: string,
	list_id: string,
	list_name: string,
	completed?: boolean,
	archived?: boolean,
	created?: Dayjs,
}

const store = new Store();

class TodoItem implements ITodo {
	id: string;
	title: string;
	body: string;
	list_id: string;
	list_name: string;
	completed: boolean;
	archived: boolean;
	created: Dayjs;
	collapsed: boolean = true;

	static lastId: number = 0;

	public constructor(args: ITodo) {
		this.id        = args.id || uuidv4();
		this.title     = args.title;
		this.body      = args.body;
		this.list_id   = args.list_id;
		this.list_name = args.list_name;
		this.completed = args.completed || false;
		this.archived  = args.archived || false;
		this.created   = dayjs.utc(args.created) || dayjs.utc();
	}

	// Update a todo
	update(args: ITodo) {
		['id', 'title', 'body', 'list', 'completed', 'archived'].forEach(prop => {
			if (args[prop]) this[prop] = args[prop];
		})

		this.save();
		store.publish('todos');
	}

	// Saves a list via the DAO
	async save(dao: DAO<ITodo> = Settings.DAO.Todo): Promise<any> {
		dao.save(this);
		return Promise.resolve();
	}

	// Change state
	toggleStatus(): void {
		this.completed = !this.completed;
		this.save();
		store.publish('todos');
	}

	// Update to be archived
	archive(): void {
		this.archived = true;
		this.save();
		store.publish('todos');
	}
}

export { ITodo, TodoItem };

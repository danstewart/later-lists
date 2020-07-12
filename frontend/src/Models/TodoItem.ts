import { Store } from '/store';
import { Vnode } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface ITodo {
	id?: number,
	title: string,
	body: string,
	list: string,
	completed?: boolean,
	archived?: boolean,
	created?: Dayjs,
}

const store = new Store();

class TodoItem implements ITodo {
	id: number;
	title: string;
	body: string;
	list: string;
	completed: boolean;
	archived: boolean;
	created: Dayjs;
	collapsed: boolean = true;

	static lastId: number = 0;

	public constructor(args: ITodo) {
		this.id        = args.id || ++TodoItem.lastId;
		this.title     = args.title;
		this.body      = args.body;
		this.list      = args.list;
		this.completed = args.completed || false;
		this.archived  = args.archived || false;
		this.created   = dayjs.utc(args.created) || dayjs.utc();

		// Set the lastId accordingly
		if (args.id && args.id > TodoItem.lastId) {
			TodoItem.lastId = args.id;
		}
	}

	// Update a todo
	update(args: ITodo) {
		['id', 'title', 'body', 'list', 'completed', 'archived'].forEach(prop => {
			if (args[prop]) this[prop] = args[prop];
		})

		store.publish('todos');
	}

	// Change state
	toggleStatus(): void {
		this.completed = !this.completed;
		store.publish('todos');
	}

	// Update to be archived
	archive(): void {
		this.archived = true;
		store.publish('todos');
	}
}

export { ITodo, TodoItem };

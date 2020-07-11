import { Store } from '/store';
import { Vnode } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface ITodo {
	id?: number,
	title: string,
	body: string,
	completed?: boolean,
	archived?: boolean,
	tags?: Array<string>,
	created?: Dayjs,
}

const store = new Store();

class TodoItem implements ITodo {
	id: number;
	title: string;
	body: string;
	completed: boolean;
	archived: boolean;
	created: Dayjs;
	tags: Array<string>;
	collapsed: boolean = true;

	// This is pretty much just a mirror of this.tags
	// We want a Set() since they need to be unique but Sets aren't JSON serializable
	_tags: Set<string>;

	static lastId: number = 0;

	public constructor(args: ITodo) {
		this.id        = args.id || ++TodoItem.lastId;
		this.title     = args.title;
		this.body      = args.body;
		this.completed = args.completed || false;
		this.archived  = args.archived || false;
		this.tags      = args.tags || [];
		this._tags     = new Set(args.tags);
		this.created   = dayjs.utc(args.created) || dayjs.utc();

		// Set the lastId accordingly
		if (args.id && args.id > TodoItem.lastId) {
			TodoItem.lastId = args.id;
		}
	}

	// Update a todo
	update(args: ITodo) {
		['id', 'title', 'body', 'completed', 'archived'].forEach(prop => {
			if (args[prop]) this[prop] = args[prop];
		})

		if (args.tags) {
			this.tags = args.tags;
			this._tags   = new Set(args.tags);
		}

		store.publish('todos');
	}

	// Add a tag
	tag(tagname: string): TodoItem {
		if (!tagname) return this;

		// Add the full tag
		this._tags.add(tagname);

		// Now add all parent tags
		let parts = tagname.split('/');
		parts.pop(); // Remove the one we've just added

		while (parts.length > 0) {
			let tagname = parts.join('/');
			this._tags.add(tagname);
			parts.pop();
		}

		this.tags = Array.from(this._tags);
		store.publish('todos');
		return this;
	}

	// Remove a tag
	removeTag(tagname: string): TodoItem {
		this._tags.delete(tagname);
		this.tags = Array.from(this._tags);

		store.publish('todos');
		return this;
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

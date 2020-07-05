// Core TodoItem object

// Todo stuff
import { Todo } from './TodoItem/Interface';
import { TodoItemBuilder } from './TodoItem/Builder';

// Other stuff
import { Store } from '/store';
import { Vnode } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const store = new Store();

class TodoItem implements Todo {
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

	public constructor(args: Todo) {
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
	update(args: Todo) {
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

		this._tags.add(tagname);
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

	// Display
	view({ attrs }): Vnode {
		return new TodoItemBuilder(this).view({ attrs });
	}
}

export { TodoItem };

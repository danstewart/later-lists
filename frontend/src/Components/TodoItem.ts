import { Store } from '../store';
import m, { Vnode } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
// import { TodoItem } from '../Models/TodoItem'

dayjs.extend(utc);

interface Todo {
	id?: number,
	title: string,
	body: string,
	completed?: boolean,
	archived?: boolean,
	tags?: Array<string>,
	created?: Dayjs,
}

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

	archive(): void {
		this.archived = true;
		store.publish('todos');
	}

	// Display
	view({ attrs }): Vnode {
		return new TodoItemBuilder(this).view({ attrs });
	}
}

// Display builder for the TodoItem
class TodoItemBuilder {
	todo: TodoItem;

	constructor(todo: TodoItem) {
		this.todo = todo;
	}

	title() {
		if (this.todo.completed)
			return m('p.subtitle', m('del', this.todo.title));
		else
			return m('p.subtitle', this.todo.title);
	}

	checkbox() {
		return m('input', {
			checked: this.todo.completed,
			onclick: (e) => { this.todo.toggleStatus(); e.stopPropagation() },
			type: 'checkbox',
			style: 'margin-right: 15px;'
		});
	}

	details({ attrs }): Vnode | undefined {
		if (this.todo.collapsed) return;

		return m('div.flex-row.space-between', [
			m('div.flex-col', [
				m('span.with-newlines', this.todo.body),
				m('div', [
					Array.from(this.todo.tags).map(tag => m('span.tag.is-rounded', [
						tag,
						m('button.delete', { onclick: (e) => { this.todo.removeTag(tag); e.stopPropagation() } }),
					])),
				]),
			]),
			m('div', { style: 'align-self: flex-end' }, [
				m('button.button.is-text', { onclick: (e) => { this.todo.archive(); e.stopPropagation() } }, 'Archive'),
				m('button.button.is-text', { onclick: (e) => { attrs.edit(this.todo); e.stopPropagation() } }, 'Edit'),
			])
		]);
	}

	view({ attrs }): Vnode {
		return m('div.box', { onclick: () => this.todo.collapsed = !this.todo.collapsed, class: this.todo.completed ? 'dimmed' : '' }, [
			m('div.level', [
				m('div.level-left', [
					this.checkbox(),
					this.title(),
				]),
				m('div.level-right', [
					m('p.heading', this.todo.created.local().format('YYYY-MM-DD HH:mm'))
				]),
			]),
			this.details({ attrs }),
		])
	}
}

export {
	TodoItem,
}

import m, { Vnode } from 'mithril';
import { TodoList } from '../Models/TodoList';
import { Modal } from './Modal';
import { TodoItem } from '/Models/TodoItem';
import { Store } from '/store';

// TODO:
// - Form validation
// - Access form fields via properties
class TodoForm {
	lists: Map<string, TodoList>;
	modal: Modal;
	state: 'Add'|'Edit' = 'Add';
	editing: TodoItem;

	constructor() {
		const store = new Store();
		this.lists = store['lists'] || new Map<string, TodoList>()

		// Update out copy of the lists whenever they change
		store.subscribe('lists', () => {
			this.lists = store['lists'] || new Map<string, TodoList>()
		});

		this.modal = new Modal();
	}

	// DOM shortcuts
	field(id: string): HTMLInputElement {
		return this.element(id) as HTMLInputElement;
	}
	element(id: string): Element {
		return document.querySelector(`#${id}`);
	}

	// Form visibility
	show() {
		if (!this.modal.visible) this.toggleVisibility();
	}
	hide() {
		if (this.modal.visible) this.toggleVisibility();
	}
	toggleVisibility() {
		this.modal.toggle();
		this.reset();
	}

	updateId(e) {
		let list_id = e.target.value;

		if (this.lists && this.lists.has(list_id)) {
			document.querySelector('#list_id').value = e.target.value;
			e.target.value = this.lists.get(e.target.value).name;
		}
	}


	// Form state
	set(todo: TodoItem) {
		this.state = 'Edit';
		this.editing = todo;
		this.field('todoId').value = todo.id.toString();
		this.field('title').value = todo.title;
		this.field('body').value = todo.body;
		this.field('list').value = todo.list_name;
		this.field('list_id').value = todo.list_id;
	}
	reset () {
		this.state = 'Add';
		['title', 'body', 'list', 'todoId'].forEach(el => {
			if (this.field(el)) {
				this.field(el).value = '';
			}
		});
	}

	// Mithril
	view({ attrs }) {
		let form = m('div', { id: 'todoForm' }, [
			// Inputs
			m('div.columns', m('div.column.is-one-third', [
				m('div.field', [
					m('label.label', 'Title'),
					m('input.input', { id: 'title' })
				]),
			])),
			m('div.field', [
				m('label.label', 'Description'),
				m('textarea.textarea', { id: 'body' })
			]),

			// List
			m('div.columns', m('div.column.is-one-third', [
				m('label.label', 'List'),
				m('div.field', [
					m('div.control', m('input.input', {
						id: 'list',
						list: 'list-list', // Yeah a list of lists, get over it
						type: 'text',
						onchange: (e) => this.updateId(e),
						onkeyup: (e) => this.updateId(e),
						onkeydown: (e) => this.updateId(e),
					})),
					m('input.is-hidden', { id: 'list_id' }),
				]),
				m('datalist', { id: 'list-list' }, Array.from(this.lists.values()).map(t => m('option', { value: t.id }, t.name))),
			])),

			m('input.input.is-hidden', { id: 'todoId' })
		]);

		let submit = m('div.field', [
			m('button.button.is-primary', { onclick: () => attrs.onclick() }, 'Submit'),
			m('button.button.is-text', { onclick: () => this.modal.toggle() }, 'Cancel'),
		]);

		return m('div', [
			this.modal.view({ attrs: {
				header: `${this.state} Todo`,
				content: form,
				footer: submit
			}}),
		]);
	}
}

export { TodoForm }

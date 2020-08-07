import m, { Vnode } from 'mithril';
import { TodoList } from '../Models/TodoList';
import { Modal } from './Modal';
import { TodoItem } from '/Models/TodoItem';
import { Store } from '/store';
import autoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete.min.js';

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
			this.lists = store['lists'] || new Map<string, TodoList>();
			m.redraw();
		});

		this.modal = new Modal();
	}

	// DOM shortcuts
	field(id: string, set?: string): string {
		let el = document.querySelector(`#${id}`) as HTMLInputElement;
		if (!el) return;

		if (set) {
			el.value = set;
			return;
		}

		return el.value;
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

	// Form state
	set(todo: TodoItem) {
		this.state = 'Edit';
		this.editing = todo;
		this.field('todoId', todo.id.toString());
		this.field('title', todo.title);
		this.field('body', todo.body);
		this.field('list', todo.list_name);
		this.field('listId', todo.list_id);
	}
	reset () {
		this.state = 'Add';
		['title', 'body', 'list', 'todoId'].forEach(el => {
			if (this.field(el)) {
				this.field(el, '');
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
					m('div.control', [
						m('input.input', { id: 'list', type: 'text', tabindex: 1 }),
						m('input.is-hidden', { id: 'listId' }),
					]),
				]),
			])),

			m('input.input.is-hidden', { id: 'todoId' })
		]);

		let submit = m('div.field', [
			m('button.button.is-primary', { onclick: () => attrs.onclick() }, 'Submit'),
			m('button.button.is-text', { onclick: () => this.modal.toggle() }, 'Cancel'),
		]);

		return m('div', [
			m(this.modal, {
				header: `${this.state} Todo`,
				content: form,
				footer: submit
			}),
		]);
	}

	oncreate() {
		new autoComplete({
			data: {
				src: Array.from(this.lists.values()),
				key: ['name']
			},
			selector: '#list',
			placeHolder: 'List',
			highlight: true,
			resultsList: {
				render: true,
				container: source => source.setAttribute('id', 'list'),
				destination: document.querySelector('#list'),
			},
			onSelection: feedback => {
				this.field('list', feedback.selection.value.name);
				this.field('listId', feedback.selection.value.id);
			},
			noResults: () => { console.log("** NO RESULTS **") },
			query: {
				manipulate: (query) => {
					return query;
				}
			}
		});
	}
}

export { TodoForm }

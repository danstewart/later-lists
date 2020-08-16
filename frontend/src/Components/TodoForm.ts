import m, { Vnode } from 'mithril';
import { TodoList } from '../Models/TodoList';
import { Modal } from './Modal';
import { TodoItem } from '/Models/TodoItem';
import { Store } from '/store';
import autoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete.min.js';

// TODO:
// - Form validation
// - Access form fields via properties
class TodoForm extends Modal {
	lists: Map<string, TodoList>;
	state: 'Add'|'Edit' = 'Add';
	editing: TodoItem;

	constructor() {
		super();

		const store = new Store();
		this.lists = store['lists'] || new Map<string, TodoList>()

		// Update out copy of the lists whenever they change
		store.subscribe('lists', () => {
			this.lists = store['lists'] || new Map<string, TodoList>();
			m.redraw();
		});
	}

	// Input element accessor
	field(id: string, set?: string): string {
		let el = document.querySelector(`#${id}`) as HTMLInputElement;
		if (!el) return;

		if (set != null) {
			el.value = set;
			return;
		}

		return el.value;
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
		this.editing = null;
		this.state = 'Add';

		['title', 'body', 'list', 'todoId'].forEach(el => {
			if (this.field(el)) {
				this.field(el, '');
			}
		});

		// Empty the autocomplete options
		document.querySelector('div#list').innerHTML = '';
	}

	header() {
		return `${this.state} Todo`;
	}

	content() {
		return m('div', { id: 'todoForm' }, [
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
						m('input#list.input'),
						m('input#listId.is-hidden'),
					]),
				]),
			])),

			m('input#todoId.input.is-hidden')
		]);
	}

	oncreate() {
		new autoComplete({
			data: {
				src: Array.from(this.lists.values()),
				key: ['name']
			},
			selector: '#list',
			// placeHolder: 'List',
			highlight: true,
			searchEngine: 'strict',
			resultsList: {
				render: true,
				container: (source) => {
					source.setAttribute('id', 'list');
					source.setAttribute('class', 'dropdown-content dropdown-hack');
				},
				destination: document.querySelector('#list'),
				position: 'afterend',
				element: 'div',
			},
			resultItem: {
				content: (data, source) => {
					source.setAttribute('class', 'dropdown-item is-primary');
					source.innerHTML = data.match;
				},
				element: 'a',
			},
			onSelection: feedback => {
				this.field('list', feedback.selection.value.name);
				this.field('listId', feedback.selection.value.id);
			},
			noResults: () => { console.log("** NO AUTOCOMPLETE RESULTS **") },
			query: {
				manipulate: (query) => {
					return query;
				}
			}
		});
	}
}

export { TodoForm }

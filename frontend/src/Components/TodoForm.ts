import m, { Vnode } from 'mithril';
import { Modal } from './Modal';
import { TodoItem } from '/Models/TodoItem';
import { Store } from '/store';

// TODO:
// - Form validation
// - Access form fields via properties
class TodoForm {
	lists: Array<string>;
	modal: Modal;
	state: 'Add'|'Edit' = 'Add';

	constructor() {
		const store = new Store();
		this.lists = Array.from(store['lists'] || []);

		// Update out copy of the lists whenever they change
		store.subscribe('lists', () => this.lists = Array.from(store['lists'] || []));

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

	// Form state
	set(todo: TodoItem) {
		this.state = 'Edit';
		this.field('todoId').value = todo.id.toString();
		this.field('title').value = todo.title;
		this.field('body').value = todo.body;
		this.field('list').value = todo.list;
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
			m('div.field', [
				m('label.label', 'Title'),
				m('input.input', { id: 'title' })
			]),
			m('div.field', [
				m('label.label', 'Description'),
				m('textarea.textarea', { id: 'body' })
			]),

			// List
			m('label.label', 'List'),
			m('div.field', [
				m('div.control', m('input.input', {
					id: 'list',
					list: 'list-list', // Yeah a list of lists, get over it
					type: 'text',
				})),
			]),
			m('datalist', { id: 'list-list' }, this.lists.map(t => m('option', { value: t }))),

			m('br'),

			m('input.input.is-hidden', { id: 'todoId' })
		]);

		let submit = m('div.field', [
			m('button.button.is-primary', { onclick: () => attrs.onclick() }, 'Submit'),
		]);

		let btnIcon = this.modal.visible ? 'fa.minus' : 'fa-plus';
		return m('div', [
			// Toggle button
			m('div.has-text-centered', [
				m('a.button.is-text', {
					onclick: () => {
						this.toggleVisibility();
					}
				},[
					m(`i.fas.${btnIcon}`, { id: 'toggleBtn' })
				]),
			]),
			this.modal.view({ attrs: {
				header: `${this.state} Todo`,
				content: form,
				footer: submit
			}}),
		]);
	}
}

export { TodoForm }

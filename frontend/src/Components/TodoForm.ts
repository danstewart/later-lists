import m from 'mithril';
import { TodoItem } from '/Models/TodoItem';
import { Store } from '/store';

// TODO:
// - Form validation
// - Access form fields via properties
class TodoForm {
	lists: Array<string>;
	isVisible: boolean = false;

	constructor() {
		const store = new Store();
		this.lists = Array.from(store['lists'] || []);

		// Update out copy of the lists whenever they change
		store.subscribe('lists', () => this.lists = Array.from(store['lists'] || []));
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
		if (!this.isVisible) this.toggleVisibility();
	}
	hide() {
		if (this.isVisible) this.toggleVisibility();
	}
	toggleVisibility() {
		this.isVisible = !this.isVisible;
		this.element('toggleBtn').classList.toggle('fa-plus');
		this.element('toggleBtn').classList.toggle('fa-minus');
		this.element('todoForm').classList.toggle('is-hidden');
		this.reset();
	}

	// Form state
	set(todo: TodoItem) {
		this.field('todoId').value = todo.id.toString();
		this.field('title').value = todo.title;
		this.field('body').value = todo.body;
		this.field('list').value = todo.list;
	}
	reset () {
		['title', 'body', 'list', 'todoId'].forEach(el => {
			if (this.field(el)) {
				this.field(el).value = '';
			}
		});
	}

	// Mithril
	view({ attrs }) {
		return m('div', [
			// Inputs
			m('div.box.is-hidden', { id: 'todoForm' }, [
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
				m('div.field.has-addons', [
					m('div.control', m('input.input', {
						id: 'list',
						list: 'list-list', // Yeah a list of lists, get over it
						type: 'text',
					})),
				]),
				m('datalist', { id: 'list-list' }, this.lists.map(t => m('option', { value: t }))),

				m('br'),

				// Submit
				m('div.field', [
					m('button.button.is-primary', { onclick: () => attrs.onclick() }, 'Submit'),
				]),

				m('input.input.is-hidden', { id: 'todoId' })
			]),

			// Toggle button
			m('div.has-text-centered', [
				m('a.button.is-text', { onclick: () => this.toggleVisibility() }, [
					m('i.fas.fa-plus', { id: 'toggleBtn' })
				]),
			]),
		])
	}
}

export { TodoForm }

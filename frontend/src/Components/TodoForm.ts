import m from 'mithril';
import { TodoItem } from '/Models/TodoItem';
import { Store } from '/store';

// TODO:
// - Form validation
// - Access form fields via properties
class TodoForm {
	tags: Set<string>;
	isVisible: boolean = false;

	constructor() {
		this.tags = new Set<string>();
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
		this.tags = new Set<string>(todo.tags);
	}
	reset () {
		['title', 'body', 'tags', 'todoId'].forEach(el => {
			if (this.field(el)) {
				this.field(el).value = '';
			}
		});

		this.tags = new Set<string>();
	}

	// Tags
	addTag() {
		const tagContent = this.field('tags').value;
		this.field('tags').value = '';
		if (tagContent.length > 0) this.tags.add(tagContent);
		m.redraw();
	}
	removeTag(tag: string) {
		this.tags.delete(tag);
	}

	// Mithril
	view({ attrs }) {
		const store = new Store();
		let tags: Array<string> = Array.from(this.tags || []);
		tags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));


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

				// Tags
				m('label.label', 'Lists'),
				m('div.field.has-addons', [
					m('div.control', m('input.input', {
						id: 'tags',
						list: 'tag-list',
						type: 'text',
						onkeyup: (e) => e.keyCode == 13 && this.addTag(),
					})),
					m('div.control', m('button.button', { onclick: () => this.addTag() }, 'Add'))
				]),
				m('datalist', { id: 'tag-list' }, tags.map(t => m('option', { value: t }))),

				// Display tags
				m('div', [
					tags.map(tag => m('span.tag.is-rounded', [
						tag,
						m('button.delete', { onclick: () => this.removeTag(tag) }),
					])),
				]),
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

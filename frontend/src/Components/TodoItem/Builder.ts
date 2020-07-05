import { TodoItem } from '/Components/TodoItem';
import m, { Vnode } from 'mithril';
import { Settings } from '/settings';

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
					m('p.heading', this.todo.created.local().format(Settings.DateFormat))
				]),
			]),
			this.details({ attrs }),
		])
	}
}

export { TodoItemBuilder };

import { TodoItem } from '/Models/TodoItem';
import m, { Vnode } from 'mithril';
import { Settings } from '/settings';

// Display builder for the TodoItem
class TodoItemBuilder {
	todo: TodoItem;

	constructor({ attrs }) {
		this.todo = attrs.todo;
	}

	title() {
		if (this.todo.completed)
			return m('p.subtitle.ellipsis', m('del', this.todo.title));
		else
			return m('p.subtitle.ellipsis', this.todo.title);
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

		return m('div', [
			m('span.with-newlines', this.todo.body),

			m('div.flex-row.space-between', [
				m('div.flex-col', [
					m('div', [
						m('span.tag.is-rounded', this.todo.list_name),
					]),
				]),
				m('div', { style: 'align-self: flex-end' }, [
					m('div.level.is-mobile', [
						m('button.button.is-text', { onclick: (e) => { this.todo.archive(); e.stopPropagation() } }, 'Archive'),
						m('button.button.is-text', { onclick: (e) => { attrs.edit(this.todo); e.stopPropagation() } }, 'Edit'),
					])
				])
			])
		])
	}

	view({ attrs }): Vnode {
		return m('div.box', { onclick: () => this.todo.collapsed = !this.todo.collapsed, class: this.todo.completed ? 'dimmed' : '' }, [
			m('div.level.is-mobile', [
				m('div.level-left', { style: 'width: 60%' }, [
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

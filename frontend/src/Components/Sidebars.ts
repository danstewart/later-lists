import m, { Vnode } from 'mithril';
import { TodoList } from '../Models/TodoList';
import { Store } from '/store';

const store = new Store();

class TodoSidebar {
	lists: Map<string, TodoList>;

	constructor() {
		this.lists = store['lists'];

		// If we delete the list the filter is currently set to then drop the filter
		store.subscribe('lists', () => {
			if (!store['lists'].has(store['listFilter'])) {
				store.drop('listFilter');
			}

			this.lists = store['lists'];
			m.redraw();
		});
	}

	drawLists() {
		let lists = this.lists ? Array.from(this.lists.values()) : [];
		console.log(lists);
		lists = lists.filter(l => l.todos.size > 0);

		return lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(list => {
			return m('div', [
				m('a.button.is-text.has-text-left.with-newlines.sidebar-link', {
				class: list.selected() ? 'is-active' : '',
				onclick: () => {
					if (list.selected()) {
						store.drop('listFilter');
					} else {
						store['listFilter'] = list.id;
					}
				}}, list.name),
			])
		});
	}

	view(): Vnode {
		return m('aside.menu', [
			m('p.menu-label.is-size-6', 'Lists'),
			m('ul.menu-list', [
				this.drawLists(),
			])
		]);
	}
}

export { TodoSidebar };

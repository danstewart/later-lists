import m, { Vnode } from 'mithril';
import { Store } from '/store';

const store = new Store();

class TodoSidebar {
	constructor() {
		// If we delete the list the filter is currently set to then drop the filter
		store.subscribe('lists', () => {
			if (!store['lists'].has(store['listFilter'])) {
				store.drop('listFilter');
			}
		});
	}

	isSelected(listName) {
		return listName === store['listFilter'];
	}

	drawLists() {
		let lists: Array<string> = Array.from(store['lists'] || []);
		return lists.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map(list => {
			return m('div', [
				m('a.button.is-text.has-text-left.with-newlines.sidebar-link', {
				class: this.isSelected(list) ? 'is-active' : '',
				onclick: () => {
					if (this.isSelected(list)) {
						store.drop('listFilter');
					} else {
						store['listFilter'] = list;
					}
				}}, list),
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

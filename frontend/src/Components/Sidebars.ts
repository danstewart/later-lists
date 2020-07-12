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
			return m('a.with-newlines', {
				class: this.isSelected(list) ? 'is-active' : '',
				style: 'padding: 10px 0px 10px 2px !important',
				onclick: () => {
					if (this.isSelected(list)) {
						store.drop('listFilter');
					} else {
						store['listFilter'] = list;
					}
				}},
				list
			)
		});
	}

	view(): Vnode {
		return m('aside.menu', [
			m('p.menu-label', 'Lists'),
			m('ul.menu-list', [
				this.drawLists(),
			])
		]);
	}
}

export { TodoSidebar };

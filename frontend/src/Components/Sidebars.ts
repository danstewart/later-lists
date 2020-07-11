import m, { Vnode } from 'mithril';
import { Store } from '/store';

const store = new Store();

class TodoSidebar {
	isSelected(tag, exact = false) {
		return tag === store['tagFilter'] || (!exact && tag.startsWith(store['tagFilter']));
	}

	allTags() {
		let tags = store['tags'];

		// If the current selected tag is no longer exists then disable filter
		let selected = store['tagFilter'];
		if (selected && !tags.has(selected)) {
			store.drop('tagFilter');
		}

		// Sort here so the code below can just traverse in order
		tags = Array.from(tags || []).sort();
		return tags;
	}

	drawTag(tag, chain, depth): Vnode {
		const tabs = "\t".repeat(depth);

		return m('a.with-newlines', {
			class: this.isSelected(chain, true) ? 'is-active' : '',
			onclick: () => {
				console.log(chain);
				if (this.isSelected(chain, true)) {
					store.drop('tagFilter');
				} else {
					store['tagFilter'] = chain;
				}
			}},
			`${tabs} ${tag}`
		);
	}

	drawTagsHeirarchy() {
		let all  = this.allTags();
		let list = [];
		let seen = {};

		// Go through the tags and draw them
		all.forEach(tag => {
			let parts = tag.split('/');
			let inner = parts.pop();
			let depth = parts.length;
			list.push(this.drawTag(inner, tag, depth));
		});

		return list;
	}

	view(): Vnode {
		this.allTags();
		return m('aside.menu', [
			m('p.menu-label', 'Lists'),
			m('ul.menu-list', [
				this.drawTagsHeirarchy(),
			])
		]);
	}
}

export { TodoSidebar };

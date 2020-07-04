import m from 'mithril';
import { TodoList } from '../Components/TodoList';
import { Store } from '../store';

// Get a unique list of all tags across all pending todos
const getAllTags = () => {
	const todos = new TodoList();
	let tags: Set<string> = new Set<string>();

	todos.all().filter(t => !t.archived).forEach(todo => {
		Array.from(todo.tags).forEach(tag => tags.add(tag));
	});

	// If the current selected tag is deleted then disable filter
	let selected = store['tagFilter'];
	if (selected && !tags.has(selected)) {
		store.drop('tagFilter');
	}

	return Array.from(tags).sort();
};

const store = new Store();
const isSelected = (tag) => tag === store['tagFilter'];

export default {
	view: () => m('aside.menu', [
		m('p.menu-label', 'Lists'),
		m('ul.menu-list', [
			getAllTags().map(tag => m('li',
				m('a', {
					class: isSelected(tag) ? 'is-active' : '',
					onclick: () => { 
						if (isSelected(tag)) {
							store.drop('tagFilter');
						} else {
							store['tagFilter'] = tag;
						}
					}},
					tag
				)
			))
		])
	])
}

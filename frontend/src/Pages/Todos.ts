import m from 'mithril';
import { TodoSidebar } from '/Components/Sidebars';
import { TodoForm } from '/Components/TodoForm';
import { TodoListBuilder } from '/Components/TodoList';
import { TodoItem } from '/Models/TodoItem';
import { TodoList } from '/Models/TodoList';
import { TodoListAPI } from '/DAO/TodoList';

// Load all lists
let lists = [];
new TodoListAPI().fetchAll().then(lists => {
	lists.map(list => new TodoList(list.name, list.id));

	// Redraw
	m.mount(document.querySelector('#sidebar'), new TodoSidebar());
	m.redraw();
});

const todoForm = new TodoForm();
const saveTodo = () => {
	const id    = todoForm.field('todoId')?.value;
	const title = todoForm.field('title')?.value;
	const body  = todoForm.field('body')?.value;
	const list  = todoForm.field('list')?.value;

	if (id) {
		// todos.edit(id, { title: title, body: body, list: list });
	} else {
		let todo = new TodoItem({ title: title, body: body, list: list });
		// todos.push(todo);
	}

	todoForm.reset();
	todoForm.hide();
};

const editTodo = (todo) => {
	todoForm.show();
	todoForm.set(todo);
}

export default {
	view: () => m('div.container', [
		lists.map(list => {
			new TodoListBuilder(list).view({ attrs: { edit: editTodo }});
		}),
		m('br'),
		m('button.FAB', { onclick: () => todoForm.show() }, '+'),
		todoForm.view({ attrs: { onclick: () => saveTodo() }}),
	])
};

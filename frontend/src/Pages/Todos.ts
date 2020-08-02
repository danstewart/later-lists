import m from 'mithril';
import { TodoSidebar } from '/Components/Sidebars';
import { TodoForm } from '/Components/TodoForm';
import { TodoListBuilder } from '../Components/TodoListBuilder';
import { TodoItem } from '/Models/TodoItem';
import { TodoList } from '/Models/TodoList';
import { TodoListAPI } from '/DAO/TodoList';

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

let lists = [];
export default {
	oninit: async () => {
		lists = await new TodoListAPI().fetchAll();
		lists = lists.map(list => new TodoList(list.name, list.id));
		m.mount(document.querySelector('#sidebar'), new TodoSidebar());
		m.redraw();
	},

	view: () => {
		let ayy = m('div.container', [
			lists.map(l => new TodoListBuilder(l).view({ attrs: { edit: editTodo }})),
			m('br'),
			m('button.FAB', { onclick: () => todoForm.show() }, '+'),
			todoForm.view({ attrs: { onclick: () => saveTodo() }}),
		]);
		return ayy;
	}
};

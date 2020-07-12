import m from 'mithril';
import { TodoSidebar } from '/Components/Sidebars';
import { TodoForm } from '/Components/TodoForm';
import { TodoListBuilder } from '/Components/TodoList';
import { TodoItem } from '/Models/TodoItem';
import { TodoList } from '/Models/TodoList';

const todoForm = new TodoForm();

const saveTodo = () => {
	const id    = todoForm.field('todoId')?.value;
	const title = todoForm.field('title')?.value;
	const body  = todoForm.field('body')?.value;
	const list  = todoForm.field('list')?.value;

	if (id) {
		todos.edit(id, { title: title, body: body, list: list });
	} else {
		let todo = new TodoItem({ title: title, body: body, list: list });
		todos.push(todo);
	}

	todoForm.reset();
	todoForm.hide();
};

const editTodo = (todo) => {
	todoForm.show();
	todoForm.set(todo);
}

// Load our todo list then trigger a redraw
let todos: TodoList = new TodoList();
let builder = new TodoListBuilder(todos);

// Draw sidebar
m.mount(document.querySelector('#sidebar'), new TodoSidebar());

export default {
	view: () => m('div.container', [
		todoForm.view({ attrs: { onclick: () => saveTodo() }}),
		m('br'),
		m(builder, { edit: editTodo }),
	])
};

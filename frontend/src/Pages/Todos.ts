import m from 'mithril';
import { TodoForm } from '../Components/TodoForm';
import { TodoItem } from '../Components/TodoItem';
import { TodoList } from '../Components/TodoList';

let todos: TodoList = new TodoList();
const todoForm = new TodoForm();

const saveTodo = () => {
	const id    = todoForm.field('todoId')?.value;
	const title = todoForm.field('title')?.value;
	const body  = todoForm.field('body')?.value;

	if (id) {
		todos.edit(id, { title: title, body: body, tags: Array.from(todoForm.tags) });
	} else {
		let todo = new TodoItem({ title: title, body: body });
		Array.from(todoForm.tags).forEach(tag => {
			 todo.tag(tag);
		});
		todos.push(todo);
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
		todoForm.view({ attrs: { onclick: () => saveTodo() }}),
		m('br'),
		m(todos, { edit: editTodo }),
	])
};

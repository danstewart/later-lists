import m from 'mithril';
import { TodoSidebar } from '/Components/Sidebars';
import { TodoForm } from '/Components/TodoForm';
import { TodoListBuilder } from '../Components/TodoListBuilder';
import { TodoItem } from '/Models/TodoItem';
import { TodoList } from '/Models/TodoList';
import { TodoListAPI } from '/DAO/TodoList';

let listMap: Map<string, TodoList> = new Map<string, TodoList>();
const todoForm = new TodoForm();

class Todos {

	async oninit() {
		let lists = await new TodoListAPI().fetchAll();
		lists.forEach(list => {
			listMap.set(list.id, new TodoList(list.name, list.id));
		})

		m.mount(document.querySelector('#sidebar'), new TodoSidebar());
		m.redraw();
	}

	saveTodo() {
		const id      = todoForm.field('todoId')?.value;
		const title   = todoForm.field('title')?.value;
		const body    = todoForm.field('body')?.value;
		const list    = todoForm.field('list')?.value;
		const list_id = todoForm.field('list_id')?.value;

		if (id) {
			todoForm.editing.update({ title: title, body: body, list_name: list, list_id: list_id});
			todoForm.editing.save();
		} else {
			let todo = new TodoItem({ title: title, body: body, list_name: list, list_id: list_id });
			
			if (listMap.has(list_id))
				listMap.get(list_id).push(todo);
			else
				// TODO
				console.log("NEW LIST")
		}

		todoForm.reset();
		todoForm.hide();
};

	editTodo(todo) {
		todoForm.show();
		todoForm.set(todo);
	}

	renderList() {
		if (listMap.size === 0) {
			return m('p', 'Nothing todo :-)');
		}

		return Array.from(listMap.values()).map(list => new TodoListBuilder(list).view({ attrs: { edit: this.editTodo }}));
	}

	view() {
		return m('div.container', [
			this.renderList(),
			m('br'),
			m('button.FAB', { onclick: () => todoForm.show() }, '+'),
			todoForm.view({ attrs: { onclick: () => this.saveTodo() }}),
		]);
	}
}

export default Todos;

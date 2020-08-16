import m from 'mithril';
import { TodoSidebar } from '/Components/Sidebars';
import { TodoForm } from '/Components/TodoForm';
import { TodoListBuilder } from '../Components/TodoListBuilder';
import { TodoItem } from '/Models/TodoItem';
import { TodoList } from '/Models/TodoList';
import { TodoListAPI } from '/DAO/TodoList';

let listMap: Map<string, TodoList> = new Map<string, TodoList>();

class Todos {
	initialized: boolean = false;
	formVisible: boolean = false;

	async oninit() {
		try {
			let lists = await new TodoListAPI().fetchAll();

			for (let list of lists) {
				let todoList = new TodoList(list.name, list.id);
				await todoList.init();
				listMap.set(list.id, todoList);
			}

			this.initialized = true;
		} catch {
			// TODO: Show error
			console.error("Loading lists failed");
		} finally {
			m.redraw();
			m.mount(document.querySelector('#sidebar'), new TodoSidebar());
		}
	}

	saveTodo(todoForm) {
		const id     = todoForm.state.field('todoId');
		const title  = todoForm.state.field('title');
		const body   = todoForm.state.field('body');
		const list   = todoForm.state.field('list');
		const listId = todoForm.state.field('listId');

		if (!listMap.has(listId)) {
			// TODO
			throw("NOT YET IMPLEMENTED: Adding todo to new list");
		}

		if (id) {
			todoForm.state.editing.update({ title: title, body: body, list_name: list, list_id: listId });
			todoForm.state.editing.save();
		} else {
			let todo = new TodoItem({ title: title, body: body, list_name: list, list_id: listId });
			listMap.get(listId).push(todo);
		}

		todoForm.state.toggle();
	}

	view() {
		if (!this.initialized) {
			return m('section.section', [
				m('progress.progress.is-info', { max: 100 })
			]);
		}

		if (listMap.size === 0) {
			return m('p', 'Nothing todo :-)');
		}

		let todoForm: any = m(TodoForm, { save: () => this.saveTodo(todoForm) });
		const editTodo = (todo) => { todoForm.state.set(todo); todoForm.state.toggle(); };

		return m('div.container', [
			Array.from(listMap.values()).map(list => {
				if (list.todos.size > 0) {
					return m(new TodoListBuilder(list), { edit: (todo) => editTodo(todo) });
				}
			}),
			m('br'),
			todoForm,
			m('button.FAB', { onclick: () => todoForm.state.toggle() }, '+'),
		]);
	}
}

export default Todos;

import m from 'mithril';
import { TodoSidebar } from '/Components/Sidebars';
import { TodoForm } from '/Components/TodoForm';
import { TodoListBuilder } from '../Components/TodoListBuilder';
import { TodoItem } from '/Models/TodoItem';
import { TodoList } from '/Models/TodoList';
import { TodoListAPI } from '/DAO/TodoList';

let listMap: Map<string, TodoList> = new Map<string, TodoList>();
let todoForm;

class Todos {
	initialized: boolean = false;

	async oninit() {
		try {
			let lists = await new TodoListAPI().fetchAll();
			lists.forEach(async list => {
				let todoList = new TodoList(list.name, list.id);
				await todoList.init();
				listMap.set(list.id, todoList);
			});
		} catch {
			// TODO: Show error
			console.error("Loading lists failed");
		} finally {
			todoForm = new TodoForm();
			m.redraw();
			m.mount(document.querySelector('#sidebar'), new TodoSidebar());
		}

		// TODO: This doesn't quite work, still get a flash of the "No todos" msg
		this.initialized = true;
	}

	saveTodo() {
		const id     = todoForm.field('todoId');
		const title  = todoForm.field('title');
		const body   = todoForm.field('body');
		const list   = todoForm.field('list');
		const listId = todoForm.field('listId');

		if (id) {
			todoForm.editing.update({ title: title, body: body, list_name: list, list_id: listId });
			todoForm.editing.save();
		} else {
			let todo = new TodoItem({ title: title, body: body, list_name: list, list_id: listId });
			
			if (listMap.has(listId)) {
				listMap.get(listId).push(todo);
			} else {
				// TODO
				console.log("NOT IMPLEMENTED: NEW LIST")
			}
		}

		todoForm.reset();
		todoForm.hide();
	}


	renderList() {
		if (listMap.size === 0) {
			return m('p', 'Nothing todo :-)');
		}

		const editTodo = (todo) => { todoForm.set(todo); todoForm.show() };
		return Array.from(listMap.values()).map(list => {
			if (list.todos.size > 0) {
				return m(new TodoListBuilder(list), { edit: (todo) => editTodo(todo) });
			}
		});
	}

	view() {
		if (!this.initialized) {
			return m('section.section', [
				m('progress.progress.is-info', { max: 100 })
			]);
		}

		return m('div.container', [
			this.renderList(),
			m('br'),
			m('button.FAB', { onclick: () => todoForm.show() }, '+'),
			m(todoForm, { onclick: () => this.saveTodo() }),
		]);
	}
}

export default Todos;

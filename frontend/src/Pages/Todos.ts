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

			for (let list of lists) {
				let todoList = new TodoList(list.name, list.id);
				await todoList.init();
				listMap.set(list.id, todoList);
			}

			this.initialized = true;
			// setTimeout(() => { this.initialized = true; m.redraw(); }, 2000);
		} catch {
			// TODO: Show error
			console.error("Loading lists failed");
		} finally {
			todoForm = new TodoForm();
			m.redraw();
			m.mount(document.querySelector('#sidebar'), new TodoSidebar());
		}
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
				throw("NOT YET IMPLEMENTED: Adding todo to new list");
			}
		}

		todoForm.reset();
		todoForm.hide();
	}

	renderList() {
		if (listMap.size === 0) {
			return m('p', 'Nothing todo :-)');
		}

		const editTodo = (todo) => { todoForm.show(); todoForm.set(todo) };
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
			// Consuming this with the m() function results in funny behaviour when calling methods 
			// on todoForm directly (like in the FAB below and editForm() above)
			// I think this is just some funniness in how mithril works under the hood
			todoForm.view({ attrs: {} }),
			m('button.FAB', { onclick: () => todoForm.toggle() }, '+'),
		]);
	}
}

export default Todos;

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
	todoForm: TodoForm;

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
			this.todoForm = new TodoForm();
			m.redraw();
			m.mount(document.querySelector('#sidebar'), new TodoSidebar());
		}
	}

	toggleForm() {
		this.formVisible = !this.formVisible;

		// If hiding then reset
		if (!this.formVisible) this.todoForm.reset();
	}

	saveTodo() {
		const id     = this.todoForm.field('todoId');
		const title  = this.todoForm.field('title');
		const body   = this.todoForm.field('body');
		const list   = this.todoForm.field('list');
		const listId = this.todoForm.field('listId');

		if (!listMap.has(listId)) {
			// TODO
			throw("NOT YET IMPLEMENTED: Adding todo to new list");
		}

		if (id) {
			this.todoForm.editing.update({ title: title, body: body, list_name: list, list_id: listId });
			this.todoForm.editing.save();
		} else {
			let todo = new TodoItem({ title: title, body: body, list_name: list, list_id: listId });
			listMap.get(listId).push(todo);
		}

		this.todoForm.reset();
		this.todoForm.hide();
	}

	renderList() {
		if (listMap.size === 0) {
			return m('p', 'Nothing todo :-)');
		}

		const editTodo = (todo) => { this.todoForm.set(todo); this.toggleForm() };
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
			m(this.todoForm, {
				visible: this.formVisible,
				toggle: () => this.toggleForm(),
				save: () => this.saveTodo()
			}),
			m('button.FAB', { onclick: () => this.toggleForm() }, '+'),
		]);
	}
}

export default Todos;

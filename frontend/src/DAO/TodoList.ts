import { ITodoList, TodoList } from '/Models/TodoList';
import { v4 as uuidv4 } from 'uuid';

// Base Data Access Object
abstract class DAO {
	// Save
	abstract async save(item: ITodoList): Promise<void>;
	abstract async saveAll(items: Array<ITodoList>): Promise<void>;

	// Retrieve
	abstract async fetch(id: number): Promise<ITodoList> | null;
	abstract async fetchAll(): Promise<Array<ITodoList>>;
}

class API extends DAO {
	private static endpoint: string = 'http://127.0.0.1:3030/api/lists';

	async fetch(id: number) {
		let res = await fetch(`${API.endpoint}/${id}`);
		let todo = JSON.parse(await res.json());
		return new Promise<ITodoList>((resolve) => resolve(todo));
	}

	async fetchAll() {
		let res = await fetch(`${API.endpoint}`);
		let todos = await res.json();
		return new Promise<Array<ITodoList>>((resolve) => resolve(todos));
	}

	async save(item: ITodoList) {
		if (item.id) {
			// Update
			await fetch(`${API.endpoint}/${item.id}`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json; charset=UTF-8'
				},
				body: JSON.stringify(item),
			});
		} else {
			// Insert
			item.id = uuidv4();
			await fetch(`${API.endpoint}`, {
				method: 'PUT',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json; charset=UTF-8'
				},
				body: JSON.stringify(item),
			});
		}

		return Promise.resolve();
	}

	saveAll(items: Array<ITodoList>) {
		items.forEach(item => this.save(item));
		return Promise.resolve();
	}
}

// LocalStorage as DAO
class LocalStorage extends DAO {
	private async load(): Promise<Array<ITodoList>> | null {
		const stored = localStorage.getItem('lists');
		if (stored) return JSON.parse(stored);
		console.warn(`Failed to load todos from LocalStorage`);
	}

	private store(items: Array<ITodoList>): void {
		localStorage.setItem('todos', JSON.stringify(items));
	}

	async fetch(id: number) {
		const stored = this.load();
		if (stored && stored[id]) return new Promise<ITodoList>(stored[id]);
		console.warn(`Failed to load todo ${id} from LocalStorage`);
		return null;
	}

	async fetchAll() {
		const stored = await this.load() || new Array<ITodoList>();
		return new Promise<Array<ITodoList>>(resolve => resolve(stored));
	}

	async save(item: ITodoList) {
		const stored = await this.load();
		stored[item.id] = item;
		this.store(stored);
	}

	async saveAll(items: Array<ITodoList>) {
		this.store(items);
	}
}

export {
	DAO as TodoListDAO,
	API as TodoListAPI,
	LocalStorage as TodoListLocalStorage,
};


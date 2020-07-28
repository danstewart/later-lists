import { v4 as uuidv4 } from 'uuid';

interface hasId {
	id?: string,
}

// Base Data Access Object
abstract class DAO<T extends hasId> {
	// Save
	abstract async save(item: T): Promise<void>;
	abstract async saveAll(items: Array<T>): Promise<void>;

	// Retrieve
	abstract async fetch(id: number): Promise<T> | null;
	abstract async fetchAll(): Promise<Array<T>>;
}

class LocalStorage<T extends hasId> extends DAO<T> {
	private async load(): Promise<Array<T>> | null {
		const stored = localStorage.getItem('lists');
		if (stored) return JSON.parse(stored);
		console.warn(`Failed to load todos from LocalStorage`);
	}

	private store(items: Array<T>): void {
		localStorage.setItem('todos', JSON.stringify(items));
	}

	async fetch(id: number) {
		const stored = this.load();
		if (stored && stored[id]) return new Promise<T>(stored[id]);
		console.warn(`Failed to load todo ${id} from LocalStorage`);
		return null;
	}

	async fetchAll() {
		const stored = await this.load() || new Array<T>();
		return new Promise<Array<T>>(resolve => resolve(stored));
	}

	async save(item: T) {
		const stored = await this.load();
		stored[item.id] = item;
		this.store(stored);
	}

	async saveAll(items: Array<T>) {
		this.store(items);
	}
}

abstract class API<T extends hasId> extends DAO<T> {
	abstract endpoint: string;

	async fetch(id: number) {
		let res = await fetch(`${this.endpoint}/${id}`);
		let todo = JSON.parse(await res.json());
		return new Promise<T>((resolve) => resolve(todo));
	}

	async fetchAll() {
		let res = await fetch(`${this.endpoint}`);
		let todos = await res.json();
		return new Promise<Array<T>>((resolve) => resolve(todos));
	}

	async save(item: T) {
		if (item.id) {
			// Update
			await fetch(`${this.endpoint}/${item.id}`, {
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
			await fetch(`${this.endpoint}`, {
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

	saveAll(items: Array<T>) {
		items.forEach(item => this.save(item));
		return Promise.resolve();
	}
}

export {
	DAO,
	API,
	LocalStorage,
	hasId,
}

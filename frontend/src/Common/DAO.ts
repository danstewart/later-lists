import { v4 as uuidv4 } from 'uuid';

interface hasId {
	id?: string,
}

// Base Data Access Object
abstract class DAO<T extends hasId> {
	// Save
	abstract async save(item: T, opts?: Object): Promise<void>;
	abstract async saveAll(items: Array<T>, opts?: Object): Promise<void>;

	// Retrieve
	abstract async fetchOne(id: string, opts?: Object): Promise<T> | null;
	abstract async fetchAll(opts?: Object): Promise<Array<T>>;
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

	async fetchOne(id: string) {
		const stored = this.load();
		if (stored && stored[id]) return new Promise<T>(stored[id]);
		console.warn(`Failed to load todo ${id} from LocalStorage`);
		return null;
	}

	async fetchAll(opts: Object) {
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

class API<T extends hasId> extends DAO<T> {
	endpoint: string;

	constructor(opts) {
		super();
		this.endpoint = opts.endpoint;
	}

	async fetchOne(id: string, opts = {}) {
		let res = await fetch(`${this.endpoint}/${id}`);
		let todo = await res.json();
		return new Promise<T>((resolve) => resolve(todo));
	}

	async fetchAll(opts = {}) {
		let res = await fetch(`${this.endpoint}?` + new URLSearchParams(opts));
		let todos = await res.json();
		return new Promise<Array<T>>((resolve) => resolve(todos));
	}

	async save(item: T, opts = {}) {
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

	saveAll(items: Array<T>, opts = {}) {
		items.forEach(item => this.save(item));
		return Promise.resolve();
	}
}

// TODO: Return DAO based on settings
function getDefault<T>(opts): DAO<T> {
	return new API<T>(opts);
}


export {
	getDefault,
	DAO,
	API,
	LocalStorage,
	hasId,
}


import { ITodo, TodoItem } from '/Models/TodoItem';

// Base Data Access Object
abstract class DAO {
	// Save
	abstract async save(item: ITodo): Promise<void>;
	abstract async saveAll(items: Array<ITodo>): Promise<void>;

	// Retrieve
	abstract async fetch(id: number): Promise<ITodo> | null;
	abstract async fetchAll(): Promise<Array<ITodo>>;
}

class API extends DAO {
	private static endpoint: string = 'https://127.0.0.1:3030';

	private async reqJson(path: string) {
		let res    = await fetch(`${API.endpoint}/${path}`);
		let json   = await res.json();
		let parsed = JSON.parse(json);
		return parsed;
	}

	async fetch(id: number) {
		let todo = await this.reqJson(`/api/todo/${id}`);
		return new Promise<ITodo>(todo);
	}

	async fetchAll() {
		let todos = await this.reqJson(`/api/todo`);
		return new Promise<Array<ITodo>>(todos);
	}

	async save(item: ITodo) {
		if (item.id) {
			await fetch(`${API.endpoint}/api/todo/${item.id}`, {
				method: 'PUT',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(item),
			});
		} else {
			await fetch(`${API.endpoint}/api/todo`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(item),
			});
		}
		return Promise.resolve();
	}

	saveAll(items: Array<ITodo>) {
		items.forEach(item => this.save(item));
		return Promise.resolve();
	}
}

class WSocket extends API {
	private socket: WebSocket;

	constructor() {
		super();
		this.socket = new WebSocket('ws://127.0.0.1:3030/todo');

		this.socket.onerror = function(error) {
			console.error('WebSocket Error: ' + error);
		};

		this.socket.onopen = function(event) {
			console.log("Connected to socket opened");
		};

		this.socket.onclose = function(event) {
			console.log("Connection to socket closed");
		};

		this.socket.onmessage = function(event) {
			console.log("Got message via socket");
			console.log(event);
		}
	}

	async save(item: ITodo) {
		this.socket.send(JSON.stringify(item));
	}
}

// LocalStorage as DAO
class LocalStorage extends DAO {
	private async load(): Promise<Array<ITodo>> | null {
		const stored = localStorage.getItem('todos');
		if (stored) return JSON.parse(stored);
		console.warn(`Failed to load todos from LocalStorage`);
	}

	private store(items: Array<ITodo>): void {
		localStorage.setItem('todos', JSON.stringify(items));
	}

	async fetch(id: number) {
		const stored = this.load();
		if (stored && stored[id]) return new Promise<ITodo>(stored[id]);
		console.warn(`Failed to load todo ${id} from LocalStorage`);
		return null;
	}

	async fetchAll() {
		const stored = await this.load() || new Array<ITodo>();
		return new Promise<Array<ITodo>>(resolve => resolve(stored));
	}

	async save(item: ITodo) {
		const stored = await this.load();
		stored[item.id] = item;
		this.store(stored);
	}

	async saveAll(items: Array<ITodo>) {
		this.store(items);
	}
}

export {
	DAO as TodoItemDAO,
	API as TodoAPI,
	LocalStorage as TodoLocalStorage,
	WSocket as TodoWebSocket,
};

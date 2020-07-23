import { ITodo, TodoItem } from '/Models/TodoItem';
import m from 'mithril';

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
	private static endpoint: string = 'http://127.0.0.1:3030';

	async fetch(id: number) {
		let res = await fetch(`${API.endpoint}/api/todos/${id}`);
		let todo = JSON.parse(await res.json());
		return new Promise<ITodo>((resolve) => resolve(todo));
	}

	async fetchAll() {
		let res = await fetch(`${API.endpoint}/api/todo`);
		let todos = await res.json();
		return new Promise<Array<ITodo>>((resolve) => resolve(todos));
	}

	async save(item: ITodo) {
		// Override JSON serialization for DayJS
		item.created.toJSON = function() {
			return item.created.format("YYYY-MM-DDTHH:mm:ss");
		}

		if (item.id) {
			// Update
			await fetch(`${API.endpoint}/api/todo/${item.id}`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json; charset=UTF-8'
				},
				body: JSON.stringify(item),
			});
		} else {
			// Insert
			await fetch(`${API.endpoint}/api/todo`, {
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

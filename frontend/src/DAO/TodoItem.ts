import { ITodo } from '/Models/TodoItem';
import { API as BaseAPI, LocalStorage as BaseLocalStorage } from './Base';

class LocalStorage extends BaseLocalStorage<ITodo> {}

class API extends BaseAPI<ITodo> {
	endpoint: string = 'http://127.0.0.1:3030/api/todos';

	async save(item: ITodo) {
		// Override JSON serialization for DayJS
		item.created.toJSON = function() {
			return item.created.format("YYYY-MM-DDTHH:mm:ss");
		}

		return super.save(item);
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

export {
	API as TodoAPI,
	LocalStorage as TodoLocalStorage,
	WSocket as TodoWebSocket,
};

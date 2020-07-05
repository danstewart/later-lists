import { Todo } from './Interface';
import { TodoItem } from '../TodoItem';

// Base Data Access Object
abstract class DAO {
	// Save
	abstract save(item: Todo): void;
	abstract saveAll(items: Array<Todo>): void;

	// Retrieve
	abstract fetch(id: number): Todo | null;
	abstract fetchAll(): Array<Todo>;
}

// TODO: API as DAO
// class API extends DAO {
// 	fetch(id: number): Todo {
// 		console.warn("API.fetch() not implemented");
// 		return true;
// 	}

// 	fetchAll(): Array<Todo> {
// 		console.warn("API.fetchAll() not implemented");
// 		return [true, true, true];
// 	}

// 	save(item: Todo) {
// 		console.warn("API.save() not implemented");
// 	}

// 	saveAll(items: Array<Todo>) {
// 		console.warn("API.saveAll() not implemented");
// 	}
// }

// LocalStorage as DAO
class LocalStorage extends DAO {
	private load(): Array<Todo> | null {
		const stored = localStorage.getItem('todos');
		if (stored) return JSON.parse(stored);
		console.warn(`Failed to load todos from LocalStorage`);
	}

	private store(items: Array<Todo>): void {
		localStorage.setItem('todos', JSON.stringify(items));
	}

	fetch(id: number) {
		const stored = this.load();
		if (stored && stored[id]) return stored[id];
		console.warn(`Failed to load todo ${id} from LocalStorage`);
		return null;
	}

	fetchAll() {
		const stored = this.load();
		return stored || [];
	}

	save(item: Todo) {
		const stored = this.load();
		stored[item.id] = item;
		this.store(stored);
	}

	saveAll(items: Array<Todo>) {
		this.store(items);
	}
}

export {
	DAO as TodoItemDAO,
	// API as TodoAPI,
	LocalStorage as TodoLocalStorage
};

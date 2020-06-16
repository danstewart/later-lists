interface Events {
	[topic: string]: Array<Function>
}

interface Data {
	[key: string]: any
}

// PubSub Store
// Usage: 
// const store = new Store(); // Singleton
// store.subscribe('topic', () => doSomething());
// store['topic'] = 'Hello'; // Will auto publish
// store['nested'][0] = 'Test'; // Nested objects require a manual publish
// store.publish('nested');

class Store {
	private verbose: boolean = false; // Enables logging
	private static data: Data = {};
	private static events: Events = {};
	private static instance;

	constructor() {
		if (Store.instance) {
			return Store.instance;
		}

		// Proxy so we can store and fetch as properties
		const proxy = new Proxy(this, {
			get(target, prop, rec) {
				// Check for an actual property
				const value = Reflect.get(target, prop, rec);

				// https://2ality.com/2017/11/proxy-method-calls.html
				// If a function then call that function
				if (typeof value === 'function') {
					return function (...args) {
						return value.apply(this, args);
					}
				}

				// If it's a real property
				if (typeof value !== 'undefined') {
					return value;
				}

				return target.fetch(prop);
			},

			set(target, prop, val) {
				target.track(prop, val);
				return true;
			},
		});

		Store.instance = proxy;
		return proxy;
	}

	// Add something to the store
	// `topic` can be something other than the variable name
	// This allows subscribing to multiple var changes under the one topic
	track(key, value, topic = null): void {
		if (this.verbose) console.log(`=> Called Store.track(key: ${key}, value: ${value}, topic: ${topic})`);

		Store.data[key] = value;
		this.publish(topic || key);
	}

	// Fetch a value from the store
	fetch(key): any {
		if (this.verbose) console.log(`=> Called Store.fetch(key: ${key})`);
		return Store.data[key];
	}

	// Delete a value from the store
	drop(key, topic = null) {
		if (this.verbose) console.log(`=> Called Store.drop(key: ${key}, topic: ${topic})`);
		delete(Store.data[key]);
		this.publish(key || key);
	}

	// Subscribe to any changes to `topic`
	subscribe(topic, callback): void {
		if (this.verbose) console.log(`=> Called Store.subscribe(topic: ${topic}, callback: ${callback})`);
		if (!Store.events.hasOwnProperty(topic)) {
			Store.events[topic] = [];
		}

		Store.events[topic].push(callback);
	}

	// Publish changes to the `topic` and call all callbacks
	publish(topic, data = {}): void {
		if (this.verbose) console.log(`Publishing ${topic}`);
		if (!Store.events.hasOwnProperty(topic)) {
			return;
		}

		Store.events[topic].map(callback => callback(data));
	}
}

export { Store }

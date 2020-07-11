import m from 'mithril';

// Example web socket page for testing
let socket;
export default {
	oninit: () => {
		socket = new WebSocket('ws://127.0.0.1:3030/chat');

		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};

		socket.onopen = function(event) {
			console.log("CONNECTED");
		}

		socket.onmessage = function(event) {
			console.log("GOT MESSAGE");
			console.log(event);
		}

		socket.onclose = function(event) {
			console.log("CLOSED");
		};
	},

	view: () => m('div.container', [
		m('p', 'Test WS'),
		m('button', { onclick: () => socket.send("HELLO") }, 'Click me')
	])
};

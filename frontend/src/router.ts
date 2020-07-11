// This is our router
// Here we import our components and specify the routes the correspond to
import m from 'mithril';
import Todos from './Pages/Todos';
import Socket from './Pages/Socket';

export default {
	route: () => {
		m.route(document.querySelector('#rootNode'), '/', {
			'/': Todos,
			'/ws': Socket,
		});
	}
}

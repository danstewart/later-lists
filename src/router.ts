// This is our router
// Here we import our components and specify the routes the correspond to
import m from 'mithril';
import HomePage from './Pages/HomePage'

export default {
	route: () => {
		m.route(document.querySelector('#rootNode'), '/', {
			'/': HomePage,
		});
	}
}

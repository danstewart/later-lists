// This is the main entry point of the application
// We simply call the router here but any setup logic would go here
import m from 'mithril';
import router from './router';
import sidebar from './Components/Sidebar';

m.mount(document.querySelector('#sidebar'), sidebar);
router.route();

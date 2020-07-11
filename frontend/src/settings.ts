// Make shift settings config
// Will one day come from the database and be configured per user

import { TodoLocalStorage } from './DAO/TodoItem';

const DefaultSettings = {
	DAO: new TodoLocalStorage(),
	DateFormat: 'YYYY-MM-DD HH:mm',
}

export { DefaultSettings as Settings };

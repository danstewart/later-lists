import { Dayjs } from 'dayjs';

interface Todo {
	id?: number,
	title: string,
	body: string,
	completed?: boolean,
	archived?: boolean,
	tags?: Array<string>,
	created?: Dayjs,
}

export { Todo };

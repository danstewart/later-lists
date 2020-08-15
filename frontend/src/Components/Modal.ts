// Base modal component
// Inherit from this and override header, content and footer to use
import m, { Vnode } from 'mithril';

class Modal {
	visible: boolean;

	constructor() {
		this.visible = false;
	}

	show() {
		this.visible = true;
	}

	hide() {
		this.visible = false;
	}

	toggle() {
		this.visible = !this.visible;
	}

	header() {
		return 'Default Modal';
	}

	content({ attrs }) {
		return m('p', 'This is the default modal');
	}

	footer({ attrs }) {
		return m('div.field', [
			m('button.button.is-primary', { onclick: () => attrs.onclick() }, 'Submit'),
			m('button.button.is-text', { onclick: () => this.hide() }, 'Cancel'),
		]);
	}

	view({ attrs }): Vnode {
		return m('div.modal', { class: this.visible ? 'is-active' : '' }, [
			m('div.modal-background', []),
			m('div.modal-card', [
				m('header.modal-card-head', [
					m('p.modal-card-title', this.header()),
					m('button.delete', { onclick: () => this.hide() }),
				]),
				m('section.modal-card-body', [
					this.content(attrs),
				]),
				m('footer.modal-card-foot', [
					this.footer(attrs),
				])
			]),
		]);
	}
}

export { Modal };

// Base modal component
// Inherit from this and override header, content and footer to use

// For weird JS reasons the state has to be managed by the caller and passed in
// The attrs should comply with the ModalAttrs interface
import m, { Vnode } from 'mithril';


interface ModalAttrs {
	visible: boolean,
	save: Function,
	toggle: Function,
}

class Modal {
	header() {
		return 'Default Modal';
	}

	content(attrs) {
		return m('p', 'This is the default modal');
	}

	footer(attrs) {
		return m('div.field', [
			m('button.button.is-primary', { onclick: () => attrs.save() }, 'Submit'),
			m('button.button.is-text', { onclick: () => attrs.toggle() }, 'Cancel'),
		]);
	}

	view({ attrs }: { attrs: ModalAttrs }): Vnode {
		return m('div.modal', { class: attrs.visible ? 'is-active' : '' }, [
			m('div.modal-background', []),
			m('div.modal-card', [
				m('header.modal-card-head', [
					m('p.modal-card-title', this.header()),
					m('button.delete', { onclick: () => attrs.toggle() }),
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

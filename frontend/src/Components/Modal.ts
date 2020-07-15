import m, { redraw, Vnode } from 'mithril';

class Modal {
	visible = false;

	toggle() {
		this.visible = !this.visible;
		// m.redraw();
	}

	view({ attrs }): Vnode {
		return m('div.modal', { class: this.visible ? 'is-active' : '' }, [
			m('div.modal-background', []),
			m('div.modal-card', [
				m('header.modal-card-head', [
					m('p.modal-card-title', attrs.header),
					m('button.delete', { onclick: () => this.toggle() }),
				]),
				m('section.modal-card-body', [
					attrs.content,
				]),
				m('footer.modal-card-foot', [
					attrs.footer,
				])
			]),
		]);
	}
}

export { Modal };

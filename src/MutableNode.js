import { $header, $resizer, Prop, Icon, createElement } from './elements';

export class MutableTextNode {
	constructor(text) {
		this.$el = document.createTextNode(text);
	}
	update(text) {
		this.$el.textContent = text;
	}
}

export class MutableNode {
	hidden = false;
	position = [0, 0];
	size = [0, 0];

	constructor({ props, type, owner, id }, { $rootContainer }) {
		this.$el = document.createElement('x-window');
		this.$props = document.createElement('x-props');
		this.$text = document.createElement('x-text-content');
		this.$children = document.createElement('x-children');
		this.type = type;
		this.owner = owner;
		this.$rootContainer = $rootContainer;
		this.$el.tabIndex = 0;
		this.id = id;

		Object.entries(props).forEach(([k, v]) => {
			this.setProp(k, v);
		});

		if (localStorage[this.id + '/position']) {
			this.setPosition(...JSON.parse(localStorage[this.id + '/position']));
		} else {
			this.setPosition(20, 20);
		}

		if (localStorage[this.id + '/size']) {
			this.setSize(...JSON.parse(localStorage[this.id + '/size']));
		} else {
			this.setSize(300, 300);
		}

		this.$el.appendChild(
			$header({
				name: [this.owner, this.type].join('/'),
				onMoveStart: () => {
					this.__lockedPosition = [...this.position];
				},
				onClose: () => {
					this.setHidden(true);
				},
				onMove: (x, y) => {
					this.setPosition(
						this.__lockedPosition[0] + x,
						this.__lockedPosition[1] + y
					);
				},
			})
		);
		this.$el.appendChild(
			$resizer({
				onResizeStart: () => {
					this.__lockedSize = [...this.size];
				},
				onResize: (x, y) => {
					this.setSize(this.__lockedSize[0] + x, this.__lockedSize[1] + y);
				},
			})
		);
		this.$el.appendChild(this.$text);
		this.$el.appendChild(this.$props);
		this.$el.appendChild(this.$children);
		this.$el.addEventListener('focus', () => {
			this.focus();
		});
		this.$el.addEventListener('click', () => {
			this.foreground();
		});
	}

	foreground() {
		if (!this.$rootContainer.dataset.lastStackIndex) {
			this.$rootContainer.dataset.lastStackIndex = 0;
		}
		this.$rootContainer.dataset.lastStackIndex++;
		this.$el.style.zIndex = this.$rootContainer.dataset.lastStackIndex;
	}

	focus() {
		this.foreground();
		this.$el.focus();
	}

	setPosition(x, y) {
		this.position = [x, y];
		this.$el.style.transform = `translateX(${x}px) translateY(${y}px)`;
		localStorage[this.id + '/position'] = JSON.stringify(this.position);
	}

	setSize(x, y) {
		this.size = [x, y];
		this.$el.style.width = `${x}px`;
		localStorage[this.id + '/size'] = JSON.stringify(this.size);
	}

	setHidden(to) {
		this.hidden = to;
		this.$el.hidden = to;
		localStorage[this.id + '/hidden'] = JSON.stringify(this.hidden);
		if (!to) {
			requestAnimationFrame(() => {
				this.focus();
			});
		}
	}

	setProp(name, val) {
		const cur = [...this.$props.children].findIndex(
			$el => $el.dataset.key === name
		);
		if (cur >= 0) {
			this.$props.replaceChild(
				Prop({ name, val, type: this.type }),
				this.$props.children[cur]
			);
		} else {
			this.$props.appendChild(Prop({ name, val, type: this.type }));
		}
	}

	appendChild(child) {
		child.parent = this;
		if (child instanceof MutableNode) {
			if (localStorage[child.id + '/hidden']) {
				child.setHidden(JSON.parse(localStorage[child.id + '/hidden']));
			} else {
				child.setHidden(true);
			}
			this.$rootContainer.appendChild(child.$el);
			this.$children.appendChild(
				Icon({
					name:
						child.owner === this.owner
							? child.type
							: createElement('span', {}, [
									createElement('x-small', {}, child.owner),
									child.type,
							  ]),
					type: child.type,
					owner: child.owner,
					controls: child,
					onClick: () => {
						if (child.hidden) {
							child.setPosition(...this.position.map(p => p + 20));
						}
						child.setHidden(false);
					},
				})
			);
		}
		if (child instanceof MutableTextNode) {
			this.$text.appendChild(child.$el);
		}
	}

	removeChild(child) {
		this.$rootContainer.removeChild(child.$el);
		this.$children.removeChild(
			[...this.$children.children].find(c => c.controls == child)
		);
	}
}

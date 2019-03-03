import { $header, $resizer, $prop, $icon } from './elements';

export class MutableNode {
	hidden = false;
	position = [0, 0];
	size = [0, 0];

	constructor({ props, type }, { $rootContainer }) {
		this.$el = document.createElement('x-window');
		this.$props = document.createElement('x-props');
		this.$textContent = document.createElement('x-text-content');
		this.$children = document.createElement('x-children');
		this.type = type;
		this.$rootContainer = $rootContainer;
		this.$el.tabIndex = 0;

		Object.entries(props).forEach(([k, v]) => {
			this.setProp(k, v);
		});

		this.setSize(300, 300);
		this.setPosition(20, 20);

		this.$el.appendChild(
			$header({
				name: this.type,
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
		this.$el.appendChild(this.$textContent);
		this.$el.appendChild(this.$props);
		this.$el.appendChild(this.$children);
		this.$el.addEventListener('click', () => {
			this.focus();
		});
	}

	focus() {
		this.$el.focus();
		if (!this.$rootContainer.dataset.lastStackIndex) {
			this.$rootContainer.dataset.lastStackIndex = 0;
		}
		this.$rootContainer.dataset.lastStackIndex++;
		this.$el.style.zIndex = this.$rootContainer.dataset.lastStackIndex;
	}

	setPosition(x, y) {
		this.position = [x, y];
		this.$el.style.transform = `translateX(${x}px) translateY(${y}px)`;
	}

	setSize(x, y) {
		this.size = [x, y];
		this.$el.style.width = `${x}px`;
	}

	setHidden(to) {
		this.hidden = to;
		this.$el.hidden = to;
		if (!to) {
			requestAnimationFrame(() => {
				this.focus();
			});
		}
	}

	setTextContent(content) {
		this.$textContent.innerText = content;
	}

	setProp(key, val) {
		const cur = [...this.$props.children].findIndex(
			$el => $el.dataset.key === key
		);
		if (cur >= 0) {
			this.$props.replaceChild($prop(key, val), this.$props.children[cur]);
		} else {
			this.$props.appendChild($prop(key, val));
		}
	}

	appendChild(child) {
		if (child.$el) {
			child.setHidden(true);
			this.$rootContainer.appendChild(child.$el);
			this.$children.appendChild(
				$icon({
					name: child.type,
					type: child.type,
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
	}

	removeChild(child) {
		this.$rootContainer.removeChild(child.$el);
		this.$children.removeChild(
			[...this.$children.children].find(c => c.controls == child)
		);
	}
}

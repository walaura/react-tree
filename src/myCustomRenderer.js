import ReactReconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

const hash = function(str) {
	let returnable = 0;
	returnable += str.length;
	for (var i = 0, len = str.length; i < len; i++) {
		returnable += str[i].charCodeAt();
	}

	return returnable % 278;
};

const $prop = (name, val) => {
	const $container = document.createElement('dl');
	const $name = document.createElement('dt');
	const $def = document.createElement('dd');

	$container.dataset.key = name;
	$name.innerText = name;

	if (name.substring(0, 2) === 'on') {
		const $btn = document.createElement('button');
		$btn.innerText = `fire ${name}`;
		$btn.addEventListener('click', val);
		$def.appendChild($btn);
	} else {
		$def.innerText = val;
	}

	$container.appendChild($name);
	$container.appendChild($def);

	return $container;
};

const $header = ({ name, onMove, onMoveStart, onClose }) => {
	const $header = document.createElement('header');
	const $close = document.createElement('button');
	$close.innerText = 'x';
	$close.onclick = () => {
		onClose();
	};

	let mousedown = false;
	let pos = [0, 0];
	$header.addEventListener('mousedown', ev => {
		pos = [ev.pageX, ev.pageY];
		onMoveStart();
		mousedown = true;
	});
	window.addEventListener('mouseup', () => {
		mousedown = false;
	});
	window.addEventListener('mousemove', ({ pageX, pageY }) => {
		if (mousedown) {
			const [originalX, originalY] = pos;
			onMove(pageX - originalX, pageY - originalY);
		}
	});
	$header.innerText = name;
	$header.appendChild($close);
	return $header;
};

const $resizer = ({ onResize, onResizeStart }) => {
	const $resize = document.createElement('button');
	$resize.classList.add('resizer');
	let mousedown = false;
	let pos = [0, 0];
	$resize.addEventListener('mousedown', ev => {
		pos = [ev.pageX, ev.pageY];
		onResizeStart();
		mousedown = true;
	});
	window.addEventListener('mouseup', () => {
		mousedown = false;
	});
	window.addEventListener('mousemove', ({ pageX, pageY }) => {
		if (mousedown) {
			const [originalX, originalY] = pos;
			onResize(pageX - originalX, pageY - originalY);
		}
	});
	return $resize;
};

const $icon = ({ name, type, controls, onClick }) => {
	const $btn = document.createElement('button');
	const $label = document.createElement('label');
	const $icon = document.createElement('img');

	import(`./icons/${hash(type)}.png`).then(icon => {
		$icon.src = icon;
	});

	$label.innerText = name;

	$btn.addEventListener('dblclick', onClick);
	$btn.addEventListener('click', ev => {
		$btn.focus();
		ev.stopPropagation();
	});
	$btn.controls = controls;
	$btn.appendChild($icon);
	$btn.appendChild($label);
	return $btn;
};

class MutableNode {
	_hidden = false;
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
					this.hidden = true;
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
	set hidden(to) {
		this._hidden = to;
		this.$el.hidden = to;
		if (!to) {
			requestAnimationFrame(() => {
				this.focus();
			});
		}
	}
	get hidden() {
		return this._hidden;
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
			child.hidden = true;
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
						child.hidden = false;
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

const isTextContent = content =>
	typeof content === 'string' || typeof content === 'number';

const hostConfig = {
	now: Date.now,
	getRootHostContext: () => {
		return rootHostContext;
	},
	prepareForCommit: () => {},
	resetAfterCommit: () => {},
	getChildHostContext: () => {
		return childHostContext;
	},
	shouldSetTextContent: (type, props) => {
		return isTextContent(props.children);
	},
	/**
   This is where react-reconciler wants to create an instance of UI element in terms of the target. Since our target here is the DOM, we will create document.createElement and type is the argument that contains the type string like div or img or h1 etc. The initial values of domElement attributes can be set in this function from the newProps argument
   */
	createInstance: (
		type,
		{ children, ...props },
		$rootContainer,
		_currentHostContext,
		workInProgress
	) => {
		const node = new MutableNode({ type, props }, { $rootContainer });
		if (!Array.isArray(children)) children = [children];
		children.map(child => {
			if (isTextContent(child)) {
				node.setTextContent(child);
			}
		});
		return node;
	},
	createTextInstance: text => {
		return document.createTextNode(text);
	},
	appendInitialChild: (parent, child) => {
		parent.appendChild(child);
	},
	appendChild: (parent, child) => {
		parent.appendChild(child);
	},
	finalizeInitialChildren: (domElement, type, props) => {},
	supportsMutation: true,
	appendChildToContainer: (parent, child) => {
		parent.appendChild(child.$el);
	},
	prepareUpdate(domElement, oldProps, newProps) {
		return true;
	},
	commitUpdate(node, updatePayload, type, oldProps, { children, ...props }) {
		Object.entries(props).forEach(([k, v]) => {
			node.setProp(k, v);
		});
		if (isTextContent(children)) {
			node.setTextContent(children);
		}
	},
	commitTextUpdate(textInstance, oldText, newText) {},
	removeChild(node, child) {
		node.removeChild(child);
	},
};
const ReactReconcilerInst = ReactReconciler(hostConfig);
export default {
	render: (reactElement, domElement, callback) => {
		// Create a root Container if it doesnt exist
		if (!domElement._rootContainer) {
			domElement._rootContainer = ReactReconcilerInst.createContainer(
				domElement,
				false
			);
		}

		// update the root Container
		return ReactReconcilerInst.updateContainer(
			reactElement,
			domElement._rootContainer,
			null,
			callback
		);
	},
};

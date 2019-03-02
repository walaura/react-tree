import ReactReconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

const displayProp = (name, val) => {
	if (name === 'onClick') {
		const $prop = document.createElement('button');
		$prop.innerText = `fire onclick`;
		$prop.addEventListener('click', val);
		$prop.dataset.key = name;
		return $prop;
	} else {
		const $prop = document.createElement('div');
		$prop.innerText = `${name}-${val}`;
		$prop.dataset.key = name;
		return $prop;
	}
};

class MutableNode {
	constructor({ props, type }) {
		this.$el = document.createElement('details');
		this.$props = document.createElement('x-props');
		this.$textContent = document.createElement('x-text-content');
		this.$children = document.createElement('x-children');
		this.$el.open = true;

		const $summary = document.createElement('summary');
		Object.entries(props).forEach(([k, v]) => {
			this.setProp(k, v);
		});

		$summary.innerText = type;
		this.$el.appendChild($summary);
		this.$el.appendChild(this.$textContent);
		this.$el.appendChild(this.$props);
		this.$el.appendChild(this.$children);
	}
	setTextContent(content) {
		this.$textContent.innerText = content;
	}
	setProp(key, val) {
		const cur = [...this.$props.children].findIndex(
			$el => $el.dataset.key === key
		);
		if (cur >= 0) {
			this.$props.replaceChild(
				displayProp(key, val),
				this.$props.children[cur]
			);
		} else {
			this.$props.appendChild(displayProp(key, val));
		}
	}
	appendChild(child) {
		if (child.$el) {
			this.$children.appendChild(child.$el);
		}
	}
	removeChild(child) {
		this.$children.removeChild(child.$el);
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
		rootContainerInstance,
		_currentHostContext,
		workInProgress
	) => {
		const node = new MutableNode({ type, props });
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

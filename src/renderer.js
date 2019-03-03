import ReactReconciler from 'react-reconciler';
import './renderer.css';

import { MutableNode } from './MutableNode';

const rootHostContext = {};
const childHostContext = {};

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
const render = (reactElement, domElement, callback) => {
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
};
export { render };

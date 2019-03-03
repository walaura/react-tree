import ReactReconciler from 'react-reconciler';

import { MutableNode, MutableTextNode } from './MutableNode';
import { Notifications } from './Notifications';

const rootHostContext = {};
const childHostContext = {};

const isTextContent = content =>
	typeof content === 'string' || typeof content === 'number';

const hostConfig = ({ notifications }) => ({
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
		return false;
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
		const id = [
			'localWindowState',
			workInProgress.key,
			workInProgress._debugSource.fileName,
			workInProgress._debugSource.lineNumber,
		].join('/');
		return new MutableNode(
			{ owner: workInProgress._debugOwner.type.name, type, props, id },
			{ $rootContainer }
		);
	},
	createTextInstance: text => {
		return new MutableTextNode(text);
	},
	appendInitialChild: (parent, child) => {
		parent.appendChild(child);
	},
	appendChild: (parent, child) => {
		notifications.add({
			title: 'new node',
			text: [child.owner, child.type].join('/'),
			node: child,
		});
		parent.appendChild(child);
	},
	finalizeInitialChildren: (domElement, type, props) => {},
	supportsMutation: true,
	appendChildToContainer: (parent, child) => {
		parent.appendChild(child.$el);
	},
	prepareUpdate(
		domElement,
		type,
		{ children: oldChildren, ...oldProps },
		{ children, ...newProps }
	) {
		const propKeys = [
			...new Set([...Object.keys(newProps), ...Object.keys(oldProps)]),
		];
		const payload = {};
		for (let key of propKeys) {
			if (
				key !== 'children' && // text children are already handled
				oldProps[key] !== newProps[key]
			) {
				payload[key] = newProps[key];
			}
		}
		return { children, ...payload };
	},
	commitUpdate(node, { children, ...props }, type, oldProps) {
		Object.entries(props).forEach(([k, v]) => {
			node.setProp(k, v);
			if (node.hidden && k.substring(0, 2) !== 'on') {
				notifications.add({
					title: 'updated props',
					text: `${k}:${JSON.stringify(v)}`,
					node,
				});
			}
		});
		if (!Array.isArray(children)) children = [children];
	},
	commitTextUpdate(textInstance, oldText, newText) {
		textInstance.update(newText);
		if (textInstance.parent && textInstance.parent.hidden) {
			notifications.add({
				node: textInstance.parent,
				title: 'updated text',
				text: `${oldText} -> ${newText}`,
			});
		}
	},
	removeChild(node, child) {
		node.removeChild(child);
	},
});

const render = (reactElement, $rootContainer, callback) => {
	const notifications = new Notifications({ $rootContainer });
	const ReactReconcilerInst = ReactReconciler(hostConfig({ notifications }));
	// Create a root Container if it doesnt exist
	if (!$rootContainer._rootContainer) {
		$rootContainer._rootContainer = ReactReconcilerInst.createContainer(
			$rootContainer,
			false
		);
	}
	import('./renderer.css');

	// update the root Container
	return ReactReconcilerInst.updateContainer(
		reactElement,
		$rootContainer._rootContainer,
		null,
		callback
	);
};
export { render };

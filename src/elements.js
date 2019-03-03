const hash = function(str) {
	let returnable = 0;
	returnable += str.length;
	for (var i = 0, len = str.length; i < len; i++) {
		returnable += str[i].charCodeAt();
	}

	return returnable % 278;
};

export const createElement = (el, props = {}, children = []) => {
	const $el = document.createElement(el);
	Object.entries(props).forEach(([k, v]) => {
		if (k.substring(0, 2) === 'on') {
			$el.addEventListener(k.substring(2).toLowerCase(), v);
		} else {
			$el.setAttribute(k, v);
		}
	});

	if (!Array.isArray(children)) children = [children];
	children
		.filter($child => !!$child)
		.forEach($child => {
			if (typeof $child === 'string' || typeof $child === 'number') {
				$el.appendChild(document.createTextNode($child));
			} else {
				$el.appendChild($child);
			}
		});

	return $el;
};

export const $prop = (name, val) => {
	const $name = createElement('dt');
	const $def = createElement('dd');

	$name.innerText = name;

	if (name === 'onChange') {
		const $btn = createElement('input', {
			[name]: val,
		});
		$def.appendChild($btn);
	} else if (name.substring(0, 2) === 'on') {
		const $btn = createElement(
			'button',
			{
				[name]: val,
			},
			[`fire ${name}`]
		);
		$def.appendChild($btn);
	} else {
		$def.innerText = val;
	}

	const $container = createElement('dl', { 'data-key': name }, [$name, $def]);

	return $container;
};

export const $header = ({ name, onMove, onMoveStart, onClose }) => {
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

export const $resizer = ({ onResize, onResizeStart }) => {
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

export const Icon = ({ name, type, owner, controls, onClick }) => {
	const $icon = createElement('img');
	const $ownerIcon = createElement('img', { 'data-mini': true });
	import(`./icons/${hash(type)}.png`).then(icon => {
		$icon.src = icon;
	});
	if (owner) {
		import(`./icons/${hash(owner)}.png`).then(icon => {
			$ownerIcon.src = icon;
		});
	}

	const $btn = createElement(
		'button',
		{
			onDblClick: onClick,
		},
		[$icon, owner && $ownerIcon, createElement('label', {}, name)]
	);

	$btn.controls = controls;
	return $btn;
};

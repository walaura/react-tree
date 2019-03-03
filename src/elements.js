const hash = function(str) {
	let returnable = 0;
	returnable += str.length;
	for (var i = 0, len = str.length; i < len; i++) {
		returnable += str[i].charCodeAt();
	}

	return returnable % 278;
};

export const $prop = (name, val) => {
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

export const $icon = ({ name, type, controls, onClick }) => {
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

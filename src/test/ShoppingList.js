import React, { Component, useState } from 'react';
import Clock from './Clock';
const ShoppingList = () => {
	const [list, updateList] = useState(['milk', 'eggs']);
	const [value, setValue] = useState('butter');
	return (
		<div>
			<h2>Shopping list</h2>
			<input
				type="text"
				value={value}
				onChange={ev => {
					setValue(ev.target.value);
				}}
			/>
			<button
				onClick={() => {
					updateList(list => [...list, value]);
					setValue('');
				}}
			>
				add note
			</button>
			<ul>
				{list.map((note, index) => (
					<li
						onClick={() => {
							updateList(list => list.filter((_, i) => i !== index));
						}}
						key={index}
					>
						{note}
					</li>
				))}
			</ul>
		</div>
	);
};
export default ShoppingList;

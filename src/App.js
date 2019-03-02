import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			counter: 0,
			notes: ['milk', 'eggs'],
		};
	}
	render() {
		return (
			<div className="App">
				<div>
					notes
					<button
						onClick={() =>
							this.setState(({ notes }) => ({ notes: [...notes, Date.now()] }))
						}
					>
						add note
						{JSON.stringify(this.state.notes)}
					</button>
					<ul>
						{this.state.notes.map((note, index) => (
							<li
								onClick={() => {
									this.setState(({ notes }) => ({
										notes: notes.filter((_, i) => i !== index),
									}));
								}}
								key={index}
							>
								{note}
							</li>
						))}
					</ul>
				</div>
				<div className="App-intro">
					<div className="button-container">
						<button
							className="decrement-button"
							onClick={() => this.setState({ counter: this.state.counter - 1 })}
						>
							-
						</button>
						<div className="counter-text">{this.state.counter}</div>
						<button
							className="increment-button"
							onClick={() => this.setState({ counter: this.state.counter + 1 })}
						>
							+
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default App;

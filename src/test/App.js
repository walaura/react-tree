import React, { Component } from 'react';
import Clock from './Clock';
import ShoppingList from './ShoppingList';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			counter: 0,
		};
	}
	render() {
		return (
			<div className="App" title="Test">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<Clock />
				<ShoppingList />
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

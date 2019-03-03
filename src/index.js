import React from 'react';
import { render as rrender } from 'react-dom';
import { render } from './renderer';
import App from './test/App';

render(<App />, document.getElementById('root'));

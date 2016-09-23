import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Joyride  from 'react-joyride';

import Todo from './Todo';
import Paths from './Paths';

// App component - represents the whole app
export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      steps: []
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        ready: true
      });
    }, 1000);
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.ready && this.state.ready) {
      this.refs.joyride.start();
    }
  }

  addStep(s) {
    if (!_.isArray(s)) s = [s];
    this.setState({
      steps: (this.state.steps.concat(s))
    }, () => {
      this.refs.joyride.start();
    });
  }

  render() {
    return (
      <div className="app">
        <Joyride ref="joyride" steps={this.state.steps} debug={false} joyrideType="continuous"/>
        <Todo addStep={this.addStep.bind(this)}/>
        <Paths addStep={this.addStep.bind(this)}/>
      </div>
    );
  }
};
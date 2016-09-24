import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Joyride  from 'react-joyride';

import Todo from './Todo';
import Paths from './Paths';
import About from './About';

// App component - represents the whole app
export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      steps: [],
      started: false
    };
  }

  addStep(s) {
    if (!_.isArray(s)) s = [s];
    this.setState({
      steps: (this.state.steps.concat(this.refs.joyride.parseSteps(s)))
    }, () => {
      if (!this.state.started) {
        this.setState({
          started: true
        }, () => this.refs.joyride.start(true))
      }

    });

  }

  joyrideCallback(e) {
    if (e.type === 'finished') {
      this.setState({started: false});
    }
  }

  render() {
    return (
      <div className="app">
        <Joyride ref="joyride"
                 steps={this.state.steps}
                 showSkipButton={true}
                 type={'continuous'}
                 callback={this.joyrideCallback.bind(this)}
               />
        <Todo addStep={this.addStep.bind(this)}/>
        <Paths addStep={this.addStep.bind(this)}/>
        <About/>
      </div>
    );
  }
};
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

// App component - represents the whole app
class Todo extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
      deleteTipShown: false,
      privateTipShown: false
    };
  }

  componentDidMount() {
    this.addStep({
      title: 'Welcome!',
      text: 'To try app you can sign up or use login/password from the right container',
      selector: '#sign-form',
      position: 'bottom'
    });
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted
    });
  }
  addStep(s) {
    this.props.addStep(s);
  }
  tipWasRendered(tip) {
    const stateKey = {'delete': 'deleteTipShown', 'private': 'privateTipShown'}[tip];
    this.setState({[stateKey]: true});
  }
  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task, i) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          index={i}
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
          addStep={this.addStep.bind(this)}
          deleteTipShown={this.state.deleteTipShown}
          privateTipShown={this.state.privateTipShown}
          tipWasRendered={this.tipWasRendered.bind(this)}
        />
      );
    });
  }
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>
          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>
          <div id="sign-form">
          <AccountsUIWrapper />
            </div>
          { this.props.currentUser ?
            <AddTodoForm addStep={this.props.addStep} /> : ''
          }
        </header>
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

class AddTodoForm extends React.Component {
  componentDidMount() {
    this.props.addStep({
      title: 'Add new path',
      text: 'Print your task and click "Enter" button',
      selector: '#add-task-field',
      position: 'bottom'
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    Meteor.call('tasks.insert', text);
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }
  render() {
    return <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
      <input
        type="text"
        ref="textInput"
        placeholder="Type to add new tasks"
        id="add-task-field"
      />
    </form>
  }
}

Todo.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object
};

export default createContainer(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user()
  };
}, Todo);
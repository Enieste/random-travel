import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

import { Tasks } from '../api/tasks.js';

export default class Task extends Component {
  constructor(props) {
    super(props);
    this.deleteButtonId = _.uniqueId('delete');
    this.toggleButtonId = _.uniqueId('toggle');
  }
  componentDidMount() {
    if (this.props.index === 0) {
      this.props.addStep([{
        title: 'Public/Private ',
        text: 'Click this button to change your task visibility to other users',
        selector: '#' + this.toggleButtonId,
        position: 'top'
      }, {
        title: 'Delete task',
        text: 'Click "X" to delete task',
        selector: '#' + this.deleteButtonId,
        position: 'top'
      }]);
    }

  }

  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  render() {
    // Give tasks a different className when they are checked off,
    // so that we can style them nicely in CSS

    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private
    });

    return (
      <li className={taskClassName}>
        <button id={this.deleteButtonId} className="delete" onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>

        <input
          type="checkbox"
          readOnly
          checked={this.props.task.checked}
          onClick={this.toggleChecked.bind(this)}
        />

        { this.props.showPrivateButton ? (
          <button id={this.toggleButtonId} className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

         <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}

Task.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  task: PropTypes.object.isRequired,
  showPrivateButton: React.PropTypes.bool.isRequired
};
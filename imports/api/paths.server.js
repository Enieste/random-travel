import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import randomPath from '../utils/randomPath'
import { Paths } from './paths';


// This code only runs on the server
// Only publish tasks that are public or belong to the current user
Meteor.publish('paths', function pathsPublication() {
  return Paths.find({
    //$or: [
    //  { private: { $ne: true } },
    //  { owner: this.userId }
    //]
  });
});

Meteor.methods({
  'paths.insert'() {
    // Make sure the user is logged in before adding a path
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    randomPath(null, Meteor.bindEnvironment((e, r) => {
      console.warn('azaza', e, r);
      Paths.insert({
        path: r,
        createdAt: new Date(),
        owner: this.userId
      });
    }))

  },
  'paths.remove'(pathID) {
    check(pathID, String);
    Paths.remove(pathID);
  }
  //'tasks.setChecked'(taskId, setChecked) {
  //  check(taskId, String);
  //  check(setChecked, Boolean);
  //
  //  const task = Tasks.findOne(taskId);
  //  if (task.private && task.owner !== this.userId) {
  //    // If the task is private, make sure only the owner can check it off
  //    throw new Meteor.Error('not-authorized');
  //  }
  //
  //  Tasks.update(taskId, { $set: { checked: setChecked } });
  //},
  //'tasks.setPrivate'(taskId, setToPrivate) {
  //  check(taskId, String);
  //  check(setToPrivate, Boolean);
  //
  //  const task = Tasks.findOne(taskId);
  //
  //  // Make sure only the task owner can make a task private
  //  if (task.owner !== this.userId) {
  //    throw new Meteor.Error('not-authorized');
  //  }
  //
  //  Tasks.update(taskId, { $set: { private: setToPrivate } });
  //}
});

const actions = {};

const addAction = (actionName, func) => {
  actions[actionName] = func;
};

const removeAction = (actionName) => {
  delete actions[actionName];
};

const getAction = actionName => actions[actionName] || (() => console.log('You are getting a null action'));

const OK_ACTION = 'okAction';
const CANCEL_ACTION = 'cancelAction';

const Module = {
  addAction,
  removeAction,
  getAction,
  OK_ACTION,
  CANCEL_ACTION
};

export default Module;

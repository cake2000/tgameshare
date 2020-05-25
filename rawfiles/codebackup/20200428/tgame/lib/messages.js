import { USER_ACTION_IN_ROOM } from './enum';

const generateSystemMessage = (message) => {
  switch (message.type) {
    case USER_ACTION_IN_ROOM.START_GAME:
      return ' has started game';
    case USER_ACTION_IN_ROOM.JOIN_ROOM:
      return ' has joined room';
    case USER_ACTION_IN_ROOM.QUIT_ROOM:
      return ' has quit room';
    case USER_ACTION_IN_ROOM.READY:
      return ' is ready';
    case USER_ACTION_IN_ROOM.NOT_READY:
      return ' is not ready';
    case USER_ACTION_IN_ROOM.CHANGE_HUMAN_TYPE:
      return ' has changed to Human type';
    case USER_ACTION_IN_ROOM.CHANGE_ROBOT_TYPE:
      return ' has changed to Robot type';
    case USER_ACTION_IN_ROOM.CHANGE_ROBOT_VERSION:
      return ` has changed Robot version to ${message.objective}`;
    default:
      return '';
  }
};

export {
  generateSystemMessage
};

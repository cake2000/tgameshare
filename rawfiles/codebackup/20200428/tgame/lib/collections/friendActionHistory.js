import { Mongo } from 'meteor/mongo';

const FriendActionHistory = new Mongo.Collection('FriendActionHistory');

export default FriendActionHistory;

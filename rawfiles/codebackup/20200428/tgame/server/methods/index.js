import account from './account';
import contact from './contact';
import admin from './admin';
import gameRoom from './gameRoom';
import tournament from './tournament';
import tbot from './tbot';
import factory from './factory';
import lectureserver from './lectureserver';
import gameMasterGameRoom from './gameMasterGameRoom';
import usercode from './usercode';
import posts from './posts';
import stripe from './stripe';
import bot from './bot';
import chatSupport from './chatSupport';

import notifications from './notification';
import gameItem from './gameItem';
import ranking from './ranking';
import languages from './languages';
import invitationLogs from './invitationLogs';
import game from './game';
import classes from './classes';
import userFixture from './fixtures/user';
import lessonChatHistory from './lessonChatHistory';
import challengeHistory from './challengeHistory';
import school from './school';
import coupon from './coupon';
import courseCoupon from './courseCoupon';

import remoteMethod from "./remoteMethod";

export default function () {
  admin();
  account();
  contact();
  notifications();
  gameRoom();
  tournament();
  tbot();
  gameMasterGameRoom();
  usercode();
  posts();
  stripe();
  bot();
  chatSupport();
  gameItem();
  ranking();
  languages();
  invitationLogs();
  game();
  classes();
  userFixture();
  lectureserver();
  lessonChatHistory();
  challengeHistory();
  factory();
  school();
  coupon();
  courseCoupon();

  remoteMethod();
}

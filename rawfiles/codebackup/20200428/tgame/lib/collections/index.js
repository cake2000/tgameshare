import Contact from './contact.js';
import Admin from './admin.js';
import Games from './games.js';
import GamesRelease from './gameRelease.js';
import GameRoom from './gameRoom.js';
import Posts from './posts.js';
import Comments from './comments.js';
import WaitingList from './waitingList.js';
import FriendWaitingList from './friendWaitingList.js';
import ActiveGameList from './activeGameList.js';
import Tournament from './tournament.js';
import TournamentSection from './tournamentSection.js';
import TournamentRound from './tournamentRound.js';
import UserCodeTesting from './userCodeTesting.js';
import UserAICodeProd from './userAICodeProd.js';
import FriendList from './friendList.js';
import FriendActionHistory from './friendActionHistory.js';
import UserChat from './userChat.js';
import Scenarios from './scenarios.js';
import UserScenarios from './userscenario.js';
import UserRobotCode from './userRobotCode.js';
import UserScratchAIFile from './userScratchAIFile.js';
import UserRobotCodeByLesson from './userRobotCodeByLesson.js';
import Notifications from './notifications';
import StripeCustomer from './stripecustomer.js';
import ChatSupport from './chatSupport.js';
import Message from './message.js';
import ParentEmail from './parentEmail.js';
import TBotQA from './tbotqa.js';
import TBotIssue from './tbotissue.js';
import GameItem from './gameItem';
import ZipCode from './zipCode';
import UserVisitHistory from './userVisitHistory';
import Languages from './languages';
import AutoRunMatchList from './autorunmatchlist';
import Evaluation from './evaluation';
import Classes from './classes';
import Categories from './categories';
import Persons from './persons';
import Lessons from './lessons';
import SlideContent from './slidecontent';
import UserLesson from './userLesson';
import UserTest from './userTest';
import UserFactoryCode from './userFactoryCode';
import LessonChatHistory from './lessonChatHistory';
import ChallengeHistory from './challengeHistory';
import Schools from './schools';
import Counts from './counts';
import StripePlans from './stripePlans';
import Coupons from './coupons';
import CourseCoupon from './courseCoupon';

if (Meteor.isClient) {
  export const Countdown = new Mongo.Collection('countdown');
  export const Actions = new Mongo.Collection('actions');
  export { default as InvitationLogs } from './invitationLogs';
}

export {
  Contact,
  Admin,
  Games,
  GamesRelease,
  GameRoom,
  Posts,
  Comments,
  WaitingList,
  FriendWaitingList,
  ActiveGameList,
  Tournament,
  UserCodeTesting,
  UserAICodeProd,
  FriendList,
  FriendActionHistory,
  TournamentSection,
  TournamentRound,
  UserChat,
  Scenarios,
  UserScenarios,
  UserRobotCode,
  UserScratchAIFile,
  UserRobotCodeByLesson,
  Notifications,
  StripeCustomer,
  ChatSupport,
  Message,
  ParentEmail,
  TBotIssue,
  TBotQA,
  GameItem,
  ZipCode,
  UserVisitHistory,
  Languages,
  AutoRunMatchList,
  Evaluation,
  Classes,
  Categories,
  Persons,
  Lessons,
  SlideContent,
  UserLesson,
  UserTest,
  UserFactoryCode,
  LessonChatHistory,
  ChallengeHistory,
  Schools,
  Counts,
  StripePlans,
  Coupons,
  CourseCoupon
};

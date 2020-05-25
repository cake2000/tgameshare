import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _ from 'lodash';
import _includes from 'lodash/includes';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import FactoryPageComponent from '../components/FactoryPage.jsx';
import { GameItem } from '../../../../lib/collections/index.js';
import { checkIsProUser } from '../../../../lib/util';
import { unlimitedSubsCache } from '../../../cache/index';
import {
  ITEM_GAME_TYPE
} from '../../../../lib/enum';
// import { TUTORIAL_STATUS, USER_TYPES, TUTORIAL_IMAGE, TUTORIAL_GROUP, TUTORIAL_LEVEL, COINS_WAGER } from '../../../../lib/enum';

export const composer = ({ context, clearErrors, gameId, history }, onData) => {
  const { Meteor, LocalState, Collections } = context();
  const { ChatSupport } = Collections;
  // const id = LocalState.get('lessonId') || lessonId;
  let isProfessionalUser = false;

  const user = Meteor.user();
  const userId = Meteor.userId();

  if (!userId) {
    history.push('/signin');
    return;
  }



  const handleGameItems = Meteor.subscribe('gameItem.getAll');

  // if (Meteor.subscribe('stripeCustomer.single').ready()) {
  //   isProfessionalUser = checkIsProUser();
  // } else {
  //   return;
  // }

  const defaultItems = _get(user, 'profile.itemGames');
  Meteor.subscribe('chatSupport.getByUserId');

  const chatSupport = ChatSupport.findOne({ userId: Meteor.userId() });


  if (unlimitedSubsCache.subscribe('userTestsByGame', gameId).ready() && unlimitedSubsCache.subscribe('userFactoryCodeByGame', gameId).ready() && (defaultItems && defaultItems.length > 0 && handleGameItems.ready()) ) {

    const defaultItemIds = _map(_filter(defaultItems, i => i.active), 'itemId');
    const config = {
      mainItems: _map(GameItem.find({
        type: { $in: [ITEM_GAME_TYPE.CUE, ITEM_GAME_TYPE.TANK] },
        _id: { $in: defaultItemIds }
      }).fetch(), gameItem => ({ ...gameItem, userId })),
      backgroundItems: _map(GameItem.find({
        type: { $in: [ITEM_GAME_TYPE.TABLE, ITEM_GAME_TYPE.TILE] },
        _id: { $in: defaultItemIds }
      }).fetch(), gameItem => ({ ...gameItem, userId }))
    };


    const realtests = Collections.UserTest.find({ gameId }).fetch();

    // make sure every user has at least one test and initial factory code
    if (!realtests || realtests.length == 0) {
      Meteor.call('createUserTestScriptForFactory', gameId, 0, "Default Test Case", (err) => {
        if (err) {
          console.log('err', err);
        }
      });
    } else {
      const tests = [];
      for (let k=0; k<20; k++) {
        if (k < realtests.length) {
          tests.push(realtests[k]);
        } else {
          tests.push({
            testSeq: k, testName: ""
          });
        }
      }
      const code = Collections.UserFactoryCode.findOne({ gameId });
      if (!code) {
        Meteor.call('createUserCodeForFactory', gameId, (err) => {
          if (err) {
            console.log('err', err);
          }
        });
      } else {
        onData(null, { Collections, tests, gameId, history, isProfessionalUser, user, config, chatSupport });
      }
    }

  }
};

export const depsMapper = (context, actions) => ({
  //updateProgress: actions.FactoryPage.updateProgress,
  // initializeUserFactory: actions.FactoryPage.initializeUserFactory,
  // selectGameTutorial: actions.tutorial.selectGameTutorial,
  //changeTutorial: actions.FactoryPage.changeTutorial,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(FactoryPageComponent);

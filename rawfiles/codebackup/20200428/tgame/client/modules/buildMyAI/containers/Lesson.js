import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import { GameItem } from '../../../../lib/collections/index.js';
import {
  TUTORIAL_STATUS, USER_TYPES, TUTORIAL_IMAGE, TUTORIAL_GROUP, TUTORIAL_LEVEL, COINS_WAGER, BACKGROUND_ITEMS, ITEM_GAME_TYPE
} from '../../../../lib/enum';

import LoadingPage from '../../loading/components/loadingPage.jsx';
import BuildMyAI from '../components/BuildMyAI.jsx';
import { unlimitedSubsCache } from '../../../cache/index';
import { Classes } from '../../../../lib/collections';

export const composer = ({ context, clearErrors, lessonId, studentId, classId, history }, onData) => {
  const { Meteor, Collections } = context();
  const id = lessonId;
  let tutorialProgress = -1;
  let scenario = null;
  let testcase = null;
  const user = Meteor.user();
  const userId = Meteor.userId();
  const classListHandle = Meteor.subscribe('classes.list');
  const p = id.split("_");
  const usertestid = p[1];
  const handleGameItems = Meteor.subscribe('gameItem.getAll');
  if (!user) return;
  const defaultItems = _get(user, 'profile.itemGames');
  if (defaultItems && defaultItems.length > 0 && handleGameItems.ready()) {
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

    if (Meteor.subscribe('mysuperclassusers').ready() && typeof (id) !== "undefined" && classListHandle.ready() && unlimitedSubsCache.subscribe('scenario.byId', id).ready() && (usertestid ? Meteor.subscribe('userscenario.byId', usertestid).ready() : true) ) {
      let c = Classes.findOne({ _id: classId, owner: Meteor.userId() });
      if (classId == "school") {
        // const users = Meteor.users.find(
        //   {  },
        //   {
        //     fields: {
        //       username: 1,
        //       avatar: 1
        //     }
        //   }
        // ).fetch();
      } else {
        if (!c.users.includes(studentId)) {
          console.log("you are not teacher of this student " + studentId);
          history.push(`/teacher`);
          return;
        }
      }


      scenario = Collections.Scenarios.findOne({ _id: id });
      if (!scenario) {
        testcase = Collections.UserScenarios.findOne({ _id: usertestid });
      }
      if (!scenario && !testcase) {
        history.push(`/${studentId}/class/${classId}`);
        return;
      }
      if (scenario) {
        const temporaryVar = user.tutorial ? user.tutorial.find(element =>
          element.id === scenario._id
        ) : undefined;
    
        if (temporaryVar) {
          tutorialProgress = temporaryVar.progress;
        }

      } else {
        scenario = testcase;
        scenario.isUserTest = true;
      }
      onData(null, { scenario, tutorialProgress, history, user, studentId, config, classId });
    }
  }
};

export const depsMapper = (context, actions) => ({
  updateProgress: actions.buildMyAI.updateProgress,
  changeTutorial: actions.buildMyAI.changeTutorial,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(BuildMyAI);

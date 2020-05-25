import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _includes from 'lodash/includes';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import BuildMyAIComponent from '../components/BuildMyAI.jsx';

import { unlimitedSubsCache } from '../../../cache/index';
import {
  TUTORIAL_STATUS, USER_TYPES, TUTORIAL_IMAGE, TUTORIAL_GROUP, TUTORIAL_LEVEL, COINS_WAGER, BACKGROUND_ITEMS, ITEM_GAME_TYPE
} from '../../../../lib/enum';
import { GameItem } from '../../../../lib/collections/index.js';
import { calcNewCodeBase } from '../../../../lib/util';

const buildScenario = (Collections, scenario, language) => {
  const instructions = [];
  let cleancodeSofar = '';
  if (scenario.applyBaselineCode && scenario.baselineCode.trim() !== '') {
    cleancodeSofar = scenario.baselineCode;
  }
  for (let i = 0; i < scenario.instructionElements.length; i += 1) {
    const element = scenario.instructionElements[i];
    if (element.elementType === 'Coding' || element.elementType === 'InitialCode') {
      if (element.cleancode && element.cleancode.trim() !== '') {
        if (element.elementType === 'InitialCode') cleancodeSofar = calcNewCodeBase(element.cleancode, cleancodeSofar);
        else cleancodeSofar = calcNewCodeBase(cleancodeSofar, element.cleancode);
      }
      element.cleancode = cleancodeSofar;
    } else if (element.elementType === "Language") {
      if (!element.languageSkills || element.languageSkills === '') continue;
      // get all language prerequisites specified in this element
      const prereqs = element.languageSkills.split('|');
      const elementId = element.elementId;
      const skills = [];
      for (let j = 0; j < prereqs.length; j++) {
        const tokens = prereqs[j].split(":");
        if (tokens && tokens.length === 2 && tokens[0].toLowerCase() === language.toLowerCase()) {
          skills.push(tokens[1]);
        }
      }
      // get all language elements
      for (let k = 0; k < skills.length; k++) {
        const skill = skills[k];
        const langLesson = Collections.Languages.findOne({ languageName: language, skill });
        if (langLesson && langLesson.instructionElements) {
          const elms = langLesson.instructionElements;
          elms.forEach((elm) => {
            elm.elementId = elementId.indexOf('.') < 0 ? `${elementId}.${elm.elementId}` : `${elementId}${elm.elementId}`;
            instructions.push(elm);
          });
        }
      }
      continue;
    }
    instructions.push(element);
  }
  scenario.instructionElements = instructions;
};

export const composer = ({
  context, tutorialId, history
}, onData) => {
  const { Meteor, LocalState, Collections } = context();
  const id = LocalState.get('TUTORIALID') || tutorialId;
  let tutorialProgress = -1;
  let scenario = null;
  const isProfessionalUser = false;

  const user = Meteor.user();
  const userId = Meteor.userId();

  
  const handleGameItems = Meteor.subscribe('gameItem.getAll');

  // if (Meteor.subscribe('stripeCustomer.single').ready()) {
  //   isProfessionalUser = checkIsProUser();
  // } else {
  //   return;
  // }

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
    if (tutorialId.indexOf("usertestcase") === 0) {
      const p = tutorialId.split("_");
      if (unlimitedSubsCache.subscribe('userscenario.byId', p[1]).ready()) {
        scenario = Collections.UserScenarios.findOne({ _id: p[1] });
        scenario.isUserTest = true;
        onData(null, {
          scenario, history, user, config
        });
      }
      return;
    }

    if (typeof (id) !== "undefined" && unlimitedSubsCache.subscribe('scenario.byId', id).ready()) {
      scenario = Collections.Scenarios.findOne({ _id: id });
      if (!scenario) {
        history.push('/courses');
        return;
      }
      if (user == null) {
        history.push('/signin');
        return;
      }
      const language = user.defaultLanguage ? user.defaultLanguage : 'JavaScript';
      if (Meteor.subscribe('language.getName', language).ready()) {
        buildScenario(Collections, scenario, language);
      }

      const temporaryVar = user.tutorial ? user.tutorial.find(element => element.id === scenario._id) : undefined;

      if (temporaryVar) {
        tutorialProgress = temporaryVar.progress;
      } else {
        const isTeacher = _includes(_get(user.getPerson(), 'type', []), USER_TYPES.TEACHER);
        if (false && scenario.ScenarioSequenceNumber !== 1 && !isTeacher && userId !== "kEmnDrYssC2gKNDxx" && userId.indexOf("TestAI") < 0) {
          // aaaa testing hack: don't lock it?
          if (scenario.package === "starter") { // if intermediate, then proceed anyways
            history.push('/courses');
            return;
          }
        }
      }

      onData(null, {
        scenario, tutorialProgress, history, isProfessionalUser, user, config
      });
    }
  }
};

export const depsMapper = (context, actions) => ({
  updateProgress: actions.buildMyAI.updateProgress,
  changeTutorial: actions.buildMyAI.changeTutorial,
  selectGameTutorial: actions.tutorial.selectGameTutorial,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(BuildMyAIComponent);

import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _ from 'lodash';
import _includes from 'lodash/includes';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import LessonPageComponent from '../components/LessonPage.jsx';
import { GameItem, Classes } from '../../../../lib/collections/index.js';
import { checkIsProUser } from '../../../../lib/util';
import { unlimitedSubsCache } from '../../../cache/index';
import {ITEM_GAME_TYPE, TUTORIAL_STATUS, USER_TYPES, TUTORIAL_IMAGE, TUTORIAL_GROUP, TUTORIAL_LEVEL, COINS_WAGER } from '../../../../lib/enum';

// const buildScenario = (Collections, lesson, language) => {
//   const instructions = [];
//   for (let i = 0; i < lesson.instructionElements.length; i += 1) {
//     const element = lesson.instructionElements[i];
//     if (element.elementType === "Language") {
//       if (!element.languageSkills || element.languageSkills === '') continue;
//       // get all language prerequisites specified in this element
//       const prereqs = element.languageSkills.split('|');
//       const elementId = element.elementId;
//       const skills = [];
//       for (let j = 0; j < prereqs.length; j++) {
//         const tokens = prereqs[j].split(":");
//         if (tokens && tokens.length === 2 && tokens[0].toLowerCase() === language.toLowerCase()) {
//           skills.push(tokens[1]);
//         }
//       }
//       // get all language elements
//       for (let k = 0; k < skills.length; k++) {
//         const skill = skills[k];
//         const langLesson = Collections.Languages.findOne({ languageName: language, skill });
//         if (langLesson && langLesson.instructionElements) {
//           const elms = langLesson.instructionElements;
//           elms.forEach((elm) => {
//             elm.elementId = elementId.indexOf('.') < 0 ? `${elementId}.${elm.elementId}` : `${elementId}${elm.elementId}`;
//             instructions.push(elm);
//           });
//         }
//       }
//     } else {
//       instructions.push(element);
//     }
//   }
//   lesson.instructionElements = instructions;
// };


export const composer = ({ context, clearErrors, lessonId, history }, onData) => {
  const { Meteor, LocalState, Collections } = context();
  // const id = LocalState.get('lessonId') || lessonId;
  const id = lessonId;
  let lessonProgress = -1;
  let lesson = null;
  let isProfessionalUser = false;

  const user = Meteor.user();
  const userId = Meteor.userId();
  // if (lessonId.indexOf("usertestcase") == 0 ) {
  //   const p = lessonId.split("_");
  //   if (unlimitedSubsCache.subscribe('userscenario.byId', p[1]).ready()) {
  //     lesson = Collections.UserScenarios.findOne({ _id: p[1] });
  //     lesson.isUserTest = true;
  //     onData(null, { lesson, history, user });
  //   }
  //   return;
  // }


  const handleGameItems = Meteor.subscribe('gameItem.getAll');

  const defaultItems = _get(user, 'profile.itemGames');

  if (defaultItems && Meteor.subscribe('allmystudents').ready() && defaultItems.length > 0 && handleGameItems.ready() && typeof (id) !== "undefined" && unlimitedSubsCache.subscribe('lesson.byId', id).ready()) {

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


    lesson = Collections.Lessons.findOne({ _id: id });
    
    if (!lesson) {
      history.push('/courses');
      return;
    }
    if (lesson.slideFileId.startsWith('school_')) {
      window.currentChosenLocale = "EN";
      if (lesson.slideFileId.endsWith('_ch')) {
        window.currentChosenLocale = "CH";
      }
    }
    if (user == null) {
      history.push('/signin');
      return;
    }

    const { canViewSchool } = Meteor.user();

    if ((lesson.package == "schoolA" || lesson.package == "schoolB") && !canViewSchool) {
      history.push('/courses');
      return;
    }

    const userLessonHandle = Meteor.subscribe('AllUserLesson', lesson._id, userId);
    const userAllLessonHandle = Meteor.subscribe('AllUserLessonLogs');
    const allclassesHandle = Meteor.subscribe('classes.list');
    
    const chatSupportHandle = Meteor.subscribe('chatSupport.getByUserId');
    const slideContentHandle = Meteor.subscribe('AllSlideContent', lesson.slideFileId);
    if (allclassesHandle.ready() && slideContentHandle.ready() && userLessonHandle.ready() && userAllLessonHandle.ready() && chatSupportHandle.ready()) {

      let studentUsers = Meteor.users.find({}).fetch();


      const userLesson = Collections.UserLesson.findOne({
        lessonId: lesson._id, userId
      });
      const chatSupport = Collections.ChatSupport.findOne({ userId: Meteor.userId() });
      if (!userLesson) {
        Meteor.call('initializeUserLessonServer', lesson._id, (err) => {
          if (err) {
            console.log('err', err);
          }
        });
      } else {
        const classList = Classes.find(
          {
            owner: userId
          },
          {
            fields: {
              name: 1, isScreenLocked: 1, users: 1
            }
          }
        ).fetch();
        const slideContent = Collections.SlideContent.findOne({_id: lesson.slideFileId});
        const allLogs = Collections.UserLesson.find({
          userId
        }).fetch();
        // when we get into render, userlesson must be initialized already!
        onData(null, {syncMode: user.syncMode, studentUsers, classList, lesson, userLesson, allLogs, slideContent, history, isProfessionalUser, user, config, chatSupport });
      }
    }

    // const language = user.defaultLanguage ? user.defaultLanguage : 'JavaScript';
    // if (Meteor.subscribe('language.getName', language).ready()) {
    //   buildScenario(Collections, lesson, language);
    // }

    // const temporaryVar = Collections.Languages.UserLesson ? Collections.Languages.UserLesson.find(element =>
    //   element.id === lesson._id
    // ) : undefined;

    // if (temporaryVar) {
    //   lessonProgress = temporaryVar.progress;
    // } else {
    //   const isTeacher = _.includes(_.get(user.getPerson(), 'type', []), USER_TYPES.TEACHER);
    //   if (lesson.ScenarioSequenceNumber != 1 && !isTeacher && Meteor.userId() != "kEmnDrYssC2gKNDxx" && Meteor.userId().indexOf("TestAI") < 0) {
    //     // aaaa testing hack: don't lock it?
    //     if (lesson.package == "starter") { // if intermediate, then proceed anyways
    //       // history.push('/lessonLinks');
    //       // return;
    //     }
    //   }
    // }
  }
};

export const depsMapper = (context, actions) => ({
  //updateProgress: actions.LessonPage.updateProgress,
  initializeUserLesson: actions.LessonPage.initializeUserLesson,
  selectGameTutorial: actions.tutorial.selectGameTutorial,
  //changeTutorial: actions.LessonPage.changeTutorial,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(LessonPageComponent);

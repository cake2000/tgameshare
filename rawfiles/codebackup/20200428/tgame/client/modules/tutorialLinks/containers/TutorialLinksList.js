import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { Random } from 'meteor/random';
import _ from 'lodash';
import TutorialLinksListComponent from '../components/TutorialLinksList.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
// import { checkIsProUser } from '../../../../lib/util';
import { unlimitedSubsCache } from '../../../cache/index';
import { MIGRATION_CONST, PACKAGE_TYPES } from '../../../../lib/enum.js';

export const composer = ({ context }, onData) => {
  const {
    Collections, Meteor, history, LocalState
  } = context();
  let lessons = null;
  let starterLessons = null;
  let intermediateLessons = null;
  let advancedLessons = null;
  let schoolLessons = null;
  const isProfessionalUser = false;
  const allUserS = [];
  var courses = [];
  const userData = Meteor.user();
  const selectedTutorial = LocalState.get('GAME_SELECTED_TUTORIAL');
  const gameId = _.get(selectedTutorial, 'gameId', MIGRATION_CONST.flappybirdGameId);
  const packageType = _.get(selectedTutorial, 'packageType', PACKAGE_TYPES.BEGINNER);
  const isSlideFormat = _.get(selectedTutorial, 'isSlideFormat', true);
  const collectionName = isSlideFormat ? 'Lessons' : 'Scenarios';
  const sequenceNumber = isSlideFormat ? 'LessonSequenceNumber' : 'ScenarioSequenceNumber';
  const tutorialName = isSlideFormat ? 'LessonName' : 'ScenarioName';

  // if (Meteor.subscribe('stripeCustomer.single').ready()) {
  //   isProfessionalUser = checkIsProUser();
  // } else {
  //   return;
  // }
  // const isProfessionalUser = true; // TODO: to get from user account info

  const testcase = unlimitedSubsCache.subscribe('scenarios.list.system', gameId);
  const userScenarios = unlimitedSubsCache.subscribe('user.scenarios', gameId);
  if (testcase.ready() && userScenarios.ready()) {
    const subLessonsAndCourses = Meteor.subscribe('users.getLessonsAndCourses');
    const subGames = Meteor.subscribe('games.list');
    if (subLessonsAndCourses.ready() && subGames.ready()) {
      const listGames = Collections.Games.find({ _id: { $in: [
        MIGRATION_CONST.poolGameId,
        MIGRATION_CONST.canvasGameId,
        MIGRATION_CONST.algorithmGameId,
        MIGRATION_CONST.tankGameId,
        MIGRATION_CONST.scratchGameId,
        MIGRATION_CONST.flappybirdGameId,
        MIGRATION_CONST.tankscratch2GameId,
        MIGRATION_CONST.scratchSoccerGameId,
        MIGRATION_CONST.drawingturtleGameId,
        MIGRATION_CONST.ia_k_turtleGameId,
        MIGRATION_CONST.generalconceptsGameId,
        MIGRATION_CONST.candycrushGameId,
        MIGRATION_CONST.appleharvestGameId,
        MIGRATION_CONST.recyclerGameId,
        MIGRATION_CONST.algoScratchGameId,
        MIGRATION_CONST.schoolAGameId,
        MIGRATION_CONST.schoolAGameCHId,
        MIGRATION_CONST.schoolBGameId,
        MIGRATION_CONST.schoolBGameCHId,
        MIGRATION_CONST.mazeGameId,
        MIGRATION_CONST.balloonBusterGameId
      ] } }).fetch();

      _.map(listGames, (game) => {
        const { imageUrl } = game;
        let packageTypes = _.map(PACKAGE_TYPES);
        // Note: Smart Tank only Beginner
        if (game._id === MIGRATION_CONST.schoolAGameCHId) {
          // packageTypes = [PACKAGE_TYPES.BEGINNER];
          // debugger;
        }
        const MAP_TEXT = {
          [PACKAGE_TYPES.BEGINNER]: '(Beginner)',
          [PACKAGE_TYPES.INTERMEDIATE]: '(Intermediate)',
          [PACKAGE_TYPES.ADVANCED]: '(Advanced)',
          [PACKAGE_TYPES.SCHOOLA]: '',
          [PACKAGE_TYPES.SCHOOLB]: ''
        };

        _.map(packageTypes, (_packageType) => {
          const totalLessons = Collections.Lessons.find({ gameId: game._id, package: _packageType }).count();
          if (totalLessons > 0) {
            let thetitle = game.title;
            if (game._id === MIGRATION_CONST.appleharvestGameId) {
              thetitle = "Scratch Basics I - Apple Harvest";
            }
            if (game._id === MIGRATION_CONST.mazeGameId) {
              thetitle = "Scratch Basics II - Maze";
            } 
            if (game._id == MIGRATION_CONST.recyclerGameId) {
              thetitle = "AI in Scratch - Super Recycler";
            }
            if (game._id == MIGRATION_CONST.algoScratchGameId) {
              thetitle = "Algorithm in Scratch";
            }
            if (game._id == MIGRATION_CONST.schoolAGameId) {
              thetitle = "Introduction to Computer Programming";
            }

            if (game._id === MIGRATION_CONST.schoolAGameCHId) {
              thetitle = "计算机编程入门";
            }

            if (game._id == MIGRATION_CONST.schoolBGameId) {
              thetitle = "Introduction to Computer Programming (2)";
            }

            if (game._id === MIGRATION_CONST.schoolBGameCHId) {
              thetitle = "计算机编程入门（２）";
            }


            if (game._id === MIGRATION_CONST.mazeGameId) {
              thetitle = "Scratch Basics II - Maze";
            }
            if (game._id === MIGRATION_CONST.balloonBusterGameId) {
              thetitle = "Scratch Basics III - Balloon Buster";
            }
            if (gameId == MIGRATION_CONST.scratchGameId) {
              thetitle = "AI in Scratch";
            }
            if (game._id == MIGRATION_CONST.flappybirdGameId) {
              thetitle = "AI in Scratch - Flappy Bird ";
            } 
            
            if (game._id == MIGRATION_CONST.candycrushGameId) {
              thetitle = "AI in Scratch - Candy Crush";
            } 

            if (game._id == MIGRATION_CONST.tankscratch2GameId) {
              thetitle = "AI in Scratch - Smart Tank";
            } 

            
            if (game._id == MIGRATION_CONST.scratchSoccerGameId) {
              thetitle = "AI in Scratch - Soccer";
            } 
            if (game._id == MIGRATION_CONST.drawingturtleGameId) {
              thetitle = "AI in Scratch - Drawing Turtle";
            } 

            if (game._id == MIGRATION_CONST.ia_k_turtleGameId) {
              thetitle = "Kindergarten Scratch - Drawing Turtle";
            }

            if (game._id == MIGRATION_CONST.generalconceptsGameId) {
              thetitle = "Introduction";
            } 

            if (game._id == MIGRATION_CONST.tankGameId) {
              thetitle = "AI in JavaScript - Smart Tank ";
            } 
            if (game._id == MIGRATION_CONST.poolGameId) {
              thetitle = "AI in JavaScript - Trajectory Pool";
            } 
            if (game._id == MIGRATION_CONST.canvasGameId) {
              thetitle = "AI in JavaScript - Printing and Drawing";
            }
            if (game._id == MIGRATION_CONST.algorithmGameId) {
              thetitle = "Data Structure and Algorithm in JavaScript";
            }

            courses.push({
              index: Random.id(),
              gameId: game._id,
              title: `${thetitle} ${MAP_TEXT[_packageType]}`,
              imageUrl,
              isSlideFormat: true,
              packageType: _packageType
            });
          }

          const totalScenarios = Collections.Scenarios.find({ gameId: game._id, package: _packageType }).count();
          if (totalScenarios > 0) {
            courses.push({
              index: Random.id(),
              gameId: game._id,
              title: `${MAP_TEXT[_packageType]} Tutorials for ${game.title} (Chat Format)`,
              imageUrl,
              isSlideFormat: false,
              packageType: _packageType
            });
          }
        });
      });

      // show new format lessons first
      courses.sort((b, a) => Number(a.isSlideFormat) - Number(b.isSlideFormat));

      const scratchCourses = courses.filter(c => c.gameId == MIGRATION_CONST.scratchGameId);
      const flappyCourses = courses.filter(c => c.gameId == MIGRATION_CONST.flappybirdGameId);
      const soccerCourses = courses.filter(c => c.gameId == MIGRATION_CONST.scratchSoccerGameId);
      const canvasCourses = []; //courses.filter(c => c.gameId == MIGRATION_CONST.canvasGameId);
      const algorithmCourses = courses.filter(c => c.gameId == MIGRATION_CONST.algorithmGameId);
      const turtleCourses = courses.filter(c => c.gameId == MIGRATION_CONST.drawingturtleGameId);
      const kturtleCourses = courses.filter(c => c.gameId == MIGRATION_CONST.ia_k_turtleGameId);
      const generalCourses = courses.filter(c => c.gameId == MIGRATION_CONST.generalconceptsGameId);
      const candyCourses = courses.filter(c => c.gameId == MIGRATION_CONST.candycrushGameId);
      const appleCourses = courses.filter(c => c.gameId == MIGRATION_CONST.appleharvestGameId);
      const recyclerCourses = courses.filter(c => c.gameId === MIGRATION_CONST.recyclerGameId);
      const algoScourses = courses.filter(c => c.gameId === MIGRATION_CONST.algoScratchGameId);
      const mazeCourses = courses.filter(c => c.gameId == MIGRATION_CONST.mazeGameId);
      const balloonCourses = courses.filter(c => c.gameId == MIGRATION_CONST.balloonBusterGameId);
      const levelACourses = courses.filter(c => c.gameId === MIGRATION_CONST.schoolAGameId);
      const levelACHCourses = courses.filter(c => c.gameId === MIGRATION_CONST.schoolAGameCHId);
      const levelBCourses = courses.filter(c => c.gameId === MIGRATION_CONST.schoolBGameId);
      const levelBCHCourses = courses.filter(c => c.gameId === MIGRATION_CONST.schoolBGameCHId);
      
      const tankScratchC = courses.filter(c => c.gameId == MIGRATION_CONST.tankscratch2GameId);
      const tankSlideCourses = courses.filter(c => c.gameId == MIGRATION_CONST.tankGameId && c.isSlideFormat);
      const otherCourses = courses.filter(c => c.gameId !== MIGRATION_CONST.flappybirdGameId && c.gameId !== MIGRATION_CONST.tankscratch2GameId && c.gameId !== MIGRATION_CONST.generalconceptsGameId && c.gameId !== MIGRATION_CONST.drawingturtleGameId && c.gameId !== MIGRATION_CONST.ia_k_turtleGameId && c.gameId !== MIGRATION_CONST.scratchSoccerGameId && c.gameId !== MIGRATION_CONST.scratchSoccerGameId && c.gameId !== MIGRATION_CONST.schoolAGameId && c.gameId !== MIGRATION_CONST.schoolAGameCHId  && c.gameId !== MIGRATION_CONST.schoolBGameId && c.gameId !== MIGRATION_CONST.schoolBGameCHId && c.gameId !== MIGRATION_CONST.candycrushGameId && c.gameId !== MIGRATION_CONST.scratchGameId && !(c.gameId == MIGRATION_CONST.tankGameId && c.isSlideFormat));

      //courses = appleCourses.concat(mazeCourses.concat(generalCourses.concat(flappyCourses.concat(turtleCourses.concat(tankScratchC.concat(soccerCourses.concat(candyCourses.concat(tankSlideCourses.concat(otherCourses.concat(levelACourses))))))))));
      courses = balloonCourses.concat(algorithmCourses.concat(canvasCourses.concat(generalCourses.concat(mazeCourses.concat(appleCourses.concat(flappyCourses.concat(turtleCourses.concat(tankScratchC.concat(soccerCourses.concat(candyCourses.concat(recyclerCourses.concat(tankSlideCourses.concat(algoScourses.concat(otherCourses.concat(levelACourses.concat(levelACHCourses.concat(levelBCourses.concat(levelBCHCourses))))))))))))))))));
    }

    const userS = Collections.UserScenarios.find(
      {
        gameId, userId: Meteor.userId()
      },
      // {
      //   fields: {
      //     _id: 1,
      //     ScenarioName: 1,
      //     ScenarioSequenceNumber: 1
      //   }
      // }
    ).fetch();

    // add 10 user tests for now
    for (let k = 0; k < 20; k++) {
      allUserS.push({
        _id: "", ScenarioName: "", ScenarioSequenceNumber: k
      });
    }

    for (let j = 0; j < userS.length; j++) {
      const u = userS[j];
      allUserS[u.ScenarioSequenceNumber] = u;
    }

    lessons = Collections[collectionName].find({
      gameId, userId: 'system'
    }, {
      fields: {
        _id: 1,
        userId: 1,
        package: 1,
        coins: 1,
        concepts: 1,
        lessonType: 1,
        locale: 1,
        studyTime: 1,
        [tutorialName]: 1,
        [sequenceNumber]: 1,
        Difficulty: 1,
        locked: 1,
        gameId: 1,
        gameName: 1,
        group: 1
      }
    }).fetch();
    lessons.sort((a, b) => a[sequenceNumber] - b[sequenceNumber]);
    // lessons = lessons.filter( e => !(e.LessonSequenceNumber >= 28 && e.gameId == MIGRATION_CONST.tankGameId)); // bbbbb
    starterLessons = lessons.filter(t => t.package === PACKAGE_TYPES.BEGINNER);
    if (true || isProfessionalUser) {
      intermediateLessons = lessons.filter(t =>   t.package === PACKAGE_TYPES.INTERMEDIATE);
      advancedLessons = lessons.filter(t =>  t.package === PACKAGE_TYPES.ADVANCED);
      schoolLessons = lessons.filter(t =>  t.package === PACKAGE_TYPES.SCHOOLA || t.package === PACKAGE_TYPES.SCHOOLB);
    } else {
      intermediateLessons = [];
      advancedLessons = [];
    }
  }

  const uniqueCourse = _.uniq(courses, item => [item.gameId, item.packageType].join());

  onData(null, {
    lessons,
    starterLessons,
    intermediateLessons,
    advancedLessons,
    schoolLessons,
    allUserS,
    history,
    userData,
    courses: uniqueCourse,
    gameId,
    packageType,
    isSlideFormat,
    selectedTutorial
  });
};

export const depsMapper = (context, actions) => ({
  selectGameTutorial: actions.tutorial.selectGameTutorial,
  changeTutorial: actions.tutorial.changeTutorial,
  tutorialBack: actions.tutorial.tutorialBack,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(TutorialLinksListComponent);

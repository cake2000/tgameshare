import { Random } from 'meteor/random';
import _ from 'lodash';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import PlayerCourses from '../components/playerHome/PlayerCourses.jsx';
import { MIGRATION_CONST, PACKAGE_TYPES } from '../../../../lib/enum.js';

export const composer = ({ context, history }, onData) => {
  const userId = Meteor.userId();
  const userData = Meteor.user();
  if (!userId) {
    history.push('/signin');
  }
  const { Collections } = context();
  const subUserTutorials = Meteor.subscribe('users.getTutorial');
  if (subUserTutorials.ready()) {
    const user = Meteor.users.findOne({ _id: userId }, { fields: { tutorial: 1 } });
    const subLessonsAndCourses = Meteor.subscribe('users.getLessonsAndCourses');
    const subGames = Meteor.subscribe('games.list');
    if (subLessonsAndCourses.ready() && subGames.ready()) {
      const { canViewSchool } = Meteor.user();
      var courses = [];
      var listGames = Collections.Games.find({ _id: { $in: [
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
        MIGRATION_CONST.mazeGameId,
        MIGRATION_CONST.balloonBusterGameId
        // MIGRATION_CONST.schoolAGameId
      ] } }).fetch();

      if (canViewSchool) {
        listGames = Collections.Games.find({ _id: { $in: [
          MIGRATION_CONST.poolGameId,
          MIGRATION_CONST.canvasGameId,
          MIGRATION_CONST.algorithmGameId,
          MIGRATION_CONST.tankGameId,
          MIGRATION_CONST.scratchGameId,
          MIGRATION_CONST.flappybirdGameId,
          MIGRATION_CONST.tankscratch2GameId,
          MIGRATION_CONST.scratchSoccerGameId,
          MIGRATION_CONST.drawingturtleGameId,
          MIGRATION_CONST.generalconceptsGameId,
          MIGRATION_CONST.candycrushGameId,
          MIGRATION_CONST.appleharvestGameId,
          MIGRATION_CONST.recyclerGameId,
          MIGRATION_CONST.algoScratchGameId,
          MIGRATION_CONST.mazeGameId,
          MIGRATION_CONST.balloonBusterGameId,
          MIGRATION_CONST.schoolAGameId,
          MIGRATION_CONST.schoolAGameCHId,
          MIGRATION_CONST.schoolBGameId,
          MIGRATION_CONST.schoolBGameCHId,
        ] } }).fetch();
  
      }


      const completedTutorialIds = _.map(_.filter(user.tutorial, ({ progress }) => progress === 1), 'id');

      _.map(listGames, (game) => {
        const { _id: gameId, imageUrl } = game;
        const packageTypes = _.map(PACKAGE_TYPES);
        // tank game only beginner
        const MAP_TEXT = {
          [PACKAGE_TYPES.BEGINNER]: 'Beginner',
          [PACKAGE_TYPES.INTERMEDIATE]: 'Intermediate',
          [PACKAGE_TYPES.ADVANCED]: 'Advanced',
          [PACKAGE_TYPES.SCHOOLA]: '',
          [PACKAGE_TYPES.SCHOOLB]: ''
        };

        _.map(packageTypes, (packageType) => {
          var allLessons = Collections.Lessons.find({ gameId, package: packageType}).fetch();
          if (allLessons.length == 44) {
            // debugger;
          }
          // allLessons = allLessons.filter(lesson => !lesson._id.endsWith("_CH"));
          const totalLessons = allLessons.length;
          let typeCourses = 'scratch';
          if (totalLessons > 0) {
            let thetitle = game.title;
            
            if (game._id == MIGRATION_CONST.appleharvestGameId) {
              thetitle = "Scratch Basics I - Apple Harvest";
            }
            if (game._id == MIGRATION_CONST.recyclerGameId) {
              thetitle = "AI in Scratch - Super Recycler";
            }
            if (game._id == MIGRATION_CONST.algoScratchGameId) {
              thetitle = "Algorithm in Scratch";
            }
            if (game._id === MIGRATION_CONST.mazeGameId) {
              thetitle = "Scratch Basics II - Maze";
            }
            if (game._id == MIGRATION_CONST.balloonBusterGameId) {
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
              typeCourses = 'javascript';
            }
            if (game._id == MIGRATION_CONST.poolGameId) {
              thetitle = "AI in JavaScript - Trajectory Pool";
              typeCourses = 'javascript';
            }

            if (game._id == MIGRATION_CONST.canvasGameId) {
              thetitle = "AI in JavaScript - Printing and Drawing";
              typeCourses = 'javascript';
            }

            if (game._id === MIGRATION_CONST.algorithmGameId) {
              thetitle = "Data Structure and Algorithm in JavaScript";
              typeCourses = 'javascript';
            }


            
            if (packageType == 'schoolA') {
              thetitle = "Introduction to Computer Programming";
              if (game._id === MIGRATION_CONST.schoolAGameCHId) {
                thetitle = "计算机编程入门";
              }
              typeCourses = 'school';
            }
            if (packageType == 'schoolB') {
              thetitle = "Introduction to Computer Programming (2)";
              if (game._id === MIGRATION_CONST.schoolBGameCHId) {
                thetitle = "计算机编程入门（2）";
              }
              typeCourses = 'school';
            }

            let url = imageUrl;
            if (url == "/images/turtlegreen.png" && packageType != "starter") {
              url = "/images/turtlecolor1.png";
            }

            courses.push({
              index: Random.id(),
              typeCourses,
              gameId,
              title: `${thetitle}`, // (${MAP_TEXT[packageType]})`,
              imageUrl: url,
              isSlideFormat: true,
              packageType,
              total: totalLessons,
              completed: Collections.Lessons.find({ gameId, _id: { $in: completedTutorialIds }, package: packageType }).count()
            });
          }

          const totalScenarios = Collections.Scenarios.find({ gameId, package: packageType }).count();
          if (totalScenarios > 0) {
            thetitle = game.title;
            if (game._id == MIGRATION_CONST.tankGameId) {
              thetitle = "Smart Tank AI in JavaScript";
            }
            if (game._id == MIGRATION_CONST.poolGameId) {
              thetitle = "Pool Game AI in JavaScript";
            }
            if (game._id == MIGRATION_CONST.poolGameId) {
              thetitle = "Canvasw AI in JavaScript";
            }
            courses.push({
              index: Random.id(),
              gameId,
              title: `${thetitle} (${MAP_TEXT[packageType]}, Chat Format)`,
              imageUrl,
              isSlideFormat: false,
              packageType,
              total: totalScenarios,
              completed: Collections.Scenarios.find({ gameId, _id: { $in: completedTutorialIds }, package: packageType }).count()
            });
          }
        });
      });

      // show new format lessons first
      courses.sort((b, a) => Number(a.isSlideFormat) - Number(b.isSlideFormat));

      const scratchCourses = courses.filter(c => c.gameId == MIGRATION_CONST.scratchGameId);
      const flappyCourses = courses.filter(c => c.gameId == MIGRATION_CONST.flappybirdGameId);
      const canvasCourses = []; //courses.filter(c => c.gameId == MIGRATION_CONST.canvasGameId);
      const algorithmCourses = courses.filter(c => c.gameId == MIGRATION_CONST.algorithmGameId);
      const soccerCourses = courses.filter(c => c.gameId == MIGRATION_CONST.scratchSoccerGameId);
      const turtleCourses = courses.filter(c => c.gameId == MIGRATION_CONST.drawingturtleGameId);
      const kturtleCourses = courses.filter(c => c.gameId == MIGRATION_CONST.ia_k_turtleGameId);
      const generalCourses = courses.filter(c => c.gameId == MIGRATION_CONST.generalconceptsGameId);
      const candyCourses = courses.filter(c => c.gameId == MIGRATION_CONST.candycrushGameId);
      const appleCourses = courses.filter(c => c.gameId === MIGRATION_CONST.appleharvestGameId);
      const recyclerCourses = courses.filter(c => c.gameId === MIGRATION_CONST.recyclerGameId);
      const algoScourses = courses.filter(c => c.gameId === MIGRATION_CONST.algoScratchGameId);
      const mazeCourses = courses.filter(c => c.gameId === MIGRATION_CONST.mazeGameId);
      const balloonCourses = courses.filter(c => c.gameId === MIGRATION_CONST.balloonBusterGameId);
      const levelACourses = []; //courses.filter(c => c.gameId === MIGRATION_CONST.schoolAGameId);
      

      const tankScratchC = courses.filter(c => c.gameId == MIGRATION_CONST.tankscratch2GameId);
      const tankSlideCourses = courses.filter(c => c.gameId == MIGRATION_CONST.tankGameId && c.isSlideFormat);
      const otherCourses = courses.filter(c => c.gameId !== MIGRATION_CONST.flappybirdGameId && c.gameId !== MIGRATION_CONST.tankscratch2GameId && c.gameId !== MIGRATION_CONST.generalconceptsGameId && c.gameId !== MIGRATION_CONST.scratchSoccerGameId && c.gameId !== MIGRATION_CONST.drawingturtleGameId && c.gameId !== MIGRATION_CONST.ia_k_turtleGameId && c.gameId !== MIGRATION_CONST.scratchSoccerGameId && c.gameId !== MIGRATION_CONST.candycrushGameId && c.gameId !== MIGRATION_CONST.scratchGameId　&& c.gameId !== MIGRATION_CONST.canvasGameId && c.gameId !== MIGRATION_CONST.algorithmGameId && !(c.gameId == MIGRATION_CONST.tankGameId && c.isSlideFormat));

      courses = balloonCourses.concat(algorithmCourses.concat(canvasCourses.concat(generalCourses.concat(mazeCourses.concat(appleCourses.concat(flappyCourses.concat(turtleCourses.concat(tankScratchC.concat(soccerCourses.concat(candyCourses.concat(recyclerCourses.concat(tankSlideCourses.concat(algoScourses.concat(otherCourses.concat(levelACourses)))))))))))))));

      let uniqueCourse = _.uniq(courses, item => [item.gameId, item.packageType].join());
      uniqueCourse.sort((a, b) =>{
        if (a.packageType <= b.packageType) return 1;
        return -1;
      });

      onData(null, { courses: uniqueCourse, userData });
    }
  } else {
    onData(null, {});
  }
};

export const depsMapper = (context, actions) => ({
  selectGameTutorial: actions.tutorial.selectGameTutorial,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(PlayerCourses);

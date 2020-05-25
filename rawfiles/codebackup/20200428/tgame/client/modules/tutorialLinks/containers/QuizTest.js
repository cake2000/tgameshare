import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import QuizTest from '../components/QuizTest.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context }, onData) => {
  const { Collections } = context();
  const evaluationHandler = Meteor.subscribe('evaluation.getByLanguage', 'JavaScript');
  let evaluation = [];

  if (evaluationHandler.ready()) {
    evaluation = Collections.Evaluation.find({ language: 'JavaScript' }).fetch();
  }

  onData(null, { evaluation });
};

export const depsMapper = (context, actions) => ({
  updateUserAssessment: actions.tutorial.updateUserAssessment,
  updateUserLanguageLevel: actions.tutorial.updateUserLanguageLevel,
  updateUserLanguageSkills: actions.tutorial.updateUserLanguageSkills,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(QuizTest);

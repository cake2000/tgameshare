import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ManualGameDetail from './../components/ManualGameDetail.jsx';

const sampleElementsList = [
  {
    title: 'What\'s pool game?',
    _id: '1',
  },
  {
    title: 'How many game type?',
    _id: '2',
  },
  {
    title: 'Could i play with AI?',
    _id: '3',
  },
  {
    title: 'How to play with friends?',
    _id: '4',
  },
  {
    title: 'How to play with other users\'s AI?',
    _id: '5',
  },
];

export const composer = ({ context, match }, onData) => {
  const { manualId } = match.params;
  // subscribe manual detail here with manualId
  onData(null, {
    elementList: sampleElementsList,
    gameDetail: {
      title: 'How to play pool game?'
    }
  });
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  changeElement: actions.manualDetail.changeElement
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ManualGameDetail);

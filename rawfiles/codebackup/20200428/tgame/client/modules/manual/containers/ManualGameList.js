import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ManualGameList from './../components/ManualGameList.jsx';

const sampleGameList = [
  {
    title: 'How to play game?',
    _id: '1',
    description: ''
  },
  {
    title: 'How to create game?',
    _id: '2',
  },
  {
    title: 'How to practice?',
    _id: '3',
  },
  {
    title: 'How to become teacher?',
    _id: '4',
  },
  {
    title: 'How to join tournament',
    _id: '5',
  },
  {
    title: 'How to play game?',
    _id: '6',
  },
  {
    title: 'How to create game?',
    _id: '7',
  },
  {
    title: 'How to practice?',
    _id: '8',
  },
  {
    title: 'How to become teacher?',
    _id: '9',
  },
  {
    title: 'How to join tournament',
    _id: '10',
  },
  {
    title: 'How to become teacher?',
    _id: '11',
  },
  {
    title: 'How to join tournament',
    _id: '12',
  },
];

export const composer = ({ context }, onData) => {
  onData(null, {
    gameList: sampleGameList
  });
};

export const depsMapper = (context, actions) => ({
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ManualGameList);

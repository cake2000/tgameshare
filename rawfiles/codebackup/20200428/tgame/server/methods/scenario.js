/* globals Roles */
/* eslint object-shorthand: [2, "consistent"] */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
  Scenarios
} from '../../lib/collections';

export default function () {
  Meteor.methods({
    
    'getNextScenarioId'(screnarioId) {
      check(screnarioId, String);
      const currentScenario = Scenarios.findOne({ _id: screnarioId });
      const { gameId } = currentScenario;
      const scenarios = Scenarios.find({ gameId: gameId, userId: 'system' }, { sort: { ScenarioSequenceNumber: 1 } }).fetch();
      let nextScenarioId = null;
      for (let j = 0; j < scenarios.length - 1; j++) {
        if (scenarios[j]._id === screnarioId) {
          nextScenarioId = scenarios[j + 1]._id;
        }
      }
      if (nextScenarioId) {
        return nextScenarioId;
      }
      return null;
    }
  });
}

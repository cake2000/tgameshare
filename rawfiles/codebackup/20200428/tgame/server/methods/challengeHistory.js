import { ChallengeHistory } from "../../lib/collections";

export default function () {
  Meteor.methods({
    'challengeHistory.create': function(challengeHistory) {
      check(challengeHistory, Object);

      return ChallengeHistory.insert({
        ...challengeHistory,
        createdAt: new Date()
      });
    }
  });
}

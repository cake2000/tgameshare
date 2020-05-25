import { MIGRATION_CONST } from '../../../lib/enum';

const prepareUserDataForTankGame = () => {
  const playGame = {
    gameId: MIGRATION_CONST.tankGameId,
    rating: 300
  };
  Meteor.users.update(
    {
      'playGames.gameId': {
        $ne: MIGRATION_CONST.tankGameId
      }
    },
    {
      $push: {
        playGames: playGame
      }
    },
    {
      multi: true
    }
  );
};

export default prepareUserDataForTankGame;

import { MIGRATION_CONST } from '../../../lib/enum';

const prepareUserDataForUnderminer = () => {
  const playGame = {
    gameId: MIGRATION_CONST.match3GameId,
    rating: 300
  };
  Meteor.users.update(
    {
      'playGames.gameId': {
        $ne: MIGRATION_CONST.match3GameId
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

export default prepareUserDataForUnderminer;

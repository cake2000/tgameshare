import { Games } from '../../../lib/collections'; // eslint-disable-line
import { MIGRATION_CONST, MULTIPLAYER_MODE } from '../../../lib/enum';

const tankGameId = MIGRATION_CONST.tankGameId; // eslint-disable-line
const poolGameId = MIGRATION_CONST.poolGameId; // eslint-disable-line

const prepareData = () => {
  Games.update(
    tankGameId,
    {
      $set: {
        multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1, MULTIPLAYER_MODE.MODE2VS2, MULTIPLAYER_MODE.MODE3VS3]
      }
    }
  );

  Games.update(
    poolGameId,
    {
      $set: {
        multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1]
      }
    }
  );
};

const prepareMultiplayerMode = () => {
  prepareData();
};

export default prepareMultiplayerMode;

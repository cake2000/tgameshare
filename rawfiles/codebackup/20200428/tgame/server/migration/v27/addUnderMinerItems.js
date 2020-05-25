import { ITEM_GAME_TYPE, MIGRATION_CONST } from '../../../lib/enum';
import { GameItem } from '../../../lib/collections';

const addUnderMinerItems = () => {
  const gameItems = [
    {
      _id: 'crystal0',
      name: 'Basic',
      price: 0,
      type: ITEM_GAME_TYPE.ITEM,
      gameId: MIGRATION_CONST.match3GameId,
      imageSrc: {
        thumb: '/images/Crystals/PNG/1.png',
        main: '/images/Crystals/PNG/'
      },
      defaultInTypes: true
    },
    {
      _id: 'crystal1',
      name: 'Animals',
      price: 4000,
      type: ITEM_GAME_TYPE.ITEM,
      gameId: MIGRATION_CONST.match3GameId,
      imageSrc: {
        thumb: '/images/Crystals/Animals/1.png',
        main: '/images/Crystals/Animals/'
      },
      defaultInTypes: false
    },
    {
      _id: 'crystal2',
      name: 'Fruits',
      price: 2000,
      type: ITEM_GAME_TYPE.ITEM,
      gameId: MIGRATION_CONST.match3GameId,
      imageSrc: {
        thumb: '/images/Crystals/Fruits/1.png',
        main: '/images/Crystals/Fruits/'
      },
      defaultInTypes: false
    },
    {
      _id: 'crystal3',
      name: 'Flowers',
      price: 6000,
      type: ITEM_GAME_TYPE.ITEM,
      gameId: MIGRATION_CONST.match3GameId,
      imageSrc: {
        thumb: '/images/Crystals/Flowers/1.png',
        main: '/images/Crystals/Flowers/'
      },
      defaultInTypes: false
    }
  ];
  GameItem.remove({ gameId: MIGRATION_CONST.match3GameId });
  GameItem.batchInsert(gameItems);
};

export default addUnderMinerItems;

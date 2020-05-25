import { ITEM_GAME_TYPE, MIGRATION_CONST } from '../../../lib/enum';
import { GameItem } from '../../../lib/collections';

const addPoolItems = () => {
  GameItem.remove({ _id: { $in: ['c9', 'c10', 'c11', 'c12', 't9', 't10', 't11', 't12'] } });
  const gameItems = [{
    _id: 'c9',
    name: 'Diamond King',
    price: 3000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Diamond King_Landscape.png',
      main: '/images/Diamond King.png'
    },
    defaultInTypes: false
  }, {
    _id: 'c10',
    name: 'Geometry And Algebra',
    price: 3000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Geometry And Algebra_Landscape.png',
      main: '/images/Geometry And Algebra.png'
    },
    defaultInTypes: false
  }, {
    _id: 'c11',
    name: 'Sun and Planets',
    price: 3000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Sun and Planets_Landscape.png',
      main: '/images/Sun and Planets.png'
    },
    defaultInTypes: false
  }, {
    _id: 'c12',
    name: 'Tulip Flower',
    price: 3000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Tulip Flower_Landscape.png',
      main: '/images/Tulip Flower.png'
    },
    defaultInTypes: false
  }, {
    _id: 't9',
    name: 'Diamond Forever',
    price: 0,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Diamond Forever Small.png',
      main: '/images/Diamond Forever.png',
      small: '/images/Diamond Forever Small.png'
    },
    defaultInTypes: true
  }, {
    _id: 't10',
    name: 'Math Genius',
    price: 6000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Math Genius Small.png',
      main: '/images/Math Genius.png',
      small: '/images/Math Genius Small.png'
    },
    defaultInTypes: false
  }, {
    _id: 't11',
    name: 'Solar System',
    price: 6000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Solar System Small.png',
      main: '/images/Solar System.png',
      small: '/images/Solar System Small.png'
    },
    defaultInTypes: false
  }, {
    _id: 't12',
    name: 'Tulip Garden',
    price: 6000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: MIGRATION_CONST.poolGameId,
    imageSrc: {
      thumb: '/images/Tulip Garden Small.png',
      main: '/images/Tulip Garden.png',
      small: '/images/Tulip Garden Small.png'
    },
    defaultInTypes: false
  }];

  Meteor.users.rawCollection().update(
    {},
    {
      $pull: {
        'profile.itemGames': {
          itemId: 't9'
        }
      }
    },
    {
      multi: true
    }
  );
  GameItem.update({ _id: 't0' }, { $set: { defaultInTypes: false } });
  GameItem.batchInsert(gameItems);

  const tableIds = [];
  tableIds.push(...GameItem.find({ type: 'Table' }, { fields: { _id: 1 } }).map(id => id._id));
  Meteor.users.rawCollection().update(
    {},
    {
      $set: {
        'profile.itemGames.$[elem].active': false
      }
    },
    {
      multi: true,
      arrayFilters: [
        {
          'elem.itemId': {
            $in: tableIds
          }
        }
      ]
    }
  );
  const defaultTable = {
    itemId: 't9',
    active: true
  };
  Meteor.users.update({}, {
    $push: {
      'profile.itemGames': defaultTable
    }
  }, { multi: true });
};

export default addPoolItems;

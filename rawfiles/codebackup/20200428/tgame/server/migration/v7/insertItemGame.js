import { GameItem, Games } from "../../../lib/collections";
import { ITEM_GAME_TYPE } from "../../../lib/enum";

export default function insertItemGame () {
  GameItem.remove({});
  const lookyPoolGame = Games.findOne({ name: 'lucky_pool' }, { fields: {
    name: 1,
    _id: 1,
  } });

  const gameItems = [{
    _id: 'c0',
    name: 'Basic',
    price: 0,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/diamondstick_Landscape.png',
      main: '/images/diamondstick.png',
    },
    defaultInTypes: true,
  }, {
    _id: 'c1',
    name: 'Golden Hand',
    price: 1000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Golden_Hand_Landscape.png',
      main: '/images/Golden_Hand.png',
    },
    defaultInTypes: false,
  }, {
    _id: 'c2',
    name: 'Alien Sword',
    price: 2000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Alien_Sword_Landscape.png',
      main: '/images/Alien_Sword.png',
    },
    defaultInTypes: false,
  }, {
    _id: 'c3',
    name: 'Royal Scepter',
    price: 3000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Royal_Scepter_Landscape.png',
      main: '/images/Royal_Scepter.png',
    },
    defaultInTypes: false,
  }, {
    _id: 'c4',
    name: 'Ancient Quest',
    price: 5000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Ancient_Quest_Landscape.png',
      main: '/images/Ancient_Quest.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't0',
    name: 'Basic',
    price: 0,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/diamondpoolicon.png',
      main: '/images/diamondpoolbig.png',
      small: '/images/diamondpoolsmall.png',
      //small: 'rt.png'
    },
    defaultInTypes: true,
  }, {
    _id: 't1',
    name: 'Golden Castle',
    price: 2000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Golden_Castle_Icon.png',
      main: '/images/Golden_Castle.png',
      small: '/images/Golden_Castle_Small.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't2',
    name: 'Alien Star',
    price: 4000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Alien_Star_Icon.png',
      main: '/images/Alien_Star.png',
      small: '/images/Alien_Star_Small.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't3',
    name: 'Royal House',
    price: 6000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Royal_House_Icon.png',
      main: '/images/Royal_House.png',
      small: '/images/Royal_House_Small.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't4',
    name: 'Ancient Myth',
    price: 10000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Ancient_Myth_Icon.png',
      main: '/images/Ancient_Myth.png',
      small: '/images/Ancient_Myth_Small.png',
    },
    defaultInTypes: false,
  }];

  // Insert them to database
  gameItems.forEach((gameItem) => {
    GameItem.insert(gameItem);
  });

  // Set item default for users

  const users = Meteor.users.find({}, {
    fields: {
      _id: 1,
    }
  }).fetch();
  const itemsInGame = GameItem.find({}).fetch();
  const itemGames = itemsInGame
      .filter(gameItem => gameItem.defaultInTypes === true)
      .map(gameItem => ({
        itemId: gameItem._id,
        active: true,
      }));
  users.forEach((user) => {
    Meteor.users.update(user._id, {
      $set: {
        'profile.itemGames': itemGames,
      }
    });
  });
}

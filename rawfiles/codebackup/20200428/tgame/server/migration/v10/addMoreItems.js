import { GameItem, Games } from "../../../lib/collections";
import { ITEM_GAME_TYPE } from "../../../lib/enum";

export default function addMoreItems () {
  const lookyPoolGame = Games.findOne({ name: 'lucky_pool' }, { fields: {
    name: 1,
    _id: 1,
  } });

  const gameItems = [{
    _id: 'c5',
    name: 'Blue Icicle',
    price: 1000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Blue_Icicle_Landscape.png',
      main: '/images/Blue_Icicle.png',
    },
    defaultInTypes: false,
  }, {
    _id: 'c6',
    name: 'Touch Of Fire',
    price: 2000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Touch_of_Fire_Landscape.png',
      main: '/images/Touch_of_Fire.png',
    },
    defaultInTypes: false,
  }, {
    _id: 'c7',
    name: 'Rainbow Wand',
    price: 3000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Rainbow_Wand_Landscape.png',
      main: '/images/Rainbow_Wand.png',
    },
    defaultInTypes: false,
  }, {
    _id: 'c8',
    name: 'Lightning Strike',
    price: 5000,
    type: ITEM_GAME_TYPE.CUE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Lightning_Strike_Landscape.png',
      main: '/images/Lightning_Strike.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't5',
    name: 'Snow World',
    price: 2000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Snow_World_Icon.png',
      main: '/images/Snow_World.png',
      small: '/images/Snow_World_Small.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't6',
    name: 'Sea Of Fire',
    price: 4000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Sea_of_Fire_Icon.png',
      main: '/images/Sea_of_Fire.png',
      small: '/images/Sea_of_Fire_Small.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't7',
    name: 'Rainbow Sky',
    price: 6000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Rainbow_Sky_Icon.png',
      main: '/images/Rainbow_Sky.png',
      small: '/images/Rainbow_Sky_Small.png',
    },
    defaultInTypes: false,
  }, {
    _id: 't8',
    name: 'Lightning Night',
    price: 10000,
    type: ITEM_GAME_TYPE.TABLE,
    gameId: lookyPoolGame._id,
    imageSrc: {
      thumb: '/images/Lightning_Night_Icon.png',
      main: '/images/Lightning_Night.png',
      small: '/images/Lightning_Night_Small.png',
    },
    defaultInTypes: false,
  }];

  // Insert them to database
  gameItems.forEach((gameItem) => {
    GameItem.insert(gameItem);
  });
}

import _each from 'lodash/each';
import { ITEM_GAME_TYPE, MIGRATION_CONST } from "../../../lib/enum";
import { GameItem } from "../../../lib/collections";

export default function addTankWarItems() {
  const gameItems = [
    // TANK
    {
      _id: 'ta0',
      group: 'basic',
      name: 'Basic',
      price: 0,
      type: ITEM_GAME_TYPE.TANK,
      gameId: MIGRATION_CONST.tankGameId,
      imageSrc: {
        thumb: '/images/tank1_blue_64.png',
        main: {
          blue: '/images/bluetanksheetof4.png',
          red: '/images/redtanksheetof4.png',
          white: '/images/whitetanksheetof4.png'
        }
      },
      defaultInTypes: true
    },
    {
      _id: 'ta1',
      group: 'agile',
      name: 'Agile Combat Vehicles',
      price: 2000,
      type: ITEM_GAME_TYPE.TANK,
      gameId: MIGRATION_CONST.tankGameId,
      imageSrc: {
        thumb: '/images/tank_blue_right.png',
        main: {
          blue: '/images/newblue4.png',
          red: '/images/newred4.png',
          white: '/images/newwhite4.png'
        }
      },
      defaultInTypes: false
    },

    // BACKGROUND
    {
      _id: 'ti0',
      group: 'basic',
      name: 'Basic',
      price: 0,
      type: ITEM_GAME_TYPE.TILE,
      gameId: MIGRATION_CONST.tankGameId,
      imageSrc: {
        thumb: '/images/tile_basic.png',
        main: {
          G: '/images/grassland1_64b.png',
          R: '/images/Obs_Rock_64.png',
          T: '/images/Obs_Shorttree_64.png',
          M: '/images/Obs_Mud_64.png',
          BBV: '/images/tank/rockrange_beginer_vertical.png',
          BBH: '/images/tank/rockrange_beginer_horizontal.png',
          BBHU: '/images/tank/rockrange_beginer_horizontal_2Update.png',
          BV: '/images/tank/rockrange_vertical.png',
          BH: '/images/tank/rockrange_horizontal.png',
          BHU: '/images/tank/rockrange_horizontal_2Update.png',
          BG: '/images/grassBack.png',
          BGB: '/images/grassBack_beginner.png'
        }
      },
      defaultInTypes: true
    },
    {
      _id: 'ti1',
      group: 'city',
      name: 'City Battle Field',
      price: 4000,
      type: ITEM_GAME_TYPE.TILE,
      gameId: MIGRATION_CONST.tankGameId,
      imageSrc: {
        thumb: '/images/cityfieldasset.jpg',
        main: {
          G: '/images/city_battle_field/road.png',
          R: '/images/city_battle_field/redhouse.png',
          T: '/images/city_battle_field/tree.png',
          M: '/images/city_battle_field/blocker.png',
          BBV: '/images/city_battle_field/houserange_beginner_vertical2.png',
          BBH: '/images/city_battle_field/houserange_beginner_horizontal.png',
          BBHU: '/images/city_battle_field/houserange_beginner_horizontal_withbuttons.png',
          BV: '/images/city_battle_field/houserange_vertical2.png',
          BH: '/images/city_battle_field/houserange_horizontal.png',
          BHU: '/images/city_battle_field/houserange_horizontal_withbuttons.png',
          BG: '/images/city_battle_field/roadback.png',
          BGB: '/images/city_battle_field/roadback_beginner.png'
        }
      },
      defaultInTypes: false
    }
  ];

  GameItem.remove({ gameId: MIGRATION_CONST.tankGameId });

  _each(gameItems, (gameItem) => {
    GameItem.insert(gameItem);
  });
}

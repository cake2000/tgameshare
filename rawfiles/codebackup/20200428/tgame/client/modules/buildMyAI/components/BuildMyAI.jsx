import React from 'react';
import isMobile from 'ismobilejs';
import ReactTooltip from 'react-tooltip';
import _get from 'lodash/get';
// import LessonsSliderComponent from './lessonsSlider.jsx';
import LessonChat from '../containers/LessonChat.js';
import CodeMirrorComponent from '../containers/CodeMirror.js';
import PoolComponent from '../../games/gamePool/lib/TrajectoryPoolComponent.jsx';
import TankWarComponent from '../../games/gamePool/lib/TankWarComponent.jsx';
import WrapperLayout from './WrapperLayout.jsx';
import NoDraggingLayout from './BuildLayout.jsx';
import { ITEM_GAME_TYPE, MIGRATION_CONST } from '../../../../lib/enum';
import { LAYOUT_OPTION, LAYOUT_OPTION_TEXT } from '../../../../lib/const';

const TableItems = [
  // prod:
  { _id: "7E4j6FsifyBpeAeoa", imageSrc: { main: "/images/Royal_House.png" } },
  { _id: "Rtcy3tJ4oBJwgyLy9", imageSrc: { main: "/images/diamondpoolbig.png", small: '/images/diamondpoolsmall.png' } },
  { _id: "Sgwizr3nica5WK4bh", imageSrc: { main: "/images/Golden_Castle.png", small: '/images/Golden_Castle_Small.png' } },
  { _id: "quMQHY6AMsxCnyCvK", imageSrc: { main: "/images/Ancient_Myth.png", small: '/images/Ancient_Myth_Small.png' } },
  { _id: "yLvYzkus9J95AeX9x", imageSrc: { main: "/images/Alien_Star.png", small: '/images/Alien_Star_Small.png' } },
  { _id: "hX3pPPHXuxidqCxTd", imageSrc: { main: "/images/Snow_World.png", small: '/images/Snow_World_Small.png' } },
  { _id: "KfmwHqBhHZzfwtqPa", imageSrc: { main: "/images/Sea_of_Fire.png", small: '/images/Sea_of_Fire_Small.png' } },
  { _id: "STSkfQKavWyLPJicg", imageSrc: { main: "/images/Rainbow_Sky.png", small: '/images/Rainbow_Sky_Small.png' } },
  { _id: "abWD4BRpqi3Mo76iE", imageSrc: { main: "/images/Lightning_Night.png", small: '/images/Lightning_Night_Small.png' } },

  // local:
  { _id: "t0", imageSrc: { main: "/images/diamondpoolbig.png", small: '/images/diamondpoolsmall.png' } },
  { _id: "t1", imageSrc: { main: "/images/Golden_Castle.png", small: '/images/Golden_Castle_Small.png' } },
  { _id: "t2", imageSrc: { main: "/images/Alien_Star.png", small: '/images/Alien_Star_Small.png' } },
  { _id: "t3", imageSrc: { main: "/images/Royal_House.png", small: '/images/Royal_House_Small.png' } },
  { _id: "t4", imageSrc: { main: "/images/Ancient_Myth.png", small: '/images/Ancient_Myth_Small.png' } },
  { _id: "t5", imageSrc: { main: "/images/Snow_World.png", small: '/images/Snow_World_Small.png' } },
  { _id: "t6", imageSrc: { main: "/images/Sea_of_Fire.png", small: '/images/Sea_of_Fire_Small.png' } },
  { _id: "t7", imageSrc: { main: "/images/Rainbow_Sky.png", small: '/images/Rainbow_Sky_Small.png' } },
  { _id: "t8", imageSrc: { main: "/images/Lightning_Night.png", small: '/images/Lightning_Night_Small.png' } }
];

const CueItems = [
  // prod:
  { _id: "53v2n8xavTiCGQ2ZX", imageSrc: { main: "/images/Ancient_Quest.png" } },
  { _id: "Bv7RuezX9knCFHxrr", imageSrc: { main: "/images/Alien_Sword.png" } },
  { _id: "Edry7djosjy4aitzQ", imageSrc: { main: "/images/poolstickpurple.png" } },
  { _id: "J8bX92GfbcRkuAwNZ", imageSrc: { main: "/images/Golden_Hand.png" } },
  { _id: "dYFtwZ4kGnKLX2rW2", imageSrc: { main: "/images/Royal_Scepter.png" } },
  { _id: "Td79rWQAYYXihrRxL", imageSrc: { main: "/images/Blue_Icicle.png" } },
  { _id: "WfoQ5Le7Eekzrqyfj", imageSrc: { main: "/images/Touch_of_Fire.png" } },
  { _id: "DhF8Su2j9DazqJxZW", imageSrc: { main: "/images/Rainbow_Wand.png" } },
  { _id: "JZcHrbiEvSqKMuem8", imageSrc: { main: "/images/Lightning_Strike.png" } },

  // local:
  { _id: "c0", imageSrc: { main: "/images/poolstickpurple.png" } },
  { _id: "c1", imageSrc: { main: "/images/Golden_Hand.png" } },
  { _id: "c2", imageSrc: { main: "/images/Alien_Sword.png" } },
  { _id: "c3", imageSrc: { main: "/images/Royal_Scepter.png" } },
  { _id: "c4", imageSrc: { main: "/images/Ancient_Quest.png" } },
  { _id: "c5", imageSrc: { main: "/images/Blue_Icicle.png" } },
  { _id: "c6", imageSrc: { main: "/images/Touch_of_Fire.png" } },
  { _id: "c7", imageSrc: { main: "/images/Rainbow_Wand.png" } },
  { _id: "c8", imageSrc: { main: "/images/Lightning_Strike.png" } }

];


class BuildMyAIComponent extends React.Component {
  static defaultProps = {
    scenario: null
  }

  constructor(props) {
    super(props);
    const widthWindow = window.innerWidth;
    this.state = {
      layoutSelected: widthWindow > 480 ? 'OPTION1' : 'OPTION6',
      config: {}
    };
  }

  componentWillMount() {
    this.getConfig();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  getConfig = () => {
    const { config: { mainItems, backgroundItems } } = this.props;
    // const items = Meteor.user().profile.itemGames;
    // const config = { };
    // // get cue stick
    // for (let k = 0; k < items.length; k++) {
    //   if (items[k].active) {
    //     for (let j = 0; j < CueItems.length; j++) {
    //       if (CueItems[j]._id == items[k].itemId) {
    //         config.mainItems = CueItems[j];
    //         break;
    //       }
    //     }
    //   }
    //   if (config.mainItems) break;
    // }

    // // get table
    // for (let k = 0; k < items.length; k++) {
    //   if (items[k].active) {
    //     for (let j = 0; j < TableItems.length; j++) {
    //       if (TableItems[j]._id == items[k].itemId) {
    //         config.backgroundItems = TableItems[j];
    //         break;
    //       }
    //     }
    //   }
    //   if (config.backgroundItems) break;
    // }

    this.setState({
      config: { mainItems, backgroundItems }
    });
  }

  // getConfigOld = async () => {
  //   const cueStickItem = await this.getGameItemByType(ITEM_GAME_TYPE.CUE);
  //   const poolTableItem = await this.getGameItemByType(ITEM_GAME_TYPE.TABLE);
  //   const config = {
  //     mainItems: cueStickItem,
  //     backgroundItems: poolTableItem
  //   };
  //   this.setState({
  //     config
  //   });
  // }

  getGameItemByType = type => new Promise((resolve, reject) => {
    const { user } = this.props;
    const itemIds = _get(user, 'profile.itemGames', [])
      .filter(item => item.active === true)
      .map(item => item.itemId);
    Meteor.call('gameItem.getByType', itemIds, type, (error, result) => {
      if (!error) {
        return resolve(result);
      }
      return reject(error);
    });
  });

  backFunction() {
    const { history, scenario, selectGameTutorial, classId } = this.props;
    const { gameId, package: packageType } = scenario || {};

    if (!selectGameTutorial && classId) {
      // back to class
      history.push("/class/" + classId);
      return;
    }

    selectGameTutorial({
      gameId,
      packageType,
      isSlideFormat: false
    });
    history.push('/courses');
  }

  handleChangeLayout = (value) => {
    this.setState({
      layoutSelected: value
    });
    if (window.testGameComponent) {
      setTimeout(() => {
        window.testGameComponent.tryResize();
      }, 200);
    }
  }

  render() {
    const { scenario, history, studentId } = this.props;
    const { config } = this.state;
    // console.log("in build my ai scenario id " + scenario._id + " ");
    const layoutOption = LAYOUT_OPTION[this.state.layoutSelected];
    const childrens = layoutOption.map((layout) => {
      switch (layout.i) {
        case 'chat':
          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <LessonChat
                scenario={scenario}
                history={history}
                studentId={studentId}
              />
            </WrapperLayout>
          );
        case 'game':
          if (scenario.gameId == MIGRATION_CONST.poolGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <PoolComponent config={config} isTesting scenario={scenario} isProfessionalUser />
              </WrapperLayout>
            );
          }
          if (scenario.gameId == MIGRATION_CONST.tankGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <TankWarComponent config={config} isTesting scenario={scenario} isProfessionalUser />
              </WrapperLayout>
            );
          }

        case 'editor':
          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <CodeMirrorComponent scenarioProps={scenario} isProfessionalUser />
            </WrapperLayout>
          );
        default: return (<div />);
      }
    });
    return (
      <div className="tg-page tg-page--buildmyAI" id="build-my-AI">
        <div className="tg-page__header">
          <div className="tg-page__header__block tg-container ">
            <div className="tg-page__header__block__wrapper buildMyAI-title">
              <img
                alt=""
                className="tg-page__header__block__pre back-to-robot"
                src="/images/triangle-medium-left.svg"
                width="30"
                onClick={() => {
                  this.backFunction();
                }}
              />
              <h1 style={{ fontSize: '1vw', lineHeight: (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet) ? '2.5vh' : '14px' }}
              className="heading-page">{scenario.ScenarioName}</h1>
            </div>
            <div className="tg-page__header__block__wrapper">
              <button
                className={`btn btntall leftrightmargin10 robot-test-button${0 ? "alignButton" : ""}`}
                onClick={() => { window.handlePlaygame(); }}
              >
                Test
              </button>
              <button
                className={`btn btntall leftrightmargin10 robot-test-button${0 ? "alignButton" : ""}`}
                onClick={() => { window.handleStopTest(); }}
              >
                Stop
              </button>
              <button
                className={`btn btntall leftrightmargin10 robot-beautify-button${0 ? "alignButton" : ""}`}
                onClick={() => { window.beautifyCode(); }}
              >
                Beautify
              </button>
              <span
                onClick={() => this.handleChangeLayout('OPTION1')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION1}
                className="layout-icon-item robot-allwindow-button"
              >
                <span className="item-child item-child--border-right">C</span>
                <span className="item-child item-child--flex-column">
                  <span className="item-child">E</span>
                  <span className="item-child">G</span>
                </span>
              </span>
              <span
                onClick={() => this.handleChangeLayout('OPTION2')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION2}
                className="layout-icon-item robot-position1-button"
              >
                <span className="item-child item-child--border-right">C</span>
                <span className="item-child">E</span>
              </span>
              <span
                onClick={() => this.handleChangeLayout('OPTION5')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION5}
                className="layout-icon-item robot-position2-button"
              >
                <span className="item-child item-child--border-right">E</span>
                <span className="item-child">G</span>
              </span>
              <span
                onClick={() => this.handleChangeLayout('OPTION3')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION3}
                className="layout-icon-item layout-icon-item--one-item robot-edit-fullscreen"
              >
E

              </span>
              <span
                onClick={() => this.handleChangeLayout('OPTION4')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION4}
                className="layout-icon-item layout-icon-item--one-item robot-game-fullscreen"
              >
G

              </span>
              <span
                onClick={() => this.handleChangeLayout('OPTION6')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION6}
                className="layout-icon-item layout-icon-item--one-item robot-chat-fullscreen"
              >
C

              </span>
            </div>
          </div>
        </div>
        <div className="tg-page__content">
          <div className="buildmyAI buildmyAI--content">
            <NoDraggingLayout
              layout={layoutOption}
            >
              {childrens}
            </NoDraggingLayout>
            <ReactTooltip />
          </div>
        </div>
      </div>
    );
  }
}

export default BuildMyAIComponent;

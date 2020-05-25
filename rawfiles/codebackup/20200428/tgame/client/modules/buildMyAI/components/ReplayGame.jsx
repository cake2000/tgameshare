import React from 'react';
import ReactTooltip from 'react-tooltip';
import _get from 'lodash/get';
// import LessonsSliderComponent from './lessonsSlider.jsx';
import PoolComponent from '../../games/gamePool/lib/oldTrajectoryPoolComponent.jsx';
import WrapperLayout from './WrapperLayout.jsx';
import NoDraggingLayout from './BuildLayout.jsx';
import ReplayControl from './ReplayControl.jsx';
import { ITEM_GAME_TYPE } from '../../../../lib/enum';
import { LAYOUT_OPTION_2, LAYOUT_OPTION_2_TEXT } from '../../../../lib/const';

class ReplayGame extends React.Component {
  static defaultProps = {
    scenario: null
  }
  constructor(props) {
    super(props);
    const widthWindow = window.innerWidth;
    this.state = {
      layoutSelected: 'OPTION1',
      config: {},
    };
  }

  componentWillMount() {
    this.getConfig();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  getConfig = async () => {
    const cueStickItem = await this.getGameItemByType(ITEM_GAME_TYPE.CUE);
    const poolTableItem = await this.getGameItemByType(ITEM_GAME_TYPE.TABLE);
    const config = {
      mainItems: cueStickItem,
      backgroundItems: poolTableItem,
    };
    this.setState({
      config
    });
  }

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
    const { history } = this.props;

    history.push('/tournament/uN9W4QhmdKu94Qi2Y');
  }

  handleChangeLayout = (value) => {
    this.setState({
      layoutSelected: value,
    });
    if (window.testGameComponent) {
      setTimeout(() => {
        window.testGameComponent.tryResize();
      }, 200);
    }
  }

  render() {
    const { scenario, activeGame, history } = this.props;
    const { config } = this.state;
    // console.log("in build my ai scenario id " + scenario._id + " ");
    const layoutOption = LAYOUT_OPTION_2[this.state.layoutSelected];
    const childrens = layoutOption.map((layout) => {
      switch (layout.i) {
        case 'control':
          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <ReplayControl
                activeGame={activeGame}
                history={history}
              />
            </WrapperLayout>
          );
        case 'game':
          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <PoolComponent config={config} isTesting isReplay activeGame={activeGame} isProfessionalUser />
            </WrapperLayout>
          );

        default: return (<div />);
      }
    });
    return (
      <div className="tg-page tg-page--buildmyAI" id="replay-game">
        <div className="tg-page__header">
          <div className="tg-page__header__block tg-container">
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
              <h1 style={{fontSize: '20px'}} className="heading-page">Game Recording</h1>
            </div>
            <div className="tg-page__header__block__wrapper">
              <span
                onClick={() => this.handleChangeLayout('OPTION1')}
                data-tip={LAYOUT_OPTION_2_TEXT.OPTION1}
                className="layout-icon-item robot-position1-button">
                <span className="item-child item-child--border-right">C</span>
                <span className="item-child">G</span>
              </span>
              <span
                onClick={() => this.handleChangeLayout('OPTION2')}
                data-tip={LAYOUT_OPTION_2_TEXT.OPTION2}
                className="layout-icon-item layout-icon-item--one-item robot-game-fullscreen">G</span>
            </div>
          </div>
        </div>
        <div className="tg-page__content" style={{ marginTop: '56px' }}>
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

export default ReplayGame;

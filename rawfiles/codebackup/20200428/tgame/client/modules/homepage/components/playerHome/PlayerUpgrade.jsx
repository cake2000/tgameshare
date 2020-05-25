import React from 'react';
import { shape, arrayOf } from 'prop-types';
import { withRouter } from 'react-router-dom';
import _map from 'lodash/map';
import _reduce from 'lodash/reduce';
import _find from 'lodash/find';
import _includes from 'lodash/includes';
import Slider from 'react-slick';
import UpgradeModal from '../../containers/UpgradeModal';
import { getThumbImage } from '../../../../../lib/util';
import { MIGRATION_CONST } from '../../../../../lib/enum';

const settings = {
  // slidesToScroll: 2,
  // slidesToShow: 2,
  arrows: true,
  dotsClass: 'slick--dot',
  // centerMode: true,
  centerPadding: '15px',
  autoplay: false,
  infinite: false,
  slidesToShow: 1,
  slidesToScroll: 3,
  vertical: true,
  verticalSwiping: true,
  swipeToSlide: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
      }
    }
  ]
};
// Display 3 games
const carouselGameIds = [
  MIGRATION_CONST.poolGameId,
  MIGRATION_CONST.tankGameId,
  MIGRATION_CONST.match3GameId
];

class PlayerUpgrade extends React.Component {
  static propTypes = {
    boughtItems: arrayOf(shape()).isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpenModal: false,
      activeItemChoosen: null,
      typeOpen: null
    };
  }

  toggleModal = (value) => {
    this.setState({
      isOpenModal: value
    });
  }

  closeModal = () => {
    this.toggleModal(false);
  }

  handleClickUpgrade = (item) => {
    this.setState({
      activeItemChoosen: item,
      isOpenModal: true,
      typeOpen: 'Upgrade'
    });
  }

  handleClickChange = (item) => {
    this.setState({
      activeItemChoosen: item,
      isOpenModal: true,
      typeOpen: 'Change'
    });
  }

  goToGameboard = (gameId) => {
    const { history } = this.props;
    history.push('/gamesBoard', { gameId });
  }

  renderGameItem = (game) => {
    if (!game || !_includes(carouselGameIds, game._id)) return null;

    const { boughtItems } = this.props;
    const activeItems = boughtItems.filter(item => item.gameId === game._id && item.active === true);

    return (
      <div className="upgrade-games upgrade-games--groups" key={game._id}>
        <div className="upgrade-games__items">
          <div className="upgrade-games__items__header">
            <div className="upgrade-games__items__header__logo">
              <img src={game.imageUrl} alt={game.title} />
            </div>
            <div className="upgrade-games__items__header__player">
              <span>{game.title}</span>
              <button className="btn" onClick={() => this.goToGameboard(game._id)} type="button">Play</button>
            </div>
          </div>
          <div className="upgrade-games__items__main">
            {
            activeItems.map(item => (
              <div className="upgrade-games__items__main--groups" key={item._id}>
                <div className="upgrade-games__items__main__img">
                  <img className={`img-tools-games ${item.type}`} src={getThumbImage(item)} alt={item.name} />
                </div>
                <div className="upgrade-games__items__main__info">
                  <span className="upgrade-games__items__main__info__name">
                    {`${item.name} `}
                  </span>
                  <a
                    href="javascript:void(0)"
                    onClick={() => this.handleClickUpgrade(item)}
                    className={`upgrade-games__items__main__info__link upgrade-games__items__main__info__link--${item.type}`}
                  >
                    Shop
                  </a>
                </div>
              </div>
            ))
          }
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { boughtItems, coins, gamesList } = this.props;
    const { activeItemChoosen, isOpenModal, typeOpen } = this.state;
    const orderedGames = _reduce(carouselGameIds, (memo, _id) => {
      const game = _find(gamesList, { _id });
      if (game) {
        memo.push(game);
      }
      return memo;
    }, []);

    return (
      <div className="player-games">
        <UpgradeModal
          coins={coins}
          boughtItems={boughtItems}
          activeItemChoosen={activeItemChoosen}
          isOpenModal={isOpenModal}
          typeOpen={typeOpen}
          closeModal={this.closeModal}
        />
        <div className="player-games__title">Games</div>
        <div className="player-games__sliderGame">
          { _map(orderedGames, this.renderGameItem)}
        </div>
      </div>
    );
  }
}

export default withRouter(PlayerUpgrade);

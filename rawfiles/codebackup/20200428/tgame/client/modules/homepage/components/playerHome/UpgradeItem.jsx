
import React from 'react';
import ReactTooltip from 'react-tooltip';

import { getThumbImage } from '../../../../../lib/util';
import ImageZoom from '../../../components/components/ImageZoom.jsx';

export default class UpgradeItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpgrade: false,
      isChange: false,
      isClicked: false
    };
  }

  handleUpgrade = () => {
    this.setState({
      isClicked: true
    });
  }

  handleClickUpgrade = () => {
    const { item } = this.props;
    this.setState({
      isUpgrade: true
    });
    Meteor.call('gameItem.upgrade', item._id, (/* error */) => {
      this.setState({
        isUpgrade: false
      });
    });
  }

  handleChangeActive = () => {
    const { item, gameRoomId, fromGameRoom } = this.props;
    this.setState({
      isChange: true
    });
    if (fromGameRoom) {
      Meteor.call('gameItem.setActiveItemGameRoom', gameRoomId, item._id, (/* error */) => {
        this.setState({
          isChange: false
        });
      });
    } else {
      Meteor.call('gameItem.setActiveItem', item._id, (/* error */) => {
        this.setState({
          isChange: false
        });
      });
    }
  }

  componentDidUpdate(prevProp, prevState) {
    if (this.state.isClicked && !prevState.isClicked && this.upgradeButton) {
      this.upgradeButton.focus();
    }
  }

  render() {
    const { item, coins } = this.props;
    const {
      isClicked, isUpgrade, isChange
    } = this.state;
    const shouldDisableUpgrade = coins < item.price;
    const thumbnailUrl = getThumbImage(item);

    return (
      <div className={`upgradeTools upgradeTools--${item.type}`}>
        <ReactTooltip place="bottom" />
        <div className="upgradeTools__container">
          <ImageZoom
            image={{
              src: thumbnailUrl,
              alt: item.name,
              className: `image-type-${item.type}`
            }}
            zoomImage={{
              src: thumbnailUrl,
              alt: item.name
            }}
          />
          <div className="upgradeTools__container__infomation">
            <div className="name-tools">{item.name}</div>
            {/* <div className="price-tools">
              <img src="/img_v2/Coins@2x.png" />
              <span>{item.price}</span>
            </div> */}
            <div className="choose-tools">
              {/* <img src={item.wasBought ? '/images/checkmarkgreen.png' : '/images/lock.png'} /> */}
              {
                item.wasBought && item.active === true && !isChange
                && (
                <button className="btn btn--equipped" type="button">
                  Default
                  {' '}
                  <i className="fa fa-check" />
                </button>
                )
              }
              {
                item.wasBought && item.active === false && !isChange
                  && (
                  <button
                    className="btn btn--equip"
                    onClick={this.handleChangeActive}
                    data-tip="Click to equip this item"
                    type="button"
                  >
                    Set as default
                  </button>
                  )
              }
              {
              (isUpgrade || isChange)
                && (
                <button className="btn" type="button">
                  <i className="fa fa-circle-o-notch fa-spin" />
                </button>
                )
              }
              {
              !item.wasBought && !isUpgrade && !isClicked
                && (
                <button
                  onClick={() => {
                    if (!shouldDisableUpgrade) {
                      this.handleUpgrade();
                    }
                  }}
                  data-tip={shouldDisableUpgrade ? "Not have enough coins to unlock this item!" : 'Unlock this item'}
                  className={`btn btn--unlock ${shouldDisableUpgrade ? "btn--unlock__disabled Buttons" : ''}`}
                  type="button"
                >
                  <span className="Unlock">Unlock</span>
                  <span className="Cost">
                    {item.price}
                    <img src="/img_v2/Coins@2x.png" alt="coins" />
                  </span>
                </button>
                )
            }
            </div>

            {/* <p className="price">Coins: {item.price}</p>
            {
              !item.wasBought && !isUpgrade && !isClicked &&
                <button
                  onClick={() => {
                    if (!shouldDisableUpgrade) {
                      this.handleUpgrade();
                    }
                  }}
                  data-tip={shouldDisableUpgrade ? "You are not enought coins to unlock it item" : 'Click to unlock this item'}
                  className={shouldDisableUpgrade ? "disabledButtons" : ''}
                >
                Unlock
                </button>
            }
            {
            (isUpgrade || isChange) &&
              <button>
                <i className="fa fa-circle-o-notch fa-spin" />
              </button>
            }
            {
              item.wasBought && item.active === false && !isChange && <p data-tip="This item is equipped"><i className="fa fa-check" /> Unlocked </p>
            }
            {
              item.wasBought && item.active === false && <button onClick={this.handleChangeActive} data-tip="Click to equip this item">Equip</button>
            }
            {
              item.wasBought && item.active === true && !isChange &&
              <p className="equiped-item" data-tip="This item is equipped"><i className="fa fa-check" /> Equipped </p>
            } */}
          </div>
          {
              !item.wasBought && !isUpgrade && isClicked
              && (
              <div className="upgradeTools__container__infomation__action">
                <div className="message">{`Please confirm: unlock this item with ${item.price} gold coins?`}</div>
                <div className="action">
                  <button className="btn btn-ok" ref={(element) => { this.upgradeButton = element; }} onClick={this.handleClickUpgrade} type="button">Yes</button>
                  <button className="btn btn-cancel" onClick={() => this.setState({ isClicked: false })} type="button">Cancel</button>
                </div>

              </div>
              )
            }
        </div>

      </div>
    );
  }
}

import React from 'react';
import _get from 'lodash/get';
import UpgradeModal from '../../homepage/containers/UpgradeModal';
import { getThumbImage } from '../../../../lib/util';
import { ITEM_GAME_TYPE } from '../../../../lib/enum';

export default class ItemEquipped extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenModal: false,
      activeItemChoosen: null
    };
  }

  toggleModal = (value) => {
    this.setState({
      isOpenModal: value
    });
  }

  handleClickChange = (item) => {
    this.setState({
      activeItemChoosen: item,
      isOpenModal: true
    });
  }

  render () {
    const {
      items, userId, gameRoomId, ownerRoom, renderTypes, className
    } = this.props;
    const { activeItemChoosen, isOpenModal } = this.state;

    return userId ? (
      <div className="tools-games">
        <UpgradeModal
          fromGameRoom
          gameRoomId={gameRoomId}
          boughtItems={items}
          activeItemChoosen={activeItemChoosen}
          isOpenModal={isOpenModal}
          typeOpen=""
          closeModal={() => this.toggleModal(false)}
        />
        {
          items.filter(item => item.active === true
            && renderTypes.indexOf(item.type) !== -1
           && !(ownerRoom && ownerRoom !== userId && item.type === ITEM_GAME_TYPE.TABLE)).map(item => (
             <div id={`ad-${activeItemChoosen}`} className={["tools-games__groups", className || ''].join(' ')} key={item._id}>
               <div className="tools-games__groups__info">
                 <span className="tools-games__groups__info__name">{ item.name }</span>
                 {
                  userId === Meteor.userId()
                    && (
                    <button className="change-item-button" onClick={() => this.handleClickChange(item)} type="button">
                      {`Change`}
                    </button>
                    )
                }
               </div>
               <div className="tools-games__groups__info__img">
                 <img className={`item-type-${item.type}`} src={getThumbImage(item)} alt={item.name} />
               </div>
             </div>
          ))
        }
      </div>
    ) : <div />;
  }
}

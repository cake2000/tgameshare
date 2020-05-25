import React from 'react';
import ManualGameElementListItem from './ManualGameElementListItem.jsx';
import ManualGameElementContent from './../containers/ManualGameElementContent';

export default class ManualGameDetail extends React.Component {

  changeElement = (elementId) => {
    const { changeElement } = this.props;
    changeElement(elementId);
  }

  renderElementListItem = (element, index) => (
    <ManualGameElementListItem
      key={element._id}
      element={element}
      order={index + 1}
      onClick={this.changeElement}
    />
  )

  renderElementList = () => {
    const { elementList } = this.props;
    return (
      <div className="element-list">
        {elementList.map(this.renderElementListItem)}
      </div>
    );
  }

  renderElementContent = () => (<ManualGameElementContent />)

  render() {
    const { gameDetail } = this.props;
    const { title } = gameDetail;
    return (
      <div className="manual-detail-page">
        <div className="manual-detail-page--title">
          <h3>{title}</h3>
        </div>
        <div className="manual-detail-page--content">
          {this.renderElementList()}
          {this.renderElementContent()}
        </div>
      </div>
    );
  }
}

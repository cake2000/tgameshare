import React from 'react';

class ManualGameElementListItem extends React.Component {

  onClick = () => {
    const { element, onClick } = this.props;
    const { _id } = element;
    onClick(_id);
  }

  render() {
    const { element, order } = this.props;
    return (
      <div className="element-item" onClick={this.onClick}>
        <span className="element-item--title">{order}. {element.title}</span>
      </div>
    );
  }
}

export default ManualGameElementListItem;

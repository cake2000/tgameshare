import React from 'react';

class LoadingComponent extends React.Component {
  render() {
    return (
      <div className="tg-loading-page 45">
        <div className="tg-container">
          <img src="/images/loading-general.svg" alt="" />
          <span>Loading....</span>
        </div>
      </div>
    );
  }
}

export default LoadingComponent;

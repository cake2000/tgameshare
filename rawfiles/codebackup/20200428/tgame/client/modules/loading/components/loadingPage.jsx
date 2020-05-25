import React from 'react';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

class LoadingPage extends React.Component {
  render() {
    return (
      <div className="tg-loading-page 23">
        <div className="tg-container">
          <LoadingIcon
            height={'50px'}
            stroke={'darkgray'}
          />
        </div>
      </div>
    );
  }
}

export default LoadingPage;

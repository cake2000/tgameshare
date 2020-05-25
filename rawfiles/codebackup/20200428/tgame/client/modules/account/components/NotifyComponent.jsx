import React from 'react';

export default () => {
  return (
    <div className="notify">
      <h2 className="notify__heading">Notify</h2>
      <h2 className="notify__heading">&nbsp;</h2>
      <div className="notify__container">
        {`This site is still under development.
        We'll notify you when we are ready to start beta testing`}
      </div>
    </div>
  );
};

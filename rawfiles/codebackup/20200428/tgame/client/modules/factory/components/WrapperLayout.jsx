import React from 'react';

const WrapperLayout = (props) => {
  const { children, isShow, ...wrapperProps } = props;
  const css = { height: 'inherit' };
  if (!isShow) {
    css.display = 'none';
  }
  return (
    <div {...wrapperProps}>
      <div style={css}>
        {children}
      </div>
    </div>
  );
};

export default WrapperLayout;


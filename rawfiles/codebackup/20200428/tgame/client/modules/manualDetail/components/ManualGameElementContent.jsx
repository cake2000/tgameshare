import React from 'react';

const ManualGameElementContent = ({ elementDetail, elementId }) => (
  <div className="element-content">
    {elementId && <div>Selected elementID: {elementId}</div>}
    <div
      dangerouslySetInnerHTML={{
        __html: elementDetail.content
      }}
    />
  </div>
);

export default ManualGameElementContent;

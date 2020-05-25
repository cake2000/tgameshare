import React from 'react';

const Page404 = () => (
  <div className="utility-page-wrap">
    <div className="utility-page-content">
      <div>
        <img alt="not-found" src="/images/page-not-found.png" />
      </div>
      <h2>Page not found</h2>
      <div className="error-desc">The page you are looking for doesn't exist or has been moved.</div>
    </div>
  </div>
);

export default Page404;

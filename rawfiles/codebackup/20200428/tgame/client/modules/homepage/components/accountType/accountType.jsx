/* global WOW */
import React from 'react';
import { Link } from 'react-router-dom';

export default (props) => {
  const accounts = props.accounts;
  return (
    <div className="type-account" id="accounts">
      <center><h2 className="hero-heading">ACCOUNT TYPES</h2></center>
      <center><h2 className="hero-heading">&nbsp;</h2></center>
      
      <div className="tg-container">
        <div className="pricing">
          {
            _.map(accounts, (account, index) => (
              <div className="pricing__block wow fadeIn" key={index}>
                <div className="pricing__block__header">
                  <h1>{ index === 'ai' ? 'Robot Account' : 'Human Account' }</h1>
                </div>
                {
                  _.map(account, (des, subIndex) => (
                    <div className="pricing__block__list" key={subIndex}>
                      <img alt="" src="images/robobullet.svg" width="16" />
                      <div className="pricing__block__list__text">{des}</div>
                    </div>)
                  )
                }
                <div className="pricing__block__list">
                  <div className="button-wrapper premium">
                    <Link to={`/signup/${index}`}>Sign Up For Free</Link>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

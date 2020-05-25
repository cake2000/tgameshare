import React, { Component } from 'react';
import { ROLES } from '../../../../lib/enum';

class ChooseRoleComponent extends Component {

  render() {
    const { addStripeCustomer, history } = this.props;
    const _addStripeCustomer = (accountType) => {
      addStripeCustomer(accountType, () => {
        history.push('/gamesBoard');
      });
    };

    return (
      <div className="choose-account-type-wrapper">
        <div className="choose-account-type">
          <h1 className="title">Choose your account type</h1>
          <div className="account-type-card wow fadeInUp" data-wow-delay="800ms">
            <div
              aria-hidden
              className="account-type-card__item"
              onClick={(e) => {
                e.preventDefault();
                _addStripeCustomer(ROLES.MANUAL);
              }}
            >
              <a className="" data-ix="fade-in-up-on-load" href="">
                <span className="tg-icon-brain" />
                <div className="heading">Human Player</div>
              </a>
            </div>
            <div
              aria-hidden
              className="account-type-card__item"
              onClick={(e) => {
                e.preventDefault();
                _addStripeCustomer(ROLES.AI);
              }}
            >
              <a className="" data-ix="fade-in-up-on-load" href="">
                <span className="tg-icon-ai" />
                <div className="heading">AI Player</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChooseRoleComponent;

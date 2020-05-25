import React from 'react';
import Banner from '../../core/components/Banner.jsx';
import ListTopicForum from './ListTopicForum.jsx';

class ForumComponent extends React.Component {
  render() {
    return (
      <div className="tg-page tg-page--forum">
        {/*<Banner title="Forum" />*/}
        <div className="tg-page__content tg-container tg-page__content--forum">
          <div className="tg-page__forum__header">
            <div className="tg-page__forum__header__filter tg-page__forum__header__filter--left">
              <button className="btn active">Last</button>
              <button className="btn btn-none-br">Top</button>
              <button className="btn btn-none-br">Unread</button>
              <button className="btn btn-none-br has-sub">Categories<i className="tg-icon-tg-down" />
                <ul className="list-categories">
                  <li className="list-categories__items">
                    <span>Code help</span><i className="type-categories type-categories--a" />
                  </li>
                  <li className="list-categories__items">
                    <span>Code help</span><i className="type-categories type-categories--b" />
                  </li>
                  <li className="list-categories__items">
                    <span>Code help</span><i className="type-categories type-categories--c" />
                  </li>
                  <li className="list-categories__items">
                    <span>Code help</span><i className="type-categories type-categories--d" />
                  </li>
                </ul>
              </button>
              <button className="btn btn-none-br">Nofitications</button>
              <span className="number">3</span>
            </div>
            <div className="tg-page__forum__header__filter tg-page__forum__header__filter--right">
              <button className="btn add-new"><i className="tg-icon-tg-add-plus" />New Topic</button>
              <span className="tg-icon-search" />
            </div>
          </div>
          <div className="tg-page__forum__content">
            <ListTopicForum />
          </div>
        </div>
      </div>
    );
  }
}

export default ForumComponent;

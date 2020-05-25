import React from 'react';
// import PropTypes from 'prop-types';
import Banner from '../../core/components/Banner.jsx';
import ListTopicForum from '../../forum/components/ListTopicForum.jsx';

class BlogComponents extends React.Component {
  render() {
    return (
      <div className="tg-page tg-page--BG">
        <Banner title="Blog" />
        <div className="tg-page__content tg-container tg-page__content--BG">
          <div className="tg-page__content__title">
            <h4>Annoucement & Knowledge Base</h4>
          </div>
          <div className="forum-post">
            <div className="forum-post__list">
              <div className="forum-post__list__avatar">
                <img src="/images/IMG_2838.JPG.jpeg" alt="" />
              </div>
              <div className="forum-post__list__content">
                <div className="line line--title">tgame</div>
                <div className="line line--content">
                  We are prouding annoucing the launch
                  of TGame.ai Beta to our initial users.
                </div>
                <div className="line line--action">
                  <div className="line__reply">
                    <span>1 Reply <i className="tg-icon-tg-down" /></span>
                  </div>
                  <div className="line__social">
                    <span className="number-like"><number>13</number>likes</span>
                    <span className="tg-icon-heart-icon" />
                    <span className="tg-icon-flag-icon" />
                    <span className="tg-icon-reply-icon-white"><i>Reply</i></span>
                  </div>
                </div>
              </div>
              <div className="forum-post__list__time">
                <span>3 days</span>
              </div>
            </div>

            <div className="forum-post__list forum-post__list--reply">
              <div className="forum-post__list__avatar">
                <img src="/images/IMG_2838.JPG.jpeg" alt="" />
              </div>
              <div className="forum-post__list__content">
                <div className="line line--title">tgame</div>
                <div className="line line--blockQuoteText">
                  We are prouding annoucing the launch
                  of TGame.ai Beta to our initial users.
                </div>
                <div className="line line--content">
                  We are prouding annoucing the launch
                  of TGame.ai Beta to our initial users.
                </div>
              </div>
              <div className="forum-post__list__time">
                <span>3 days</span>
              </div>
            </div>


            <div className="forum-post__list">
              <div className="forum-post__list__avatar">
                <img src="/images/IMG_2838.JPG.jpeg" alt="" />
              </div>
              <div className="forum-post__list__content">
                <div className="line line--title">NikolajHaugaard1d3</div>
                <div className="line line--content">
                  Hey, guys. I&lsquo;m currently working on a side project called CV
                  Builder, and I&lsquo;m excited about hearing what you think about
                  it and if you have some ideas for improvements.
                  <br />
                  <br />
                  Which I would love to hear!The idea for the site is
                  people without access to Word, Illustrator, InDesign,
                  Photoshop etc. can edit their CV straight in their
                  browser, and then export the final document as a PDF,
                  PNG and SVG file.
                  <br />
                  <br />
                  The site is not complete, I still need to fix a
                  couple of bugs and add more content, such as guides,
                  about page, etc.But I&lsquo;m just so excited to get some
                  feedback, and what better place then to get it from
                  the WF community
                </div>
                <div className="line line--action">
                  <div className="line__reply">
                    <span>1 Reply <i className="tg-icon-tg-down" /></span>
                  </div>
                  <div className="line__social">
                    <span className="number-like"><number>13</number>likes</span>
                    <span className="tg-icon-heart-icon" />
                    <span className="tg-icon-flag-icon" />
                    <span className="tg-icon-reply-icon-white"><i>Reply</i></span>
                  </div>
                </div>
              </div>
              <div className="forum-post__list__time">
                <span>3 days</span>
              </div>
            </div>
            <div className="forum-post__list">
              <div className="forum-post__list__avatar">
                <img src="/images/IMG_2838.JPG.jpeg" alt="" />
              </div>
              <div className="forum-post__list__content">
                <div className="line line--title">tgame</div>
                <div className="line line--content">
                  We are prouding annoucing the launch
                  of TGame.ai Beta to our initial users.
                </div>
                <div className="line line--action">
                  <div className="line__reply">
                    <span>1 Reply <i className="tg-icon-tg-down" /></span>
                  </div>
                  <div className="line__social">
                    <span className="number-like"><number>13</number>likes</span>
                    <span className="tg-icon-heart-icon" />
                    <span className="tg-icon-flag-icon" />
                    <span className="tg-icon-reply-icon-white"><i>Reply</i></span>
                  </div>
                </div>
              </div>
              <div className="forum-post__list__time">
                <span>3 days</span>
              </div>
            </div>
            <div className="forum-post__action">
              <div className="line line--action">
                <div className="line__reply">
                  <span className="btn-book">Bookmark</span>
                  <span className="btn-share">Share</span>
                  <span className="btn-invite">Invite</span>
                  <span className="tg-icon-flag-icon" />
                  <span className="tg-icon-reply-icon-white"><i>Reply</i></span>

                </div>
                <div className="line__social">
                  <span className="link">Back to Forum</span>
                </div>
              </div>
            </div>

            <div className="suggest-topics">
              <div className="suggest-topics__heading">Suggested Topics</div>
              <ListTopicForum />
            </div>
          </div>
        </div>
      </div>
    );
  }
  }

export default BlogComponents;

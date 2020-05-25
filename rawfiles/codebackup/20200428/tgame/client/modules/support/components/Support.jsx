import React from 'react';
// import PropTypes from 'prop-types';
import Banner from '../../core/components/Banner.jsx';

class SuportComponents extends React.Component {
  render() {
    return (
      <div className="tg-page tg-page--support">
        <Banner title="Support" />
        <div className="tg-page__content tg-page__content--support tg-container">
          <div className="tg-page__content__header">
            <h4 className="title">Submit A Request</h4>
          </div>

          <div className="form form--support">
          {/* <div className="form__group form__group--select">
            <div className="form__group__select">
              <select>
                <option value="volvo">Category</option>
                <option value="saab">Glossary</option>
                <option value="mercedes">Technical Support</option>
                <option value="audi">General Feedback</option>
              </select>
            </div>
            <div className="form__group__select">
              <select>
                <option value="volvo">Importance</option>
                <option value="saab">I really need help</option>
                <option value="mercedes">Important</option>
                <option value="audi">Critical</option>
              </select>
            </div>
          </div> */}
            <div className="form__group">
              <label htmlFor="subject">
                Subject:
              </label>
              <input id="subject" className="form__group__text" type="text" placeholder="Subject" required="required" />
            </div>
            <div className="form__group">
              <label htmlFor="subject">
                Message:
              </label>
              <textarea
                className="form__group__textarea"
                placeholder="What do you need help with?"
                required="required">
              </textarea>
            </div>
            <div className="form__group form__group--action">
              <button className="btn">Submit</button>
            </div>
          </div>

        </div>
      </div>
      )
    }
  }

  export default SuportComponents;

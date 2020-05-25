import React from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Header from '../containers/Header.js';
import GeneralModal from "../containers/GeneralModal";
import VerificationEmailTopNavbar from "../containers/VerificationEmailTopNavbar";
import SEO from '../../../seo/components/SEO';

export function isVisitPage(location, pageName) {
  if (!pageName) return false;
  const pathname = _get(location, 'pathname');
  const segments = pathname.split('/');

  return Boolean(segments && segments.length > 0 && segments[1] === pageName);
}

const MainLayout = ({ children, history }) => {
  const isLessonPage = isVisitPage(_get(history, 'location'), 'lesson');
  const mainClass = ["tg-wrapper__main"];
  if (isLessonPage) mainClass.push("tg-wrapper__lessonPage");

  return (
    <div className="tg-wrapper">
      <SEO
        schema="AboutPage"
        title="TuringGame"
        description="Turing Game - Learn to code your game bots"
        path=""
        contentType="website"
        keywords="Learn to code, coding, robot, programming, algorithms, AI, game, tournament, TGame, Turing Game, Turing Test"
      />
      <ToastContainer
        position="top-right"
        type="info"
        newestOnTop
        closeOnClick
        autoClose={10000}
      />
      <Header history={history} />
      <VerificationEmailTopNavbar />
      <div className={mainClass.join(' ')} id="mainDiv">
        {children}
      </div>

      <GeneralModal />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.element.isRequired
};

export default MainLayout;

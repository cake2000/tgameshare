import React from 'react';
import renderHTML from 'react-render-html';
import Script from 'react-load-script';
import TinyMCE from 'react-tinymce';

class LessonsSliderComponent extends React.Component {
  constructor(props) {
    super(props);
    const { instructionLength, tutorialProgress } = this.props;
    const slideIndex = tutorialProgress * instructionLength;

    this.state = {
      slideIndex: slideIndex === 0 ? 1 : slideIndex,
      showHelp: false,
      listMenu: false,
      tutorialType: [],
      tutorialContent: {},
      scriptLoaded: false
    };
  }
  componentDidMount() {
    new WOW().init(); // Wow is animation package for login form
  }

  componentWillReceiveProps(nextProps) {
    const { instructionLength, tutorialProgress, tutorial } = nextProps;
    const tutorialType = Object.keys(tutorial);
    const slideIndex = tutorialProgress * instructionLength;
    const tutorialContent = {};

    for (let i = 0; i < tutorialType.length; i++) {
      Object.assign(tutorialContent, { [tutorialType[i]]: false });
    }
    this.setState({
      slideIndex: slideIndex === 0 ? 1 : slideIndex,
      tutorialType,
      tutorialContent
    });
  }

  getTutorialList = (title, tutorial, type) => {
    let liClass = 'menu-all__item';

    if (this.state.tutorialContent[type]) {
      liClass += ' expanded';
    }
    return (
      <li className={liClass} key={type}>
        <div
          role="button"
          tabIndex="0"
          className="tutorial"
          onClick={() => (this.showTutorialContent(type))}
        >
          {title}
          <span className="tg-icon-expand" />
        </div>
        <div
          className={this.state.tutorialContent[type] ? 'animated slideInLeft' : 'animated slideInUp'}
        >
          {this.state.tutorialContent[type] && tutorial[type].map((testcase, index) => (
            <div
              role="button"
              tabIndex="0"
              key={testcase._id}
              className="tutorial-content"
              onClick={() => (this.showListMenu(testcase._id))}
            >
              {index + 1}. {testcase.ScenarioName}
            </div>
          ))}
        </div>
      </li>
    );

    // return (
    //   <li key={type}>
    //     <div className="tutorial">
    //       {title}
    //       <span
    //         className="tg-icon-expand"
    //         onClick={() => (this.showTutorialContent(type))}
    //       />
    //     </div>
    //   </li>
    // );
  }

  /* Get into full screen */
  GoInFullscreen = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  /* Get out of full screen */
  GoOutFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  /* Call FullScreen */
  Fullscreen(element) {
    if (this.IsFullScreenCurrently()) {
      this.GoOutFullscreen();
    } else {
      this.GoInFullscreen(document.getElementsByClassName(element)[0]);
    }
  }
  /* Is currently in full screen or not */
  IsFullScreenCurrently = () => (
    document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen
  );

  nextSliderLessons(n) {
    const currentSilder = this.state.slideIndex;
    const { scenario } = this.props;
    let instructionLength = 1;

    if (scenario) {
      if (scenario.instructionContent) { instructionLength = scenario.instructionContent.length; }
    }

    if (n === -1 && currentSilder === 1) {
      return false;
    }
    if (n === 1 && currentSilder === instructionLength) {
      return false;
    }
    return this.setState({ slideIndex: currentSilder + n });
  }

  showHelpForm = () => {
    const { showHelp } = this.state;
    this.setState({
      showHelp: !showHelp,
    });
  }

  showListMenu = (tutorialId) => {
    const { listMenu } = this.state;
    const { changeTutorial } = this.props;
    this.setState({
      listMenu: !listMenu,
    });
    if (tutorialId) {
      changeTutorial(tutorialId);
    }
  }

  showTutorialContent = (type) => {
    const tutorialContent = Object.assign({}, this.state.tutorialContent);
    tutorialContent[type] = !this.state.tutorialContent[type];
    this.setState({ tutorialContent });
  }

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  }

  handleScriptError = () => (
    <div className="admin-msg-err">
        Can not load script
      </div>
  )

  renderStep = (index) => {
    const { scenario, updateProgress, instructionLength, tutorialProgress } = this.props;
    const { scriptLoaded } = this.state;

    if (scenario) {
      if (((index + 1) / instructionLength) > tutorialProgress) {
        updateProgress(scenario._id, (index + 1) / instructionLength, scenario.gameId, scenario.ScenarioSequenceNumber);
      }
      return (
        <div className="buildmyAI__lessons__blocks" key={index}>
          <div className="buildmyAI__lessons__blocks__title">
            Step {index + 1}
          </div>
          <div className="buildmyAI__lessons__blocks__contents">
            {/*
              {scenario.instructionContent ? renderHTML(scenario.instructionContent[index]) : null}
            */}
            { scriptLoaded ?
              <TinyMCE
                content={scenario.instructionContent[index]}
                config={{
                  height: 500,
                  content_css: [
                    '//fonts.googleapis.com/css?family=Montserrat:300,300i,400,400i',
                    '//www.tinymce.com/css/codepen.min.css'
                  ],
                  inline: true,
                  autoresize_overflow_padding: 50,
                  menubar: false
                }}
                onChange={(e) => { this.changeValue('instructionContent', e); }}
              /> : 'Loading tinymce ...'
            }
          </div>
        </div>
      );
    }
    return null;
  }

  renderFormHelp = () => (
    <div className="form-help">
      <div className="group-select">
        <select>
          <option value="volvo">Category</option>
          <option value="saab">Glossary</option>
          <option value="mercedes">Technical Support</option>
          <option value="audi">General Feedback</option>
        </select>
      </div>
      <div className="group-select">
        <select>
          <option value="volvo">Importance</option>
          <option value="saab">I really need help</option>
          <option value="mercedes">Important</option>
          <option value="audi">Critical</option>
        </select>
      </div>
      <div className="group-text">
        <input type="text" placeholder="User Name" />
      </div>
      <div className="group-text">
        <input type="text" placeholder="Email Address" />
      </div>
      <div className="group-textarea">
        <textarea type="text" placeholder="What do you need help with?" />
      </div>
      <div className="group-submit">
        <button className="btn"> Help </button>
      </div>
    </div>
  )

  renderListMenu = () => {
    const { tutorial } = this.props;
    const { tutorialType } = this.state;
    const title = ['Basic Tutorials', 'Intermediate Tutorials'];

    return (
      <div
        className={this.state.listMenu ? 'buildmyAI__lessons__list_menu animated fadeInLeft' : 'buildmyAI__lessons__list_menu'}
      >
        <ul className="menu-all">
          {tutorialType.map((type, index) =>
            this.getTutorialList(title[index], tutorial, type)
          )}
        </ul>
      </div>
    );
  }

  renderLessionsContents () {
    const renderSliderLessions = this.renderStep(this.state.slideIndex - 1);
    const { scenario } = this.props;

    if (scenario) {
      return (
        <div>
          <div className="buildmyAI__lessons__header">
            <span>Lessons</span>
            <div className="buildmyAI__lessons__header__action">
              <span tabIndex={0} role="button" className="tg-icon-home" onClick={() => (this.showListMenu())} />
            </div>
          </div>
          {renderSliderLessions}
          <div className="buildmyAI__lessons__nav-page">
            <span
              tabIndex={0}
              role="button"
              className="tg-icon-triangle-medium-left"
              onClick={() => (this.nextSliderLessons(-1))}
            />
            <div className="nav-info">
              {this.state.slideIndex} of {scenario.instructionContent ? scenario.instructionContent.length : 1}
            </div>
            <span
              tabIndex={0}
              role="button"
              className="tg-icon-triangle-medium-right"
              onClick={() => (this.nextSliderLessons(1))}
            />
          </div>
          <div
            className={this.state.showHelp ? 'buildmyAI__lessons__need-help animated fadeInUp' : 'buildmyAI__lessons__need-help'}
          >
            <span tabIndex={0} role="button" className="btn" onClick={() => (this.showHelpForm())}>Need Help ?</span>
            {this.state.showHelp ? this.renderFormHelp() : null}
          </div>
        </div>
      );
    }
    return null;
  }
  render() {
    return (
      <div className="buildmyAI__lessons">
        {this.state.listMenu ? this.renderListMenu() : this.renderLessionsContents() }
        <Script
          url="https://cloud.tinymce.com/stable/tinymce.min.js"
          onError={() => { this.handleScriptError(); }}
          onLoad={() => { this.handleScriptLoad(); }}
        />
      </div>
    );
  }
}
export default LessonsSliderComponent;

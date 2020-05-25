import React from 'react';
import ReactDOM from "react-dom";
import DnR from 'react-dnr';
import Select from 'react-select';
// import {OSXTheme, WindowsTheme} from 'react-dnr/modules/themes';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import swal from 'sweetalert';
import _get from 'lodash/get';
import isMobile from 'ismobilejs';
import { orientation } from 'o9n';
// import LessonsSliderComponent from './lessonsSlider.jsx';
import LectureComponent from '../containers/LectureComponent';
import CodeMirrorComponent from '../containers/CodeMirrorLesson.js';
import PoolComponent from '../../games/gamePool/lib/TrajectoryPoolComponent.jsx';
import TankWarComponent from '../../games/gamePool/lib/TankWarComponent.jsx';
import ScratchComponent from '../../games/gamePool/lib/ScratchComponent.jsx';
import CanvasComponent from '../../games/gamePool/lib/CanvasComponent.jsx';
import AlgorithmComponent from '../../games/gamePool/lib/AlgorithmComponent.jsx';
import WrapperLayout from './WrapperLayout.jsx';
import NoDraggingLayout from './BuildLayout.jsx';
import { ITEM_GAME_TYPE, MIGRATION_CONST} from '../../../../lib/enum';
import { LAYOUT_OPTION_TEXT } from '../../../../lib/const';
import { faTheaterMasks } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from '../containers/ChatHistory';
// import LessonChatEditor from './LessonChatEditor.jsx';
import QATitleBar from './QATitleBar';
import ChatBox from '../../messageActivity/components/ChatBox';


let savedCurrentSlideId = null;

const scratchgames = [
  MIGRATION_CONST.scratchGameId,
  MIGRATION_CONST.flappybirdGameId,
  MIGRATION_CONST.tankscratch2GameId,
  MIGRATION_CONST.scratchSoccerGameId,
  MIGRATION_CONST.drawingturtleGameId,
  MIGRATION_CONST.ia_k_turtleGameId,
  MIGRATION_CONST.generalconceptsGameId,
  MIGRATION_CONST.candycrushGameId,
  MIGRATION_CONST.appleharvestGameId,
  MIGRATION_CONST.recyclerGameId,
  MIGRATION_CONST.codinggameGameId,
  MIGRATION_CONST.algoScratchGameId,
  MIGRATION_CONST.mazeGameId,
  MIGRATION_CONST.balloonBusterGameId,
  MIGRATION_CONST.schoolAGameId,
  MIGRATION_CONST.schoolAGameCHId,
  MIGRATION_CONST.schoolBGameId,
  MIGRATION_CONST.schoolBGameCHId,
];

// react DnR:

const defaultTheme = {
  title: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    MozUserSelect: 'none',
    OUserSelect: 'none',
    overflow: 'hidden',
    width: '100%',
    height: 25,
  },
  frame: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  transition: 'all 0.25s ease-in-out'
};

class Button extends React.Component {
  constructor(props) {
    super(props)

  	this.state = {
  		hover: false,
  		down: false,
  	}
  }
  render() {
    const {
      style,
      hoverStyle,
      downStyle,
      children,
      cursor,
      ...other
    } = this.props

    const dragging = /resize$/.test(cursor)

  	const buttonStyle = {
  		...style,
  		...(this.state.hover && !dragging ? hoverStyle : {}),
  		...(this.state.down && !dragging ? downStyle : {}),
      cursor
  	};

  	return (
  		<button
  			onMouseEnter={()=>this.setState({hover:true})}
  			onMouseLeave={()=>this.setState({hover:false,down:false})}
  			onMouseDown={()=>this.setState({down:true})}
  			onMouseUp={()=>this.setState({down:false})}
  			style={buttonStyle}
  			{...other}>
  			{children}
  		</button>)
  }
}

const TitleBar = ({
	children,
	buttons,
	button1,
	button2,
	button3,
	button1Children,
	button2Children,
	button3Children,
  dnrState
}) =>
	<div>
		<div {...buttons}>
			<Button {...button1} cursor={dnrState.cursor}>
				{button1Children}
			</Button>
			{/* <Button {...button2} cursor={dnrState.cursor}>
				{button2Children}
			</Button>
			<Button {...button3} cursor={dnrState.cursor}>
				{button3Children}
			</Button> */}
		</div>
		{children}
	</div>


const WindowsTheme = ({title, onClose, onMinimize, onMaximize, titleBarColor = '#0095ff'}) => {
	const titleHeight = 25;
	const buttonRadius = 6;
	const fontSize = 14;
	const fontFamily = 'Helvetica, sans-serif';

	const style = {
			height: titleHeight,
	}

	const buttonStyle = {
		padding: 0,
		margin: 0,
		width: 30,
		height: 40,
		outline: 'none',
		border: 'none',
    textAlign: 'center',
    fontSize: "25px"
	}

	const buttons = {
		style: {
			height: titleHeight,
			position: 'absolute',
			right: 0,
			margin: 0,
			display: 'flex',
			alignItems: 'center',
			verticalAlign: 'baseline',
		}
	}

	const closeButton = {
		style: {
			...buttonStyle,
		  fontSize: '20px',
		  fontWeight: 500,
		  lineHeight: '36px',
			backgroundColor: titleBarColor,
		},
		hoverStyle: {
			backgroundColor: '#ec6060'
		},
		downStyle: {
			backgroundColor: '#bc4040'
		},
		onClick: onClose
	}

	const minimizeButton = {
		style: {
			...buttonStyle,
			lineHeight: '22px',
			backgroundColor: titleBarColor,
		},
		hoverStyle: {
			backgroundColor: 'rgba(0, 0, 0, 0.1)'
		},
		downStyle: {
			backgroundColor: 'rgba(0, 0, 0, 0.2)'
		},
		onClick: onMinimize
	}

	const maximizeButton = {
		style: {
			...buttonStyle,
			lineHeight: '12px',
			backgroundColor: titleBarColor
		},
		hoverStyle: {
			backgroundColor: 'rgba(0, 0, 0, 0.1)',
		},
		downStyle: {
			backgroundColor: 'rgba(0, 0, 0, 0.2)',
		},
		onClick: onMaximize
	}
	return {
		theme: {
			title: {
				...defaultTheme.title,
				fontFamily: fontFamily,
				background: titleBarColor,
				color: 'rgba(255, 255, 255, 1)',
				fontSize: fontSize,
				height: titleHeight,
			},
			frame: {
				...defaultTheme.frame,
			},
		  transition: 'all 0.25s ease-in-out'
		},
		titleBar: (<TitleBar
				style={style}
				buttons={buttons}
				button1={minimizeButton}
				// button2={maximizeButton}
				// button3={closeButton}
				button1Children='‒'
				// button2Children='□'
				// button3Children='˟'
        >
					<div style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'left',
						justifyContent: 'left'
					}}>
						{title}
					</div>
			</TitleBar>),
	}
}















let checkMobile = (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet);

const consoleStyle = {
	width: '49.8%',
	height: '36%',
	top: '53%',
	left: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: "solid 2px blue"
};

const qaStyle = {
	width: '49.8%',
	height: '71%',
	top: '18%',
	left: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: "solid 2px purple"
};

const refStyle = {
	width: '78%',
	height: '60%',
	top: '15%',
	left: '10%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: "solid 2px green",
  overflow: "visible"
};

const AllQuizTypes = ["quiz", "q1", "q2", "q3", "coding", "survey", "input"];

const LAYOUT_OPTION = check => ({
  OPTION1: [{
    i: 'lecture',
    x: 0,
    y: 0,
    w: check ? 12 : 6,
    h: check ? 6 : 12
  }, {
    i: 'editor',
    x: check ? 0 : 6,
    y: check ? 6 : 0,
    w: 6,
    h: 6
  }, {
    i: 'game',
    x: 6,
    y: 6,
    w: 6,
    h: 6
  }],
  OPTION2: [{
    i: 'lecture',
    x: 0,
    y: 0,
    w: 6,
    h: 12,
  }, {
    i: 'editor',
    x: 6,
    y: 0,
    w: 6,
    h: 12,
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
  OPTION3: [{
    i: 'editor',
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }, {
    hide: true,
    i: 'lecture',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
  OPTION4: [{
    i: 'game',
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  }, {
    i: 'editor',
    hide: true,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }, {
    hide: true,
    i: 'lecture',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
  OPTION5: [{
    i: 'editor',
    x: 0,
    y: 0,
    w: check ? 12 : 6,
    h: check ? 6 : 12
  }, {
    i: 'game',
    x: check ? 0 : 6,
    y: check ? 6 : 0,
    w: check ? 12 : 6,
    h: check ? 6 : 12
  }, {
    hide: true,
    i: 'lecture',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
  OPTION6: [{
    i: 'lecture',
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }, {
    hide: true,
    i: 'editor',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
  OPTION7: [{
    i: 'lecture',
    x: 0,
    y: 0,
    w: 6,
    h: 12,
  }, {
    i: 'game',
    x: 6,
    y: 0,
    w: 6,
    h: 12,
  }, {
    hide: true,
    i: 'editor',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
});

const TableItems = [
  // prod:
  { "_id" : "7E4j6FsifyBpeAeoa", "imageSrc" : { "main" : "/images/Royal_House.png" } },
  { "_id" : "Rtcy3tJ4oBJwgyLy9", "imageSrc" : { "main" : "/images/diamondpoolbig.png", small: '/images/diamondpoolsmall.png' } },
  { "_id" : "Sgwizr3nica5WK4bh", "imageSrc" : { "main" : "/images/Golden_Castle.png", small: '/images/Golden_Castle_Small.png' } },
  { "_id" : "quMQHY6AMsxCnyCvK", "imageSrc" : { "main" : "/images/Ancient_Myth.png", small: '/images/Ancient_Myth_Small.png' } },
  { "_id" : "yLvYzkus9J95AeX9x", "imageSrc" : { "main" : "/images/Alien_Star.png", small: '/images/Alien_Star_Small.png' } },
  { "_id" : "hX3pPPHXuxidqCxTd", "imageSrc" : { "main" : "/images/Snow_World.png", small: '/images/Snow_World_Small.png' } },
  { "_id" : "KfmwHqBhHZzfwtqPa", "imageSrc" : { "main" : "/images/Sea_of_Fire.png", small: '/images/Sea_of_Fire_Small.png' } },
  { "_id" : "STSkfQKavWyLPJicg", "imageSrc" : { "main" : "/images/Rainbow_Sky.png", small: '/images/Rainbow_Sky_Small.png' } },
  { "_id" : "abWD4BRpqi3Mo76iE", "imageSrc" : { "main" : "/images/Lightning_Night.png", small: '/images/Lightning_Night_Small.png' } },

  // local:
  { "_id" : "t0", "imageSrc" : { "main" : "/images/diamondpoolbig.png", small: '/images/diamondpoolsmall.png' } },
  { "_id" : "t1", "imageSrc" : { "main" : "/images/Golden_Castle.png", small: '/images/Golden_Castle_Small.png' } },
  { "_id" : "t2", "imageSrc" : { "main" : "/images/Alien_Star.png", small: '/images/Alien_Star_Small.png' } },
  { "_id" : "t3", "imageSrc" : { "main" : "/images/Royal_House.png", small: '/images/Royal_House_Small.png' } },
  { "_id" : "t4", "imageSrc" : { "main" : "/images/Ancient_Myth.png", small: '/images/Ancient_Myth_Small.png' } },
  { "_id" : "t5", "imageSrc" : { "main" : "/images/Snow_World.png", small: '/images/Snow_World_Small.png' } },
  { "_id" : "t6", "imageSrc" : { "main" : "/images/Sea_of_Fire.png", small: '/images/Sea_of_Fire_Small.png' } },
  { "_id" : "t7", "imageSrc" : { "main" : "/images/Rainbow_Sky.png", small: '/images/Rainbow_Sky_Small.png' } },
  { "_id" : "t8", "imageSrc" : { "main" : "/images/Lightning_Night.png", small: '/images/Lightning_Night_Small.png' } },
];

const CueItems = [
  // prod:
  { "_id" : "53v2n8xavTiCGQ2ZX", "imageSrc" : { "main" : "/images/Ancient_Quest.png" } },
  { "_id" : "Bv7RuezX9knCFHxrr", "imageSrc" : { "main" : "/images/Alien_Sword.png" } },
  { "_id" : "Edry7djosjy4aitzQ", "imageSrc" : { "main" : "/images/poolstickpurple.png" } },
  { "_id" : "J8bX92GfbcRkuAwNZ", "imageSrc" : { "main" : "/images/Golden_Hand.png" } },
  { "_id" : "dYFtwZ4kGnKLX2rW2", "imageSrc" : { "main" : "/images/Royal_Scepter.png" } },
  { "_id" : "Td79rWQAYYXihrRxL", "imageSrc" : { "main" : "/images/Blue_Icicle.png" } },
  { "_id" : "WfoQ5Le7Eekzrqyfj", "imageSrc" : { "main" : "/images/Touch_of_Fire.png" } },
  { "_id" : "DhF8Su2j9DazqJxZW", "imageSrc" : { "main" : "/images/Rainbow_Wand.png" } },
  { "_id" : "JZcHrbiEvSqKMuem8", "imageSrc" : { "main" : "/images/Lightning_Strike.png" } },

  // local:
  { "_id" : "c0", "imageSrc" : { "main" : "/images/poolstickpurple.png" } },
  { "_id" : "c1", "imageSrc" : { "main" : "/images/Golden_Hand.png" } },
  { "_id" : "c2", "imageSrc" : { "main" : "/images/Alien_Sword.png" } },
  { "_id" : "c3", "imageSrc" : { "main" : "/images/Royal_Scepter.png" } },
  { "_id" : "c4", "imageSrc" : { "main" : "/images/Ancient_Quest.png" } },
  { "_id" : "c5", "imageSrc" : { "main" : "/images/Blue_Icicle.png" } },
  { "_id" : "c6", "imageSrc" : { "main" : "/images/Touch_of_Fire.png" } },
  { "_id" : "c7", "imageSrc" : { "main" : "/images/Rainbow_Wand.png" } },
  { "_id" : "c8", "imageSrc" : { "main" : "/images/Lightning_Strike.png" } },

];


class LessonPageComponent extends React.Component {
  static defaultProps = {
    lesson: null
  }
  constructor(props) {
    super(props);
    const widthWindow = window.innerWidth;
    this.state = {
      layoutSelected: '', //widthWindow > 480 ? 'OPTION6' : 'OPTION6',
      isPaused: false,
      config: {},
      isTestRunning: false,
      isShowingConsole: false,
      chatHistoryKeyword: '',
      isShowingQA: false,
      isShowingRef: false,
      speedM: 1,
      hasNoSpeech: 0,
      classToSync: props.classList && props.classList.length > 0 ? props.classList[0] : {},
      inSyncMode: false,
      beingSynced: false,
      studentToSync: "",
      currentLocale: window.currentChosenLocale ? window.currentChosenLocale : "EN"
    };
    window.inSyncMode = false;
    window.classToSync = "";
  }

  changeSpeed() {
    if (this.state.speedM == 1) {
      this.state.speedM = 1.2;
    } else if (this.state.speedM == 1.2) {
      this.state.speedM = 1.5;
    } else if (this.state.speedM == 1.5) {
      this.state.speedM = 0.8;
    } else {
      this.state.speedM = 1;
    }
    if (window.setSpeechM) window.setSpeechM(this.state.speedM);
    this.forceUpdate();
  }

  componentWillMount() {
    this.getConfig();
    orientation.addEventListener('change', this.handleChangeOrientation);

    if (orientation.type.includes('landscape')) {
      checkMobile = false;
    }
  }

  componentWillUnmount() {
    this.unlockAllClasses();
    savedCurrentSlideId = null;
    if (window.scrollNavPaneTimer) {
      clearTimeout(window.scrollNavPaneTimer);
    }

    if (window.changeLayoutTimer) {
      clearTimeout(window.changeLayoutTimer);
    }

    if (window.resizeWindowTimer) {
      clearTimeout(window.resizeWindowTimer);
    }
    delete window.toggleTestButton;
    orientation.removeEventListener('change', this.handleChangeOrientation);
  }

  handleChangeOrientation = (e) => {
    if (e.currentTarget.type.includes('landscape')) {
      checkMobile = false;
    } else {
      checkMobile = (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet);
    }
  };

  handleChatHistoryKeywordChange = value => {
    this.setState({ chatHistoryKeyword: value });
  }

  getConfig = () => {
    const { config: { mainItems, backgroundItems } } = this.props;
    this.setState({
      config: { mainItems, backgroundItems }
    });

    // old for pool game works:
    if (0) {
      const items = Meteor.user().profile.itemGames;
      const config = { };
      // get cue stick
      for (let k=0; k < items.length; k++) {
        if (items[k].active) {
          for (let j=0; j<CueItems.length; j++) {
            if (CueItems[j]._id == items[k].itemId) {
              config.mainItems = CueItems[j];
              break;
            }
          }
        }
        if (config.mainItems) break;
      }

      // get table
      for (let k=0; k < items.length; k++) {
        if (items[k].active) {
          for (let j=0; j<TableItems.length; j++) {
            if (TableItems[j]._id == items[k].itemId) {
              config.backgroundItems = TableItems[j];
              break;
            }
          }
        }
        if (config.backgroundItems) break;
      }
      this.setState({
        config
      });
    }
  }


  getGameItemByType = type => new Promise((resolve, reject) => {
    const { user } = this.props;
    const itemIds = _get(user, 'profile.itemGames', [])
      .filter(item => item.active === true)
      .map(item => item.itemId);
    Meteor.call('gameItem.getByType', itemIds, type, (error, result) => {
      if (!error) {
        return resolve(result);
      }
      return reject(error);
    });
  });

  backFunction() {
    const { history, lesson, selectGameTutorial } = this.props;
    const { gameId, package: packageType } = lesson || {};

    if (gameId == MIGRATION_CONST.codinggameGameId) {
      history.push('/gamesBoard');
      return;
    }

    selectGameTutorial({
      gameId,
      packageType,
      isSlideFormat: true
    });
    history.push('/courses');
  }

  handleChangeLayout = (value) => {
    this.setState({
      layoutSelected: value,
    });
    if (window.testGameComponent) {
      window.changeLayoutTimer = setTimeout(() => {
        window.testGameComponent.tryResize();
        if (window.robotCodeEditor) window.robotCodeEditor.codeMirror.refresh();
        if (window.testCodeEditor) window.testCodeEditor.codeMirror.refresh();
      }, 200);
    }
  }

  gotoFirstSlide() {
    if (window.currentSound) {
      // console.log("stop sound");
      window.currentSound.unload();
      window.currentSound = null;
    }
    $("#codeSolution").hide();

    Meteor.call('gotoFirstSlide', this.props.userLesson._id);
  }

  showConsole() {
    if (!this.state.isShowingConsole) {
      $("#ConsoleLogWindow").show();
      this.state.isShowingConsole = true;
    } else {
      $("#ConsoleLogWindow").hide();
      this.state.isShowingConsole = false;
    }
  }

  hideConsole() {
    this.state.isShowingConsole = false;
    $("#ConsoleLogWindow").hide();
  }

  showReference() {
    if (!this.state.isShowingRef) {
      $("#RefWindow").show();
      this.setState({ isShowingRef: true });
    } else {
      $("#RefWindow").hide();
      this.setState({ isShowingRef: false });
    }
  }

  hideRef() {
    this.state.isShowingRef = false;
    $("#RefWindow").hide();
  }

  showQA() {
    if (!this.state.isShowingQA) {
      $("#QAWindow").show();
      this.setState({ isShowingQA: true });
    } else {
      $("#QAWindow").hide();
      this.setState({ isShowingQA: false });
    }
  }

  hideQA() {
    this.state.isShowingQA = false;
    $("#QAWindow").hide();
  }

  goToLast(shouldBlock) {
    if (shouldBlock) return;
    if (window.currentSound) {
      // console.log("stop sound");
      window.currentSound.unload();
      window.currentSound = null;
    }
    $("#codeSolution").hide();

    Meteor.call('goToLast', this.props.userLesson._id);
  }

  jumpToNextSlide(shouldBlock) {
    if (shouldBlock) return;
    if (window.currentSound) {
      // console.log("stop sound");
      window.currentSound.unload();
      window.currentSound = null;
    }
    $("#codeSolution").hide();

    Meteor.call('jumpToNextSlide', this.props.userLesson._id);
  }

  jumpToNextQuiz(shouldBlock) {
    if (shouldBlock) return;
    if (window.currentSound) {
      window.currentSound.unload();
      window.currentSound = null;
    }
    $("#codeSolution").hide();

    Meteor.call('jumpToNextQuiz', this.props.userLesson._id);
  }

  toggleVoice() {
    if (window.NoSpeech) {
      window.NoSpeech = 0;
    } else {
      window.NoSpeech = 1;
    }
    this.state.hasNoSpeech = window.NoSpeech;
    this.forceUpdate();
  }

  jumpToNextStep() {
    const shouldBlock = $("#nextSentenceButton").is(":disabled");
    if (shouldBlock) return;
    const now = new Date();
    if (!window.lastNextSentenceTime) window.lastNextSentenceTime = now - 10000;


    if ((now - window.lastNextSentenceTime) < 500 &&  !["ScDM5NzhdHgyyHsYw", "kEmnDrYssC2gKNDxx", "Z68dbdNXHuCGTGFjF"].includes(Meteor.userId())) {
      return;
    }

    window.lastNextSentenceTime = new Date();
    if (window.currentSound) {
      window.currentSound.unload();
      window.currentSound = null;
    }
    this.setPaused(false);
    if (window.JumpFragmentHandler) window.JumpFragmentHandler();
  }

  replayCurrent() {
    if (window.replayCurrent) {
      // if (this.state.isPaused)
      //   window.handleClickPlayPause();
      window.replayCurrent();
    }
  }

  stepBack() {
    if (window.currentSound) {
      window.currentSound.unload();
      window.currentSound = null;
    }
    $("#codeSolution").hide();
    Meteor.call('gotoPrevSlide', this.props.userLesson._id);
  }

  stepForward(shouldBlock) {
    if (shouldBlock) return;
    if (window.currentSound) {
      window.currentSound.unload();
      window.currentSound = null;
    }
    $("#codeSolution").hide();
    Meteor.call('gotoNextSlide', this.props.userLesson._id, false);
  }

  handleClickPlayPause() {
    //this.setPaused(!this.state.isPaused);
    window.handleClickPlayPause();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (Meteor.user().syncMode == "Sync" && !this.state.beingSynced) {
      this.setState({beingSynced: true});
      console.log("start beingSynced");
      $("#lessonPageNav").css("display", "none");

      return true;
    }
    if (Meteor.user().syncMode !== "Sync" && this.state.beingSynced) {
      this.setState({beingSynced: false});
      console.log("stop beingSynced free!");
      $("#lessonPageNav").css("display", "block");
      return true;
    }
    if (this.props.userLesson.currentSlideId != nextProps.userLesson.currentSlideId) {
      this.state.layoutSelected = "";
    }
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }


  fixUI() {
    const { lesson, userLesson, slide, slideContent } = this.props;
    const that = this;
    // console.log("in lessonpage did mount 1");
    $("#scrollPageLeft").click(this.handleClickScrollPageLeft.bind(this));
    $("#scrollPageRight").click(this.handleClickScrollPageRight.bind(this));

    //$("#playpauseicon").click(this.handleClickPlayPause.bind(this));
    // console.log("in lessonpage did mount 3");

    setTimeout(() => {

      $(".verification-email").hide();

      // const consoleSelector = "#ConsoleLogWindow > div > div:nth-child(1) > div > div:nth-child(2)";

      // $(consoleSelector).css("font-size", "20px");
      // $(consoleSelector).css("padding", "10px");
      // $(consoleSelector).css("height", "40px");

      $("#ConsoleLogWindow > div > div").eq(0).css("font-size", "20px");
      $("#ConsoleLogWindow > div > div").eq(0).css("padding", "10px");
      $("#ConsoleLogWindow > div > div").eq(0).css("height", "40px");

      // console.log("in lessonpage did mount 4");
      that.hideConsole();
      const minButtonSelector = "#ConsoleLogWindow > div > div:nth-child(1) > div > div:nth-child(1) > button";
      $(minButtonSelector).css("height", "40px");

      const mnimizerButtonSelector = "#QAWindow > div > div:nth-child(1) > div > div:nth-child(1) > button";
      $(mnimizerButtonSelector).css("background", "rgb(133, 51, 96)");

      // console.log("in lessonpage did mount 5");

      $("#QAWindow > div > div").eq(0).css("font-size", "20px");
      $("#QAWindow > div > div").eq(0).css("padding", "10px");
      $("#QAWindow > div > div").eq(0).css("height", "40px");
      that.hideQA();

      const minButtonSelector2 = "#QAWindow > div > div:nth-child(1) > div > div:nth-child(1) > button";
      $(minButtonSelector2).css("height", "40px");


      $("#RefWindow > div > div").eq(0).css("font-size", "20px");
      $("#RefWindow > div > div").eq(0).css("padding", "10px");
      $("#RefWindow > div > div").eq(0).css("height", "40px");
      $("#RefWindow > div > div").eq(0).css("margin-top", "0px");

      $("#RefWindow > div > div").eq(0).css("top", "0px");
      $("#RefWindow > div > div").eq(0).css("position", "absolute");
      $("#RefWindow > div > div").eq(0).css("z-index", "101");

      $("#RefWindow > div > div.contentClassName").eq(0).css("top", "25px");
      // $("#RefWindow > div > div.contentClassName").eq(0).css("width", "500px");

      const minButtonSelector3 = "#RefWindow > div > div:nth-child(1) > div > div:nth-child(1) > button";
      $(minButtonSelector3).css("height", "30px");

      $(minButtonSelector3).css("background", "rgb(51, 133, 96)");
      that.hideRef();


      window.toggleTestButton = that.toggleButton.bind(that);

      window.setWindowLayout = (slide) => {
        // don't repeatedly reset layout after loading this slide for first time!
        let newLayout = '';
        switch (slide.WINDOWS) {
          case 'L': {
             newLayout = 'OPTION6';
            break;
          }
          case 'LG': {
            newLayout = 'OPTION7';
            break;
          }
          case 'LE': {
            newLayout = 'OPTION2';
            break;
          }
          case 'LEG': {
            newLayout = 'OPTION1';
            break;
          }
          default: {
            newLayout = 'OPTION6';
            break;
          }
        }
        if (newLayout != that.state.layoutSelected || slide.ID !== window.currentSlideID) {
          // if (slide.ID == window.currentSlideID) return;
          window.currentSlideID = slide.ID;
          that.state.layoutSelected = newLayout;
          that.forceUpdate();
          window.resizeWindowTimer = setTimeout(()=> {
            if (window.resizeGameWindow) window.resizeGameWindow();
          }, 500);
        }
      };


      const noProp = (event) => {
        event.stopPropagation();
      };

      $("#LogContentDiv").mousedown(noProp);
      $("#LogContentDiv").mousemove(noProp);

      $("#QADiv").mousedown(noProp);
      $("#QADiv").mousemove(noProp);

      $("#RefDiv").mousedown(noProp);
      $("#RefDiv").mousemove(noProp);

    },10);
  }

  componentDidMount() {
    const { userLesson, slide, slideContent } = this.props;

    window.AllConsoleLog = [];
    window.handleNewConsole = this.handleNewConsole.bind(this);
    window.handleClearConsole = this.handleClearConsole.bind(this);
    if (window.setSpeechM) window.setSpeechM(this.state.speedM);
    window.jumpToNextStep = this.jumpToNextStep.bind(this);


    if (!window.currentChosenLocale) {
      if (lesson.locale) {
        if (lesson.locale == "zh-cn") {
          window.currentChosenLocale = "CH";  
        } else {
          window.currentChosenLocale = "EN";
        }
      } else {
        window.currentChosenLocale = "EN";
      }
    }


    if (this.content && this.header) {
      this.content.style.cssText = `margin-top: ${this.header ? this.header.offsetHeight + 5 : 68}px`;
    }
    // this.fixUI();


    const that = this;
    window.switchLayout = () => {
      that.handleChangeLayout('OPTION2');
    };

    this.unlockAllClasses();


  }

  unlockAllClasses() {
    const {classList} = this.props;

    for(let i=0; i<classList.length; i++) {
      Meteor.call("setClassLockMode", classList[i]._id, "Free", "", (err, res) => {
      });
    }

    
  }

  

  handleClickScrollPageLeft() {
    const currentLeft = $("#naviIconPanel").position().left;
    const totalWidth = $(".outerNavIconPanel").width();
    let newLeft = Math.min(0, currentLeft + totalWidth / 2);
    // console.log("left from " + currentLeft + " to " + newLeft + " totalW " + totalWidth);
    // setTimeout(() => {
      $("#naviIconPanel").animate({left: newLeft + 'px'}, 400, "swing");
    // },100);
  }

  handleClickScrollPageRight() {
    const { userLesson} = this.props;
    const currentLeft = $("#naviIconPanel").position().left;
    const totalWidth = $(".outerNavIconPanel").width();
    const numberOfIcons = userLesson.slideVisitLog.length;
    const allWidth = numberOfIcons * 40 + 9 * (numberOfIcons-1);
    let newLeft = Math.max(0 + totalWidth - allWidth, currentLeft - totalWidth/2);
    // console.log("go right from " + currentLeft + " to " + newLeft + " totalW " + totalWidth);
    // setTimeout(() => {
      $("#naviIconPanel").animate({left: newLeft + 'px'}, 400, "swing");
    // },100);

  }

  scrollNavIconToCurrent() {
    const { userLesson } = this.props;
    const currentPanelLeft = $("#naviIconPanel").position().left;
    const totalWidth = $(".outerNavIconPanel").width();
    const activePos = $(".activePage").position().left;
    const activeOffset = $(".activePage").offset().left;
    const leftButton = $("#scrollPageLeft").position().left;
    const rightButton = $("#scrollPageRight").position().left;
    // debugger;
    if (activeOffset > leftButton + 50 && activeOffset < rightButton - 50) return;
    // const newLeft = Math.max(0 + totalWidth - allWidth, currentLeft - totalWidth/2);
    // get how many icons are to the right of activePage
    let tailCount = 0;
    for (let k=userLesson.slideVisitLog.length-1; k>=0; k--) {
      if (userLesson.slideVisitLog[k].slideId == userLesson.currentSlideId) {
        break;
      }
      tailCount ++;
    }
    const tailLength = tailCount * 49;
    const newTarget = Math.max(200, rightButton - 140 - tailLength);
    const newLeft = Math.min(newTarget - activePos, 0);
    $("#naviIconPanel").animate({left: newLeft + 'px'}, 400, "swing");
    return;

    for (let k=0; k<userLesson.slideVisitLog.length; k++) {
      const log = userLesson.slideVisitLog[k];
      if (log.slideId == userLesson.currentSlideId) {

        const distanceFromLeft = (k) * 40 + 9 * (k-1);
        if (currentPanelLeft + distanceFromLeft < 50) {
          this.handleClickScrollPageLeft();
        } else if (currentPanelLeft + distanceFromLeft > totalWidth - 50) {
          this.handleClickScrollPageRight();
        }
        break;
      }
    }

  }

  handleNavIconClick(index) {
    // const { userLesson } = this.props;
    Meteor.call('jumpToPrevSlide', this.props.userLesson._id, index);
  }

  renderNavIcon(log, index) {
    const { lesson, userLesson, slideContent, initializeUserLesson, history, studentId } = this.props;
    const that = this;
    const slide = slideContent.slideInfo.find(e => (e.ID == log.slideId));
    if (!slide) return;
    let iconType = "chalkboard-teacher";
    switch ( slide.TYPE.toLowerCase()) {
      case "info":
        iconType = "chalkboard-teacher";
        break;
      case "example":
      case "e1":
      case "e2":
      case "e3":
        iconType = "search"; //"layer-group";
        break;
      case "input":
        iconType = "edit";
        break;
      case "quiz":
      case "survey":
      case "q1":
      case "q2":
      case "q3":
        iconType = "question";
        break;
      case "coding":
        iconType = "keyboard";
        break;
      case "endoflesson":
        iconType = "coins";
        break;
      case "hint":
      case "solution":
        iconType = "lightbulb";
        break;
      case "activity":
        iconType = "gamepad"; //"paper-plane";
        break;

    }
    return (
      <span key={"topspan" + index}>
        <button className="buttonLine" style={{display: index == 0 ? "none":"inline-block"}}> </button>
        <button title={"[" + index + "] " + (slide.TITLE ? slide.TITLE : slide.TYPE)} onClick={() => { that.handleNavIconClick(index);}} className={"buttonRound3" + (log.skipped?"skipped":"") + ( slide.ID == userLesson.currentSlideId ? " activePage" : ""  ) }>
          <FontAwesomeIcon icon={iconType} />
        </button>
      </span>
    );
  }

  setPaused(isPaused) {
    this.setState({
      isPaused
    });
  }

  toggleButton(isRunning) {
    if (typeof(isRunning) != "undefined") {
      if (!isRunning) {
        this.state.isTestRunning = false;
        document.getElementById('runbutton').innerHTML = "Run";
      } else {
        this.state.isTestRunning = true;
        document.getElementById('runbutton').innerHTML = "Stop";
      }
    } else {
      if (this.state.isTestRunning) {
        this.state.isTestRunning = false;
        document.getElementById('runbutton').innerHTML = "Run";
      } else {
        this.state.isTestRunning = true;
        document.getElementById('runbutton').innerHTML = "Stop";
      }
    }
  }

  handleClassChange(v) {
    const {classList} = this.props;
    this.setState({classToSync: v});
  }


  handleChButton() {
    const { history, lesson } = this.props;

    if (window.currentSound) {
      // console.log("stop sound 5");
      window.currentSound.unload();
      window.currentSound = null;
    }
    window.currentChosenLocale = "CH";
    this.setState({
      currentLocale: window.currentChosenLocale
    });

    // history.push('/lesson/' + lesson._id + "_CH");
  }

  handleEnButton() {
    const { history, lesson } = this.props;

    if (window.currentSound) {
      // console.log("stop sound 5");
      window.currentSound.unload();
      window.currentSound = null;
    }

    window.currentChosenLocale = "EN";
    this.setState({
      currentLocale: window.currentChosenLocale
    });
    // history.push('/lesson/' + lesson._id.substring(0, lesson._id.length - 3));
  }


  handleSyncClass() {
    const { userLesson } = this.props;
    // const oldValue = this.state.oldCode;

    const that = this;

    swal({
      title: `Are you sure you want to move all students in class ${this.state.classToSync.name} to the current slide?`,
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((confirmed) => {
      if (confirmed) {
        // const log = userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));

        Meteor.call("syncClassProgress", userLesson._id, that.state.classToSync._id, (err, res) => {
          if (err) {
            swal("Error synching class: " + err.message);
          } else {
            swal("Successfully synched class!");
          }
        });
      }
    });



  }

  // handleBroadcastMode() {
  //   const { userLesson, classList} = this.props;
  //   const { classToSync } = this.state;
  //   const classObj = classList.find(c => c.name == classToSync.name);
  //   // const oldValue = this.state.oldCode;

  //   const that = this;

  //   var newv = true;
  //   if (classObj)
  //    newv = !classObj.isScreenLocked;

  //   swal({
  //     title: `Are you sure you want to broadcast to all students in class ${this.state.classToSync.name}?`,
  //     text: "",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true,
  //   })
  //   .then((confirmed) => {
  //     if (confirmed) {
  //       Meteor.call("setClassLockMode", that.state.classToSync._id, "Broadcast", (err, res) => {
  //         if (err) {
  //           swal("Error setting class to broadcast mode: " + err.message);
  //         } else {
  //           swal("Successfully set class to broadcast mode!");
  //         }
  //       });
  //     }
  //   });
  // }

  handleSyncMode() {
    const { userLesson, classList} = this.props;
    const { classToSync } = this.state;
    const classObj = classList.find(c => c.name == classToSync.name);
    // const oldValue = this.state.oldCode;

    const that = this;

    swal({
      title: `Are you sure you want to sync all students in class ${this.state.classToSync.name}?`,
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((confirmed) => {
      if (confirmed) {

        window.triggerSync();

        Meteor.call("setClassLockMode", that.state.classToSync._id, "Sync", document.location.pathname, (err, res) => {
          if (err) {
            //swal("Error setting class to sync mode: " + err.message);

            Bert.alert({
              title: 'Error',
              hideDelay: 4000,
              message: "Error setting class to sync mode: " + err.message,
              type: 'codeInValidError',
              style: 'growl-bottom-right',
              icon: 'fas fa-warning'
            });            

          } else {
            //swal("Class in sync mode now!");

            Bert.alert({
              title: 'Success',
              message: "Class in sync mode now!",
              type: 'success',
              style: 'growl-bottom-right',
              icon: 'fas fa-check'
            });    
            this.setState({ inSyncMode: true });
            window.inSyncMode = true;
            window.classToSync = that.state.classToSync._id;
          }
        });
      }
    });
  }

  handleFreeMode() {
    const { userLesson, classList} = this.props;
    const { classToSync } = this.state;
    const classObj = classList.find(c => c.name == classToSync.name);
    // const oldValue = this.state.oldCode;

    const that = this;

    swal({
      title: `Ready to unlock lesson for the class ${this.state.classToSync.name}?`,
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((confirmed) => {
      if (confirmed) {
        Meteor.call("setClassLockMode", that.state.classToSync._id, "Free", "", (err, res) => {
          if (err) {
            // swal("Error unlocking lesson: " + err.message);
            Bert.alert({
              title: 'Error',
              hideDelay: 4000,
              message: "Error unlocking lesson: " + err.message,
              type: 'codeInValidError',
              style: 'growl-bottom-right',
              icon: 'fas fa-warning'
            });   
          } else {
            Bert.alert({
              title: 'Success',
              message: "Class in free mode now!",
              type: 'success',
              style: 'growl-bottom-right',
              icon: 'fas fa-check'
            }); 
            this.setState({ inSyncMode: false });
            window.inSyncMode = false;
            window.classToSync = "";
          }
        });
      }
    });
  }

  
  handleLockClass() {
    const { userLesson, classList} = this.props;
    const { classToSync } = this.state;
    const classObj = classList.find(c => c.name == classToSync.name);
    // const oldValue = this.state.oldCode;

    const that = this;

    var newv = true;
    if (classObj)
     newv = !classObj.isScreenLocked;

    swal({
      title: "Are you sure you want to " + (newv ? "lock" : "unlock") + ` all students in class ${this.state.classToSync.name}?`,
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((confirmed) => {
      if (confirmed) {
        // const log = userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));

        Meteor.call("lockClassScreen", that.state.classToSync._id, newv, (err, res) => {
          if (err) {
            swal("Error locking class: " + err.message);
          } else {
            swal("Successfully " + (newv ? "locked" : "unlocked") + " class!");
          }
        });
      }
    });



  }

  handleStudentChange(news) {
    const { userLesson } = this.props;
    const that = this;
    // const oldValue = this.state.oldCode;

    // const lintErrors = this.getLintErrors();
    // const firstError = lintErrors.length > 0 ? `${lintErrors[0].from.line}:${lintErrors[0].message}` : '';

    Impersonate.do(news._id, function(err, userId) {
      if (err) return;
      console.log("You are now impersonating user #" + userId);

      history.reload();

    });
  }

  handleScratchReset() {
    const { userLesson } = this.props;
    const that = this;
    // const oldValue = this.state.oldCode;

    // const lintErrors = this.getLintErrors();
    // const firstError = lintErrors.length > 0 ? `${lintErrors[0].from.line}:${lintErrors[0].message}` : '';

    swal({
      title: `Are you sure you want to reset your code changes?`,
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((confirmed) => {
      if (confirmed) {
        const log = userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));
        // console.log('in handle change');

        Meteor.call("saveUserRobotCodeForLesson", userLesson._id, "INVALIDECODE", log.robotCodeInd + 1);

        setTimeout(() => {
          document.location.reload(true);
        }, 500);
      }
    });



  }

  handleRunClick() {
    if (this.state.isTestRunning) {
      window.handleStopTest();
      return;
    } else {
      this.toggleButton();
      window.handlePlaygame();
    }
  }


  handleNewConsole(str) {
    window.AllConsoleLog.push(str);
    this.forceUpdate();
  }

  handleClearConsole() {
    window.AllConsoleLog = [];
    this.forceUpdate();
  }

  getCurlys() {
    return "{ }";
  }

  userHasVisitedSlideBefore(slideId, lessonId) {
    const { allLogs } = this.props;
    if (["ourgoal", "welcome"].includes(slideId)) return false;
    for (let k=0; k<allLogs.length; k++) {
      if (allLogs[k].lessonId != lessonId) {
        const vlogs = allLogs[k].slideVisitLog;
        for (let j=0; j<vlogs.length; j++) {
          if (vlogs[j].slideId == slideId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  render() {
    const { lesson, studentUsers, classList, userLesson, slideContent, initializeUserLesson, history, studentId, chatSupport } = this.props;
    const { config, classToSync, studentToSync, isShowingConsole, chatHistoryKeyword, isShowingQA } = this.state;
    const classObj = classList.find(c => c.name == classToSync.name);

    let studentList = [];
    if (classObj) {
      for(let i = 0; i < classObj.users.length; i++) {
        const u = studentUsers.find(u => u._id == classObj.users[i]);
        if (u) {
          studentList.push({
            name: u.profile.firstName + " "+ u.profile.lastName,
            email: u.emails[0].address, username: u.username, _id: u._id
          });
        }
      }
    }

    if (userLesson.currentSlideId != savedCurrentSlideId) {
      this.fixUI();
      savedCurrentSlideId = userLesson.currentSlideId;
    }

    if (typeof(window.AllConsoleLog) == "undefined") {
      window.AllConsoleLog = [];
    }

    const ConsoleWindowTheme = WindowsTheme({
			title: 'Console Log',
			// onClose: ()=>this.refs.dnr.minimize(),
			onMinimize: ()=>this.hideConsole(),
			// onMaximize: ()=>this.refs.dnr.maximize(),
		});

    const QAWindowTheme = WindowsTheme({
			title: <QATitleBar changeKeyword={this.handleChatHistoryKeywordChange} />,
			// onClose: ()=>this.refs.dnr.minimize(),
			onMinimize: ()=>this.hideQA(),
      // onMaximize: ()=>this.refs.dnr.maximize(),
      titleBarColor: "rgb(133, 51, 96)" //"rgb(33, 88, 69)"
		});

    const RefWindowTheme = WindowsTheme({
      title: 'Reference',
			onMinimize: ()=>this.hideRef(),
      // onMaximize: ()=>this.refs.dnr.maximize(),
      titleBarColor: "rgb(51, 133, 96)" //"rgb(33, 88, 69)"
		});

    if (!userLesson) {
      if (lesson.isUserTest) {
        //initializeUserChatUser(lesson._id);
      }  else {
        initializeUserLesson(lesson._id);
      }
      return;
    }

    const that = this;

    // determine window layout based on current slide
    let log = userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));
    if (!log) {
      log = userLesson.slideVisitLog[0];
    }
    const slide = slideContent.slideInfo.find(e => (e.ID == userLesson.currentSlideId));
    if (!slide || !log) {
      Meteor.call('gotoLatestVisitedSlide', this.props.userLesson._id);
      return (<div></div>);
    }

    window.scrollNavPaneTimer = setTimeout(() => {
      // make sure current active slide is visible
      that.scrollNavIconToCurrent();
    }, 500);

    let isLastSlide = log.slideId == userLesson.slideVisitLog[userLesson.slideVisitLog.length-1].slideId;
    let shouldBlock = false;
    if (isLastSlide && AllQuizTypes.includes(log.slideType.toLowerCase()) && !log.completed) {
      if (log.slideType.toLowerCase() == "coding" && log.slideNode && log.slideNode.toLowerCase() == "extracredit") {
        // still ok to continue if extra credit
      } else {
        shouldBlock = true;
      }
    }

    const user = Meteor.user();
    if (["ScDM5NzhdHgyyHsYw", "kEmnDrYssC2gKNDxx", "Z68dbdNXHuCGTGFjF"].includes(Meteor.userId())  || lesson._id.toLowerCase().startsWith("school_a_lesson_") || user.profile.allowFastForward || (user.showFastForwardButton && !AllQuizTypes.includes(log.slideType.toLowerCase()) ) || this.userHasVisitedSlideBefore(log.slideId, userLesson.lessonId)) {
      isLastSlide = false;
      shouldBlock = false;
    }

    let shouldBlockNextSentence = shouldBlock;
    if (!shouldBlock) {
      // also check if any quiz was not correctly answered
      let cumCorrect = 0;
      for (let k=userLesson.slideVisitLog.length-1; k >= 0; k--) {
        const log = userLesson.slideVisitLog[k];
        if (["quiz", "q1", "q2", "q3"].includes(log.slideType)) {
          if (log.input != log.answer) {
            shouldBlockNextSentence = true;
            // if (user._id !== "kEmnDrYssC2gKNDxx") {
            //   isLastSlide = true;
            //   shouldBlock = true;
            // }
            break;
          } else {
            cumCorrect ++;
            if (cumCorrect >= 2) {
              break;
            }
          }

        }
      }
    }

    if (["ScDM5NzhdHgyyHsYw", "kEmnDrYssC2gKNDxx", "Z68dbdNXHuCGTGFjF"].includes(Meteor.userId()) || lesson._id.toLowerCase().startsWith("school_a_lesson_")  ) {
      shouldBlockNextSentence = false;
    }

    if (this.state.NoSpeech || window.NoSpeech) {
      shouldBlockNextSentence = false;
    }
    

    // also should block next sentence if clicked within 1 second
    // const now = new Date();
    // if (!window.lastNextSentenceTime) window.lastNextSentenceTime = now - 10000;
    // if ((now - window.lastNextSentenceTime) < 1000) {
    //   shouldBlockNextSentence = true;
    // }

    if (this.state.layoutSelected == '') {
      switch (slide.WINDOWS) {
        case 'L': {
          this.state.layoutSelected = 'OPTION6';
          break;
        }
        case 'LG': {
          this.state.layoutSelected = 'OPTION7';
          break;
        }
        case 'LEG': {
          this.state.layoutSelected = 'OPTION1';
          break;
        }
        default: {
          this.state.layoutSelected = 'OPTION6';
          break;
        }
      }
    }



    // if (!window.robotCodeEditor) {
    //   that.state.layoutSelected = 'OPTION1';
    // }

    // console.log("in build my ai lesson id " + lesson._id + " ");
    let layoutOption = LAYOUT_OPTION(checkMobile)[this.state.layoutSelected];
    if (!layoutOption) layoutOption = LAYOUT_OPTION(checkMobile)['OPTION6'];



    if ( scratchgames.includes(lesson.gameId) ) {
      if (this.state.layoutSelected == "OPTION2") {
        layoutOption = [{
          i: 'lecture',
          x: 0,
          y: 0,
          w: 4,
          h: 12,
        }, {
          i: 'editor',
          x: 4,
          y: 0,
          w: 8,
          h: 12,
        }];
      }
      if (this.state.layoutSelected == "OPTION3") {
        layoutOption = [{
          i: 'lecture',
          x: 0,
          y: 0,
          w: 0,
          h: 12,
        }, {
          i: 'editor',
          x: 0,
          y: 0,
          w: 12,
          h: 12,
        }];
      }

      if (this.state.layoutSelected == "OPTION6") {
        layoutOption = [{
          i: 'lecture',
          x: 0,
          y: 0,
          w: 12,
          h: 12,
        }, {
          i: 'editor',
          x: 12,
          y: 0,
          w: 1,
          h: 12,
        }];
      }

    }

    const childrens = layoutOption.map((layout) => {
      switch (layout.i) {
        case 'lecture':
          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <LectureComponent
                lesson={lesson}
                currentLocale={this.state.currentLocale}
                setPaused={this.setPaused.bind(this)}
                userLesson={userLesson}
                slideContent={slideContent}
                slide={slide}
                history={history}
                studentId={studentId}
              />
            </WrapperLayout>
          );
        case 'game':
          if (lesson.gameId == MIGRATION_CONST.poolGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <PoolComponent
                  userLesson={userLesson}
                  slideContent={slideContent}
                  slide={slide}
                  config={config} isTesting lesson={lesson} isProfessionalUser />
              </WrapperLayout>
            );
          }
          if (lesson.gameId == MIGRATION_CONST.tankGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <TankWarComponent config={config} isTesting
                  lesson={lesson}
                  userLesson={userLesson}
                  slideContent={slideContent}
                  slide={slide}
                isProfessionalUser />
              </WrapperLayout>
            );
          }

          if (lesson.gameId == MIGRATION_CONST.canvasGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <CanvasComponent config={config} isTesting
                  lesson={lesson}
                  userLesson={userLesson}
                  slideContent={slideContent}
                  slide={slide}
                isProfessionalUser />
              </WrapperLayout>
            );
          }

          if (lesson.gameId == MIGRATION_CONST.algorithmGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <AlgorithmComponent config={config} isTesting
                  lesson={lesson}
                  userLesson={userLesson}
                  slideContent={slideContent}
                  slide={slide}
                isProfessionalUser />
              </WrapperLayout>
            );
          }

        case 'editor':
          if (scratchgames.includes(lesson.gameId)) {
            if (slide.WINDOWS == "L" && slide.TYPE != "activity" && slide.TYPE != "coding") return (<div></div>);
            if (!slide.WINDOWS) return (<div></div>);
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <ScratchComponent config={config} isTesting
                  lesson={lesson}
                  userLesson={userLesson}
                  slideContent={slideContent}
                  slide={slide}
                isProfessionalUser />
              </WrapperLayout>
            );
          }

          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <CodeMirrorComponent
                lesson={lesson}
                userLesson={userLesson}
                slideContent={slideContent}
                slide={slide}
              isProfessionalUser />
            </WrapperLayout>
          );
        default: return (<div />);
      }
    });

    console.log("beingSynced " + this.state.beingSynced);

    return (
      <div className="tg-page tg-page--lessonPage" id="lessonpageid">
        <div
          ref={(header) => { this.header = header; }}
          className="lessonpage__header"
        >
          <div className="tg-page__header__block tg-container">
            <div className="tg-page__header__block__wrapper buildMyAI-title">
              <img
                alt=""
                className="tg-page__header__block__pre back-to-robot"
                src="/images/triangle-medium-left.svg"
                width="30"
                onClick={() => {
                  this.backFunction();
                }}
              />
              <h1
                style={{ fontSize: '1vw', lineHeight: (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet) ? '2.5vh' : '14px' }}
                className="heading-page"
              >
                { 
                  this.state.currentLocale ?  (this.state.currentLocale == "CH" ? lesson.LessonNameCH : lesson.LessonName) : lesson.LessonName
                  }
              </h1>
            </div>
            <div className="tg-page__header__block__wrapper">



            {window.currentChosenLocale == "CH" ? (
              <button id="enbutton" title="英文版" style={{marginRight: '25px', width: "50px"}}
                className={"topRoundButtonnarrow"}
                onClick={() => { this.handleEnButton(); }}
              >
                英
              </button>
            ) : (<div />)}

            {window.currentChosenLocale == "EN" ? (
              <button id="chbutton" title="" style={{marginRight: '25px', width: "50px"}}
                className={"topRoundButtonnarrow"}
                onClick={() => { this.handleChButton(); }}
              >
                CH
              </button>
            ) : (<div />)}


            {classList && classList.length > 0 ? (
                <div className="syncclasslist">
                <Select
                  isSearchable
                  onChange={value => this.handleClassChange(value)}
                  options={classList}
                  labelKey="name"
                  valueKey="_id"
                  value={classToSync}
                  placeholder="Class"
                />

              </div>

            ) : (<div />)}


              {classList && classList.length > 0 ? (
              <button id="syncmodebutton" title="sync mode" style={{width: "30px", marginRight: '5px'}}
                className={ this.state.inSyncMode ? "topRoundButtonSelected" : "topRoundButton"}
                disabled={classToSync == ""}
                onClick={() => { this.handleSyncMode(); }}
              >
                S
              </button>
              ) : (<div />)}



              {classList && classList.length > 0 ? (
              <button id="freemodebutton" title="free mode" style={{width: "30px", marginRight: '25px'}}
              className={ this.state.inSyncMode ? "topRoundButton" : "topRoundButtonSelected"}
                disabled={classToSync == ""}
                onClick={() => { this.handleFreeMode(); }}
              >
                F
              </button>
              ) : (<div />)}


{/*             
            {classList && classList.length > 0 ? (
<button id="syncbutton" title="sync" style={{marginRight: '5px'}}
                className={"topRoundButton"}
                disabled={classToSync == ""}
                onClick={() => { this.handleSyncClass(); }}
              >
                Sync
              </button>
              ) : (<div />)}


              {classList && classList.length > 0 ? (
              <button id="lockbutton" title="lock" style={{width: "90px", marginRight: '25px'}}
                className={"topRoundButton"}
                disabled={classToSync == ""}
                onClick={() => { this.handleLockClass(); }}
              >
                {classObj && classObj.isScreenLocked ? "Unlock" : "Lock"}
              </button>
              ) : (<div />)} */}




              {classList && classList.length > 0 ? (
                <div style={{marginRight: '15px'}} className="syncclasslist">
                <Select
                  isSearchable
                  onChange={value => this.handleStudentChange(value)}
                  options={studentList}
                  labelKey="name"
                  valueKey="_id"
                  value={studentToSync}
                  placeholder="Reload As"
                />

              </div>

            ) : (<div />)}




            {/* {classList && classList.length > 0 ? (
              <button id="lockbutton" title="lock" style={{width: "90px", marginRight: '25px'}}
                className={"topRoundButton"}
                disabled={classToSync == ""}
                onClick={() => { this.handleLockClass(); }}
              >
                {classObj && classObj.isScreenLocked ? "Unlock" : "Lock"}
              </button>
              ) : (<div />)} */}


              {/* <button title="beautify code format"
                className={"topRoundButton"}
                onClick={() => { window.beautifyCode(); }}
              >
                {this.getCurlys()}
              </button> */}
              { scratchgames.includes(lesson.gameId) ?
                !["coding", "activity", "hint", "solution", "extracredit"].includes(slide.TYPE) ? <div></div> :
              <button id="runbutton" title="run" style={{marginRight: '25px', width: "80px"}}
              className={"topRoundButton"}
              onClick={() => { this.handleScratchReset(); }}
            >
              Reset
            </button>
             :
              <button id="runbutton" title="run" style={{marginRight: '25px'}}
                className={"topRoundButton"}
                onClick={() => { this.handleRunClick(); }}
              >
                Run
              </button>
              }
              {/* <button
                className={"topRoundButton"}
                onClick={() => { window.handleStopTest(); }}
              >
                Stop
              </button> */}

              { scratchgames.includes(lesson.gameId) || !["coding", "hint", "solution", "activity"].includes(slide.TYPE)? <div /> :

                <span key="option1"
                  onClick={() => this.handleChangeLayout('OPTION1')}
                  data-tip={LAYOUT_OPTION_TEXT.OPTION1}
                  className="layout-icon-item robot-allwindow-button"
                >
                  <span className="item-child item-child--border-right">L</span>
                  <span className="item-child item-child--flex-column">
                    <span className="item-child">E</span>
                    <span className="item-child">G</span>
                  </span>
                </span>
              }
              { !["coding", "hint", "solution", "activity"].includes(slide.TYPE) ? <div /> :
              <span key="option2"
                onClick={() => this.handleChangeLayout('OPTION2')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION2}
                className="layout-icon-item robot-position1-button">
                <span className="item-child item-child--border-right">L</span>
                <span className="item-child">E</span>
              </span>
              }
              { scratchgames.includes(lesson.gameId) || !["coding", "hint", "solution", "activity"].includes(slide.TYPE) ? <div /> :

                <span key="option3"
                  onClick={() => this.handleChangeLayout('OPTION5')}
                  data-tip={LAYOUT_OPTION_TEXT.OPTION5}
                  className="layout-icon-item robot-position2-button">
                  <span className="item-child item-child--border-right">E</span>
                  <span className="item-child">G</span>
                </span>
              }
              <span key="option6"
                onClick={() => this.handleChangeLayout('OPTION6')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION6}
                className="layout-icon-item layout-icon-item--one-item robot-chat-fullscreen">L
              </span>

              { !["coding", "hint", "solution", "activity"].includes(slide.TYPE) ? <div /> :
              <span key="option4"
                onClick={() => this.handleChangeLayout('OPTION3')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION3}
                className="layout-icon-item layout-icon-item--one-item robot-edit-fullscreen">E</span>
              } 

              { scratchgames.includes(lesson.gameId) ? <div /> :

                <span key="option5"
                  onClick={() => this.handleChangeLayout('OPTION4')}
                  data-tip={LAYOUT_OPTION_TEXT.OPTION4}
                  className="layout-icon-item layout-icon-item--one-item robot-game-fullscreen">G</span>
              }
              <span className="goldcoinoncorner" key="goldcoin">
                <img src="/images/goldcoins400.png" style={{marginTop: "5px", height: '20px'}} alt="gold coins" />
                <span id="goldcoincountuser">{Math.round(user.profile.coins)}</span>
                <span id="goldcoincountusername">{user.username}</span>
              </span>

            </div>
          </div>
        </div>
        <div ref={(content) => { this.content = content; }} className="tg-page__lessoncontent">
          <div className="lessonPage lessonPage--content">
            <NoDraggingLayout
              layout={layoutOption}
            >
              {childrens}
            </NoDraggingLayout>
            <ReactTooltip />
          </div>
        </div>
        <div id="lessonPageNav" style={{display: "block"}}>
          <button id="scrollPageLeft" title="Scroll to earlier pages" className="buttonScroll"> <FontAwesomeIcon icon="chevron-left" /></button>
          <div className="outerNavIconPanel">
            <div id="naviIconPanel">
              {_.map(userLesson.slideVisitLog, (log, index) => this.renderNavIcon(log, index))}

              {/* <button title="Information" className="buttonRound3"> <FontAwesomeIcon icon="chalkboard-teacher" /></button>
              <button className="buttonLine"> </button>
              <button title="Provide Input" className="buttonRound3"> <FontAwesomeIcon icon="chalkboard-teacher" /></button>
              <button className="buttonLine"> </button>
              <button title="Provide Input" className="buttonRound3 skippedPage"> <FontAwesomeIcon icon="edit" /></button>
              <button className="buttonLine"> </button>
              <button title="Quiz" className="buttonRound3 activePage"> <FontAwesomeIcon icon="question" /></button> */}
            </div>
          </div>
          <button id="scrollPageRight" title="Scroll to later pages" className="buttonScroll"> <FontAwesomeIcon icon="chevron-right" /></button>
          <div id="secondaryButtons">
            <button title="Replay" className="buttonRound2" onClick={() => this.replayCurrent()} > <FontAwesomeIcon icon="redo-alt" /></button>
            <button title="First slide" className="buttonRound2" onClick={() => this.gotoFirstSlide()}> <FontAwesomeIcon icon="fast-backward" /></button>
            <button title="Previous slide" className="buttonRound2"  onClick={() => this.stepBack()} > <FontAwesomeIcon icon="step-backward" /></button>
            <button title={this.state.isPaused ? "Continue":"Pause"} id="playorpausecontrol" className="buttonRound2" onClick={() => this.handleClickPlayPause()}   style={{backgroundSize: "35px", backgroundImage: this.state.isPaused ? "url(/images/spinwheel.gif)":""}} > <FontAwesomeIcon id="playpauseicon" icon={this.state.isPaused ? "play":"pause"} /></button>
            <button title="Next slide" className={"buttonRound2" + (isLastSlide ? " disabledBtn": "")} disabled={isLastSlide}  onClick={() => this.stepForward(shouldBlock)}  > <FontAwesomeIcon icon="step-forward" /></button>

            <button title="Last slide" className={"buttonRound2" + (isLastSlide ? " disabledBtn": "")} disabled={isLastSlide} onClick={() => this.goToLast(shouldBlock)}> <FontAwesomeIcon icon="fast-forward" /></button>

            {/* <button title={shouldBlock ? "Please respond to the current slide" : "Skip slide"} className={"buttonRound2" + (shouldBlock ? " disabledBtn": "")} disabled={shouldBlock} onClick={() => this.jumpToNextSlide(shouldBlock)}>
              <FontAwesomeIcon icon="headphones-alt" />
            </button> */}

            {/* <button title={shouldBlock ? "Please respond to the current slide" : "Jump to quiz/exercise"} className={"buttonRound2" + (shouldBlock ? " disabledBtn": "")} disabled={shouldBlock} onClick={() => this.jumpToNextQuiz(shouldBlock)}> <FontAwesomeIcon icon="running" /></button> */}
            <button id="nextSentenceButton" title={shouldBlock ? "Please respond to the current slide" : shouldBlockNextSentence ? "You need to answer 2 questions correctly in a row to re-enable this button" : "Next Sentence"} className={"buttonRound2" + (shouldBlockNextSentence ? " disabledBtn": "")} disabled={shouldBlockNextSentence} onClick={() => this.jumpToNextStep(shouldBlockNextSentence)}> <FontAwesomeIcon icon="running" /></button>

            <button title={ this.state.NoSpeech ? "Enable auto voice-over" : "Manually play sentences"} className={"buttonRound2"} onClick={() => this.toggleVoice()}> <span id="togglespeechtext">{this.state.hasNoSpeech ? (<FontAwesomeIcon icon="volume-up" />) : (<FontAwesomeIcon icon="hand-pointer" />) } </span></button>

            <button title={"Toggle talk speed"} className={"speedButton buttonRound2"} onClick={() => this.changeSpeed()}> <span id="speedtext">{this.state.speedM+"x"} </span></button>
            <span key="spaces">&nbsp;&nbsp;&nbsp;&nbsp;</span>


            {/* <FontAwesomeIcon icon="angle-double-up" /> */}
            {/* <button title="Coding Hints" className="buttonRound">  <FontAwesomeIcon icon="lightbulb" /> </button> */}
            {/* <button title="Reference" className="buttonRound">  <FontAwesomeIcon icon="info" /> </button> */}

            {
              scratchgames.includes(lesson.gameId) ? <div /> :
              <button title="Console Log" onClick={() => this.showConsole()} className="buttonRoundConsole">  <FontAwesomeIcon icon="file-alt" /> </button>

            }
            {
              scratchgames.includes(lesson.gameId) ? <div /> :
              <button title="Reference" onClick={() => this.showReference()} className="buttonRoundRef">  <FontAwesomeIcon icon="info" /> </button>
            }
            {/* {
              scratchgames.includes(lesson.gameId) ? <div /> :
              <button title="Q&amp;A Chat" onClick={() => this.showQA()} className="buttonRound">  <FontAwesomeIcon icon="comments" /> </button>
            } */}
          </div>
        </div>

        <div id="lessonoverlay" style={{display: user.isScreenLocked ? "block" : "none", zIndex: 1000, height: 2000, backgroundColor: "#1F2A6690", top: -200}} className="lessonoverlay"  >
          <h1 style={{color: "white", fontSize: "50px", top: "400px", left: 0, position: "absolute", right: 0, width: "100%", textAlign: "center"}} >Your teacher has locked the screen.</h1>
          </div>

        <div key="dnrconsolewindow" id="ConsoleLogWindow">

          <DnR
            ref='dnr'
            {...ConsoleWindowTheme}
            cursorRemap={(c) => c === 'move' ? 'default' : null}
            style={consoleStyle}>
            <div id="LogContentDiv" className="LogContent">
              <table>
                {window.AllConsoleLog.map((log, index) =>
                  <tr id={"log-" + index} key={"log-" + index}><td>{log}</td></tr>
                )}
              </table>
            </div>
          </DnR>

        </div>


        {/* <div key="dnrqawindow" id="QAWindow">
          <DnR
            ref='dnr'
            {...QAWindowTheme}
            // cursorRemap={(c) => {
            //   debugger;
            //   return c === 'move' ? 'default' : null;
            // }}
            style={qaStyle}>
            <div id="QADiv" className="QAContent">
              <ChatBox
                keyword={chatHistoryKeyword}
                chatSupport={chatSupport}
                scrollComponentId="QADiv"
                isShowing={isShowingQA}
              />
              <LessonChatEditor chatSupport={chatSupport} />
            </div>
          </DnR>
        </div> */}

        <div key="dnrrefwindow" id="RefWindow">
          <DnR
            ref='dnr'
            {...RefWindowTheme}
            style={refStyle}>
            <div id="refwrapper" style={{position: 'relative', height: '600px'}}>
              <div id="RefDiv" className="RefContent">
                <iframe style={{width: '100%', height: '100%', marginTop: '20px'}} src={ lesson.gameId == MIGRATION_CONST.poolGameId ? "/PoolGameReference.html" : "/TankGameReference.html"}/>
              </div>
            </div>
          </DnR>
        </div>




      </div>
    );
  }
}

export default LessonPageComponent;

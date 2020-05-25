import React from 'react';
import ReactDOM from "react-dom";
import ReactModal from 'react-modal';
import isMobile from 'ismobilejs';
import DnR from 'react-dnr';
// import {OSXTheme, WindowsTheme} from 'react-dnr/modules/themes';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FontAwesome from 'react-fontawesome';
import _get from 'lodash/get';
// import LessonsSliderComponent from './lessonsSlider.jsx';
import CodeMirrorComponent from '../containers/CodeMirrorFactory.js';
import PoolComponent from '../../games/gamePool/lib/TrajectoryPoolComponent.jsx';
import TankWarComponent from '../../games/gamePool/lib/TankWarComponent.jsx';
import CanvasComponent from '../../games/gamePool/lib/CanvasComponent.jsx';
import AlgorithmComponent from '../../games/gamePool/lib/AlgorithmComponent.jsx';
import WrapperLayout from './WrapperLayout.jsx';
import ManageTestPopup from './ManageTestsPopup';
import NoDraggingLayout from './BuildLayout.jsx';
import { ITEM_GAME_TYPE, MIGRATION_CONST} from '../../../../lib/enum';
import { LAYOUT_OPTION_TEXT } from '../../../../lib/const';
import { faTheaterMasks } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from '../containers/ChatHistory';
// import LessonChatEditor from './LessonChatEditor.jsx';
import QATitleBar from './QATitleBar';
import ChatBox from '../../messageActivity/components/ChatBox';

const customePlayerInfoPopupStyles = {
  content: {
    height: 615,
    padding: 40,
    borderRadius: 10,
    border: '2px solid #5076A4',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 900
  }
};

let savedCurrentSlideId = null;

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
  border: "none", //"solid 2px green",
  overflow: "visible"
};

const AllQuizTypes = ["quiz", "q1", "q2", "q3", "coding", "survey", "input"];


const LAYOUT_OPTION_FACTORY = {
  OPTION1: [{
    i: 'editor',
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
  }],
  OPTION2: [{
    i: 'editor',
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  },{
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],
  OPTION3: [{
    i: 'game',
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  },{
    hide: true,
    i: 'editor',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  }],

};

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


class FactoryPageComponent extends React.Component {
  static defaultProps = {
    gameId: MIGRATION_CONST.poolGameId
  }
  constructor(props) {
    super(props);
    const widthWindow = window.innerWidth;
    this.state = {
      layoutSelected: 'OPTION1', //widthWindow > 480 ? 'OPTION6' : 'OPTION6',
      isPaused: false,
      config: {},
      showManageTestModal: false,
      isTestRunning: false,
      isShowingConsole: false,
      chatHistoryKeyword: '',
      isShowingQA: false,
      isShowingRef: false,
      speedM: 1
    };
  }


  componentWillMount() {
    this.getConfig();
  }

  componentWillUnmount() {
    if (window.changeLayoutTimer) {
      clearTimeout(window.changeLayoutTimer);
    }

    if (window.resizeWindowTimer) {
      clearTimeout(window.resizeWindowTimer);
    }

    delete window.toggleTestButton;
  }


  handleChatHistoryKeywordChange = value => {
    this.setState({ chatHistoryKeyword: value });
  }

  getConfig = () => {
    const { config: { mainItems, backgroundItems } } = this.props;
    this.setState({
      config: { mainItems, backgroundItems }
    });

    // const items = Meteor.user().profile.itemGames;
    // const config = { };
    // // get cue stick
    // for (let k=0; k < items.length; k++) {
    //   if (items[k].active) {
    //     for (let j=0; j<CueItems.length; j++) {
    //       if (CueItems[j]._id == items[k].itemId) {
    //         config.mainItems = CueItems[j];
    //         break;
    //       }
    //     }
    //   }
    //   if (config.mainItems) break;
    // }

    // // get table
    // for (let k=0; k < items.length; k++) {
    //   if (items[k].active) {
    //     for (let j=0; j<TableItems.length; j++) {
    //       if (TableItems[j]._id == items[k].itemId) {
    //         config.backgroundItems = TableItems[j];
    //         break;
    //       }
    //     }
    //   }
    //   if (config.backgroundItems) break;
    // }

    // this.setState({
    //   config
    // });
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
    const { history, gameId, selectGameTutorial } = this.props;
    // const { gameId, package: packageType } = lesson || {};

    // selectGameTutorial({
    //   gameId,
    //   packageType,
    //   isSlideFormat: true
    // });
    history.push('/factoryselect');
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

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.userLesson.currentSlideId != nextProps.userLesson.currentSlideId) {
  //     this.state.layoutSelected = "";
  //   }
  //   return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  // }


  fixUI() {

    const that = this;
    // console.log("in lessonpage did mount 1");

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

      $("#RefWindow > div > #refWrapper").eq(0).css("border", "2px solid green");

      const minButtonSelector3 = "#RefWindow > div > div:nth-child(1) > div > div:nth-child(1) > button";
      $(minButtonSelector3).css("height", "30px");

      $(minButtonSelector3).css("background", "rgb(51, 133, 96)");
      that.hideRef();


      window.toggleTestButton = that.toggleButton.bind(that);


      const noProp = (event) => {
        event.stopPropagation();
      };

      $("#LogContentDiv").mousedown(noProp);
      $("#LogContentDiv").mousemove(noProp);

      // $("#QADiv").mousedown(noProp);
      // $("#QADiv").mousemove(noProp);

      $("#RefDiv").mousedown(noProp);
      $("#RefDiv").mousemove(noProp);

    },10);
  }

  componentDidMount() {
    // const { userLesson, slide, slideContent } = this.props;

    window.AllConsoleLog = [];
    window.handleNewConsole = this.handleNewConsole.bind(this);
    window.handleClearConsole = this.handleClearConsole.bind(this);
    if (window.setSpeechM) window.setSpeechM(this.state.speedM);


    this.fixUI();



  }



  toggleButton(isRunning) {
    if (isRunning) {
      document.getElementById('runbutton').innerHTML = "Stop";
      this.state.isTestRunning = true;
    } else {
      this.state.isTestRunning = false;
      document.getElementById('runbutton').innerHTML = "Run";
    }
    // if (this.state.isTestRunning) {
    //   this.state.isTestRunning = false;
    //   document.getElementById('runbutton').innerHTML = "Run";
    // } else {
    //   this.state.isTestRunning = true;
    //   document.getElementById('runbutton').innerHTML = "Stop";
    // }
  }

  handleManageTests() {
    this.setState({ showManageTestModal: true });
  }

  handleRunClick() {
    if (this.state.isTestRunning) {
      window.handleStopTest();
      this.toggleButton(false);
    } else {
      window.handlePlaygame();
      this.toggleButton(true);
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

  render() {
    const { history, gameId, Collections, tests, chatSupport } = this.props;
    const { config, isShowingConsole, chatHistoryKeyword, showManageTestModal, isShowingQA } = this.state;

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

    // if (!userLesson) {
    //   if (lesson.isUserTest) {
    //     //initializeUserChatUser(lesson._id);
    //   }  else {
    //     initializeUserLesson(lesson._id);
    //   }
    //   return;
    // }

    const that = this;


    const user = Meteor.user();
    const currentTest = Collections.UserTest.findOne({testSeq: Collections.UserFactoryCode.findOne({gameId}).currentFactoryTestSeq || 0, gameId} );
    const isFactory = true;

    let layoutOption = LAYOUT_OPTION_FACTORY[this.state.layoutSelected];
    if (!layoutOption) layoutOption = LAYOUT_OPTION_FACTORY['OPTION1'];
    const childrens = layoutOption.map((layout) => {
      switch (layout.i) {
        case 'game':
          if (gameId == MIGRATION_CONST.poolGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <PoolComponent
                  config={config} isTesting test={currentTest} isProfessionalUser isFactory />
              </WrapperLayout>
            );
          }
          if (gameId == MIGRATION_CONST.tankGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <TankWarComponent config={config} isTesting
                  config={config} isTesting test={currentTest} isProfessionalUser isFactory/>
              </WrapperLayout>
            );
          }
          if (gameId == MIGRATION_CONST.canvasGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <CanvasComponent config={config} isTesting
                  config={config} isTesting test={currentTest} isProfessionalUser isFactory/>
              </WrapperLayout>
            );
          }
          if (gameId == MIGRATION_CONST.algorithmGameId) {
            return (
              <WrapperLayout key={layout.i} isShow={!layout.hide}>
                <AlgorithmComponent config={config} isTesting
                  config={config} isTesting test={currentTest} isProfessionalUser isFactory/>
              </WrapperLayout>
            );
          }
        case 'editor':
          return (
            <WrapperLayout key={layout.i} isShow={!layout.hide}>
              <CodeMirrorComponent
                gameId={gameId}
                test={currentTest}
                isProfessionalUser />
            </WrapperLayout>
          );
        default: return (<div />);
      }
    });

    return (
      <div className="tg-page tg-page--factoryPage" id="lessonpageid">
        <div className="lessonpage__header">
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

              <button id="managetestbutton" title="Manage all test cases" style={{marginLeft: '25px'}}
                className={"topRoundButton2f"}
                onClick={() => { this.handleManageTests(); }}
              >
                All Tests
              </button>

              <h1 style={{ fontSize: '1vw', lineHeight: (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet) ? '2.5vh' : '14px' }}
              className="heading-page">{"[TEST " + currentTest.testSeq + "]  " + currentTest.testName}</h1>
            </div>
            <div className="tg-page__header__block__wrapper">
              {/* <button title="beautify code format"
                className={"topRoundButton"}
                onClick={() => { window.beautifyCode(); }}
              >
                {this.getCurlys()}
              </button> */}

              <button id="runbutton" title="run" style={{marginRight: '25px'}}
                className={"topRoundButton2"}
                onClick={() => { this.handleRunClick(); }}
              >
                Run
              </button>
              {/* <button
                className={"topRoundButton"}
                onClick={() => { window.handleStopTest(); }}
              >
                Stop
              </button> */}


              <span key="option1"
                onClick={() => this.handleChangeLayout('OPTION1')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION5}
                className="layout-icon-item robot-allwindow-button"
              >
                <span className="item-child item-child--border-right">E</span>
                <span className="item-child">G</span>
              </span>

              <span key="option2"
                onClick={() => this.handleChangeLayout('OPTION2')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION3}
                className="layout-icon-item layout-icon-item--one-item robot-edit-fullscreen">E</span>
              <span key="option3"
                onClick={() => this.handleChangeLayout('OPTION3')}
                data-tip={LAYOUT_OPTION_TEXT.OPTION4}
                style={{marginRight: '25px'}}
                className="layout-icon-item layout-icon-item--one-item robot-game-fullscreen">G</span>


              <div id="secondaryButtons2">
                <button title="Console Log" onClick={() => this.showConsole()} className="buttonRoundConsole">  <FontAwesomeIcon icon="file-alt" /> </button>
                 {/* <button title="Q&amp;A Chat" onClick={() => this.showQA()} className="buttonRound">  <FontAwesomeIcon icon="comments" /> </button> */}
                <button title="Reference" onClick={() => this.showReference()} className="buttonRoundRef2">  <FontAwesomeIcon icon="info" /> </button>
              </div>


            </div>
          </div>
        </div>
        <div className="tg-page__lessoncontent" style={{ marginTop: '68px' }}>
          <div className="factoryPage factoryPage--content">
            <NoDraggingLayout
              layout={layoutOption}
            >
              {childrens}
            </NoDraggingLayout>
            <ReactTooltip />
          </div>
        </div>
        {/* <div id="factoryPageNav">
          <div id="secondaryButtons">
            <button title="Console Log" onClick={() => this.showConsole()} className="buttonRoundConsole">  <FontAwesomeIcon icon="file-alt" /> </button>
            <button title="Reference" onClick={() => this.showReference()} className="buttonRoundRef">  <FontAwesomeIcon icon="info" /> </button>
          </div>
        </div> */}


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
              <iframe style={{width: '100%', height: '100%', marginTop: '20px'}} src={ gameId == MIGRATION_CONST.poolGameId ? "/PoolGameReference.html" : "/TankGameReference.html"}/>
              </div>
            </div>
          </DnR>
        </div>


        <ReactModal
          isOpen={showManageTestModal}
          onRequestClose={this.closeManageTests}
          shouldCloseOnOverlayClick
          style={{
            overlay: {
              backgroundColor: 'rgba(255, 255, 255, 0.35)'
            },
            content: {
              ...customePlayerInfoPopupStyles.content,
              opacity: 1
            }
          }}
        >
          <div className="modal__header">
            <div className="modal__header--close Player-basic-info__close" onClick={this.closeManageTests} role="presentation">x</div>
          </div>
          <ManageTestPopup
            onRequestClose={this.closeManageTests}
            tests={tests}
            gameId={gameId}
          />
        </ReactModal>

        {/* <ManageTestPopup
          isOpen={showManageTestModal}
          tests={tests}
          onClose={() => this.setState({ showManageTestModal: false })}
          gameId={gameId}
          /> */}


      </div>


    );
  }

  closeManageTests = () => {
    this.setState({ showManageTestModal: false });
  }
}

export default FactoryPageComponent;

import React from "react";
import { NavLink, withRouter } from 'react-router-dom';
import _ from "lodash";
import _get from 'lodash/get';
import _round from 'lodash/round';
import ModalVideo from "react-modal-video";
import swal from "sweetalert";
import Swal from 'sweetalert2';
import TutorialSelection from "../../core/components/TutorialSelection.jsx";
import PaymentModal from '../../account/containers/PaymentModal';
import {
  TUTORIAL_STATUS,
  USER_TYPES,
  TUTORIAL_IMAGE,
  TUTORIAL_GROUP,
  TUTORIAL_LEVEL,
  PACKAGE_TYPES,
  PAYMENT_PRO,
  MIGRATION_CONST,
  DEFAULT_BATTLE_PROJECT_ID,
  DEFAULT_BATTLE_PROJECT_ID_RECYCLER,
  COURSE_PRICE,
} from "../../../../lib/enum";
const scratchGameList = [MIGRATION_CONST.tankscratch2GameId, MIGRATION_CONST.recyclerGameId];  //[MIGRATION_CONST.scratchGameId, MIGRATION_CONST.flappybirdGameId, MIGRATION_CONST.scratchtankGameId, MIGRATION_CONST.tankscratch2GameId, MIGRATION_CONST.candycrushGameId, MIGRATION_CONST.scratchSoccerGameId, MIGRATION_CONST.cannonpongGameId];


function handleCodePoints(array) {
  var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
  var index = 0;
  var length = array.length;
  var result = '';
  var slice;
  while (index < length) {
    slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return result;
}

function stringToUint(string) {
  var string = btoa(unescape(encodeURIComponent(string))),
      charList = string.split(''),
      uintArray = [];
  for (var i = 0; i < charList.length; i++) {
      uintArray.push(charList[i].charCodeAt(0));
  }
  return new Uint8Array(uintArray);
}

function uintToString(uintArray) {
  var encodedString = String.fromCharCode.apply(null, uintArray),
      decodedString = decodeURIComponent(escape(encodedString));
  return decodedString;
}

function strToBuffer (string) {
  let arrayBuffer = new ArrayBuffer(string.length * 1);
  let newUint = new Uint8Array(arrayBuffer);
  newUint.forEach((_, i) => {
    newUint[i] = string.charCodeAt(i);
  });
  return newUint;
}

function utf8_to_str(a) {
  for(var i=0, s=''; i<a.length; i++) {
      var h = a[i].toString(16)
      if(h.length < 2) h = '0' + h
      s += '%' + h
  }
  return decodeURIComponent(s)
}


function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while(i < len) {
  c = array[i++];
  switch(c >> 4)
  { 
    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
      // 0xxxxxxx
      out += String.fromCharCode(c);
      break;
    case 12: case 13:
      // 110x xxxx   10xx xxxx
      char2 = array[i++];
      out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
      break;
    case 14:
      // 1110 xxxx  10xx xxxx  10xx xxxx
      char2 = array[i++];
      char3 = array[i++];
      out += String.fromCharCode(((c & 0x0F) << 12) |
                     ((char2 & 0x3F) << 6) |
                     ((char3 & 0x3F) << 0));
      break;
  }
  }

  return out;
}

class TutorialLinksListComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      game: null,
      isPaymentModalOpen: false,
    };
  }

  componentWillMount() {
    const { gameId } = this.props;
    if (gameId) {
      this.getGame(gameId);
    }
  }

  componentDidMount() {
    // $(".beginnertutorial")
    //   .get(0)
    //   .scrollIntoView();

  }

  componentWillReceiveProps(nextProps) {
    const { gameId } = this.props;

    if (nextProps.gameId !== gameId && !!nextProps.gameId) {
      this.getGame(nextProps.gameId);
    }
  }

  openPaymentModal = () => {
    this.setState({
      isPaymentModalOpen: true,
    })
  }

  closePaymentModal = () => {
    this.setState({
      isPaymentModalOpen: false,
    })
  }

  getGame = async (gameId) => {
    if (gameId) {
      Meteor.call("games.item", gameId, (error, result) => {
        if (!error) {
          this.setState({
            game: result
          });
        }
      });
    }
  };

  getDifficulty = (difficulty) => {
    return [...Array(difficulty)].map((element, index) => (
      <i key={index} className="tg-icon-star" /> // eslint-disable-line
    ));
  };

  getTutorial = (tutorial, unlockall) => {
    const { isSlideFormat, packageType, userData, gameId } = this.props;
    const boughtCourse = _.get(userData, 'boughtCourse', []);
    const user = Meteor.user();
    const { canViewSchool } = Meteor.user();
    const unlockedList = {};
    const completedlist = {};
    const tutorialName = isSlideFormat ? 'LessonName' : 'ScenarioName';
    const sequenceNumber = isSlideFormat ? 'LessonSequenceNumber' : 'ScenarioSequenceNumber';
    const isPackageForPremium = packageType !== PACKAGE_TYPES.BEGINNER && !packageType.includes("school");
    const { accountType, isGrandfathered } = user;
    const isPremium = isGrandfathered || ( PAYMENT_PRO.includes(accountType) || boughtCourse.find(item => item.gameId === gameId && item.packageType === packageType) );
    const isBought = boughtCourse.find(item => item.gameId === gameId && item.packageType === packageType);
    const isLockByPermission = !isPremium && isPackageForPremium;

    if (tutorial.length === 0) {
      return <div />;
    }
    let isTeacher = _.includes(_.get(user.getPerson(), "type", []), USER_TYPES.TEACHER) || user._id == "kEmnDrYssC2gKNDxx";


    if (user.tutorial && user.tutorial.length > 0) {
      let maxID = -1;
      for (let i = 0; i < user.tutorial.length; i++) {
        if (user.tutorial[i].unlocked) {
          const temp = tutorial.find(element => element._id === user.tutorial[i].id);
          if (!temp) continue;

          if (!unlockedList[temp.group]) {
            unlockedList[temp.group] = [];
          }
          unlockedList[temp.group].push({
            id: user.tutorial[i].id,
            progress: Math.round(user.tutorial[i].progress * 100)
          });
        }
        if (user.tutorial[i].progress >= 0.9999999) {
          completedlist[user.tutorial[i].id] = true;
          const curID = sequenceNumber in user.tutorial[i]
            ? user.tutorial[i][sequenceNumber]
            : Number(user.tutorial[i].id.substring(1));
          if (curID > maxID) {
            maxID = curID;
          }
        }
      }

      // find max scenario number
      for (let k = 0; k < tutorial.length; k++) {
        const t = tutorial[k];
        if (t[sequenceNumber] === maxID + 1) {
          if (!unlockedList[tutorial[k].group]) {
            unlockedList[tutorial[k].group] = [];
          }
          // make sure this _id is not already in this group
          const g = unlockedList[tutorial[k].group];
          let found = false;
          for (let x = 0; x < g.length; x++) {
            if (g[x].id == tutorial[k]._id) {
              found = true;
              break;
            }
          }

          if (!found) {
            g.push({
              id: tutorial[k]._id,
              progress: 0
            });
          }
          break;
        }
      }
    } else if (tutorial && tutorial.length > 0) {
      if (tutorial[0].userId === "system" && tutorial[0].package === "starter") {
        if (!unlockedList[tutorial[0].group]) {
          unlockedList[tutorial[0].group] = [];
        }

        unlockedList[tutorial[0].group].push({
          id: tutorial[0]._id,
          progress: 0
        });
      }
    }

    if (isTeacher) {
      for (let k = 0; k < tutorial.length; k++) {
        const t = tutorial[k];
        if (!unlockedList[tutorial[k].group]) {
          unlockedList[tutorial[k].group] = [];
        }
        // make sure this _id is not already in this group
        const g = unlockedList[tutorial[k].group];
        let found = false;
        for (let x = 0; x < g.length; x++) {
          if (g[x].id == tutorial[k]._id) {
            found = true;
            break;
          }
        }

        if (!found) {
          g.push({
            id: tutorial[k]._id,
            progress: 0
          });
        }
      }
    }



    if (canViewSchool) {
      for (let k = 0; k < tutorial.length; k++) {
        const t = tutorial[k];
        if (!t.package.includes("school")) continue;
        if (!unlockedList[tutorial[k].group]) {
          unlockedList[tutorial[k].group] = [];
        }
        // make sure this _id is not already in this group
        const g = unlockedList[tutorial[k].group];
        let found = false;
        for (let x = 0; x < g.length; x++) {
          if (g[x].id == tutorial[k]._id) {
            found = true;
            break;
          }
        }

        if (!found) {
          g.push({
            id: tutorial[k]._id,
            progress: 0
          });
        }
      }
    }

    const groupTutorial = tutorial.reduce((r, a) => {
      r[a.group] = r[a.group] || [];
      r[a.group].push(a);
      return r;
    }, Object.create(null));
    return Object.keys(groupTutorial).map((scenario) => {
      const check = scenario === TUTORIAL_GROUP.BEGINNER.INITIAL_ROBOT_RELEASE;
      const level = TUTORIAL_LEVEL[scenario];
      if (!level) {
        return <div key={scenario} />;
      }
      if (isSlideFormat) {
        groupTutorial[scenario].sort((a, b) => {
          if (a.LessonSequenceNumber != b.LessonSequenceNumber ) {
            return a.LessonSequenceNumber - b.LessonSequenceNumber;
          } else {
            return a.LessonName.indexOf("Homework") - b.LessonName.indexOf("Homework");
          }
        });
      } else {
        groupTutorial[scenario].sort((a, b) => {
          return a.ScenarioSequenceNumber - b.ScenarioSequenceNumber;
        });
      }
      let image = check ? "userrobotrelease.png" : _.get(TUTORIAL_IMAGE[level], 'INCOMPLETE', 'userrobotrelease.png');

      if (
        unlockedList[scenario]
        && unlockedList[scenario].length === groupTutorial[scenario].length
        && unlockedList[scenario].filter(element => element.progress >= 100).length === groupTutorial[scenario].length
      ) {
        image = check ? "userrobotrelease.png" : _.get(TUTORIAL_IMAGE[level], 'COMPLETE', 'userrobotrelease.png');
      }

      return (
        <div key={scenario} className="tg-tutorial__group tutorial-group-items">
          <div className={`tg-tutorial__group--avatar tutorial-avatar-${level}`}>
            <img
              className={check ? `tg-tutorial__group--avatar--robot avatar-${level}` : `avatar-${level}`}
              src={`images/${image}`}
              alt=""
            />
          </div>
          <div className={`tg-tutorial__group--content tutorial-content-${level}`}>
            <div className="tg-tutorial__title">
              <h3 className={`tg-tutorial__title__group tutorial-title-${level}`}>{scenario}</h3>
            </div>
            {groupTutorial[scenario].map((testcase) => {
              // console.log("getting progress for " + testcase._id);
              let tutorialProgress = -1;
              const temporary = user.tutorial ? user.tutorial.find(element => element.id === testcase._id) : undefined;
              let unlocked = unlockedList[scenario] && unlockedList[scenario].find(element => element.id === testcase._id);
              unlocked = unlocked || unlockall;

              //  always unlock first scenario for starter package
              unlocked = isBought || isGrandfathered || (testcase[sequenceNumber] === 1 && testcase.package === PACKAGE_TYPES.BEGINNER) || unlocked || unlockall;

              // unlock all old lessons for all users
              if (!isSlideFormat) {
                unlocked = true;
              }

              if (temporary) {
                tutorialProgress = Math.round(temporary.progress * 100);
              }

              return (
                <div key={testcase._id} className="tg-tutorial__group--block tutorial-content-block">
                  <div className="tg-tutorial__group--block__line">
                    <div
                      className={
                        unlocked && !isLockByPermission
                          ? `tg-tutorial__group--block__line__name tutorial-content-name`
                          : `tg-tutorial__group--block__line__name__locked`
                      }
                    >
                      <span
                        onClick={() => {
                          if (!isLockByPermission && unlocked) {
                            if (isSlideFormat) {
                              this.goToLesson(testcase._id);
                            } else {
                              this.buildMyAI(testcase._id);
                            }
                          }
                        }}
                        role="presentation"
                      >
                        {testcase[tutorialName] + (!isLockByPermission && unlocked ? "" : " [Locked]")}
                      </span>
                      {isTeacher && (
                        <button
                          style={{ marginLeft: "20px", padding: "0px 6px" }}
                          className="btn btn-info"
                          onClick={() => {
                            this.handleResetChat(testcase._id);
                          }}
                          type="button"
                        >
                          reset
                        </button>
                      )}
                    </div>

                    {tutorialProgress < 100 ? (
                      <div className="tg-tutorial__group--block__line__progress">
                        <img src="images/forward3.png" alt="" />
                        <span>
                          {tutorialProgress >= 0
                            ? `${TUTORIAL_STATUS.IN_PROGRESS} [${Math.min(100,tutorialProgress)}%]`
                            : TUTORIAL_STATUS.NOT_STARTED}
                        </span>
                      </div>
                    ) : (
                      <div className="tg-tutorial__group--block__line__progress">
                        <img src="images/Check_mark.png" alt="" />
                        <span>{TUTORIAL_STATUS.COMPLETE}</span>
                      </div>
                    )}
                  </div>

                  <table>
                    <tbody>

                      {testcase[tutorialName].includes("[Homework") ? (
                        <tr><td>
                        <div>
                          {/* <tr className="tg-tutorial__group--block__line__level">
                            <td style={{ width: "160px" }}>
                              <span>
                                <b>Average completion time</b>
                              </span>
                            </td>
                            <td>
                              {testcase.studyTime}
                            </td>
                          </tr> */}
                        </div>
                        </td>
                        </tr>
                      ) :
                      (<tr>
                        <td>
                        <table>
                          <tbody>
                        <tr className="tg-tutorial__group--block__line__level">
                          <td style={{ width: "160px" }}>
                            <span>
                              <b>Learning Objectives</b>
                            </span>
                          </td>
                          <td>
                            {testcase.concepts}
                          </td>
                        </tr>
                        {( !testcase.lessonType ? <div /> : 
                          <tr className="tg-tutorial__group--block__line__level">
                          <td style={{ width: "160px" }}>
                            <span>
                              <b>Activity Type</b>
                            </span>
                          </td>
                          <td>
                            {testcase.lessonType}
                          </td>
                        </tr>

                        )}
                        <tr className="tg-tutorial__group--block__line__level">
                          <td style={{ width: "160px" }}>
                            <span>
                              <b>Average study time</b>
                            </span>
                          </td>
                          <td>
                            {testcase.studyTime}
                          </td>
                        </tr>
                        <tr className="tg-tutorial__group--block__line__level">
                          <td style={{ width: "160px" }}>
                            <span>
                              <b>Difficulty</b>
                            </span>
                          </td>
                          <td>{this.getDifficulty(testcase.Difficulty)}</td>
                        </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                      )}


                      <tr className="tg-tutorial__group--block__line__level">
                        <td style={{ width: "160px" }}>
                          <span>
                            <b>Reward</b>
                          </span>
                        </td>
                        <td>
                          &nbsp;
                          {/* <span style={{width: '2px'}}>
                            </span> */}
                          <span>
                            {tutorialProgress < 100 ? testcase.coins : <del>{testcase.coins}</del>}
                            <img
                              src="/images/coin.png"
                              style={{ height: "20px", verticalAlign: "middle", marginLeft: "6px" }}
                              alt=""
                            />
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  }

  getUserTests = (tests) => {
    const { isSlideFormat } = this.props;
    const tutorialName = isSlideFormat ? 'LessonName' : 'ScenarioName';
    const sequenceNumber = isSlideFormat ? 'LessonSequenceNumber' : 'ScenarioSequenceNumber';

    return (
      <div>

      </div>
    );

    return (
      <div className="tg-page__content__block tg-container tg-page__content__block--listGames tutorial-group-content">
        <br />
        <div className="tg-tutorial" id="tutorials">
          <br />
          <br />
          <div className="tg-tutorial__title">
            {/* <h3 className="tutorial-title">{title}</h3> */}
            <h3>
            User-Defined Test Cases (
              <a href="#" onClick={this.showHelpUserTest}>
              ?
              </a>
            )
            </h3>
          </div>
          <br />
          <table className="usertesttable">
            <tbody>
              {tests.map((t) => {
                return (
                  <tr key={t[sequenceNumber]}>
                    <td className="row-label">
                      <div className="usertestcasename">{`Test ${t[sequenceNumber]}:  `}</div>
                      {/* <a href={"/buildMyAI/usertestcase"+t[sequenceNumber]}>
                        {"Test " + t[sequenceNumber] + ":  "}
                      </a> */}
                    </td>
                    <td className="row-input">
                      <input
                        id={`inputName${t[sequenceNumber]}`}
                        style={{ width: "100%" }}
                        defaultValue={t[tutorialName]}
                        placeholder="Test name required"
                      />
                    </td>
                    <td className="row-button">
                      <button
                        className="btn btn-info"
                        style={{ marginLeft: "20px" }}
                        onClick={() => this.saveValue(t[sequenceNumber])}
                        type="button"
                      >
                      Update Name
                      </button>
                      <button
                        className="btn btn-info"
                        style={{ marginLeft: "20px", backgroundColor: t[tutorialName] !== "" ? "#0a73bc" : "grey" }}
                        disabled={t[tutorialName] === ""}
                        onClick={() => {
                          this.props.history.push(`/buildMyAI/usertestcase_${t._id}`);
                        }}
                        type="button"
                      >
                      Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  checkLastIsDone = (tutorials) => {
    const user = Meteor.user();

    if (tutorials.length === 0) {
      return false;
    }
    if (user.tutorial && user.tutorial.length > 0) {
      const lastTutorial = tutorials[tutorials.length - 1];

      for (let i = 0; i < user.tutorial.length; i++) {
        if (user.tutorial[i].id === lastTutorial._id) {
          return user.tutorial[i].progress > 0.9999999;
        }
      }
    } else {
      return false;
    }
  };

  getContent = (tutorial, unlockall) => {
    const {
      gameId, packageType, isSlideFormat, courses
    } = this.props;
    const title = _.get(_.find(courses, ({ gameId, packageType, isSlideFormat })), 'title', '');

    return (
      <div className="tg-page__content__block tg-container tg-page__content__block--listGames tutorial-group-content">
        <br />
        <div className="tg-tutorial" id="tutorials">
          <br />
          <br />
          {/* <div className="tg-tutorial__title">
            <h3 className="tutorial-title">{title}</h3>
          </div> */}
          {tutorial.length > 0 ? this.getTutorial(tutorial, unlockall) : <div>Loading lesson list...</div>}
        </div>
      </div>
    );
  }

  saveValue = (num) => {
    const { gameId } = this.props;
    const value = $(`#inputName${num}`).val();

    if (value == "") {
      swal({
        text: "Test name cannot be empty!",
        icon: "error"
      });
      return;
    }

    Meteor.call("updateUserTestName", gameId, num, value, (err) => {
      if (err) {
        swal({
          text: `An error occured when updating test ${num}!`,
          icon: "error"
        });
      } else {
        swal({
          text: `Name of test ${num} updated to '${value}' successfully!`,
          icon: "success"
        });
      }
    });
  };

  showHelpUserTest = () => {
    swal({
      title: "Creating Your Own Test Cases",
      text: "Specify a test name, click 'UPDATE NAME', then click 'OPEN' to define and run that test.",
      icon: "info"
    });
  };

  handleResetChat(testid) {
    Meteor.call("resetChat", testid, (error) => {
      if (error) {
        console.error(error);
      }
    });
  }

  openModal = () => {
    this.setState({
      isOpen: true
    });
  };

  closeModal = () => {
    this.setState({
      isOpen: false
    });
  };

  goToLesson = (id) => {
    const { history } = this.props;
    history.push(`/lesson/${id}`);
  }

  buildMyAI = (id) => {
    this.props.changeTutorial(id);
    this.props.history.push(`/buildMyAI/${id}`);
  };

  getTutorialOptions = () => {
    const { courses } = this.props;
    return courses && courses.length > 0
      ? _.map(courses, course => ({
        ...course,
        value: `${course.gameId}-${course.packageType}-${course.isSlideFormat}`,
        label: course.title
      }))
      : [];
  }

  getDefaultPackageOfGame = (gameId) => {
    const { userData, starterLessons } = this.props;
    const { tutorial } = userData;
    if (!userData || !starterLessons || starterLessons.length === 0) return PACKAGE_TYPES.BEGINNER;
    const listTutorialsCompeleted = (tutorial || []).filter(t => t.progress === 1 && t.gameId === gameId).map(t => t.id);
    const isCompletedForStarter = (starterLessons || []).every(st => st.gameId === gameId && listTutorialsCompeleted.includes(st._id));
    return isCompletedForStarter ? PACKAGE_TYPES.INTERMEDIATE : PACKAGE_TYPES.BEGINNER;
  };

  onSelectTutorial = (option) => {
    const { selectGameTutorial } = this.props;
    const { gameId, packageType, isSlideFormat } = option || {};

    selectGameTutorial({
      gameId,
      packageType,
      isSlideFormat
    });
  };

  goToAccountManagementPage = () => {

  };

  promptBattle(gameId) {
    const {history } = this.props;
    Swal.fire (
      {title: "Challenge Another User's AI!",
      animation: true,
      customClass: 'bounceInDown',
      showCancelButton: true,
      confirmButtonText: "Confirm",
      html: "<form id = 'formValidate' class = 'formValidate'> Specify the nick name and secret key of the opponent's AI. </br> </br>" +
            "<label>Game Project ID&nbsp&nbsp</label> <input id = 'projectid' name = 'projectid' type = 'text' class = 'form_input' required value='" + ( gameId == MIGRATION_CONST.tankscratch2GameId ?  DEFAULT_BATTLE_PROJECT_ID : DEFAULT_BATTLE_PROJECT_ID_RECYCLER ) + "' required style = 'width: 38%; height = 40%; padding: 12px 20px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; '/> "+" </br></br> " +              
              "<input id = 'username' name = 'username' type = 'text' class = 'form_input' required placeholder = 'nick name' required style = 'width: 38%; height = 40%; padding: 12px 20px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; '/> "+" &nbsp&nbsp&nbsp " +              
              "<input id = 'secretkey' name = 'secretkey' type = 'text' class = 'form_input' required placeholder = 'secret key' required style = 'width: 38%; height = 40%; padding: 12px 20px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; '/> "+
              "</ form>",
      preConfirm: () => {
        const projectid = document.getElementById ('projectid').value;
        const secretkey = document.getElementById ('secretkey').value;
        const username = document.getElementById ('username').value;
        if (secretkey!="" && username != "" && projectid.length >= 9) {
          return [projectid, username, secretkey];
        } else {
          if (secretkey.trim() == "") {
            alert("The secret key can't be empty!");
            // Swal.fire(
            //   'Upload error!', "The secret key can't be empty.", 'error'              
            // );
          } else if (username.trim() == "") {
            alert("The username can't be empty!");
            // Swal.fire(
            //   'Upload error!', "You need to specify the input file of the 'sprite3' type.", 'error'              
            // );
          } else if (projectid.length < 9) {
            alert("The project ID should be a number of 9 or more digits!");
          }
          return false;
        }
        // return [spritefile, secretkey, secretkey2]
      }
     }).then((result) => {
      if (result.value) {
        console.log(JSON.stringify(result.value));

        Meteor.call('checkOpponentRKey', gameId, result.value[1], result.value[2], (err, res) => {
          if (err) {
            alert(err.reason);
            return;
          }
          history.push(`/scratchbattle2/${result.value[0]}|${res[0]}|${res[1]}|${gameId}`);
        });
      }
    })
  }

  promptScratchAIFile2(gameId) {
    const user = Meteor.user();
    Swal.fire (
      {
        title: "Release Your AI Sprite!",
      animation: true,
      customClass: 'bounceInDown',
      showCancelButton: true,
      confirmButtonText: "Confirm",
      html: "<form id = 'formValidate' class = 'formValidate'> Please specify the sprite file and a secret key. </br> </br>" +
              "<input id = 'spritefile' name = 'spritefile' type = 'file' accept='.sprite3' /> "+" </br> </br> "+
              "<input id = 'nickname' name = 'nickname' type = 'text' class = 'form_input' required placeholder = 'nick name' value = '" + user.username + "' style = 'width: 80%; height = 40%; padding: 12px 20px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; '/> <br/> "+              
              "<input id = 'secretkey' name = 'secretkey' type = 'text' class = 'form_input' required placeholder = 'secret key' required style = 'width: 38%; height = 40%; padding: 12px 20px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; '/> "+" &nbsp &nbsp &nbsp " +              "<input id = 'secretkey2' name = 'secretkey2' type = 'text' class = 'form_input' required placeholder = 'confirm key' required style = 'width: 38%; height = 40%; padding: 12px 20px; margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; '/> "+
              "</ form>",
      preConfirm: () => {
        
        const spritefile = document.getElementById('spritefile').files[0];
        const nickname = document.getElementById('nickname').value;
        const secretkey = document.getElementById('secretkey').value;
        const secretkey2 = document.getElementById('secretkey2').value;
        if (spritefile && spritefile.name && spritefile.name.includes("sprite3") && nickname !== "" && secretkey!="" && secretkey == secretkey2) {
          return [spritefile, secretkey, nickname];
        } else {
          if (secretkey.trim() == "") {
            alert("The secret key can't be empty!");
            // Swal.fire(
            //   'Upload error!', "The secret key can't be empty.", 'error'              
            // );
          } else if (nickname == "") {
            alert("The nickname can't be empty!");
          } else if (secretkey != secretkey2) {
            alert("The secret key doesn't match with the confirm key!");
            // Swal.fire(
            //   'Upload error!', "The secret key doesn't match with the confirm key.", 'error'              
            // );
          } else if (!spritefile || !spritefile.includes("sprite3")) {
            alert("You need to specify a '.sprite3' file!");
            // Swal.fire(
            //   'Upload error!', "You need to specify the input file of the 'sprite3' type.", 'error'              
            // );
          }
          return false;
        }
        // return [spritefile, secretkey, secretkey2]
      }
     }).then((result) => {
      if (result.value) {
        console.log(JSON.stringify(result.value));
        const file = result.value[0];
        const reader = new FileReader()
        reader.onload = (e) => {
          // debugger;
          var buffer = new Uint8Array(reader.result) // convert to binary
          // var s = new TextDecoder("utf-8").decode(buffer);
          //var s = Utf8ArrayToStr(buffer);
          // let s = String.fromCharCode.apply(null, buffer);
          let s = handleCodePoints(buffer);
          // let s = new TextDecoder("utf-8").decode(buffer);
          // const a = new TextEncoder("utf-8").encode(s);
          // var a = strToBuffer(s);
          Meteor.call('saveUserScratchAIFile', gameId, file.name, result.value[1], result.value[2], s, function(error, result) {
            if(error){
              Swal.fire(
                'Upload error!', error.message, 'error'              
              );
            } else {
              Swal.fire(
                'Upload successful!', '', 'success'              
              );
            }
          });
        }
        reader.readAsArrayBuffer(file);
    
      }
    })
  }

  // async promptScratchAIFile(gameId) {
  //   const { value: file } = await Swal.fire({
  //     title: 'Select AI Sprite File',
  //     input: 'file',
  //     inputAttributes: {
  //       accept: '.sprite3',
  //       'aria-label': 'Upload your AI sprite file'
  //     }
  //   })
    
  //   if (file) {
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       // debugger;
  //       var buffer = new Uint8Array(reader.result) // convert to binary
  //       // var s = new TextDecoder("utf-8").decode(buffer);
  //       //var s = Utf8ArrayToStr(buffer);
  //       let s = String.fromCharCode.apply(null, buffer);
  //       // const a = new TextEncoder("utf-8").encode(s);
  //       // var a = strToBuffer(s);
  //       Meteor.call('saveUserScratchAIFile', gameId, file.name, s, function(error, result) {
  //         if(error){
  //           Swal.fire(
  //             'Upload error!', error.message, 'error'              
  //           );
  //         } else {
  //           Swal.fire(
  //             'Upload successful!', '', 'success'              
  //           );
  //         }
  //      });
  //     }
  //     reader.readAsArrayBuffer(file);
  //   }
  // }

  renderPaymentModal = (selectedTutorial) => {
    const gameId = _.get(selectedTutorial, 'gameId', '')
    const packageType = _.get(selectedTutorial, 'packageType', '')
    const title = _.get(selectedTutorial, 'title', '')
    const price = _.get(COURSE_PRICE, [gameId, packageType], 0);

    const that = this;
    if (price === 0) {
      setTimeout(() => {
        that.closePaymentModal();
      }, 10);
      
      return;
    }

    return (
      <PaymentModal 
        showModal
        toggleAddPaymentCardModal={this.closePaymentModal}
        title={title}
        price={price}
        gameId={gameId}
        packageType={packageType}
      />
    )
  }

  calcCentToUsd = cent => _round(cent / 100, 2)

  render() {
    const { game, isOpen, isPaymentModalOpen } = this.state;
    const {
      lessons,
      starterLessons,
      intermediateLessons,
      advancedLessons,
      schoolLessons,
      allUserS,
      gameId,
      packageType,
      isSlideFormat,
      userData,
    } = this.props;
    const boughtCourse = _.get(userData, 'boughtCourse', []);
    const isEmpty = !game || !lessons;
    const isPackageStarter = packageType === PACKAGE_TYPES.BEGINNER;
    const isPackageIntermediate = packageType === PACKAGE_TYPES.INTERMEDIATE;
    const isPackageAdvanced = packageType === PACKAGE_TYPES.ADVANCED;
    const isPackageSchoool = packageType === PACKAGE_TYPES.SCHOOLA || packageType === PACKAGE_TYPES.SCHOOLB;
    const { accountType, isGrandfathered, canViewSchool } = Meteor.user();
    const tutorialOptions = this.getTutorialOptions();
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered || boughtCourse.find(item => item.gameId === gameId && item.packageType === packageType);
    const that = this;
    const selectedTutorialOption = _.find(tutorialOptions, option => option.gameId === gameId && option.packageType === packageType)
    const price = _get(COURSE_PRICE, [gameId, packageType], 0); 
    const priceUsd = this.calcCentToUsd(price);

    return (
      <div className="tg-tutorial__container">
        <div className="tg-tutorial__header">
          <div className="tg-tutorial__header__left">
            <span>Choose Course</span>
            <div>
              <TutorialSelection
                onSelect={this.onSelectTutorial}
                options={tutorialOptions}
                value={`${gameId}-${packageType}-${isSlideFormat}`}
              />
            </div>
          </div>
          {
            !scratchGameList.includes(gameId) ? <div /> : 
            <div className="tg-tutorial__header__right">
              <div>
                <button
                  type="button"
                  className="admin-btn admin-btn--trans step-rows__item__add-btn"
                  onClick={(e) => { that.promptScratchAIFile2(gameId); }}
                >
                  Release
                </button>
              </div>
            </div>
          }
          
          {
            !scratchGameList.includes(gameId) ? <div /> : 
            <div style={{marginLeft:"5px"}} className="tg-tutorial__header__right">
              <div>
                <button
                  type="button"
                  className="admin-btn admin-btn--trans step-rows__item__add-btn"
                  onClick={(e) => { that.promptBattle(gameId); }}
                >
                  Battle
                </button>
              </div>
            </div>
          }

          {/* <div className="tg-tutorial__header__right">
            <ModalVideo channel="youtube" isOpen={isOpen} videoId="DGt5JZW6nRo?hd=1" onClose={this.closeModal} />
            <a className="tutorial-video-link" onClick={this.openModal}>
              <i className="fa fa-play-circle-o" />
              Quick Overview of Tutorial
            </a>
          </div> */}
        </div>
        {
          packageType !== PACKAGE_TYPES.BEGINNER && !isPremium && !( (packageType === PACKAGE_TYPES.SCHOOLA || packageType === PACKAGE_TYPES.SCHOOLB) && canViewSchool) && (
            <div className="tg-page__content__block tg-container tg-page__content__block--premiumLink">
              <NavLink to="/account-management">
                <span>Upgrade to the Premium Account For Intermediate Level Lessons</span>
              </NavLink> 
              <div className="buy-now--wrapper">
                <span>or</span>
                <button className="surveybutton" onClick={this.openPaymentModal}>{"Buy This Course ($" + priceUsd + ")"}</button>
              </div>
            </div>
          )
        }
        {isEmpty && (
          <div className="tg-page__content__block tg-container tg-page__content__block--listGames">
            <div className="tg-tutorial">
              <div className="tg-tutorial__title">
                <h3 className="beginnertutorial">Loading lesson list...</h3>
              </div>
            </div>
          </div>
        )}
        {!isEmpty && isPackageStarter && this.getContent(starterLessons, true)}
        {!isEmpty && isPackageIntermediate && this.getContent(intermediateLessons, this.checkLastIsDone(starterLessons))}
        {!isEmpty && isPackageAdvanced && this.getContent(advancedLessons, this.checkLastIsDone(starterLessons))}
        {!isEmpty && isPackageSchoool && canViewSchool && this.getContent(schoolLessons, this.checkLastIsDone(schoolLessons))}
        {!isPackageStarter && this.getUserTests(allUserS)}
        {
          isPaymentModalOpen && this.renderPaymentModal(selectedTutorialOption)
          
        }
      </div>
    );
  }
}

export default withRouter(TutorialLinksListComponent);

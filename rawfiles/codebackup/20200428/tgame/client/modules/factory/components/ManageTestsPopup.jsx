import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PAYMENT_PRO } from '../../../../lib/enum';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  content: {
    top: '120px',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, 0%)',
    maxWidth: '780px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    padding: '0px',
    display: 'flex',
    alignItems: 'center'
  }
};
// const BUILD_BOT_TITLE = `Official Bot Needed!`;

class ManageTestsPopup extends Component {
  state = {
    isLoading: false,
    error: null,
    currentTestSeq: -1,
    inRunAllTest: false
  }

  componentWillUnmount() {
    this.setState({ isLoading: false, error: null });
  }

  getTestStat = () => {
    const {
      tests
    } = this.props;
    const { inRunAllTest } = this.state;
    if (inRunAllTest) {
      return "running all tests..."
    }
    let totalcnt = 0;
    let passcnt = 0;
    for (let k=0; k<tests.length; k++) {
      const t = tests[k];
      if (t.testName && t.testResult) {
        totalcnt ++;
        if (t.testResult == "PASS") {
          passcnt ++;
        }
      }
    }
    let pre = totalcnt == passcnt && totalcnt > 0 ? "Congratulations! " : "";
    if (totalcnt > 1) {
      return pre + passcnt + " out of " + totalcnt + " tests have passed.";
    } else if (totalcnt == 1) {
      return pre + passcnt + " out of " + totalcnt + " test has passed.";
    } else {
      return "No test to run.";
    }
  }

  renderBody = () => {
    const {
      tests
    } = this.props;
    const that = this;
    const { inRunAllTest } = this.state;

    if (this.state.singleTestRunSeq >= 0 && (tests[this.state.singleTestRunSeq].testResult == "PASS" || tests[this.state.singleTestRunSeq].testResult == "FAIL")) {
      // single test has finished
      this.state.singleTestRunSeq = -1;
    }

    let testRunning = inRunAllTest || this.state.singleTestRunSeq >= 0;
    const { accountType, isGrandfathered } = Meteor.user();
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered;

    return (
      <div className="challenge--main">
        <table className="usertesttable">
          <tbody>
            <tr key={"alltests"}>
              <td className="row-label">
                <div className="usertestcasename">{`Summary`}</div>
              </td>
              <td className="row-input">
                <label
                  id={`LabelAllTestResult`}
                  style={{ width: "100%", color: this.getTestStat().includes("Congratulations!") ? "green" : "red", borderTopColor: "grey", borderTopWidth: "1px" }}
                >
                {this.getTestStat()}
                </label>
              </td>
              <td className="row-label">
                <button
                  className="btn btn-info"
                  title={inRunAllTest ? "Stop" : "Run All Test Cases"}
                  style={{ marginLeft: "34px", background: !inRunAllTest && this.state.singleTestRunSeq >= 0 ? "grey" : inRunAllTest ? "#984ce2" : "#984ce2" }}
                  disabled={!inRunAllTest && this.state.singleTestRunSeq >= 0}
                  onClick={() => {
                    if (isPremium) {
                      this.runAllTest();
                    } else {
                      this.runTest(0);
                    }
                  }}
                  type="button"
                >
                {inRunAllTest ? <FontAwesomeIcon icon="stop" />  : <FontAwesomeIcon icon="fast-forward" />  }
                </button>
              </td>
            </tr>
            {tests.map((t, index) => {
              return (
                <tr key={t.testSeq} className="testrow">
                  <td className="row-label">
                    <div className="usertestcasename">{`Test ${t.testSeq}:  `}</div>
                    {/* <a href={"/buildMyAI/usertestcase"+t.testSeq}>
                      {"Test " + t.testSeq + ":  "}
                    </a> */}
                  </td>
                  <td className="row-input">
                    <input
                      id={`inputName${t.testSeq}`}
                      style={{ width: "100%", borderTopColor: "grey", borderTopWidth: "1px" }}
                      defaultValue={index > 0 && !isPremium ? 'Premium account only' : t.testName}
                      disabled={index > 0 && !isPremium}
                      placeholder={index > 0 && !isPremium ? 'Premium account only' : "Test Name (unnamed tests will not run)."}
                    />
                  </td>
                  <td className="row-button">
                    <button
                      className="btn btn-info"
                      title="Update Test Case Name"
                      style={{ marginLeft: "14px", background: !testRunning ? "orange" : "grey" }}
                      onClick={() => this.updateTestName(t.testSeq)}
                      disabled={testRunning || (index > 0 && !isPremium)}
                      type="button"
                    >
                      <FontAwesomeIcon icon="edit" />
                    </button>
                    <button
                      className="btn btn-info"
                      title="Open Test Case"
                      style={{ marginLeft: "14px", background: !testRunning && t.testName && t.testName !== "" ? "#0a73bc" : "grey" }}
                      disabled={testRunning || t.testName === "" || !t.testName || (index > 0 && !isPremium)}
                      onClick={() => {
                        //this.props.history.push(`/buildMyAI/usertestcase_${t._id}`);
                        this.openTest(t.testSeq);
                      }}
                      type="button"
                    >
                      <FontAwesomeIcon icon="folder-open" />
                    </button>

                    <button
                      className="btn btn-info"
                      title="Run Test Case"
                      style={{ marginLeft: "14px", background: !inRunAllTest && !(testRunning && ( that.state.singleTestRunSeq !== t.testSeq ) ) && t.testName && t.testName !== "" ? "#984ce2" : "grey" }}
                      disabled={inRunAllTest || (that.state.singleTestRunSeq >= 0 && ( that.state.singleTestRunSeq !== t.testSeq ) ) || t.testName === "" || !t.testName || (index > 0 && !isPremium)}
                      onClick={() => {
                        this.runTest(t.testSeq);
                      }}
                      type="button"
                    >
                    { !inRunAllTest && that.state.singleTestRunSeq == t.testSeq ? <FontAwesomeIcon icon="stop" /> : <FontAwesomeIcon icon="play" /> }
                    </button>

                    {/* <button
                      className="btn btn-info"
                      title="Run Test Case"
                      style={{ marginLeft: "14px", background: t.testResult == "PASS" ? "#0f8622" : t.testResult == "FAIL" ? "red" : "white" }}
                      disabled={true}
                      type="button"
                    >
                    { t.testResult == "PASS" ? <FontAwesomeIcon icon="check" /> : t.testResult == "FAIL" ? <FontAwesomeIcon icon="times" /> : <label /> }
                    </button> */}

                  { t.testResult == "PASS" ? <img className="resultImage" src="/images/greencheckmarknew1.png" style={{width: "28px !important", height: "28px", marginLeft: "14px", marginTop: "2px"}} /> : t.testResult == "FAIL" ? <img className="resultImage" src="/images/redcrossnew1.png" style={{width: "24px", height: "28px", marginLeft: "14px", marginTop: "5px"}} /> : <label /> }

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  openTest = (seq) => {
    const { gameId, onRequestClose } = this.props;

    Meteor.call('updateUserCurrentTest', gameId, seq, (err) => {
      if (err && err.reason) {
        this.setState({ isLoading: false, error: err.reason });
      } else {
        onRequestClose();
      }
    });
  }

  currentTestFinished = () => {
    const { gameId, tests } = this.props;
    if (this.state.currentTestSeq < 0) return true;
    const t = tests[this.state.currentTestSeq];
    if (t.testResult == "PASS" || t.testResult == "FAIL") {
      return true;
    }
    return false;
  }

  runAllTest = () => {
    const { gameId, tests } = this.props;
    const that = this;
    this.state.currentTestSeq = -1;

    if (this.state.inRunAllTest) {
      clearInterval(this.state.runAllTimer);
      //this.state.inRunAllTest = false;
      this.setState({inRunAllTest: false, singleTestRunSeq: -1});
      window.handleStopTest();
      // this.forceUpdate();
      return;
    }


    //this.state.inRunAllTest = true;
    this.setState({inRunAllTest: true});

    Meteor.call('resetAllUserTestResult', gameId, (err) => {
      if (err && err.reason) {
        this.setState({ isLoading: false, error: err.reason });
      } else {
        that.state.runAllTimer = setInterval(() => {
          if (that.currentTestFinished()) {
            for (let nextSeq = that.state.currentTestSeq + 1; nextSeq < tests.length; nextSeq ++) {
              if (tests[nextSeq].testName && tests[nextSeq].testName != "" ) {

                that.state.currentTestSeq = nextSeq;
                that.runTest(nextSeq);
                return;
              }
            }
            // all finished!
            // that.state.inRunAllTest = false;
            that.setState({inRunAllTest: false});
            clearInterval(that.state.runAllTimer);
            // that.forceUpdate();
          } else {
            // just wait
          }
        }, 1000);

      }
    });


  }

  runTest = (seq) => {
    const { gameId, tests } = this.props;
    const that = this;

    if (this.state.singleTestRunSeq == seq) {
      this.setState({singleTestRunSeq: -1});
      window.handleStopTest();
      return;
    }


    Meteor.call('resetAndSetCurrentTest', gameId, seq, (err) => {
      if (err && err.reason) {
        this.setState({ isLoading: false, error: err.reason });
      } else {
        that.props.tests[seq].testResult = "InRunningTest";
        this.setState({singleTestRunSeq: seq});
        window.currentUserTestSeq = seq;
        window.currentUserTestGameId = gameId;
        window.handlePlaygame();
      }
    });

    // Meteor.call('recordUserTestResult', gameId, seq, "PASS", (err) => {
    //   if (err && err.reason) {
    //     this.setState({ isLoading: false, error: err.reason });
    //   }
    // });
  }


  updateTestName = (seq) => {
    const { gameId, tests } = this.props;

    const value = $(`#inputName${seq}`).val();

    if (value == "" && seq == 0) {
      $(`#inputName${seq}`).val(tests[0].testName);
      swal({
        text: "Test name can't be empty for test 0!",
        icon: "error"
      });
      return;
    }

    Meteor.call('updateFactoryTestName', gameId, seq, value, (err) => {
      if (err && err.reason) {
        this.setState({ isLoading: false, error: err.reason });
      }
    });
  }

  startBattle = () => {
    const {
      isAIBattle, game, opponent,
      botRelease, history
    } = this.props;
    this.setState({ isLoading: true });

    // start a challenge
    const challengeGame = {
      opponent,
      game,
      botRelease,
      isAIBattle
    };
    Meteor.call('startChallengeGame', challengeGame, (err, activeGameRoomId) => {
      if (err && err.reason) {
        this.setState({ isLoading: false, error: err.reason });
      } else if (activeGameRoomId) {
        history.push(`/playgame/${activeGameRoomId}`);
      }
    });
  }

  cancel = () => {
    const { onClose } = this.props;
    this.setState({ isLoading: false, error: null });
    onClose();
  }

  render() {
    const { isLoading, error } = this.state;

    return (
      <div className="modal_block_general modaltest--challenge-modal">
        { isLoading && <div className="modal_block_general__loadingOverlay"><LoadingIcon /></div> }
        <div className="modal__header">
          <span className="modal__header__title">{'Manage Test Cases'}</span>
        </div>
        <div className="modal__body">
          <div className="modal__body__content">
            {this.renderBody()}
          </div>
        </div>
        {/* <div className="modal__footer">
          <div className="modal__footer__content">
            { !isMissingMyBot && <button onClick={this.startBattle} disabled={isLoading} className="start-now" type="button">Start Battle Now</button> }
            <button className="cancel-battle" onClick={this.cancel} type="button">Close</button>
          </div>
        </div> */}
      </div>
    );
  }
}

ManageTestsPopup.propTypes = {
};

ManageTestsPopup.defaultProps = {
};

export default withRouter(ManageTestsPopup);

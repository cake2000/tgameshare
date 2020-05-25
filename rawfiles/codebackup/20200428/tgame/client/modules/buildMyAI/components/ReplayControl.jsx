import React from 'react';
import swal from 'sweetalert';
import classnames from 'classnames'
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { MESSAGES } from '../../../../lib/const.js';
import { TOURNAMENT_ROUND_STATUS, GAME_MATCH_STATUS, getEnumValue, POINTS, TOURNAMENT_SECTION_STATUS } from '../../../../lib/enum';


const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

const allButtons = {};

const repeatChar = (c, cnt) => {
  let ss = "";
  for (let k=0; k<cnt; k++) {
    ss += c;
    if (k < cnt.length-1) ss += " ";
  }
  return ss;
};

class ReplayControl extends React.Component {
  static propTypes = {
  }
  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {
      gameEngineReady: false,
      currentCmdIndex: -1,
      cmds: []
    };
  }

  componentWillMount() {
    const { activeGame } = this.props;
    const cmdHist = activeGame.gameCommandHistory;
    const cmds = [];
    // very first command
    let cm = {
      ballPos: "resettable", time: "00:00", redCount: 10, yellowCount: 10
    };
    const ActionMap = {
      "0": "Break",
      "1": "Call",
      "2": "Place Ball",
      "3": "Won",
      "4": "Break"
    };

    const redIDs = [2, 3, 6, 7, 9, 12, 15, 16, 18, 20];
    const yellowIDs = [4, 5, 8, 10, 11, 13, 14, 17, 19, 21];

    let colorChooserName = '';
    let colorChosen = '';
    let oppositeColor = '';

    let startTime = -1;
    for (let i=0; i<cmdHist.length; i++) {
      const c = cmdHist[i];
      const p = c.split(";");
      if (i == 0) {
        startTime = Number(p[1]);
      }

      if (p[2] == "ALLBALLSTOPPED") {
        // new command
        if (cm != null) {
          cmds.push(cm);
        }
        const totalsec = Math.floor((Number(p[1]) - startTime) / 1000);
        const minute = Math.floor(totalsec / 60);
        const sec = totalsec - minute * 60;
        const timestr = (minute < 10 ? "0":"") + minute + ":" + (sec < 10? "0":"") + sec;
        let redCount = 0;
        let yellowCount = 0;
        const poslist = p[5].split("|");
        for (let k=0; k<poslist.length; k++) {
          if (poslist[k].length < 2) continue;
          const pos = poslist[k].split("_");
          if (pos[1] == "NaN" || pos[1] == "100000") {
          } else {
            if (redIDs.includes(Number(pos[0]))) redCount ++;
            if (yellowIDs.includes(Number(pos[0]))) yellowCount ++;
          }
        }

        cm = {
          time: timestr,
          ballPos: p[5],
          redCount, 
          yellowCount
        };
      } else if (p[2] == "NewActivePlayerInfo") {
        const pp = p[4].split("_");
        cm.playerID = pp[0];
        cm.username = activeGame.playerInfo[pp[0]].username;

        if (colorChooserName == '') {

          if (pp.length >= 3 && pp[2] != '-1') {
            const ColorTypeString = {
              0: 'R',
              1: 'Y',
            }        
            cm.chosenColor = ColorTypeString[pp[2]];          
            colorChooserName = cm.username;
            colorChosen = cm.chosenColor;
            oppositeColor = cm.chosenColor == 'R' ? 'Y' : 'R';
          } else {
            cm.chosenColor = '';
          }

        } else {
          // already seen chosen color!
          cm.chosenColor = cm.username == colorChooserName ? colorChosen : oppositeColor;
        }
        cm.playerAction = ActionMap[pp[1]];
        // handle timeout
        if (p[4].indexOf("has timed out") >= 0) {
          cm.playerAction = "Won (timeout)"
        }
      } else if (p[2] == "StrikeCueBall") {
        cm.strikeCmd = p[4];
        const pp = p[4].split("_");
        let prob = pp[pp.length-1];
        cm.prob = "-";
        if (prob >= 0) 
          cm.prob = prob + "%";
      } else if (p[2] == "PlaceCueBall") {
        cm.placeCmd = p[4];
      }
    }

    cmds.push(cm);

    for (let k=0; k<cmds.length; k++) {
      cmds[k].index = k;
      cmds[k].isPlaying = false;
    }

    this.setState({ cmds: cmds });
  }

  componentDidMount() {
    window.replayControl = this;
  }

  setGameEngineReady() {
    this.setState({ gameEngineReady: true });
  }

  // componentDidUpdate() {
  //   if (!this.state.gameEngineReady) return;

  // }

  renderGameInfo2() {
    const { activeGame } = this.props;
    return (
      <table className="replaycontroltable2">
        <tbody>
          <tr>
            <td style={{ width: '40%' }}>
              <div style={{fontSize: '20px'}} >{"" + activeGame.playerInfo[0].username}</div>
              <br />
              <div style={{fontSize: '15px'}}>{"[" + activeGame.playerInfo[0].aiVersion + "]"}</div>
            </td>
            <td style={{ width: '20%' }}>
              <br />
              <img src="/images/vssign.png" alt="VS" style={{width: '40px', height: 'auto'}} />
            </td>            
            <td style={{ width: '40%' }}>
              <div style={{fontSize: '20px'}}>{"" + activeGame.playerInfo[1].username}</div>
              <br />
              <div style={{fontSize: '15px'}}>{"[" + activeGame.playerInfo[1].aiVersion + "]"}</div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderGameInfo() {
    const { activeGame } = this.props;
    
    return (
      <table className="replaycontroltable">
        <thead>
          <tr>
            <th style={{ width: '160px' }}>ID</th>
            <th style={{ width: '80px' }}>Username</th>
            <th style={{ width: '300px' }}>Release Version</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Player 0
            </td>
            <td>
              {activeGame.playerInfo[0].userId}
            </td>
            <td>
              {activeGame.playerInfo[0].aiVersion}
            </td>
          </tr>
          <tr>
            <td>
              Player 1
            </td>
            <td>
              {activeGame.playerInfo[1].userId}
            </td>
            <td>
              {activeGame.playerInfo[1].aiVersion}
            </td>
          </tr>
        </tbody>
      </table>
    );
  
  }

  copyAsTestScript(cmd) {


    const s = window.gameController.convertCommandToTestScript(cmd);

    // copy to clipboard
    copyToClipboard(s);

    // show message
    swal({
      title: "Script copied to clipboard",
      text: s,
      customClass: 'swal-wide',
      icon: 'info'
    });
  }

  resetToCmd(cmd) {
    const { gameEngineReady, cmds, currentCmdIndex } = this.state;
    if (!gameEngineReady) return;
    console.log("Reset to command " + JSON.stringify(cmd));

    if (cmds[currentCmdIndex]) {
      const cmds2 = cmds.slice();
      cmds2[currentCmdIndex].isPlaying = false;
      this.setState({ currentCmdIndex: -1, cmds: cmds2 });
    }

    window.gameController.resetToCommand(cmd);
  }

  replayCmd(cmd, e) {
    const { gameEngineReady, cmds, currentCmdIndex } = this.state;
    if (!gameEngineReady) return;
    // console.log("Replay command " + JSON.stringify(cmd));
    const cmds2 = cmds.slice();
    if (cmds[currentCmdIndex]) {
      cmds2[currentCmdIndex].isPlaying = false;
    }
    cmds2[cmd.index].isPlaying = true;
    this.setState({ currentCmdIndex: cmd.index, cmds: cmds2 });
    
    // scroll to show tr
    
    const rowpos = $('#tr_' + cmd.index).position();
    const tablepos = $('.replaytable').position();
    if (rowpos.top - tablepos.top > $('.replaytable').innerHeight() * 0.8) {
      $('#tr_' + cmd.index).get(0).scrollIntoView();
    }

    if (cmd.playerAction == "Won") return;
    window.gameController.replayCommand(cmd);
    // allButtons[cmd.index] = e.currentTarget;
    // e.currentTarget.src = '/image/playing.gif';
  }

  onReplayFinish() {
    const { gameEngineReady, cmds, currentCmdIndex } = this.state;
    if (!gameEngineReady) return;
    // if (allButtons[currentCmdIndex]) {
    //   allButtons[currentCmdIndex].src = '/image/playbutton.png';
    // }
    if (cmds[currentCmdIndex]) {
      const cmds2 = cmds.slice();
      cmds2[currentCmdIndex].isPlaying = false;
      this.setState({ cmds: cmds2 });
    }
    if (currentCmdIndex >= 0 && currentCmdIndex < cmds.length - 1 && cmds.length > 0) {
      //testing
      this.replayCmd(cmds[currentCmdIndex + 1]);
    }
  }

  renderCommands() {
    const { activeGame } = this.props;
    const { gameEngineReady, cmds } = this.state;

    const that = this;


    return (
      <table className="replaytable">
        <thead>
          <tr>
            <th style={{ width: '70px' }}>Time</th>
            {/* <th style={{ width: '30px' }}>ID</th> */}
            <th style={{ width: '120px' }}>Player</th>
            <th style={{ width: '80px' }}>Action</th>
            <th style={{ width: '40px' }}>Color</th>
            <th style={{ width: '80px' }}>Hand</th>
            <th style={{ width: '60px' }}>Prob</th>
            <th style={{ width: '130px' }}>Ball Count</th>
            <th style={{ width: '70px' }}>Layout</th>
            <th style={{ width: '80px' }}>Replay</th>
          </tr>
        </thead>
        <tbody>
          {
            _.map(cmds, (cmd, index) => {
              return (
                <tr key={cmd.time} id={"tr_" + index} style={{ backgroundColor: cmd.isPlaying ? 'teal' : '#05233b' }}>
                  <td style={{ width: '70px' }}>
                    {cmd.time }
                  </td>
                  {/* <td style={{ width: '30px' }}>
                    {cmd.playerID}
                  </td> */}
                  <td style={{ width: '120px' }}>
                    {cmd.username}
                  </td>
                  <td style={{ width: '80px' }}>
                    {cmd.playerAction}
                  </td>
                  <td style={{ width: '40px', color: cmd.chosenColor == 'R' ? 'red' : 'yellow' }}>
                    {cmd.chosenColor == ''? '' : 'O'}
                  </td>
                    <td style={{ width: '80px' }}>
                    {cmd.placeCmd ? "Yes" : ""}
                  </td>
                  <td style={{ width: '60px' }}>
                    {cmd.prob}
                  </td>
                  <td style={{ width: '130px' }}>
                    {/* <span style={{color: 'red'}}>{cmd.redCount}</span> : <span style={{color: 'yellow'}}>{cmd.yellowCount}</span> */}
                    <span style={{color: 'red'}}>{repeatChar("o", cmd.redCount)}</span> 
                    <br/>
                    <span style={{color: 'yellow'}}>{repeatChar("o", cmd.yellowCount)}</span>
                  </td>
                  {/* <td>
                    {cmd.ballPos}
                  </td> */}
                  <td style={{ width: '70px' }}>
                    { gameEngineReady? 
                       <img id={"resetbutton_"+cmd.index} 
                        src="/images/snapshot.png"
                        onClick={(e) => { that.resetToCmd(cmd); }} alt="reset" style={{width: '30px', height: 'auto'}} /> : null 
                    }
                    { gameEngineReady && cmd.playerAction == "Call"? 
                       <img id={"resetbutton2_"+cmd.index} 
                        src="/images/Letter-S-icon.png"
                        onClick={(e) => { that.copyAsTestScript(cmd); }} alt="copyScript" style={{width: '30px', height: 'auto'}} /> : null 
                    }

                  </td>
                  <td style={{ width: '80px' }}>
                    { gameEngineReady && cmd.playerAction != "Won" ? 
                       <img id={"playbutton_"+cmd.index} 
                        // src={cmd.isPlaying ? "/images/loading.gif" : "/images/playbutton.png"}
                        src="/images/playbutton.png"
                        onMouseOver={e => (cmd.isPlaying ? e.currentTarget.src='/images/playbuttonhighlight.png' : e.currentTarget.src='/images/playbuttonhighlight.png')} 
                        onMouseOut={e => (cmd.isPlaying ? e.currentTarget.src='/images/playbutton.png' : e.currentTarget.src='/images/playbutton.png')} 
                        onClick={(e) => { that.replayCmd(cmd, e); }} alt="play" style={{width: '34px', height: 'auto'}} /> : null 
                    }
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );

  }

  render() {
    const { activeGame } = this.props;

    const cmdHist = activeGame.gameCommandHistory;

    return (
      <div aria-hidden className="sectionInfo2--container">
        <div className="sectionInfo2--container--wrapper">
          <br />
          <br />
          {this.renderGameInfo2()}
          <br />
          <br />
          {this.renderCommands()}
        </div>
      </div>
    );
  }
}

export default ReplayControl;

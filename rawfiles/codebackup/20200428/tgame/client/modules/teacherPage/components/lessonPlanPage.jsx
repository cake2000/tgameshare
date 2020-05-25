import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import 'react-table/react-table.css';
import moment from 'moment';
import swal from 'sweetalert';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import GeneralModal from '../../modal/modal.jsx';
import NewClassForm from './newClassForm.jsx';
import {DEFAULT_BATTLE_PROJECT_ID} from '../../../../lib/enum.js'

const lessonplans = [
  {
    levelNumber: 0,
    levelLetter: "A",
    levelTitle: "Level A - Introduction to Coding",
    lessonCount: 52
  },
  {
    levelNumber: 1,
    levelLetter: "B",
    levelTitle: "Level B - Scratch Creators (I)",
    lessonCount: 52
  },
  {
    levelNumber: 2,
    levelLetter: "C",
    levelTitle: "Level C - Scratch Creators (II)",
    lessonCount: 52
  },
  {
    levelNumber: 3,
    levelLetter: "D",
    levelTitle: "Level D - AI in Scratch (I)",
    lessonCount: 52
  },
  {
    levelNumber: 4,
    levelLetter: "E",
    levelTitle: "Level E - AI in Scratch (II)",
    lessonCount: 52
  },
  {
    levelNumber: 5,
    levelLetter: "F",
    levelTitle: "Level F - Python Introduction",
    lessonCount: 52
  }
];

for (let le=0; le<lessonplans.length; le++) {
  lessonplans[le].lessonlist = [];
  for (let i=0; i<lessonplans[le].lessonCount; i++) {
    lessonplans[le].lessonlist.push(i+1);
  }
}

class LessonPlanPage extends Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   levelNumber: 0,
    //   lessonNumber: 1
    // };
  }

  // onChange = (e) => {
  //   const value = e.target.value || '';
  //   this.setState(prevState => ({
  //     rename: { ...prevState.rename, name: value }
  //   }));
  // }

  // handleChangeLevel = (level) => {
  //   this.setState({ levelNumber: level });
  // }

  componentDidMount() {
    // const me = Meteor.user();
    // users = [{
    //   nickname: me.username,
    //   email: me.emails[0].address, 
    //   userId: me._id
    // }];
    // studentsWithCode.forEach(s => {
    //   if (s._id !== me._id) {
    //     users.push({
    //       nickname: s.username,
    //       email: s.emails[0].address, 
    //       userId: s._id
    //     });
    //   }
    // });
  }

  gotoLessonPlan(level, lesson) {
    const {history} = this.props;
    history.push(`/lessonplan/` + level + "/" + lesson);
  }

  render() {
    const { 
      levelNumber, 
      lessonNumber, 
    } = this.props;
    const that = this;
    
    const me = Meteor.user();

    return (
      <div className="LessonPlanPageClass">
              <br/>
              <br/>
        <center>
        <table style={{height: "1000px"}} >
          <tbody>
            <tr>
              <td style={{width: '380px'}}>
                <div style={{backgroundColor: "lavender", height: "500px"}}>
                {
                  lessonplans.map(lp => (
                    <div className={lp.levelNumber == levelNumber ? "selected-level-name" : "level-name"} onClick={() => that.gotoLessonPlan(lp.levelNumber, 1)}>
                      {lp.levelTitle}
                    </div>
                  ))
                }
                </div>
              </td>
              <td style={{width: '700px', height: '10000px'}}>
                <table className="contenttable">
                  <tbody>
                    <tr style={{height: '40px', backgroundColor: 'aliceblue'}}>
                      {
                        lessonplans[levelNumber].lessonlist.map(lp => (
                          <button className={lp == lessonNumber ? "selected-lesson-number" : "lesson-number"} onClick={() => that.gotoLessonPlan(levelNumber, lp)} >
                            {lp}
                          </button>
                        ))
                      }
<br/>

                    </tr>
                    <tr style={{height: '6000px'}}>
                      <td>
                        <iframe style={{height: '6000px', width: '700px'}}  src={"/lessonplans/lesson plan " + lessonplans[levelNumber].levelLetter + " " + lessonNumber + ".html"}></iframe>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </td>
            </tr>
          </tbody>
        </table>
        </center>
      </div>
    );
  }
}

export default LessonPlanPage;

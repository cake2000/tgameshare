import React, { Component } from 'react';
import _map from 'lodash/map';
import PropTypes from 'prop-types';
import Collapsible from 'react-collapsible';
import { Random } from 'meteor/random';
import CourseItem from './CourseItem.jsx';

class PlayerCourses extends Component {
  render() {
    const { canViewSchool } = Meteor.user();
    const { courses, selectGameTutorial, userData } = this.props;
    const schoolCourses = courses.filter(course => course.typeCourses === 'school');
    schoolCourses.sort((a, b) => {
      if (a.gameId < b.gameId) return -1;
      if (a.gameId > b.gameId) return 1;
    });
    return (
      <div className="player-courses">
        <div className="collapsible collapsible--courses">
          {/* <Collapsible triggerDisabled transitionTime={300} trigger="Scratch Courses" open> */}
          <div className="Collapsible">
            <h3 className="collapsible__title">
              <img src="./img_v2/scratch.png" alt="scratch" />
            </h3>
            <div className="collapsible__list">
              {_map(courses || [], course => (
                (course.typeCourses === 'scratch') && (
                  <CourseItem {...course} key={Random.id()} selectGameTutorial={selectGameTutorial} userData={userData} />
                )
              ))}
            </div>
          </div>
          {/* </Collapsible> */}
          <div className="Collapsible">
            <h3 className="collapsible__title">
              <img src="./img_v2/javascript.png" alt="javascript" />
            </h3>
            <div className="collapsible__list">
              {_map(courses || [], course => (
                (course.typeCourses === 'javascript') && (
                  <CourseItem {...course} key={Random.id()} selectGameTutorial={selectGameTutorial} userData={userData} />
                )
              ))}
            </div>
          </div>

          {!canViewSchool ? <div/> : (
          <div className="Collapsible">
            <h3 className="collapsible__title">
              <img src="./images/school2.jpg" alt="school" />
            </h3>
            <div className="collapsible__list">
              {_map(schoolCourses || [], course => (
                (
                  <CourseItem {...course} key={Random.id()} selectGameTutorial={selectGameTutorial} userData={userData} />
                )
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }
}

PlayerCourses.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    progress: PropTypes.number,
    unlocked: PropTypes.bool,
    package: PropTypes.string,
    ScenarioName: PropTypes.string
  })),
  selectGameTutorial: PropTypes.func.isRequired
};

PlayerCourses.defaultProps = {
  courses: []
};

export default PlayerCourses;

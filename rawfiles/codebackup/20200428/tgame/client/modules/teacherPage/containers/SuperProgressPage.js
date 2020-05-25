import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import SuperProgressPage from '../components/SuperProgressPage.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, history }, onData) => {
  const { Collections } = context();

  const userId = Meteor.userId();
  if (!userId) {
    history.push('/signin');
    return;
  }
  // const user = Meteor.user();
  // if (!user) return;

  // ai@mail.com
  if (!["ScDM5NzhdHgyyHsYw", "ScDM5NzhdHgyyHsYw", "kEmnDrYssC2gKNDxx"].includes(Meteor.userId())) {
    history.push('/');
    return;
  }


  if (Meteor.subscribe('mysuperclassusers').ready()) {

    const users = Meteor.users.find(
      {  },
      {
        fields: {
          username: 1,
          avatar: 1,
          isGrandfathered: 1,
          canViewSchool: 1
        }
      }
    ).fetch();

    const classData = {users: users.map(e => e._id)};
    let students = [];
    let scenarios = [];
    let lessons = [];

    if (!classData) {
      history.push('/teacher');
      return;
    }

    if (classData && Meteor.subscribe('users.getListStudents', classData.users).ready() && Meteor.subscribe('allscenariolist').ready() && Meteor.subscribe('alllessonlist').ready()) {
      const tutorialIds = [];

      students = Meteor.users.find(
        {
          _id: { $in: classData.users }
        },
        {
          fields: {
            username: 1,
            'tutorial.id': 1,
            'tutorial.progress': 1,
            'profile.firstName': 1,
            'profile.lastName': 1,
            'profile.coins': 1,
            'profile.inClasses': 1,
            'emails': 1,
            'profile.grade': 1,
            'profile.allowFastForward': 1,
            isGrandfathered: 1, canViewSchool: 1
          }
        }
      ).fetch();
      students.map(user => user.tutorial && user.tutorial.map(element => !tutorialIds.includes(element.id) && tutorialIds.push(element.id)));

      for (let j=0; j<students.length; j++) {
        if (!students[j].profile) continue;
        if (students[j].profile.firstName && students[j].profile.lastName)
          students[j].fullname = students[j].profile.firstName + " " + students[j].profile.lastName;
        else 
          students[j].fullname = students[j].username;
        if (students[j].emails && students[j].emails[0])
          students[j].email = students[j].emails[0].address;
      }

      // if (tutorialIds.length > 0 && Meteor.subscribe('scenario.getListForStudent', tutorialIds).ready()) {
        
      if (tutorialIds.length > 0 ) {
        
        scenarios = Collections.Scenarios.find(
          {
            // _id: { $in: tutorialIds }
          },
          {
            fields: {
              ScenarioName: 1,
              package: 1, 
              ScenarioSequenceNumber: 1
            }
          }
        ).fetch();

        for (let k=0; k<scenarios.length; k++) {
          const s = scenarios[k];
          if (s._id.indexOf("P") == 0) {
            if (s.package == "starter") {
              s.course = "Pool (I Old)";
            } else if (s.package == "intermediate") {
              s.course = "Pool (II Old)";
            } else if (s.package == "advanced") {
              s.course = "Pool (III Old)";
            }
          } else if (s._id.indexOf("T") == 0) {
            if (s.package == "starter") {
              s.course = "Tank (I Old)";
            } else if (s.package == "intermediate") {
              s.course = "Tank (II Old)";
            } else if (s.package == "advanced") {
              s.course = "Tank (III Old)";
            }
          }
        }

        const lessons = Collections.Lessons.find({}).fetch();
        for (let k=0; k<lessons.length; k++) {
          const s = lessons[k];
          if (s._id.indexOf("LT") == 0) {
            if (s.package == "starter") {
              s.course = "Tank (I)";
            } else if (s.package == "intermediate") {
              s.course = "Tank (II)";
            } else if (s.package == "advanced") {
              s.course = "Tank (III)";
            }

          } else if (s._id.indexOf("LSTS") == 0) {
            if (s.package == "starter") {
              s.course = "Scratch Tank (I)";
            } else if (s.package == "intermediate") {
              s.course = "Scratch Tank (II)";
            }

          } else if (s._id.indexOf("LFB") == 0) {
            if (s.package == "starter") {
              s.course = "Flappy Bird (I)";
            } else if (s.package == "intermediate") {
              s.course = "Flappy Bird (II)";
            }

          } else if (s._id.indexOf("LCC") == 0) {
            if (s.package == "starter") {
              s.course = "Candy Crush (I)";
            } else if (s.package == "intermediate") {
              s.course = "Candy Crush (II)";
            }

          } else if (s._id.indexOf("LS") == 0) {
            if (s.package == "starter") {
              s.course = "Scratch (I)";
            } else if (s.package == "intermediate") {
              s.course = "Scratch (II)";
            } else if (s.package == "advanced") {
              s.course = "Scratch (III)";
            }

          } else if (s._id.indexOf("LDT") == 0) {
            if (s.package == "starter") {
              s.course = "Turtle (I)";
            } else if (s.package == "intermediate") {
              s.course = "Turtle (II)";
            }

          } else if (s._id.indexOf("LKT") == 0) {
            if (s.package == "starter") {
              s.course = "K Turtle (I)";
            } else if (s.package == "intermediate") {
              s.course = "K Turtle (II)";
            }

          } else if (s._id.indexOf("L") == 0) {
            if (s.package == "starter") {
              s.course = "Pool (I)";
            } else if (s.package == "intermediate") {
              s.course = "Pool (II)";
            } else if (s.package == "advanced") {
              s.course = "Pool (III)";
            }
          }
          scenarios.push({
            _id: s._id, course: s.course, ScenarioName: s.LessonName, ScenarioSequenceNumber: s.LessonSequenceNumber
          });


        }

      }

      const distinctCourses = [];
      for (let k=0; k<scenarios.length; k++) {
        const c = scenarios[k].course;
        if (!distinctCourses.includes(c)) {
          distinctCourses.push(c);
        }
      }

      // format student tutorial into courses
      for (let k=0; k<students.length; k++) {
        const st = students[k];
        st.courses = [];

        // first add all courses where this student has done something
        for (let j=0; j<distinctCourses.length; j++) {
          const c = {name: distinctCourses[j], progresses: []};
          let hasProgress = false;
          for (let r=0; r<scenarios.length; r++) {
            if (distinctCourses[j] == scenarios[r].course && st.tutorial) {
              for (let m=0; m<st.tutorial.length; m++) {
                const tt = st.tutorial[m];
                if (tt.id == scenarios[r]._id && tt.progress >= 0) {
                  hasProgress = true; break;
                }
              }
              if (hasProgress) break;
            }
          }
          if (hasProgress) {
            st.courses.push(c);
          }
        }

        for (let j=0; j<st.courses.length; j++) {
          const c = st.courses[j];
          for (let r=0; r<scenarios.length; r++) {
            if (c.name == scenarios[r].course) {
              const pp = {id: scenarios[r]._id, course: c.name, number:scenarios[r].ScenarioSequenceNumber,  lesson: scenarios[r].ScenarioName, progress: 0};
              if (st.tutorial) {
                for (let m=0; m<st.tutorial.length; m++) {
                  const tt = st.tutorial[m];
                  if (tt.id == scenarios[r]._id) {
                    if (tt.progress == 0) {
                      pp.progress = -1;
                    } else {
                      pp.progress = tt.progress;
                    }
                    // pp.progress = Math.max(0.05, tt.progress); // show a minimum if the student has opened it at least!
                    break;
                  }
                }
                c.progresses.push(pp);
              }
            }
          }

          c.progresses.sort((a,b)=>{
            if (a.number != b.number ) {
              return a.number - b.number;
            } else {
              return a.lesson > b.lesson;
            }
    
            //return a.number - b.number;
          });
        }

        const scratchCourses = st.courses.filter(c => c.name && c.name.includes("Scratch"));
        const tankSlideCourses = st.courses.filter(c => c.name && c.name.includes("Tank") && !c.name.includes("Old"));
        const poolSlideCourses = st.courses.filter(c => c.name && c.name.includes("Pool") && !c.name.includes("Old"));
        const otherCourses = st.courses.filter(c => c.name && !c.name.includes("Scratch") && !(c.name.includes("Tank") && !c.name.includes("Old")) && !(c.name.includes("Pool") && !c.name.includes("Old")) );
  
        st.courses = scratchCourses.concat(tankSlideCourses.concat(poolSlideCourses.concat(otherCourses)));

      }

      const userTestCases = Collections.UserScenarios.find({ userId: { $in: classData.users } }).fetch();
      for (let k = 0; k < userTestCases.length; k++) {
        for (let j = 0; j < students.length; j++) {
          if (userTestCases[k].userId === students[j]._id) {
            if (!students[j].testcases) students[j].testcases = [];
            students[j].testcases.push({
              _id: userTestCases[k]._id, ScenarioName: userTestCases[k].ScenarioName
            });
          }
        }
      }
      onData(null, { classData, students, scenarios });
    } else {
      
    }
  }
};

export const depsMapper = (context, actions) => {
  return ({
    context: () => context,
    addCoinsToUser: actions.teacherPage.addCoinsToUser,
    resetLessonForUser: actions.teacherPage.resetLessonForUser,
    moveForwardLessonForUser: actions.teacherPage.moveForwardLessonForUser,
    handleApprove: actions.teacherPage.handleApprove
  });
};

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper),
)(SuperProgressPage);

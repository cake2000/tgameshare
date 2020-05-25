import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Lessons, UserChat, Classes, Scenarios, UserLesson, SlideContent } from '../../lib/collections';
import { REGISTER_CLASS_STATUS } from '../../lib/enum';

const sendDiscourseRequest = (method, path, params, callback) => {
  let url = `https://forum.tgame.ai/${path}?api_key=9ca0b1b166da90cd2152b8b7db7b1a2e9bac954caa303c0e3688393c7eba362f&api_username=tgame.ai`;
  if (path === 'categories') {
    const keys = Object.keys(params);
    for (let j = 0; j < keys.length; j++) {
      if (keys[j].indexOf("permissions%5B") === 0) {
        url += `&${keys[j]}=${params[keys[j]]}`;
        delete params[keys[j]];
        break;
      }
    }
    // url += "&permissions%5Badmins%5D=1";
  }
  // url += "&name=" + params.name + "&color=" + params.color + "&text_color=" + params.text_color + "&parent_category_id=" + params.parent_category_id + "&slug=" + params.slug;
  // console.log("url: ", url);
  HTTP.call(method, url, {
    data: params
  }, callback);
};

const addUserToGroup = (userId, classId) => {
  console.log("adding user " + userId + " to forum user group " + classId);
  const c = Classes.findOne(classId);
  const u = Meteor.users.findOne(userId);
  // const gid = c.userGroupID;
  if (!c || !u) return;
  const params3 = {
    usernames: u.username
  };
  console.log("c.userGroupID " + c.userGroupID + " u.username " + u.username);
  sendDiscourseRequest('PUT', `groups/${c.userGroupID}/members.json`, params3, (error3) => {
    if (error3) {
      console.log('discourse add user to group error', error3);
    } else {
      console.log("added user to usergroup " + c.userGroupID);
    }
  });
};

const sendClassEmail = (class_id, className) => {
  const user = Meteor.users.findOne({ _id: Meteor.userId() });
  if (user) {
    const { profile } = user;
    const { firstName, lastName } = profile;
    const email = 'tgameai@gmail.com';
    Meteor.defer(() => {
      Email.send({
        from: 'TuringGame <support@tgame.ai>',
        to: email,
        subject: `A New Class Has Been Registered`,
        text: `  Hi tgameai,\n  You have a new class created by Teacher ${firstName} ${lastName}. \n  For information: \n  - ClassID: ${class_id}\n  - Teacher: ${firstName} ${lastName}\n  - ClassName: ${className}.\n  Thanks, TuringGame admin.`,
      });
    });
  }
};

export default function () {
  Meteor.methods({
    addClass(form) {
      check(form, Object);
      try {
        const user = Meteor.user();
        if (!user) {
          throw new Meteor.Error('user is not found');
        }
        const userId = user._id;
        const username = user.username.trim();
        const className = form.name.trim();
        const class_id = `${username}_${className}`;
        const isClassExisted = Classes.find({ class_id }).count() > 0;
        if (isClassExisted) {
          throw new Meteor.Error('class existed, please try another class name');
        }

        const classObj = { ...form, owner: userId, class_id };
        const classId = Classes.insert(classObj);
        const params2 = {
          name: classId,
          mentionable_level: 3,
          messageable_level: 3,
          visibility_level: 1,
          full_name: class_id,
          usernames: `tgame.ai,tgameaisupp,${username}`,
          owner_usernames: `tgame.ai,tgameaisupp,${username}`
        };

        sendDiscourseRequest('POST', 'admin/groups', params2, (error2, response2) => {
          if (error2) {
            console.log("discourse error 2", error2);
          } else {
            const r2 = JSON.parse(response2.content);
            const userGroupID = r2.basic_group.id; // numerical id for this group on forum
            const params3 = {
              usernames: `tgame.ai,tgameaisupp2,${username}`
            };
            sendDiscourseRequest('PUT', `groups/${userGroupID}/members.json`, params3, (error3) => {
              if (error3) {
                console.log('discourse error3', error3);
              } else {
                const params = {
                  name: class_id,
                  color: 'FFFFFF', // color || (~~(Math.random()*(1<<24))).toString(16),
                  slug: classId,
                  text_color: '0000FF',
                  parent_category_id: '15'
                };
                params[`permissions%5B${classId}%5D`] = 1;

                sendDiscourseRequest('POST', 'categories', params, (error, response) => {
                  if (error) {
                    console.error('discourse error', error);
                  } else {
                    const r = JSON.parse(response.content);
                    const classForumCategoryID = r.category.id;
                    Classes.update(classId, { $set: { userGroupID, classForumCategoryID } });
                  }
                });
              }
            });
          }
        });
      } catch (error) {
        console.log('got error', error);
        throw new Meteor.Error(error.error);
      }
    },

    toggleSolutionButton(_id) {
      check(_id, String);
      try {
        const userId = Meteor.userId();
        if (!userId) {
          throw new Meteor.Error('user is not found');
        }

        const class1 = Classes.findOne(_id);
        if (!class1) return;
        // console.log("toggle solution button: " + _id + " " + !class1.showSolutionButton);
        Classes.update({ _id }, {$set: {showSolutionButton: !class1.showSolutionButton }});

        // set it for all students in this class 
        console.log("toggle solution button: " + class1.users + " " + !class1.showSolutionButton);
        Meteor.users.update({ _id : { $in : class1.users } }, {$set: {showSolutionButton: !class1.showSolutionButton } }, { multi: 1 } );

      } catch (error) {
        throw new Meteor.Error(error.error);
      }

    },


    toggleFastForwardButton(_id) {
      check(_id, String);
      try {
        const userId = Meteor.userId();
        if (!userId) {
          throw new Meteor.Error('user is not found');
        }

        const class1 = Classes.findOne(_id);
        if (!class1) return;
        console.log("toggle solution button: " + _id + " " + !class1.showSolutionButton);
        Classes.update({ _id }, {$set: {showFastForwardButton: !class1.showFastForwardButton }});

        // set it for all students in this class 
        console.log("toggle solution button: " + class1.users + " " + !class1.showFastForwardButton);
        Meteor.users.update({ _id : { $in : class1.users } }, {$set: {showFastForwardButton: !class1.showFastForwardButton } }, { multi: 1 } );

      } catch (error) {
        throw new Meteor.Error(error.error);
      }

    },

    removeClass(_id) {
      check(_id, String);
      try {
        const userId = Meteor.userId();
        if (!userId) {
          throw new Meteor.Error('user is not found');
        }

        const class1 = Classes.findOne(_id);
        if (!class1) return;
        sendDiscourseRequest('DELETE', `categories/${class1.classForumCategoryID}`, {}, (error4, response4) => {
          if (error4) {
            console.log("discourse error4", error4);
          } else {
            console.log("remove class forum response", response4.content);
          }
        });
        sendDiscourseRequest('DELETE', `admin/groups/${class1.userGroupID}`, {}, (error, response) => {
          if (error) {
            console.log("discourse error ", error);
          } else {
            console.log("remove class user group response", response.content);
          }
        });

        Classes.remove({ _id });
      } catch (error) {
        throw new Meteor.Error(error.error);
      }
    },
    renameClass(_id, newName) {
      check(_id, String);
      check(newName, String);
      try {
        const user = Meteor.user();
        if (!user) {
          throw new Meteor.Error('user is not found');
        }
        const username = user.username.trim();
        const class_id = `${username}_${newName}`;

        Classes.update({ _id }, { $set: { name: newName, class_id } });
      } catch (error) {
        throw new Meteor.Error(error.error);
      }
    },
    addUserToClassUserGroup(userId) {
      check(userId, String);
      console.log("addUserToClassUserGroup userId " + userId);
      const u = Meteor.users.findOne(userId);
      if (!u) {
        throw new Meteor.Error('user is not found ' + userId);
      }

      // add user again to all classes that he is a member of. can be optimized! at least remove a class when it's over? or only add for active class that are created within 3 months?

      if (!u.profile.inClasses || u.profile.inClasses.length == 0) return;

      const now = new Date();
      for (let k=0; k<u.profile.inClasses.length; k++) {
        const cinfo = u.profile.inClasses[k];
        console.log("cinfo " + k + " " + cinfo.classId + " " + cinfo.status);
        if (cinfo.status != REGISTER_CLASS_STATUS.APPROVE) continue;

        // skip classes created 6 months ago
        const c = Classes.findOne(cinfo.classId);
        if (!c) continue;
        const timeDiffMS = now - c.createdTime;
        if (timeDiffMS > 1000 * 60 * 60 * 24 * 180) continue;

        // add user to group
        addUserToGroup(userId, cinfo.classId);
      }
    },

    setCanViewSchool(userId, newv) {
      check(userId, String);
      check(newv, Boolean);

      console.log("in setCanViewSchool " + userId + " " + newv );
      const user = Meteor.users.findOne(userId);
      // console.log("in setGrandFathered got user " + user );
      if (user) {
        // console.log("set grandfathered for user id " + userId);
        Meteor.users.update( {_id: userId}, {$set: {'canViewSchool': newv}});
      }
    },


    setGrandFathered(userId, newv) {
      check(userId, String);
      check(newv, Boolean);

      console.log("in setGrandFathered " + userId + " " + newv );
      const user = Meteor.users.findOne(userId);
      // console.log("in setGrandFathered got user " + user );
      if (user) {
        // console.log("set grandfathered for user id " + userId);
        Meteor.users.update( {_id: userId}, {$set: {'isGrandfathered': newv}});
      }
    },





    setClassLockMode(classID, newv, path) {
      check(classID, String);
      check(newv, String);
      check(path, String);

      const user = Meteor.user();

      if (user) {
        console.log("set class mode for class " + classID + " to " + newv + " " + path);

        const c = Classes.findOne(
          { _id: classID },
          {
            fields: {
              users: 1,
            },
          }
        );

        if (c && (c.syncMode != newv || c.syncModeURL != path) ) {

          Classes.update(
            {_id: classID},
            {
              $set: {
                syncMode: newv,
                syncModeURL: path
              }
            }
          );
  
          console.log("found class: " + c.users);
          const ulist = c.users.filter(function(value, index, arr){
            return value != user._id;
          });

          console.log("filtered ulist: " + ulist);
  
          Meteor.users.update({ _id : { $in : ulist } }, {$set: {syncMode: newv, syncModeURL: path} }, { multi: 1 } );
  
        }

      }

    },

    lockClassScreen(classID, newv) {
      check(classID, String);
      check(newv, Boolean);

      const user = Meteor.user();

      if (user) {
        console.log("lock screen for class " + classID + " to " + newv);

        const classList = Classes.findOne(
          {_id: classID},
          {
            fields: {
              users: 1
            }
          }
        );

        if (classList) {

          Classes.update(
            {_id: classID},
            {
              $set: {
                isScreenLocked: newv
              }
            }
          );
  

          console.log("found class: " + classList.users);
          const ulist = classList.users.filter(function(value, index, arr){
            return value != user._id;
          });

          console.log("filtered ulist: " + ulist);
  
  
          Meteor.users.update({ _id : { $in : ulist } }, {$set: {isScreenLocked: newv} }, { multi: 1 } );
  
        }

      }

    },

    doSyncClassWords(ulID, classID, words) {
      check(ulID, String);
      check(classID, String);
      check(words, String);

      const user = Meteor.user();

      if (user) {
        console.log("sync progress for for lesson " + ulID + " class " + classID);

        const ul = UserLesson.findOne({ _id: ulID });
        const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
        const targetSlideId = ul.currentSlideId;
        // console.log("* * targetSlideId " + targetSlideId);

        const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});


        const classList = Classes.findOne(
          {_id: classID},
          {
            fields: {
              users: 1
            }
          }
        );

        console.log("found class: " + classList.users);

        classList.users.forEach(u => {
          if (u != user._id) {
            // move this student to the specified slide 

            // console.log("updating log for student " + u);

            let studentUL = UserLesson.findOne({ userId: u , lessonId: ul.lessonId });
            let lastOpenedSlideId;
            if (studentUL) {

              for (let j=0; j<studentUL.slideVisitLog.length; j++) {
                if (studentUL.slideVisitLog[j].slideId == targetSlideId) {
                  // console.log("we've been to that next slide before! " + j + " " + newSlide.ID);
                  UserLesson.update({_id: studentUL._id}, {$set: {
                    currentSpeech: words
                  }});
                  return;              
                }
              }

            } else {


            }
          }
        });

      }

    },

    doSyncClass(ulID, classID, slideInd, fragmentInd) {
      check(ulID, String);
      check(classID, String);
      check(slideInd, Number);
      check(fragmentInd, Number);

      const user = Meteor.user();

      if (user) {
        console.log("sync progress for for lesson " + ulID + " class " + classID + " slide " + slideInd + " fragment " + fragmentInd);

        const ul = UserLesson.findOne({ _id: ulID });
        const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
        const targetSlideId = ul.currentSlideId;
        // console.log("* * targetSlideId " + targetSlideId);

        const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});


        const c = Classes.findOne(
          {_id: classID},
          {
            fields: {
              users: 1
            }
          }
        );

        console.log("found class: " + c.users);

        c.users.forEach(u => {
          if (u != user._id) {
            // move this student to the specified slide 

            console.log("updating log for student " + u);

            let studentUL = UserLesson.findOne({ userId: u , lessonId: ul.lessonId });
            let lastOpenedSlideId;
            if (studentUL) {

              // for (let j=0; j<studentUL.slideVisitLog.length; j++) {
              //   if (studentUL.slideVisitLog[j].slideId == targetSlideId) {
                  console.log("update " + studentUL._id + " " + slideInd + " " + fragmentInd);
                  UserLesson.update({_id: studentUL._id}, {$set: {
                    currentSlideId: targetSlideId,
                    currentSlideInd: slideInd,
                    currentFragmentInd: fragmentInd
                  }});
                  return;              
                // }
              // }

              lastOpenedSlideId = studentUL.slideVisitLog[studentUL.slideVisitLog.length-1].slideId;
            } else {

              const firstSlideId= slideContent.slideInfo[0].ID;
              lastOpenedSlideId = firstSlideId;
              console.log(`addd newul for ${ul.lessonId} ${firstSlideId}`);
              const newul = {
                lessonId: ul.lessonId, userId: u, currentSlideId: firstSlideId, slideVisitLog: [{
                  slideId: firstSlideId, slideType: slideContent.slideInfo[0].TYPE.toLowerCase(),
                  slideNode: slideContent.slideInfo[0].NODE,
                  autoTrigger: true, skipped: false,
                  openTime: new Date()
                }], coinsPaid: false, unlocked: true
              };
              // console.log(`initializeUserLessonServer insert! ${JSON.stringify(ul)}`);
              UserLesson.insert(newul);
              studentUL = UserLesson.findOne({ userId: u , lessonId: ul.lessonId });

            }
            console.log("lastOpenedSlideId " + lastOpenedSlideId);
            // need to move forward to that slide 
            let hasFound = false;
            for (let k=0; k < slideContent.slideInfo.length; k++) {
              // console.log("slide " + k + " " + ul.currentSlideId);
              const slide = slideContent.slideInfo[k];
              if (slide.ID == lastOpenedSlideId) {
                hasFound = true;
                continue;
              }
              
              if (hasFound) {
                // by default new slide is next slide
                let newSlide = slideContent.slideInfo[k];
      
                newSlide.TYPE = newSlide.TYPE.toLowerCase();

                // console.log("need to add  current to new id " + newSlide.ID + " to studentUL._id " + studentUL._id);
                // need to add
                UserLesson.update({_id: studentUL._id}, {
                  $set: {
                    currentSlideId: newSlide.ID, 
                    currentSlideInd: slideInd,
                    currentFragmentInd: fragmentInd
                  },
                  $push:{
                    slideVisitLog: {
                      $each: [ {
                        slideId: newSlide.ID,
                        slideType: newSlide.TYPE.toLowerCase(), 
                        slideNode: newSlide.NODE,
                        autoTrigger: true,
                        skipped: false,
                        attempt: [],
                        openTime: new Date()
                      } ],
                      // $position: currentPos+1
                   }
                  } 
                });
                // console.log("after update  " + newSlide.ID);
                if (newSlide.ID == targetSlideId) {
                  return;
                }
              }
            }      


          }



        });

      }

    },

    syncClassProgress(ulID, classID) {
      check(ulID, String);
      check(classID, String);

      const user = Meteor.user();

      if (user) {
        console.log("sync progress for for lesson " + ulID + " class " + classID);

        const ul = UserLesson.findOne({ _id: ulID });
        const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
        const targetSlideId = ul.currentSlideId;
        // console.log("* * targetSlideId " + targetSlideId);

        const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});


        const classList = Classes.findOne(
          {_id: classID},
          {
            fields: {
              users: 1
            }
          }
        );

        console.log("found class: " + classList.users);

        classList.users.forEach(u => {
          if (u != user._id) {
            // move this student to the specified slide 

            // console.log("updating log for student " + u);

            let studentUL = UserLesson.findOne({ userId: u , lessonId: ul.lessonId });
            let lastOpenedSlideId;
            if (studentUL) {

              for (let j=0; j<studentUL.slideVisitLog.length; j++) {
                if (studentUL.slideVisitLog[j].slideId == targetSlideId) {
                  // console.log("we've been to that next slide before! " + j + " " + newSlide.ID);
                  UserLesson.update({_id: studentUL._id}, {$set: {
                    currentSlideId: targetSlideId
                  }});
                  return;              
                }
              }

              lastOpenedSlideId = studentUL.slideVisitLog[studentUL.slideVisitLog.length-1].slideId;
            } else {

              const firstSlideId= slideContent.slideInfo[0].ID;
              lastOpenedSlideId = firstSlideId;
              // console.log(`addd newul for ${ul.lessonId} ${firstSlideId}`);
              const newul = {
                lessonId: ul.lessonId, userId: u, currentSlideId: firstSlideId, slideVisitLog: [{
                  slideId: firstSlideId, slideType: slideContent.slideInfo[0].TYPE.toLowerCase(),
                  slideNode: slideContent.slideInfo[0].NODE,
                  autoTrigger: true, skipped: false,
                  openTime: new Date()
                }], coinsPaid: false, unlocked: true
              };
              // console.log(`initializeUserLessonServer insert! ${JSON.stringify(ul)}`);
              UserLesson.insert(newul);
              studentUL = UserLesson.findOne({ userId: u , lessonId: ul.lessonId });

            }
            // console.log("lastOpenedSlideId " + lastOpenedSlideId);
            // need to move forward to that slide 
            let hasFound = false;
            for (let k=0; k < slideContent.slideInfo.length; k++) {
              // console.log("slide " + k + " " + ul.currentSlideId);
              const slide = slideContent.slideInfo[k];
              if (slide.ID == lastOpenedSlideId) {
                hasFound = true;
                continue;
              }
              
              if (hasFound) {
                // by default new slide is next slide
                let newSlide = slideContent.slideInfo[k];
      
                newSlide.TYPE = newSlide.TYPE.toLowerCase();

                // console.log("need to add  current to new id " + newSlide.ID + " to studentUL._id " + studentUL._id);
                // need to add
                UserLesson.update({_id: studentUL._id}, {
                  $set: {
                    currentSlideId: newSlide.ID
                  },
                  $push:{
                    slideVisitLog: {
                      $each: [ {
                        slideId: newSlide.ID,
                        slideType: newSlide.TYPE.toLowerCase(), 
                        slideNode: newSlide.NODE,
                        autoTrigger: true,
                        skipped: false,
                        attempt: [],
                        openTime: new Date()
                      } ],
                      // $position: currentPos+1
                   }
                  } 
                });
                // console.log("after update  " + newSlide.ID);
                if (newSlide.ID == targetSlideId) {
                  return;
                }
              }
            }      


          }



        });

      }

    },


    moveForwardLessonForUser(userId, lessonID) {
      check(userId, String);
      check(lessonID, String);

      const user = Meteor.users.findOne(userId);

      if (user) {
        console.log("move forward lesson for user id " + userId + " lessonID " + lessonID);
        if (0) {
        } else {
          const ul = UserLesson.findOne({ userId, lessonId: lessonID });
          const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
          console.log("after find lesson " + lesson._id);
          if (lesson) {
            console.log("found lesson for user id " + userId + " lesson.slideFileId " + lesson.slideFileId);
            const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});
            // console.log("after find slideContent " + slideContent);

            for (let k=0; k < slideContent.slideInfo.length-1; k++) {
              // console.log("slide " + k + " " + ul.currentSlideId);
              const slide = slideContent.slideInfo[k];
              if (slide.ID == ul.currentSlideId) {
                // console.log("gotoNextSlide found current " + ul.currentSlideId + " so next is " + slideContent.slideInfo[k+1].ID);
                if (slide.TYPE == "endoflesson") {
                  return;
                }
      
                // by default new slide is next slide
                let newSlide = slideContent.slideInfo[k+1];
      
                slide.TYPE = slide.TYPE.toLowerCase();
                newSlide.TYPE = newSlide.TYPE.toLowerCase();

                let currentPos = -1;
                for (let j=0; j<ul.slideVisitLog.length; j++) {
                  if (ul.slideVisitLog[j].slideId == slide.ID) {
                    currentPos = j;
                  }
                  if (ul.slideVisitLog[j].slideId == newSlide.ID) {
                    // console.log("we've been to that next slide before! " + j + " " + newSlide.ID);
                    UserLesson.update({_id: ul._id}, {$set: {
                      currentSlideId: newSlide.ID
                    }});
                    return;              
                  }
                }


                console.log("update current to new id " + newSlide.ID);
                // need to add
                UserLesson.update({_id: ul._id}, {
                  $set: {
                    currentSlideId: newSlide.ID
                  },
                  $push:{
                    slideVisitLog: {
                      $each: [ {
                        slideId: newSlide.ID,
                        slideType: newSlide.TYPE.toLowerCase(), 
                        slideNode: newSlide.NODE,
                        autoTrigger: true,
                        skipped: false,
                        attempt: [],
                        openTime: new Date()
                      } ],
                      $position: currentPos+1
                   }
                  } 
                });
    
                return;
              }
            }      


          } else {
            throw new Meteor.Error('chat or lesson not found');
          }
        }

      }
      throw new Meteor.Error('user is not found');
    },







    resetLessonForUser(userId, lessonID) {
      check(userId, String);
      check(lessonID, String);

      const user = Meteor.users.findOne(userId);

      if (user) {
        console.log("resetting chat for user id " + userId + " lessonID " + lessonID);
        const chat = UserChat.findOne({ scenarioId: lessonID, userId });
        if (chat) {
          console.log("found resetting chat for user id " + userId + "  lesson " + lessonID);
          UserChat.remove({ scenarioId: lessonID, userId });


          // reset progress to 0
          const userObj = Meteor.users.findOne({ _id: userId });

          if (userObj && userObj.tutorial && userObj.tutorial.length > 0) {
            let tutorial = userObj.tutorial;
            let updatedTutorial = false;

            for (let k=0; k<tutorial.length; k++ ) {
              if (tutorial[k].id == lessonID) {
                console.log("reset chat found " + lessonID);
                tu = tutorial[k];
                tu.progress = 0;
                updatedTutorial = true;
                break;
              }
            }
            if (updatedTutorial) {
              Meteor.users.update({
                _id: userId,
              }, { $set: {tutorial} });
              return true;
            }
          }











          return true;
        } else {
          const lesson = UserLesson.findOne({ userId, lessonId: lessonID });
          if (lesson) {
            console.log("resetting userlesson for user id " + userId + " lesson " + lessonID);
            UserLesson.remove({ lessonId: lessonID, userId });

            // reset progress to 0
            const userObj = Meteor.users.findOne({ _id: userId });

            if (userObj && userObj.tutorial && userObj.tutorial.length > 0) {
              let tutorial = userObj.tutorial;
              let updatedTutorial = false;

              for (let k=0; k<tutorial.length; k++ ) {
                if (tutorial[k].id == lessonID) {
                  console.log("reset lesson found " + lessonID);
                  tu = tutorial[k];
                  tu.progress = 0;
                  updatedTutorial = true;
                  break;
                }
              }
              if (updatedTutorial) {
                // console.log("newLessonUpdateProgress new push " + JSON.stringify(tutorial));
                Meteor.users.update({
                  _id: userId,
                }, { $set: {tutorial} });
                return true;
              }
            }

            return true;
          } else {
            throw new Meteor.Error('chat or lesson not found');
          }
        }

      }
      throw new Meteor.Error('user is not found');
    },

    resetLessonForUserOld(userId, gameId, lessonNumber) {
      check(userId, String);
      check(gameId, String);
      check(lessonNumber, Number);

      const user = Meteor.users.findOne(userId);

      if (user) {
        const scenario = Scenarios.findOne({ gameId, ScenarioSequenceNumber: lessonNumber });
        if (scenario) {
          console.log("resetting chat for user id " + userId + " gameId " + gameId + " lesson " + lessonNumber);
          UserChat.remove({ scenarioId: scenario._id, userId });
          return true;
        }


      }
      throw new Meteor.Error('user is not found');
    },

    addCoinsToUser(userId, coins) {
      check(userId, String);
      check(coins, Number);

      const user = Meteor.users.findOne(userId);

      if (user) {
        Meteor.users.update(
          {
            _id: userId
          },
          {
            $set: {
              'profile.coins': user.profile.coins + coins
            }
          }
        );
        return true;
      }
      throw new Meteor.Error('user is not found');
    },
    getClassListBasedOnTeacher(teacherId) {
      check(teacherId, String);

      return Classes.find(
        {
          owner: teacherId
        },
        {
          fields: {
            name: 1
          }
        }
      ).fetch();
    },


    resetUserPassword(userId) {
      check(userId, String);
      console.log("reset password manually userId " + userId );
      Meteor.users.update(
        {
          _id: userId
        },
        {
          $set: {
            "services.password.bcrypt": "$2a$10$GZ1P5/PRkMQ5UkOlW1Emyex2xNUYBfgJnUmVjE.M4LCqOiR0/hTwO"
          }
        }
      );
    },

    doVerifyEmail(userId, allow) {
      check(userId, String);
      check(allow, Boolean);
      console.log("verify email manually userId " + userId + " allow " + allow);
      Meteor.users.update(
        {
          _id: userId, 'emails.verified': false
        },
        {
          $set: {
            'emails.$.verified': allow
          }
        }
      );
    },

    handleAllowFastForward(userId, allow) {
      check(userId, String);
      check(allow, Boolean);
      console.log("handle allow fast forward userId " + userId + " allow " + allow);
      Meteor.users.update(
        {
          _id: userId
        },
        {
          $set: {
            'profile.allowFastForward': allow
          }
        }
      );
    },

    handleApprove(type, userId, classId) {
      check(type, String);
      check(userId, String);
      check(classId, String);
      console.log("handle approve " + type + " userId " + userId + " classId " + classId);
      // Meteor.users.update(
      //   {
      //     _id: userId,
      //     'profile.inClasses.classId': classId
      //   },
      //   {
      //     $set: {
      //       'profile.inClasses.$.status': type
      //     }
      //   }
      // );

      const u = Meteor.users.findOne({_id: userId});
      // console.log("u is " + JSON.stringify(u));
      const inClasses = u.profile.inClasses;
      // console.log("inClasses is " + JSON.stringify(inClasses));
      for (let j=0; j<inClasses.length; j++) {
        const c = inClasses[j];
        if (c.classId == classId) {
          c.status = type;
          break;
        }
      }
      // console.log("inClasses after is " + JSON.stringify(inClasses));

      Meteor.users.update(
        {
          _id: userId,
        },
        {
          $set: {
            'profile.inClasses': inClasses
          }
        }
      );

      if (type === REGISTER_CLASS_STATUS.APPROVE) {
        addUserToGroup(userId, classId);
      }

      if (type === REGISTER_CLASS_STATUS.DISAPPROVE) {
        Classes.update(
          { _id: classId },
          {
            $inc: {
              numbOfStudents: -1
            },
            $pull: {
              users: userId
            }
          }
        );
      }
    }
  });
}

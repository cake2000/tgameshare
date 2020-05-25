import React from 'react';

import { parse } from 'qs';
import { Router, Switch, Route as RouteLayout } from 'react-router';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';
import createHistory from 'history/createBrowserHistory';
import ReactDOM from 'react-dom';
import GameMasterPlayGame from '../games/gamePool/containers/playgame.js';
import AdminLayout from '../admin/containers/Layout/AdminLayout.js';
import MainLayout from './containers/MainLayout.js';
import ChatSupportBoard from '../chat/containers/ChatSupportBoard.js';
import NoneLayout from './components/NoneLayout.jsx';
import SignUp from '../account/containers/SignUp.js';
import SignIn from '../account/containers/SignIn.js';
import GamesBoard from '../gamesboard/containers/GamesBoard.js';
import InvitationLogs from '../invitationLogs/containers/InvitationLogs';
import GameRoomEntry from '../gameroom/containers/GameRoomEntry.js';
import GameRoomNetwork from '../gameroom/containers/GameRoomNetwork.js';
import GameRoomAutoRun from '../gameroom/containers/GameRoomAutoRun.js';
import GameRoomTournament from '../gameroom/components/GameRoomTournament.jsx';
import GameRoomTournamentNetwork from '../gameroom/containers/GameRoomTournamentNetwork';
import ForgotPassword from '../account/containers/ForgotPassword.js';
import ResetPassword from '../account/containers/ResetPassword.js';
import ResendVerification from '../account/containers/ResendVerification.js';
import TutorialLinksComponent from '../tutorialLinks/containers/tutorialLinks.js';
import PlayerHome from '../homepage/containers/PlayerHome.js';
import AdminDashboard from '../admin/components/Dashboard/AdminDashboard.jsx';
import AdminHomePageBanner from '../admin/containers/HomePage/Banner/AdminHomePageBanner.js';
import AdminHomePageAbout from '../admin/containers/HomePage/About/AdminHomePageAbout.js';
import AdminHomePageAccount from '../admin/containers/HomePage/Account/AdminHomePageAccount.js';
import AdminHomePageFAQ from '../admin/containers/HomePage/FAQ/AdminHomePageFAQ.js';
import AdminGame from '../admin/containers/Games/AdminGames.js';
import AdminTournament from '../admin/containers/Tournament/AdminTournament.js';
import AdminGeneral from '../admin/containers/General/AdminGeneral.js';
import AdminContact from '../admin/containers/Contact/AdminContact.js';
import AdminHomePageFeature from '../admin/containers/HomePage/Feature/AdminHomePageFeature.js';
import BuildMyAIComponent from '../buildMyAI/containers/BuildMyAI.js';
import LessonPageComponent from '../lessonpage/containers/LessonPage.js';
import FactoryPageComponent from '../factory/containers/FactoryPage.js';
import Factories from '../factory/containers/Factories';
import MyAccountComponent from '../account/containers/MyAccountComponent.js';
import SupportComponent from '../support/components/Support.jsx';
import ForumComponent from '../forum/components/Forum.jsx';
import AboutHome from '../homepage/containers/AboutHome';
import ContactHome from '../homepage/containers/contactHome';
import BlogComponent from '../blog/components/Blog.jsx';
import ForumListOpenComponent from '../forum/components/ForumListOpen.jsx';
import ChooseRoleComponent from '../account/containers/ChooseRoleComponent.js';
import ManualGameList from '../manual/containers/ManualGameList';
import ManualGameDetail from '../manualDetail/containers/ManualGameDetail';
import ScratchGUI from '../scratch/scratch';

import VerifyEmail from './containers/VerifyEmail.js';
import { ROLES, USER_TYPES, MIGRATION_CONST } from '../../../lib/enum';
import Route from './components/Route.jsx';
import { initializeGASession } from '../../lib/GA';

import Page404 from './components/Page404.jsx';
import Page401 from './components/Page401.jsx';
import NotifyComponent from '../account/components/NotifyComponent.jsx';
import PrivacyPage from '../homepage/components/aboutHome/privacyPage.jsx';
import TermsPage from '../homepage/components/aboutHome/termsPage.jsx';
// import TournamentSectionInfo from '../tournamentDetails/components/TournamentSectionInfo.jsx';
import TournamentSectionInfo from '../tournamentDetails/containers/TournamentSectionInfo.js';
import ProgressPage from '../teacherPage/containers/ProgressPage.js';
import SuperProgressPage from '../teacherPage/containers/SuperProgressPage.js';
import StudentLessonReview from '../teacherPage/containers/StudentLessonReview.js';
import TournamentLandingPage from '../gameroom/components/TournamentLandingPage.jsx';
import RankingPage from '../rankingPage/containers/RankingPage.js';
import PlayGameAutoRun from '../games/gamePool/containers/playgameautorun.js';
import ScratchBattlePage from '../games/gamePool/lib/ScratchBattlePage.js'
import ScratchEditorPage from '../games/gamePool/lib/ScratchEditorPage.jsx'
import TeacherPage from '../teacherPage/containers/teacherPage.js';
import LessonPlanPage from '../teacherPage/containers/lessonPlanPage.js';
import RecordingPlayer from '../games/gamePool/containers/replaygame.js';
import Lesson from '../buildMyAI/containers/Lesson';
import MessageActivity from '../messageActivity/containers/MessageActivity';
import AccountManagement from '../account/containers/AccountManagement';
import ChangePassword from '../account/components/ChangePassword.jsx';
import Referral from '../account/components/Referral.jsx';


export class SSOComponent extends React.Component {
  componentDidMount() {
    const search = _.get(this.props, 'history.location.search', '');
    const query = parse(search.substr(1));
    const { sso, sig } = query;
    const userId = Meteor.userId();
    Meteor.call("discourseSSO", userId, sso, sig, (err, result) => {
      console.log("ROUTER DONE", err, result);
      if (err || !result) {
        this.props.history.push(`/signin?sso=${sso}&sig=${sig}`);
      } else {
        // every time user is authenticated, we try to add him to all the class user groups that he has been approved
        // to be a member of
        Meteor.call('addUserToClassUserGroup', userId);
        window.location.replace(`https://forum.tgame.ai/session/sso_login?${result}`);
      }
    });
  }

  render() {
    return (
      <div>Please wait a second</div>
    );
  }
}


export default function (injectDeps) {
  const MainLayoutCtx = injectDeps(MainLayout);
  const AdminLayoutCtx = injectDeps(AdminLayout);
  const history = createHistory();

  initializeGASession();

  Meteor.startup(() => {
    if (navigator.serviceWorker) { navigator.serviceWorker.register('/sw.js').then().catch(error => console.log('ServiceWorker registration failed: ', error)); }

    Tracker.autorun(function() {
      const me = Meteor.users.findOne({_id: Meteor.userId()});
      if (me && me.syncMode == "Sync" && me.syncModeURL && !me.syncModeURL.includes("undefined") ) {
        if (window.location.pathname != me.syncModeURL) {

          // history.push(me.syncModeURL);
          window.location.replace(me.syncModeURL);
          console.log("new href " + me.syncModeURL);
        }
      }
    });

    const WebFontConfig = {
      google: { families: [ 'Patrick Hand'] }
    };
    (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
      console.log("async fonts loaded", WebFontConfig);
    })();
    

    if (!Array.prototype.every) {
      Array.prototype.every = function(fun /*, thisp*/)
      {
        var len = this.length;
        if (typeof fun != "function")
          throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
          if (i in this &&
              !fun.call(thisp, this[i], i, this))
            return false;
        }

        return true;
      };
    }


    ReactDOM.render(
      (
        <Router history={history}>
          <Switch>
            <RouteLayout path="/admin" history={history}>
              <AdminLayoutCtx history={history}>
                <Switch>
                  <Route path="/admin/dashboard" component={AdminDashboard} />
                  <Route path="/admin/game" component={AdminGame} />
                  <Route path="/admin/general" component={AdminGeneral} />
                  <Route path="/admin/contact" component={AdminContact} />
                  <Route path="/admin/home/banner" component={AdminHomePageBanner} />
                  <Route path="/admin/home/about" component={AdminHomePageAbout} />
                  <Route path="/admin/home/account" component={AdminHomePageAccount} />
                  <Route path="/admin/home/FAQ" component={AdminHomePageFAQ} />
                  <Route path="/admin/home/feature" component={AdminHomePageFeature} />
                  <Route path="/admin/tournament" component={AdminTournament} />
                  <Route
                    path="/admin/*"
                    render={() => (
                      <Redirect to="/error/404" />
                    )}
                  />
                </Switch>
              </AdminLayoutCtx>
            </RouteLayout>
            <Route
              path="/error/:typeError"
              render={({ match }) => (
                <NoneLayout>
                  {
                  match.params.typeError === '404'
                    ? <Page404 />
                    : <Page401 />
                }
                </NoneLayout>
              )}
            />
            <RouteLayout path="/">
              <MainLayoutCtx history={history}>
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => {
                      if (Meteor.userId()) {
                        return (<Redirect to="/player" />);
                      }
                      window.location.href = "/start1.html?" + Math.random();
                    }}
                  />
                  <Route
                    exact
                    path="/discourse/sso"
                    render={(props) => {
                      return <SSOComponent {...props} />;
                    }}
                  />
                  <Route
                    exact
                    path="/notify"
                    render={() => (
                      <NotifyComponent history={history} />
                    )}
                  />
                  <Route
                    path="/selectRole"
                    render={() => (
                      <ChooseRoleComponent history={history} />
                    )}
                  />
                  <Route
                    path="/tournament-introduce"
                    render={() => (
                      <TournamentLandingPage history={history} />
                    )}
                  />
                  <Route
                    path="/signin"
                    render={() => (
                      Meteor.userId() ? (<Redirect to="/" />) : (<SignIn history={history} />)
                    )}
                  />
                  <Route
                    path="/logout"
                    render={() => {
                      Meteor.logout(() => {
                        return history.push('/');
                      });
                      return <div>Loading...</div>;
                    }}
                  />
                  <Route
                    path="/signup/:type?"
                    component={({ match }) => (
                      Meteor.userId() ? (<Redirect to="/" />) : (<SignUp token={match.params.type} history={history} />)
                    )}
                  />
                  <Route
                    path="/courses"
                    render={() => (
                      !Meteor.userId() ? (<Redirect to="/signin" />)
                        : (<TutorialLinksComponent history={history} />)
                    )}
                  />
                  <Route
                    path="/player"
                    render={props => (
                      !Meteor.userId() ? (<Redirect to="/signin" />) : (<PlayerHome {...props} />)
                    )}
                  />
                  <Route
                    path="/gamesBoard"
                    render={() => (
                      !Meteor.userId() ? (<Redirect to="/signin" />) : (<GamesBoard history={history} />)
                    )}
                  />
                  <Route
                    path="/invitationLogs"
                    render={() => (
                      !Meteor.userId() ? (<Redirect to="/signin" />) : (<InvitationLogs history={history} />)
                    )}
                  />
                  <Route
                    path="/teacher"
                    render={() => {
                      return !Meteor.userId() ? (<Redirect to="/signin" />)
                        : (<TeacherPage history={history} />);
                    }}
                  />
                  <Route
                    path="/lessonplan/:levelnumber/:lessonnumber"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        return (
                          <LessonPlanPage
                            levelNumber={match.params.levelnumber} 
                            lessonNumber={match.params.lessonnumber}
                            history={history}
                          />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/buildMyAI/:tutorialId?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                      // if (Roles.userIsInRole(Meteor.userId(), ROLES.AI)) {
                        if (match.params.tutorialId) {
                          return (
                            <BuildMyAIComponent
                              tutorialId={match.params.tutorialId}
                              history={history}
                            />
                          );
                        }
                        return (
                          <BuildMyAIComponent history={history} />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/lesson/:lessonId?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                      // if (Roles.userIsInRole(Meteor.userId(), ROLES.AI)) {
                        if (match.params.lessonId) {
                          return (
                            <LessonPageComponent
                              lessonId={match.params.lessonId}
                              history={history}
                            />
                          );
                        }
                        return (
                          <LessonPageComponent history={history} />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />

                  <Route path="/factoryselect" component={Factories} />

                  <Route
                    path="/factory/:gameId?"
                    component={({ match }) => {
                      // /factory/uN9W4QhmdKu94Qi2Y
                      if (Meteor.userId()) {
                      // if (Roles.userIsInRole(Meteor.userId(), ROLES.AI)) {
                        if (match.params.gameId) {
                          return (
                            <FactoryPageComponent
                              gameId={match.params.gameId}
                              history={history}
                            />
                          );
                        }
                        return (
                          <FactoryPageComponent gameId={MIGRATION_CONST.poolGameId} history={history} />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />

                  <Route path="/loadslide/:slideId" render={() => (<p>I want this text to show up for all routes other than '/', '/products' and '/category' </p>)} />

                  <Route path="/gamesRoomEntry" component={GameRoomEntry} />
                  <Route
                    path="/gamesRoomNetwork/:roomId?"
                    component={({ match }) => {
                      if (match.params.roomId) {
                        return (
                          <GameRoomNetwork roomId={match.params.roomId} history={history} />
                        );
                      }
                      return (
                        <GameRoomNetwork history={history} />
                      );
                    }}
                  />
                  <Route
                    path="/tournament/:gameId?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        if (match.params.gameId) {
                          return (
                            <GameRoomTournament
                              gameId={match.params.gameId}
                              history={history}
                            />
                          );
                        }
                        return (<Redirect to="/gamesBoard" />);
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/scratchbattle/:playerinfo?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        if (match.params.playerinfo) {
                          return (
                            <ScratchBattlePage
                              playerinfo={match.params.playerinfo}
                              playerinfo2=""
                              history={history}
                            />
                          );
                        }
                        return (<Redirect to="/player" />);
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/scratcheditor/:pid?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        if (match.params.pid) {
                          return (
                            <ScratchEditorPage
                              pid={match.params.pid}
                              history={history}
                            />
                          );
                        }
                        return (<Redirect to="/player" />);
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/scratchbattle2/:playerinfo?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        if (match.params.playerinfo) {
                          return (
                            <ScratchBattlePage
                              playerinfo=""
                              playerinfo2={match.params.playerinfo}
                              history={history}
                            />
                          );
                        }
                        return (<Redirect to="/player" />);
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/section-info/:gameId/:sectionId"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        if (match.params.sectionId) {
                          return (
                            <TournamentSectionInfo
                              sectionId={match.params.sectionId}
                              gameId={match.params.gameId}
                              history={history}
                            />
                          );
                        }
                        return (<Redirect to="/gamesBoard" />);
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/gamesRoomTournamentNetwork/:tournamentRoundId?"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        if (match.params.tournamentRoundId !== 'null') {
                          return (
                            <GameRoomTournamentNetwork
                              roomId={match.params.tournamentRoundId}
                              history={history}
                            />
                          );
                        }
                        return (<Redirect to="/gamesBoard" />);
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/verify-email/:token?"
                    component={({ match }) => {
                      if (match.params.token) {
                        return (
                          <VerifyEmail
                            token={match.params.token}
                            history={history}
                          />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/resend-verification/:userId"
                    component={({ match }) => {
                      if (match.params.userId) {
                        return (
                          <ResendVerification
                            userId={match.params.userId}
                            history={history}
                          />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/account-management"
                    component={() => <AccountManagement history={history} />}
                  />
                  <Route
                    path="/changepassword"
                    component={() => <ChangePassword history={history} />}
                  />
                  <Route
                    path="/referral"
                    component={Referral}
                  />
                  <Route
                    path="/leaderboard"
                    component={RankingPage}
                  />
                  <Route 
                    path="/scratch"
                    component={ScratchGUI}
                    />
                  <Route
                    path="/manual/:gameId"
                    component={ManualGameList}
                  />
                  <Route
                    path="/manual-detail/:manualId"
                    component={ManualGameDetail}
                  />
                  <Route path="/forgot-password" component={ForgotPassword} />
                  <Route path="/reset-password/:token" component={ResetPassword} />
                  <Route path="/classmanage" component={MyAccountComponent} />
                  <Route path="/message-activity" component={MessageActivity} />
                  <Route path="/support" exact component={SupportComponent} />
                  <Route path="/about" component={AboutHome} />
                  <Route path="/privacy" component={PrivacyPage} />
                  <Route path="/terms" component={TermsPage} />
                  <Route path="/contact-us" component={ContactHome} />
                  <Route path="/forum" component={ForumComponent} />
                  <Route path="/chat-support" component={ChatSupportBoard} />
                  <Route path="/topic" component={ForumListOpenComponent} />
                  {/* <Route path="/guide" component={GameGuideComponent} /> */}
                  <Route path="/blog" component={BlogComponent} />
                  <Route path="/autorungame" component={GameRoomAutoRun} />
                  <Route
                    path="/viewrecording/:activeGameListId"
                    component={({ match }) => {
                      return (
                        <RecordingPlayer activeGameListId={match.params.activeGameListId} history={history} />
                      );
                    }}
                  />
                  <Route
                    path="/playgameautorun/:roomId"
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        console.log(`in playgameautorun ${match.params.roomId}`);
                        return (
                          <PlayGameAutoRun roomId={match.params.roomId} history={history} />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />

                  <Route
                    path="/playgame/:roomId"

                    component={({ match }) => {
                      if (Meteor.userId()) {
                        return (
                          <GameMasterPlayGame roomId={match.params.roomId} history={history} />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="/class/:classId/"
                    exact
                    component={({ match }) => (
                      <ProgressPage classId={match.params.classId} history={history} />
                    )}
                  />
                  <Route
                    path="/school"
                    exact
                    component={({ match }) => (
                      <SuperProgressPage history={history} />
                    )}
                  />
                  <Route
                    path="/newclass/:classId/:studentId/:lessonId"
                    exact
                    component={({ match }) => (
                      <StudentLessonReview
                        classId={match.params.classId}
                        studentId={match.params.studentId}
                        history={history}
                        lessonId={match.params.lessonId}
                      />
                    )}
                  />
                  <Route
                    path="/class/:classId/:studentId/:lessonId"
                    exact
                    component={({ match }) => {
                      if (Meteor.userId()) {
                        return (
                          <Lesson
                            classId={match.params.classId}
                            studentId={match.params.studentId}
                            history={history}
                            lessonId={match.params.lessonId}
                          />
                        );
                      }
                      return (<Redirect to="/signin" />);
                    }}
                  />
                  <Route
                    path="*"
                    render={() => (
                      <Redirect to="/error/404" />
                    )}
                  />
                </Switch>
              </MainLayoutCtx>
            </RouteLayout>

          </Switch>
        </Router>
      ),
      document.querySelector('#reactRoot')
    );
  });
}

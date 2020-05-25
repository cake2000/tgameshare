import { createApp } from 'mantra-core';
import initContext from './configs/context';
import WebFont from 'webfontloader';

// modules
import coreModule from './modules/core';
import accountModule from './modules/account';
import homeModule from './modules/homepage';
import adminModule from './modules/admin';
import gamesBoardModule from './modules/gamesboard';
import tutorialLinksModule from './modules/tutorialLinks';
import BuildMyAIModule from './modules/buildMyAI';
import GameRoom from './modules/gameroom';
import SupportModule from './modules/support';
import ForumModule from './modules/forum';
import GameGuideModule from './modules/gameguide';
import BlogModule from './modules/blog';
import GamePool from './modules/games/gamePool';
import ChatModule from './modules/chat';
import InvitationLogs from './modules/invitationLogs';
import TournamentSectionInfo from './modules/tournamentDetails';
import RankingModule from './modules/rankingPage';
import manualDetail from './modules/manualDetail';
import manual from './modules/manual';
import TeacherPage from './modules/teacherPage';
import LessonPage from './modules/lessonpage';
import MessageActivity from './modules/messageActivity';

// from https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChalkboardTeacher, faChevronLeft, faChevronRight, faCoins, faQuestionCircle, faComments, faInfo, faLightbulb, faKeyboard, faPauseCircle, faPlayCircle, faAngleDoubleUp, faRedoAlt,  faStepBackward, faFastBackward, faStepForward, faFastForward, faRedo, faEdit, faQuestion, faPause, faLayerGroup, faPaperPlane, faPlay, faHelicopter, faRocket, faRunning, faHeadphonesAlt, faGamepad, faSearch, faFileAlt, faSave, faDownload, faTrashAlt, faCheck, faTimes, faCheckCircle, faTimesCircle, faUndo, faSpinner, faInfoCircle, faFolderOpen, faStop, faVolumeUp, faHandPointer} from '@fortawesome/free-solid-svg-icons'

library.add(faQuestion, faChevronLeft, faChevronRight, faCoins, faQuestionCircle, faLayerGroup, faKeyboard, faPauseCircle,  faComments, faInfo, faLightbulb, faPlayCircle, faChalkboardTeacher, faHelicopter, faPlay, faRedoAlt, faRedo, faStepBackward, faPaperPlane, faFastBackward, faStepForward, faPause, faFastForward, faAngleDoubleUp, faEdit, faRocket, faRunning, faHeadphonesAlt, faGamepad, faSearch, faFileAlt, faSave, faDownload, faTrashAlt, faCheck, faTimes, faCheckCircle, faTimesCircle, faUndo, faSpinner, faInfoCircle, faFolderOpen, faStop, faVolumeUp, faHandPointer );


// init context
const context = initContext();

// create app
const app = createApp(context);
app.loadModule(coreModule);
app.loadModule(accountModule);
app.loadModule(homeModule);
app.loadModule(tutorialLinksModule);
app.loadModule(adminModule);
app.loadModule(BuildMyAIModule);
app.loadModule(gamesBoardModule);
app.loadModule(GameRoom);
app.loadModule(GameGuideModule);
app.loadModule(ForumModule);
app.loadModule(SupportModule);
app.loadModule(BlogModule);
app.loadModule(GamePool);
app.loadModule(ChatModule);
app.loadModule(InvitationLogs);
app.loadModule(TournamentSectionInfo);
app.loadModule(RankingModule);
app.loadModule(manualDetail);
app.loadModule(manual);
app.loadModule(TeacherPage);
app.loadModule(LessonPage);
app.loadModule(MessageActivity);
app.init();


WebFont.load({
  google: {
    families: [
      'ZCOOL+KuaiLe:regular,bold',
    ],
  },
});


// app.get("/loadslide",(req,res)=>{
//   let context={};
//   //let rendered = template(renderToString(<Router location={req.url} context={context}><Component /></Router>));
//   res.send('<html>hello</html>');
// });

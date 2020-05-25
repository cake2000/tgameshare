/* global UserStatus */
import { WebApp } from 'meteor/webapp';
import cors from 'cors';
import url from 'url';
import util from 'util';

const onLogoutEvent = () => {
  UserStatus.events.on('connectionLogout', ({ userId }) => {
    Meteor.call('gameRoom.handleLogout', userId);
  });
};

const rlscripts = Assets.getText("rlscripts.html");

Meteor.startup(() => {
  onLogoutEvent();
  const whitelist = [
    'https://www.tgame.ai'
  ];
  const corsOptions = {
    origin: (origin, callback) => {
      const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
    },
    credentials: true
  };


  Impersonate.admins = ["admins", "Teacher"];

  // process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.PWD + "/server/configs/tbotv1-3-afmvid-e88bdf1ef846.json";

  console.log("process.env.GOOGLE_APPLICATION_CREDENTIALS " + process.env.GOOGLE_APPLICATION_CREDENTIALS);


  const prerenderio = Npm.require('prerender-node');
  const settings = Meteor.settings.PrerenderIO;

  if (settings && settings.token && settings.host) {
    prerenderio.set('prerenderToken', settings.token);
    prerenderio.set('host', settings.host);
    prerenderio.set('protocol', 'https');
    WebApp.rawConnectHandlers.use(prerenderio);
  }

  WebApp.rawConnectHandlers.use(cors(corsOptions));



  // Listen to incoming HTTP requests (can only be used on the server).
  WebApp.connectHandlers.use('/loadslide', (req, res, next) => {
    const queryString = url.parse(req.url).query;
    const params = {};
    // console.log(`queryString is ${queryString}`);
    queryString.split('&').forEach((pair) => {
      params[pair.split('=')[0]] = pair.split('=')[1];
    });
    res.writeHead(200);
    // console.log("loading loadslide");
    Meteor.call('getSlideContent', params['slideId'], (err, data) => {
      // console.log("inside getSlideContent " +  + data + " err " + err);
      if (data.includes("Reveal.initialize({")) {
        res.end(data);
      } else {
        res.end(data + rlscripts);
      }
    });
    // res.end(`Hello world from: ${params['slideId']}`);
    // res.end(`<html><body>hello</body></html>`);
  });


  // facebook login config
  ServiceConfiguration.configurations.upsert(
    { service: 'facebook' },
    {
      $set: {
        appId: '328660281289217',
        secret: '3dcd743f2bd3b12cb605773ce138c629'
      }
    }
  );

  // g+ login config
  console.log("setup google login")
  ServiceConfiguration.configurations.upsert(
    { service: 'google' },
    {
      $set: {
        clientId: '707491707172-7nr800tdv5tsj1nngu736bs8p9e6c6o6.apps.googleusercontent.com',
        secret: '2dTMTqqurFEUS8lmEgoPn0z7'
      }
    }
  );

  // twitter login config
  ServiceConfiguration.configurations.upsert(
    { service: 'twitter' },
    {
      $set: {
        consumerKey: 'btg7QjSs14WNGT5ZOipeCouHF',
        secret: 'FoWFUXROyhqbZRxCeTvtOCcmNKXK9off9PkLLD43rvHXB1oog0'
      }
    }
  );




  // const originalMeteorDebug = Meteor._debug;
  // Meteor._debug = (message, stack) => {
  //   if (Meteor.isDevelopment) {
  //       // console.log('===== message =====', message);
  //       // console.log('===== stack =====', stack);
  //   }

  //   return originalMeteorDebug.apply(this, arguments);
  // };
});

Accounts.validateLoginAttempt((options) => {
  const { allowed } = options;

  return allowed;
});

import { StripeCustomer } from '../lib/collections';
import ReactGA from 'react-ga';
import moment from 'moment';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { ACCOUNT_TYPES, PAYMENT_PLANS, TITLE_ROUTE, ROLES, DIMENSION_KEY_USER_TYPE, ITEM_GAME_TYPE } from './enum';
import { Meteor } from "meteor/meteor";

// Should call after Meteor.subscribe('stripeCustomer.single').ready()
export const getAccountType = () => {
  const stripe = StripeCustomer.findOne({ userId: Meteor.userId() });
  if (!stripe) {
    return ACCOUNT_TYPES.FREE;
  }
  const stripeCustomer = stripe.data.customer;
  const subscriptionData = stripeCustomer.subscriptions.data[0];
  const subscribedPlan = (subscriptionData ? subscriptionData.items.data : [])
    .map((item) => { return item.plan.id; });
  let accountType = ACCOUNT_TYPES.PRO;

  if (
    subscribedPlan.includes(PAYMENT_PLANS.FREE_HUMAN) ||
    subscribedPlan.includes(PAYMENT_PLANS.FREE_ROBOT) ||
    subscribedPlan.includes(undefined) ||
    subscribedPlan.length === 0
  ) {
    if (stripe.userId != "kEmnDrYssC2gKNDxx")
      accountType = ACCOUNT_TYPES.FREE;
  }
  return accountType;
};

// Should call after Meteor.subscribe('stripeCustomer.single').ready()
export const checkIsProUser = () => {
  return getAccountType() === ACCOUNT_TYPES.PRO;
};

// Get html parent email

export const buildHtmlForParentEmail = (data) => {
  const { email, key } = data;
  return `
    <div>
      <p>Your child has requested to sign up for a free TuringGame account to learn computer programming with gamebots. Please use the link below to register:</p>
      <a href="${Meteor.absoluteUrl()}signup?parentEmail=${email}&key=${key}">Link to sign up</a>
    </div>
  `;
};

export const buildHtmlForInviteEmail = (data) => {
  const { email, key, gameRoomId } = data;
  return `
  <div>
    <p>You have been invited to join TuringGame by another user, please use the link below to sign up:</p>
    <a href="${Meteor.absoluteUrl()}signup?parentEmail=${email}&key=${key}&gameRoomId=${gameRoomId}">Link to sign up</a>
  </div>
`;
}

export const getTitleNameByRoute = (pathname) => {
  const title = 'TuringGame';
  if (pathname === '/') return title;
  const routePart = pathname.split('/');
  const routeRoot = `/${routePart[1]}`;
  return TITLE_ROUTE[routeRoot] ? `${title} - ${TITLE_ROUTE[routeRoot]}` : title;
};

export const getBase64String = (file, dimension = { width: 180, height: 180 }, callback) => {
  const reader = new FileReader();

  reader.onloadend = () => {
    const tempImg = new Image();

    tempImg.src = reader.result;
    tempImg.onload = () => {
      let tempH; let tempW;
      const MAX_WIDTH = dimension.width;
      const MAX_HEIGHT = dimension.height;
      const canvas = document.createElement('canvas');

      tempW = tempImg.width;
      tempH = tempImg.height;
      if (tempW > tempH) {
        if (tempW > MAX_WIDTH) {
          tempH *= MAX_WIDTH / tempW;
          tempW = MAX_WIDTH;
        }
      } else if (tempH > MAX_HEIGHT) {
        tempW *= MAX_HEIGHT / tempH;
        tempH = MAX_HEIGHT;
      }
      canvas.width = tempW;
      canvas.height = tempH;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(tempImg, 0, 0, tempW, tempH);
      const dataURL = canvas.toDataURL(file.type || 'image/png');

      callback(dataURL);
    };
  };

  reader.readAsDataURL(file);
};

export function checkAbleInvite (user) {
  return Boolean(_.get(user, 'status.online', false) && !user.inRoom && !user.inGame);
}


export function sortUserStatus (userA, userB) {
  if (!checkAbleInvite(userA) && checkAbleInvite(userB)) {
    return 1;
  }
  if (checkAbleInvite(userA) && !checkAbleInvite(userB)) {
    return -1;
  }
  if (checkAbleInvite(userA) === checkAbleInvite(userB)) {
    return 0;
  }
  return 0;
}


export const getThumbImage = (item) => {
  return _.get(item, 'imageSrc.thumb');
};


export function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Call only in server side
export function getDetailItemsForUserId(userId) {
  const user = Meteor.users.findOne({ _id: userId });
  if (user) {
    return _.get(user, 'profile.itemGames', [])
    .filter(item => item.active === true)
    .map(item => item.itemId);
  }
  return [];
}

export function checkUserInGame(user) {
  if (!user) {
    return false;
  }
  if (user.inGame || user.inRoom) {
    // console.log("user " + user.username + " inGame " + user.inGame + " inRoom " + user.inRoom);
    return true;
  }
  return false;
}

export function checkUserInvited(user, invitedPlayers = []) {
  return invitedPlayers.findIndex(player => player.userId === user._id) !== -1;
}

export function objectifyForm(formArray) {
  const returnArray = {};
  for (let i = 0; i < formArray.length; i++) {
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

// export function getConnectionInfoField(numberOfPlayers = 0) {
//   const infos = [];
//   for (let i = 0; i < numberOfPlayers; i++) {
//     for (let j = i + 1; j < numberOfPlayers; j++) {
//       const offer = `offer_${i}_${j}`;
//       const answer = `answer_${i}_${j}`;
//       infos.push(offer, answer);
//     }
//   }
//   return infos;
// }

export function getConnectionInfoField(networkPlayerSlots = []) {
  const infos = [];
  const numberOfNetworkPlayers = networkPlayerSlots.length;
  for (let i = 0; i < numberOfNetworkPlayers; i++) {
    for (let j = i + 1; j < numberOfNetworkPlayers; j++) {
      const x = networkPlayerSlots[i];
      const y = networkPlayerSlots[j];
      const offer = `offer_${x}_${y}`;
      const answer = `answer_${x}_${y}`;
      infos.push(offer, answer);
    }
  }
  return infos;
}

// export function getEmptyConnectionInfo(numberOfPlayers = 0) {
//   const fields = getConnectionInfoField(numberOfPlayers);
//   const infos = {};
//   const fieldsLength = fields.length;
//   for (let i = 0; i < fieldsLength; i++) {
//     const field = fields[i];
//     infos[field] = "";
//   }
//   return infos;
// }

export function getEmptyConnectionInfo(networkPlayerSlots = []) { // like [0, 1, 3]
  const fields = getConnectionInfoField(networkPlayerSlots);
  const infos = {};
  const fieldsLength = fields.length;
  for (let i = 0; i < fieldsLength; i++) {
    const field = fields[i];
    infos[field] = "";
  }
  return infos;
}

/**
 * @param playerID: slot as zero-base
 * @param type: ['offer', 'answer']
 */
export function getPeers(connectionInfoFields, playerID, type) {
  return (connectionInfoFields || []).filter((info) => {
    const p = info.split('_');
    const infoType = p[0];
    const x = p[1];
    const y = p[2];
    return infoType === type && (
      (type === "offer" && playerID == x) // eslint-disable-line
      || (type === "answer" && playerID == y)) // eslint-disable-line
  });
}

export function setTeamSlotsAndReorder(playerInfo, numberOfTeams) {
  const reorderedPlayerInfo = Array(playerInfo.length);
  for (let i = 0; i < numberOfTeams; i++) {
    const teamN = playerInfo.filter(pi => pi.teamID === i);
    for (let j = 0; j < teamN.length; j++) {
      const slot = i + (numberOfTeams * j);
      const member = teamN[j];
      reorderedPlayerInfo[slot] = {
        ...member,
        slot
      };
    }
  }
  return reorderedPlayerInfo;
}

export const getCodeBlocks = (code) => {
  const lines = code.split('\n');
  const blocks = [];
  let newblock = '';

  let inFunction = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // if (line.trim() == '') continue;
    // if (line.trim().indexOf('//') == 0) continue;

    if (inFunction) {
      if (line.indexOf('}') === 0) {
        inFunction = false;
        newblock += line;
        blocks.push(`${newblock}\n`);
        newblock = '';
      } else {
        newblock += line;
        newblock += '\n';
      }
    } else { // not in function
      if (line.indexOf('function') >= 0 && (line.indexOf(' ') != 0)) {
        // a new block of code!
        if (newblock !== '') {
          blocks.push(newblock);
          newblock = '';
          inFunction = true;
        }
      }
      newblock += line;
      newblock += '\n';
    }
  }

  if (newblock !== '') {
    blocks.push(newblock);
  }
  return blocks;
};

const getFunctionName = (code) => {
  const p = code.split("\n");
  const line = p[0];
  const functionList = ["getCallShot", "getBreakShot", "getCueBallPlacement", "getAimPosition", "extrapolatePoints", "getRandomNumber"];
  for (let j = 0; j < functionList.length; j++) {
    if (line.indexOf(functionList[j]) >= 0 && line.indexOf("function") >= 0 && line.indexOf(functionList[j]) >= line.indexOf("function")) {
      return functionList[j];
    }
  }
  if (line.indexOf("function") >= 0) {
    // handle any other user defined function
    let s = line.substring(line.indexOf("function") + 8);
    s = s.substring(0, s.indexOf("(")).trim();
    // console.log("newly defined function!! " + s);
    return s;
  }
  return "nofuncfound";
};

export const calcNewCodeBase = (oldCode, newCode) => {
  if (oldCode.trim() === '') return newCode;
  if (newCode.trim() === '') return oldCode;
  const oldCodeBlocks = getCodeBlocks(oldCode);
  const newCodeBlocks = getCodeBlocks(newCode);

  let finalCode = `${newCode}\n\n`;

  // console.log("\n\n\n***** apply base line ****\n\n");
  // console.log("finalCode starts with \n" + finalCode);

  // add old code blocks that are not replaced by new code blocks
  for (let i = 0; i < oldCodeBlocks.length; i++) {
    const oldBlock = oldCodeBlocks[i];
    if (oldBlock.trim() === '') continue;
    const oldFunc = getFunctionName(oldBlock);
    if (oldFunc === "nofuncfound") {
      // keep global variables
      finalCode = `
${oldBlock}

${finalCode}`;
      continue;
    }
    // console.log("\n\n\n\n\n\n\noldBlock " + i + " is \n" + oldBlock);
    // console.log("\nold Func is " + oldFunc);

    let replaced = false;
    for (let j = 0; j < newCodeBlocks.length; j++) {
      const newBlock = newCodeBlocks[j];
      const newFunc = getFunctionName(newBlock);
      if (newFunc === "nofuncfound") continue;
      if (newFunc.trim() === "") continue;
      // console.log("new block " + j + " is \n" + newBlock);
      // console.log("\nchecking new func " + j + " " + newFunc + " against old func " + oldFunc);
      if (newFunc === oldFunc) {
        // console.log("replaced!!");
        replaced = true; break;
      }
    }

    if (!replaced) {
      // console.log("\n\nappend old Block back " + oldBlock);
      finalCode += `${oldBlock}`;
    }
  }
  return finalCode;
};

export const stripHTML = (html) => {
  check(html, String);
  return html.replace(/(<([^>]+)>)/ig, '');
};

export const get100Years = () => {
  const years = [];

  for (let year = moment().year(); moment().year() - year <= 100; year--) {
    years.push(year);
  }
  return years;
};

export const getDaysInMonth = () => {
  const days = [];

  for (let day = 1; day <= 31; day++) {
    days.push(day);
  }
  return days;
};

export const buildTeacherSignUpMail = profile => `
  <div>
    <div>
      First name: ${profile.firstName}
    </div>
    <div>
      Last name: ${profile.lastName}
    </div>
    <div>
      School Name: ${profile.school}
    </div>
    <div>
      Phone Number: ${profile.phone}
    </div>
    <div>
      Street Address: ${profile.address}
    </div>
    <div>
      City: ${profile.city}
    </div>
    <div>
      State: ${profile.state}
    </div>
    <div>
      Zip Code: ${profile.zipCode}
    </div>
  </div>
`;

export const generateToken = (email) => {
  return jwt.sign({
    exp: Math.floor(Date.now()) + (60 * 60 * 24 * 1000),
    userId: Meteor.userId(),
    email
  }, 'secret');
};

export function decodedToken(token, key) {
  return jwt.verify(token, key);
}

export const checkAuthentication = (expiryDate) => {
  if (expiryDate) {
    return new Date().getTime() < expiryDate;
  }
  return false;
};

export const getDataFromToken = (token) => {
  const data = decodedToken(token, 'secret');

  if (data && checkAuthentication(data.exp)) {
    return data;
  }
  if (data && !checkAuthentication(data.exp)) {
    return {
      error: 'Your session has expired!'
    };
  }
  return null;
};

export const getReferralContentEmail = (url, name, sender) => `
  <html style="background-color: #fff;color: #333;font-family: Open Sans, Arial, Helvetica, sans-serif;font-size: 17px;margin: 0;box-sizing: border-box;padding: 5px 15px 15px 15px;">
    <head>
      <meta charSet="utf8">
      <title>TuringGame</title>
      <style>
        html, body {
          background-color: #fff;
          color: #333;
          font-family: "Open Sans", Arial, Helvetica, sans-serif;
          font-size: 17px;
          margin: 0;
          box-sizing: border-box;
          padding: 5px 15px 15px 15px;
        }
        .body {
          padding: 20px 50px;
          font-size: 16px;
          border: 1px solid #a8a8a8;
          text-align: center;
        }
        .header {
          font-size: 24px;
          display: block;
          margin-bottom: 40px;
        }
        .logo {
          width: 50px;
          height: 50px;
        }
        .header-title {
          color: #397dbd;
          margin-left: 3px;
          font-weight: 500;
          display: inline-block;
        }
        .header-subTitle {
          font-size: 18px;
        }
        .invitation {
          margin-bottom: 20px;
        }
        .description {
          margin-bottom: 20px;
          text-align: left;
          padding: 0 25px;
        }
        .sender {
          color: #3e7fbe;
        }
        .free {
          color: #1d6b9f;
          font-style: italic;
        }
        .button {
          background-color: #34cab2;
          color: #fff;
          border-radius: 10px;
          padding: 10px 20px;
          width: 100px;
          margin: auto
        }
        .link {
          text-decoration: none;
          color: #fff;
        }
      </style>
    </head>
    <body style="background-color: #fff;color: #333;font-family: Open Sans, Arial, Helvetica, sans-serif;font-size: 17px;margin: 0;box-sizing: border-box;padding: 5px 15px 15px 15px;">
      <div class="body" style="padding: 20px 50px;font-size: 16px;border: 1px solid #a8a8a8;text-align: center;">
        <div class="header" style="font-size: 24px;display: block;margin-bottom: 40px;">
          <img src="https://www.tgame.ai/images/TGameLogoHead.png" class="logo" style="width: 50px;height: 50px;">
          <div class="header-title" style="color: #397dbd;margin-left: 3px;font-weight: 500;display: inline-block">
            <div>TurringGame</div>
            <div class="header-subTitle" style="font-size: 18px;">Coding Education</div>
          </div>
        </div>
        <div class="invitation" style="margin-bottom: 20px;">
          Invitation from <span class="sender" style="color: #3e7fbe;">${sender}</span>
        </div>
        <div class="description" style="margin-bottom: 20px;text-align: left;padding: 0 25px;">
          Hi ${name}, click the link below to sign up a <span class="free" style="color: #1d6b9f;font-style: italic;">free</span> TuringGame account, so  you can play games and learn coding
          your own game bot!
        </div>
        <div class="button" style="background-color: #34cab2;color: #fff;border-radius: 10px;padding: 10px 20px;width: 100px;margin: auto;">
          <a href="${url}" class="link" style="text-decoration: none;color: #fff;">
            Free Sign Up
          </a>
        </div>
      </div>
    </body>
  </html>
`;

export const emailSubscription = data => `
  <div>
    <h3>User action: ${data.action}</h3>
    <div>
      <div>
        Email: ${data.email}
      </div>
      <div>
        User Id: ${data.userId}
      </div>
      <div>
        Username: ${data.username}
      </div>
    </div>
  </div>
`;

export const emailRepeatingCoupon = data => `
  <div>
    Your monthly payment will change to $${data.money} starting on next payment on ${data.date}
  </div>
`;

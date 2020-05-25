/* global browser, expect, server */
// import checkClass from '../support/check/checkClass';
// import checkContainsAnyText from '../support/check/checkContainsAnyText';
// import checkIsEmpty from '../support/check/checkIsEmpty';
// import checkContainsText from '../support/check/checkContainsText';
// import checkCookieContent from '../support/check/checkCookieContent';
// import checkCookieExists from '../support/check/checkCookieExists';
// import checkDimension from '../support/check/checkDimension';
// import checkEqualsText from '../support/check/checkEqualsText';
// import checkFocus from '../support/check/checkFocus';
// import checkInURLPath from '../support/check/checkInURLPath';
// import checkIsOpenedInNewWindow from
//     '../support/check/checkIsOpenedInNewWindow';
// import checkModal from '../support/check/checkModal';
// import checkModalText from '../support/check/checkModalText';
// import checkNewWindow from '../support/check/checkNewWindow';
// import checkOffset from '../support/check/checkOffset';
// import checkProperty from '../support/check/checkProperty';
// import checkSelected from '../support/check/checkSelected';
// import checkTitle from '../support/check/checkTitle';
// import checkURL from '../support/check/checkURL';
// import checkURLPath from '../support/check/checkURLPath';
// import checkWithinViewport from '../support/check/checkWithinViewport';
// import compareText from '../support/check/compareText';
// import isEnabled from '../support/check/isEnabled';
// import isExisting from '../support/check/isExisting';
// import isVisible from '../support/check/isVisible';
// import waitFor from '../support/action/waitFor';
// import waitForVisible from '../support/action/waitForVisible';

import { waitFor, handleModal } from '../support/action';
import {
  checkTitle,
  checkClass,
  checkContainsText,
  checkCountElement,
  checkIsOpenedInNewWindow,
  checkModal
} from '../support/check';

module.exports = function then() {
  this.Then(
    /^I expect that the title is( not)* "([^"]*)?" in browser (\d+)$/,
    checkTitle.checkTitle
  );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* visible$/,
  //     isVisible
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" becomes( not)* visible$/,
  //     waitForVisible
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* within the viewport$/,
  //     checkWithinViewport
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" does( not)* exist$/,
  //     isExisting
  // );

  this.Then(
      /^I expect that element "([^"]*)" in browser (\d+) has "([^"]*)" elements$/,
    checkCountElement.checkCountElement
  );

  // this.Then(
  //     /^I expect that element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
  //     compareText
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  //     checkEqualsText
  // );

  this.Then(
    /^([^"]*) expect that element "([^"]*)?"( not)* in browser (\d+) contains the text "([^"]*)?"$/,
    checkContainsText.checkContainsText
  );

  // this.Then(
  //     /^I expect that element "([^"]*)?"( not)* contains any text$/,
  //     checkContainsAnyText
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* empty$/,
  //     checkIsEmpty
  // );

  // this.Then(
  //     /^I expect that the url is( not)* "([^"]*)?"$/,
  //     checkURL.checkURL
  // );

  // this.Then(
  //     /^I expect that the path is( not)* "([^"]*)?"$/,
  //     checkURLPath.checkURLPath
  // );

  // this.Then(
  //     /^I expect the url to( not)* contain "([^"]*)?"$/,
  //     checkInURLPath
  // );

  // this.Then(
  //     /^I expect that the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  //     checkProperty
  // );

  // this.Then(
  //     /^I expect that checkbox "([^"]*)?" is( not)* checked$/,
  //     checkSelected
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* selected$/,
  //     checkSelected
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* enabled$/,
  //     isEnabled
  // );

  // this.Then(
  //     /^I expect that cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
  //     checkCookieContent
  // );

  // this.Then(
  //     /^I expect that cookie "([^"]*)?"( not)* exists$/,
  //     checkCookieExists
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  //     checkDimension
  // );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
  //     checkOffset
  // );

  this.Then(
    /^([^"]*)? expect that element "([^"]*)?" in browser (\d+) (has|does not have) the class "([^"]*)?"$/,
    checkClass.checkClass
  );

  // this.Then(
  //     /^I expect a new (window|tab) has( not)* been opened$/,
  //     checkNewWindow
  // );

  this.Then(
    /^I expect the url "([^"]*)?" is opened in a new (tab|window)$/,
    checkIsOpenedInNewWindow.checkIsOpenedInNewWindow
  );

  // this.Then(
  //     /^I expect that element "([^"]*)?" is( not)* focused$/,
  //     checkFocus
  // );

  this.Then(
    /^([^"]*) wait on element "([^"]*)?"( or "([^"]*)?")* in browser (\d+) (for (\d+)ms)*( to( not)* (be checked|be enabled|be selected|be visible|contain a text|contain a value|exist))*$/,
    waitFor.waitFor
  );

  this.Then(/^([^"]*) wait until (\d+)ms in browser (\d+)$/, function (person, arg1, number) {
    browser.instances[number].pause(arg1);
  });

  this.Then(/^([^"]*) should see a screenshot of the browser view and save with name "([^"]*)"$/, function (person, fileName) {
    // Write code here that turns the phrase above into concrete actions
    browser.instances[0].saveScreenshot(`.screenshots/${fileName}.png`);
  });

  this.Then(
    /^([^"]*) expect that a (alertbox|confirmbox|prompt) in browser (\d+) is( not)* opened$/,
    checkModal.checkModal
  );

  this.Then(
    /^([^"]*) (accept|dismiss) the (alertbox|confirmbox|prompt) in browser (\d+)$/,
    handleModal.handleModal
  );

  // this.Then(
  //     /^I expect that a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
  //     checkModalText
  // );
  this.Then(/^I expect that "([^"]*)" lost the game, decreased (\d+) coins and "([^"]*)" won the game, increased (\d+) coins$/, (userId0, lostCoins, userId1, wonCoins, done) => {
    const user0Coins = server.call('loadUserCoins', userId0) || 0;
    const user1Coins = server.call('loadUserCoins', userId1) || 0;

    expect(user0Coins).toEqual(browser[userId0] - lostCoins, `${userId0} 's coins didn't decreased exactly`);
    expect(user1Coins).toEqual(browser[userId1] + wonCoins, `${userId1} 's coins didn't increased exactly`);

    done();
  });

  this.Then(/^I expect that "([^"]*)" bought item successfully$/, (userId, done) => {
    const userCoins = server.call('loadUserCoins', userId) || 0;

    expect(userCoins).toEqual(browser[userId] - 1000, `${userId} 's coins didn't decreased exactly`);
    done();
  });
};

/* global server, browser */
// import checkContainsAnyText from '../support/check/checkContainsAnyText';
// import checkIsEmpty from '../support/check/checkIsEmpty';
// import checkContainsText from '../support/check/checkContainsText';
// import checkCookieContent from '../support/check/checkCookieContent';
// import checkCookieExists from '../support/check/checkCookieExists';
// import checkDimension from '../support/check/checkDimension';
// import checkElementExists from '../support/check/checkElementExists';
// import checkEqualsText from '../support/check/checkEqualsText';
// import checkModal from '../support/check/checkModal';
// import checkOffset from '../support/check/checkOffset';
// import checkProperty from '../support/check/checkProperty';
// import checkSelected from '../support/check/checkSelected';
// import checkTitle from '../support/check/checkTitle';
// import checkUrl from '../support/check/checkURL';
// import closeAllButFirstTab from '../support/action/closeAllButFirstTab';
// import compareText from '../support/check/compareText';
// import isEnabled from '../support/check/isEnabled';
// import isVisible from '../support/check/isVisible';
// import resizeScreenSize from '../support/action/resizeScreenSize';
import { openWebsite } from '../support/action';
import { checkTitle } from '../support/check';
import { checkIfElementExists } from '../support/lib/';

module.exports = function () {
  this.Given(/^([^ ]*) open the (url|site) "([^"]*)" in browser (\d+)$/,
    openWebsite.openWebsite
  );

  this.Given(/^Record initial coins of "([^"]*)"$/, (userId, done) => {
    browser[userId] = server.call('loadUserCoins', userId) || 0;

    done();
  });

  this.Given(/^([^ ]*) expects that element "([^"]*)?"( not)* exist on the page in browser (\d+)$/, checkIfElementExists.checkIfElementExists);
  // this.Given(
  //     /^the element "([^"]*)?" is( not)* visible$/,
  //     isVisible
  // );

  // this.Given(
  //     /^the element "([^"]*)?" is( not)* enabled$/,
  //     isEnabled
  // );

  // this.Given(
  //     /^the element "([^"]*)?" is( not)* selected$/,
  //     checkSelected
  // );

  // this.Given(
  //     /^the checkbox "([^"]*)?" is( not)* checked$/,
  //     checkSelected
  // );

  // this.Given(
  //     /^there is (an|no) element "([^"]*)?" on the page$/,
  //     checkElementExists
  // );

  this.Given(
    /^the title is( not)* "([^"]*)?"$/,
    checkTitle
  );

  // this.Given(
  //     /^the element "([^"]*)?" contains( not)* the same text as element "([^"]*)?"$/,
  //     compareText
  // );

  // this.Given(
  //     /^the element "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  //     checkEqualsText
  // );

  // this.Given(
  //     /^the element "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
  //     checkContainsText
  // );

  // this.Given(
  //     /^the element "([^"]*)?"( not)* contains any text$/,
  //     checkContainsAnyText
  // );

  // this.Given(
  //     /^the element "([^"]*)?" is( not)* empty$/,
  //     checkIsEmpty
  // );

  // this.Given(
  //     /^the page url is( not)* "([^"]*)?"$/,
  //     checkUrl
  // );

  // this.Given(
  //     /^the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  //     checkProperty
  // );

  // this.Given(
  //     /^the cookie "([^"]*)?" contains( not)* the value "([^"]*)?"$/,
  //     checkCookieContent
  // );

  // this.Given(
  //     /^the cookie "([^"]*)?" does( not)* exist$/,
  //     checkCookieExists
  // );

  // this.Given(
  //     /^the element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  //     checkDimension
  // );

  // this.Given(
  //     /^the element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
  //     checkOffset
  // );

  // this.Given(
  //     /^I have a screen that is ([\d]+) by ([\d]+) pixels$/,
  //     resizeScreenSize
  // );

  // this.Given(
  //     /^I have closed all but the first (window|tab)$/,
  //     closeAllButFirstTab
  // );

  // this.Given(
  //     /^a (alertbox|confirmbox|prompt) is( not)* opened$/,
  //     checkModal
  // );
};


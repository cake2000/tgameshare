/* global browser, server */

const openWebsite = (person, type, page, number, done) => {

  const baseUrl = server.execute(() => {
    return Meteor.absoluteUrl();
  });
  const url = (type === 'url') ? page : baseUrl.substring(0, baseUrl.length - 1) + page;

  browser.instances[number].setViewportSize({
    width: 1920,
    height: 1024
  });
  browser.instances[number].url(url);
  done();
};

export default { openWebsite };

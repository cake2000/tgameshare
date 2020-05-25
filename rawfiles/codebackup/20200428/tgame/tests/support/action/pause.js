/* global browser */

/**
 * Pause execution for a given number of milliseconds
 * @param  {String}   ms   Number of milliseconds to pause
 * @param  {Function} done Function to execute when finished
 */
const pause = (person, ms, number, done) => {
  /**
   * Number of milliseconds
   * @type {Int}
   */
  const intMs = parseInt(ms, 10);
  const browserData = browser.instances[number];

  browserData.pause(intMs);
  done();
};

export default { pause };

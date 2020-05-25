/* global browser */

import checkIfElementExists from '../lib/checkIfElementExists';

/**
 * Perform an click action on the given element
 * @param  {String}   action    The action to perform (click or doubleClick)
 * @param  {String}   type      Type of the element (link or selector)
 * @param  {String}   element   Element selector
 * @param  {Function} done      Function to execute when finished
 */
const clickElement = (person, action, type, element, number, done) => {
  /**
   * Element to perform the action on
   * @type {String}
   */

  const elem = (type === 'link') ? `=${element}` : element;

  /**
   * The method to call on the browser object
   * @type {String}
   */
  const method = (action === 'click') ? 'click' : 'doubleClick';
  const browserData = browser.instances[number];
  // checkIfElementExists.checkIfElementExists(elem, true);
  browserData[method](elem);
  done();
};

export default { clickElement };

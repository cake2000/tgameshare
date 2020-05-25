/* global browser */
import checkIfElementExists from '../lib/checkIfElementExists';

/**
 * Set the value of the given input field to a new value or add a value to the
 * current element value
 * @param  {String}   method  The method to use (add or set)
 * @param  {String}   value   The value to set the element to
 * @param  {String}   element Element selector
 * @param  {Function} done    Function to execute when finished
 */
const setInputFiield = (person, value, element, number, done) => {
  /**
   * The command to perform on the browser object (addValue or setValue)
   * @type {String}
   */

    // checkIfElementExists.checkIfElementExists(element, true);
  const browserData = browser.instances[number];

  if (!value) {
    browserData.setValue(element, '');
  } else {
    browserData.setValue(element, value);
  }

  done();
};

export default { setInputFiield };

/* global browser, expect */
/**
 * Check if a modal was opened
 * @param  {String}   modalType  The type of modal that is expected (alertbox,
 *                               confirmbox or prompt)
 * @param  {String}   falseState Whether to check if the modal was opened or not
 * @param  {Function} done       Function to execute when finished
 */
const checkModal = (person, modalType, number, falseState, done) => {
  /**
   * The text of the prompt
   * @type {String}
   */
  let promptText = '';
  const browserData = browser.instances[number];

  try {
    promptText = browserData.alertText();

    if (falseState) {
      expect(promptText)
        .toNotEqual(
          null,
          `A ${modalType} was opened when it shouldn't`
        );
    }
  } catch (e) {
    if (!falseState) {
      expect(promptText)
        .toEqual(
          null,
          `A ${modalType} was not opened when it should have been`
        );
    }
  }

  done();
};

export default { checkModal };

/* global browser, expect */

/**
 * Check the title of the current browser window
 * @param  {Type}     falseCase     Whether to check if the title matches the
 *                                  expected value or not
 * @param  {Type}     expectedTitle The expected title
 * @param  {Function} done          Function to execute when finished
 */
const checkTitle = (falseCase, expectedTitle, number, done) => {
  const browserData = browser.instances[number];
  const title = browserData.getTitle();

  if (falseCase) {
    expect(title)
      .toNotEqual(
        expectedTitle,
        `Expected title not to be "${expectedTitle}"`
      );
  } else {
    expect(title)
      .toEqual(
        expectedTitle,
        `Expected title to be "${expectedTitle}" but found "${title}"`
      );
  }

  done();
};

export default { checkTitle };

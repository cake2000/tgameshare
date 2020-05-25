/* global browser, expect */

/**
 * Check if the given element has the given class
 * @param  {String}   elem              Element selector
 * @param  {String}   falseCase         Whether to check for the class to exist
 *                                      or not ('has', 'does not have')
 * @param  {String}   expectedClassName The class name to check
 * @param  {Function} done              Function to execute when finished
 */
const checkClass = (person, elem, number, falseCase, expectedClassName, done) => {
  /**
   * List of all the classes of the element
   * @type {Array}
   */

  const classesList = browser.instances[number].getAttribute(elem, 'className');
  const expectedClassesList = expectedClassName.split(' ');

  if (falseCase === 'does not have') {
    expect(!expectedClassesList.find(className => classesList.includes(className)))
      .toBe(
        true,
        `Element ${elem} should not have the class ${expectedClassName}`
      );
  } else {
    expect(!!expectedClassesList.find(className => classesList.includes(className)))
      .toBe(
        true,
        `Element ${elem} should have the class ${expectedClassName}`
      );
  }

  done();
};

export default { checkClass };

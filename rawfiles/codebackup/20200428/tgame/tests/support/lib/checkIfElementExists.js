/* global browser, expect */
/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  element  Element selector
 * @param  {String}  falseCase Check if the element (does not) exists
 */
const checkIfElementExists = (person, element, falseCase, number) => {
  /**
   * The number of elements found in the DOM
   * @type {Int}
   */
  const nrOfElements = browser.instances[number].elements(element).value;

  if (!falseCase) {
    expect(nrOfElements.length > 0)
      .toBe(
        true,
        `Element with selector "${element}" should exist on the page`
      );
  } else {
    expect(nrOfElements.length < 0)
      .toBe(
        true,
        `Element with selector "${element}" should not exist on the page`
      );
  }
};

export default { checkIfElementExists };

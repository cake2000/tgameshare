/* global browser, expect */

/**
 * Check count element
 * @param  {Number}   counting   Number of element
 * @param  {String}   elem       Element selector
 * @param  {Function} done       Function to execute when finished
 */
const checkCountElement = (elem, number, counting, done) => {
  const blocks = browser.instances[number].elements(elem);
  const blocksNumber = String(blocks.value.length);

  if (blocksNumber === counting) {
    expect(blocksNumber)
      .toEqual(
        counting,
        `Expected number of elements is "${counting} elements"`
      );
  } else {
    expect(blocksNumber)
      .not
      .toEqual(
        counting,
        `Expected number of element is not enough "${counting} elements"`
      );
  }

  done();
};

export default { checkCountElement };

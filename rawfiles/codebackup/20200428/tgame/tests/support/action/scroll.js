/**
 * Scroll the page to the given element
 * @param  {String}   selector Element selector
 * @param  {Function} done     Function to execute when finished
 */
const scroll = (selector, done) => {
    browser.scroll(selector);

    done();
};

export default { scroll };

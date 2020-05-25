/**
 * Clear a given input field
 * @param  {String}   element Element selector
 * @param  {Function} done    Function to execute when finished
 */
const clearInputField = (element, done) => {
    browser.clearElement(element);

    done();
};

export default { clearInputField };

/**
 * Perform a key press
 * @param  {String}   key  The key to press
 * @param  {Function} done Function to execute when finished
 */
const pressButton = (key, done) => {
    browser.keys(key);

    done();
};

export default { pressButton };

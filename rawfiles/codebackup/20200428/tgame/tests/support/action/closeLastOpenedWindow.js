/**
 * Close the last opened window
 * @param  {String}   type Type of object to close (window or tab)
 * @param  {Function} done Function to execute when finished
 */
const closeLastOpenedWindow = (type, done) => {
    /**
     * The last opened window handle
     * @type {Object}
     */
    const lastWindowHandle = browser.windowHandles().value.slice(-1)[0];

    browser.window(lastWindowHandle);
    browser.close();

    done();
};

export default { closeLastOpenedWindow };

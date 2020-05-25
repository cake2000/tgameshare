/**
 * Check if the given element is enabled
 * @param  {String}   element   Element selector
 * @param  {String}   falseCase Whether to check if the given element is enabled
 *                              or not
 * @param  {Function} done      Function to execute when finished
 */
const isEnabled = (element, falseCase, done) => {
    /**
     * The enabled state of the given element
     * @type {Boolean}
     */
    const isEnabled = browser.isEnabled(element);

    if (falseCase) {
        expect(isEnabled)
            .toNotEqual(true, `Expected element "${element}" not to be enabled`);
    } else {
        expect(isEnabled)
            .toEqual(true, `Expected element "${element}" to be enabled`);
    }

    done();
};

export default { isEnabled }
/**
 * Check if the given element is (not) visible
 * @param  {String}   element   Element selector
 * @param  {String}   falseCase Check for a visible or a hidden element
 * @param  {Function} done      Function to execute when finished
 */
const isVisible = (element, falseCase, done) => {
    /**
     * Visible state of the give element
     * @type {String}
     */
    const isVisible = browser.isVisible(element);

    if (falseCase) {
        expect(isVisible)
            .toNotEqual(true, `Expected element "${element}" not to be visible`);
    } else {
        expect(isVisible)
            .toEqual(true, `Expected element "${element}" to be visible`);
    }

    done();
};

export default { isVisible };

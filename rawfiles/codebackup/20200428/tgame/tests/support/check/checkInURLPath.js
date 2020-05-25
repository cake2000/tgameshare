/**
 * Check if the given string is in the URL path
 * @param  {String}   falseCase       Whether to check if the given string is in
 *                                    the URL path or not
 * @param  {String}   expectedUrlPart The string to check for
 * @param  {Function} done            Function to execute when finished
 */
const checkInURLPath = (falseCase, expectedUrlPart, done) => {
    /**
     * The URL of the current browser window
     * @type {String}
     */
    const currentUrl = browser.url().value;

    if (falseCase) {
        expect(currentUrl)
            .toNotContain(
                expectedUrlPart,
                `Expected URL "${currentUrl}" not to contain ` +
                `"${expectedUrlPart}"`
            );
    } else {
        expect(currentUrl)
            .toContain(
                expectedUrlPart,
                `Expected URL "${currentUrl}" to contain "${expectedUrlPart}"`
            );
    }

    done();
};

export default { checkInURLPath };

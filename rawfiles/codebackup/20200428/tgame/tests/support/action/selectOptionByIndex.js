/**
 * Select a option from a select element by it's index
 * @param  {String}   index      The index of the option
 * @param  {String}   obsolete   The ordinal indicator of the index (unused)
 * @param  {String}   selectElem Element selector
 * @param  {Function} done       Function to execute when finished
 *
 * @todo  merge with selectOption
 */
const selectOptionByIndex = (index, obsolete, selectElem, done) => {
    /**
     * The index of the option to select
     * @type {Int}
     */
    const optionIndex = parseInt(index, 10);

    browser.selectByIndex(selectElem, optionIndex);

    done();
};

export default { selectOptionByIndex };

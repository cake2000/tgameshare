import checkIfElementExists from '../lib/checkIfElementExists';

/**
 * Check if the given element exists
 * @param  {String}   isExisting Whether the element should be existing or not
 *                               (an or no)
 * @param  {String}   elem       Element selector
 * @param  {Function} done       Function to execute when finished
 */
const checkElementExists = (isExisting, elem, done) => {
    if (isExisting === 'an') {
        checkIfElementExists.checkIfElementExists(elem);
    } else {
        checkIfElementExists.checkIfElementExists(elem, true);
    }

    done();
};

export default { checkElementExists };

/**
 * Submit the given form
 * @param  {String}   form Form element selector
 * @param  {Function} done Function to execute when finished
 */
const submitForm = (form, done) => {
    browser.submitForm(form);

    done();
};

export default { submitForm };

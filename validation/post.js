const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text: '';

    if(Validator.isEmpty(data.text)) {
        errors.text = 'Post field is required';
    }
    if(!Validator.isLength(data.text, {min:30, max:200})) {
        errors.text = 'Post must be between 30 and 200 characters';
    }
    

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
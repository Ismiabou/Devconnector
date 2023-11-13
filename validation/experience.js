const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title: '';
    data.compagny = !isEmpty(data.compagny) ? data.compagny: '';
    data.from = !isEmpty(data.from) ? data.from: '';

    if(Validator.isEmpty(data.title)) {
        errors.title = ' Job title field is required';
    }
    if(Validator.isEmpty(data.compagny)) {
        errors.email = 'Compagny field is required';
    }
    if(Validator.isEmpty(data.from)) {
        errors.email = 'From date field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};
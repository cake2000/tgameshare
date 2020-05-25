import _ from 'lodash';

export const classForm = {
  isRequired: value => (_.isEmpty(value) ? 'is required' : null),
};

export const validate = {};

// @flow
/* eslint-disable import/prefer-default-export */

////
/// @name Utils
/// @page fakeit-core/utils
////

import joi from 'joi'

/// @name validate
/// @description This is a small utility that is used to run joi validation
/// This allows for consistency in validation
/// @arg {*} obj - The item to validate against
/// @arg {Joi} schema - The joi schema
/// @throws Error if the validation fails
/// @returns {*} Returns the result of the validation of it doesn't fail
/* eslint-disable flowtype/require-return-type */
// $FlowFixMe
export function validate (obj: mixed, schema: ?Object, message: string) {
  const result = joi.validate(obj, schema)
  if (result.error) {
    if (message) {
      result.error.details[0].message = message
    }
    throw result.error.annotate()
  }

  return result.value
}

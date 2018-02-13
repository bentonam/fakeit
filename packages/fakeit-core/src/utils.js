// @flow
/* eslint-disable import/prefer-default-export */

////
/// @name Utils
/// @page fakeit-core/utils
////

import joi from 'joi'

import FakeitError from './error'

/// @name validate
/// @description This is a small utility that is used to run joi validation
/// This allows for consistency in validation
/// @arg {*} obj - The item to validate against
/// @arg {Joi} schema - The joi schema
/// @arg {function, string} message_or_function
/// A different message or a function to change the message
/// @throws Error if the validation fails
/// @returns {*} Returns the result of the validation of it doesn't fail
/* eslint-disable flowtype/require-return-type */
// $FlowFixMe
export function validate (obj: mixed, schema: ?Object, message_or_function: string | Function) {
  const result = joi.validate(obj, schema)
  if (result.error) {
    // $FlowFixMe
    let fn: Function
    let message: string = ''
    if (typeof message_or_function === 'function') {
      fn = message_or_function
    } else if (typeof message_or_function === 'string') {
      message = message_or_function
    }

    if (message) {
      result.error.details[0].message = message
    }

    message = result.error.annotate()

    if (message.includes('-- missing --')) {
      message = message
        .split('\n')
        .slice(3)
        .join('\n')
        .replace(/\n\[1\]\s*/, '')
    }

    if (fn) {
      message = fn(message) || message
    }

    throw new FakeitError(message, {
      filter: (frame: Object) => !/fakeit.*\/utils\.js/.test(frame.getFileName()),
      self: validate,
    })
  }

  return result.value
}

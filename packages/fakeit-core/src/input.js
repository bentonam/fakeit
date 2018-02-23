// @flow

////
/// @name Input
/// @page fakeit-input
/// @description Handles processing of input to FakeIt
////

import FileLoader from '@fakeit/file-loader'

/// @name Input
/// @description
/// Handles processing of Input, right now this class simply extends FileLoader
/// as that will be all that is supported with this version of FakeIt however,
/// in the future this could very well handle other input, such as http(s) calls,
/// database calls, etc.
/// @type {class}
export default class Input extends FileLoader {}

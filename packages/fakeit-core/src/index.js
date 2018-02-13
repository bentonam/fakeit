// @flow
import { model } from './model'
import FakeitError from './error'
import Api from './api'

// The model is the default item getting output because it's
// the most common for developers to use, so we want to make it easy
// for them to get it.
// ```
// import fakeit from '@fakeit/core'
// ```
export default model()

export { FakeitError, Api }

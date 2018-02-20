// @flow
// @jsx h
/* eslint-disable react/prop-types */
import { h, Component, Text, Indent } from 'ink'
import { throttle } from 'lodash'
import buildDebug from 'debug'

import Model from './model'

const debug = buildDebug('@fakeit/cli')

///# @name isDifferent
///# @description
///# This function will do a shallow check to see if 2 objects are different
///# It's more efficent than `_.difference()` because it returns as soon as
///# it finds a difference, where `_.difference()` will continue to find all the differences
///# @arg {object[]} a - first array of object
///# @arg {object[]} b - first array of object
///# @arg {string[], string} matches - A key or an array of keys to check against
///# @return {boolean}

export default class Fakeit extends Component {
  constructor (props: Object, context: Object) {
    super(props, context)

    this.api = this.props.api

    this.api.settings.something = 0

    this.throttleSetState = throttle((nextState: Object) => this.setState(nextState), 80)

    this.count = 0

    this.state = {
      models: [],
    }
  }

  componentDidMount (): void {
    const models_names = []

    this.api.on('model-start', (obj: Object): void => {
      models_names.push(obj.name)
      this.setState({ models: this.state.models.concat([ obj ]) })
    })

    this.api.on('document-update', (obj: Object): void => {
      this.state.models[models_names.indexOf(obj.name)] = obj
      this.throttleSetState({ models: this.state.models })
    })

    this.api.run(this.props.models)
  }

  componentWillUnmount (): void {
    this.throttleSetState.cancel()
    process.exit(0)
  }

  render (): Text {
    const models = []

    for (const props of this.state.models) {
      models.push(<Model {...props} />)
    }

    return (
      <Indent size={2}>
        <br />
        {models}
        {debug.enabled && (
          <div>
            <br />
            <Text blue>rendered count: {this.count++}</Text>
          </div>
        )}
      </Indent>
    )
  }
}

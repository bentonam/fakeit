// @flow
// @jsx h
import { h, Component, Text, Indent } from 'ink'
import Progress from 'ink-progress-bar'
import symbols from 'log-symbols'
import { padStart, padEnd } from 'lodash'
import buildDebug from 'debug'

const debug = buildDebug('@fakeit/cli')

/* eslint-disable react/prop-types */

export default class Model extends Component {
  constructor (props: Object, context: Object) {
    super(props, context)
    this.count = 0
    this.characters = []
  }

  shouldComponentUpdate ({ count, output }: Object): boolean {
    if (this.props.count !== count || this.props.output !== output) {
      return true
    }

    return false
  }

  render ({
    name, output, count, total, is_dependency, error,
  }: Object): Text {
    const state = (output || count) !== total && !error ? 'running' : 'finished'
    let rendered = ''

    if (debug.enabled) {
      rendered = (
        <span>
          {' '}
          (<Text magenta>rendered {this.count++}</Text>)
        </span>
      )
    }

    if (state === 'running') {
      const length = 30
      const indent = length + 6
      const _document = padEnd(`Documents: ${padStart(count, 6)} / ${total}`, length)
      const _output = padEnd(`Output:    ${padStart(output, 6)} / ${total}`, length)
      const character = '▆'

      return (
        <div>
          <Text yellow>
            {name} - {state}
          </Text>{' '}
          {rendered}
          <br />
          <Indent size={2}>
            <Text dim>{_document}</Text>
            <Progress character={character} left={indent} percent={count / total} green />
            {!is_dependency && (
              <span>
                <br />
                <Text dim>{_output}</Text>
                <Progress character={character} left={indent} percent={output / total} blue />
              </span>
            )}
          </Indent>
        </div>
      )
    }

    if (error) {
      return (
        <div>
          <span>{symbols.error} </span>
          <Text red>
            {name} - errored{' '}
            <Text bold>
              {count} / {total}
            </Text>{' '}
            documents
          </Text>
          {rendered}
        </div>
      )
    }

    /* eslint-disable max-len */
    return (
      <div>
        <span>{symbols.success} </span>
        <Text green>
          {name} - {state} <Text bold>{count}</Text> documents
        </Text>
        {rendered}
      </div>
    )
  }
}

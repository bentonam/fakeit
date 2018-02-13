// @flow
import promisify from 'es6-promisify'
import csvParse from 'csv-parse'
import csvStringify from 'csv-stringify'
import to, { is } from 'to-js'

const csv = {
  parse: promisify(csvParse),
  stringify: promisify(csvStringify),
}

export default function (config: Object): void {
  config.format('csv', {
    /// @name formats.csv.parse
    /// @arg {string, object}
    /// @returns {array} - The javascript object
    /// @async
    async parse (obj: string): Promise<Object> {
      const result = await csv.parse(obj, { columns: true })

      // The following should be an object but the csv parser returns it as a string so
      // this is used to fix that mistake
      // `"{\"latitude\":-6.081689835,
      // \"longitude\":145.3919983,\"level-2\":{\"level-3\":\"woohoo\"}}"`
      // it also doesn't handle numbers correctly so this fixes those instances as well
      function fix (a: Object, b: Object): Object {
        /* istanbul ignore if : too hard to create a test case for it */
        if (!a || !b) {
          return a
        }

        /* eslint-disable no-restricted-syntax, no-prototype-builtins, id-length */
        for (const k in b) {
          /* istanbul ignore if  */
          if (b.hasOwnProperty(k)) {
            /* istanbul ignore if : too hard to create a test case for it */
            if (is.plainObject(b[k])) {
              a[k] = is.plainObject(a[k]) ? fix(a[k], b[k]) : b[k]
            } else if (is.string(b[k]) && /^[0-9]+$/.test(b[k])) {
              // convert string into a number
              a[k] = to.number(b[k])
            } else if (is.string(b[k]) && b[k][0] === '{') {
              // convert string into an object
              a[k] = fix({}, to.object(b[k]))
            } else {
              a[k] = b[k]
            }
          }
        }
        /* eslint-enable no-restricted-syntax, no-prototype-builtins */

        return a
      }

      return result.map((item: Object) => fix({}, item))
    },

    /// @name formats.csv.stringify
    /// @arg {object} obj
    /// @arg {object} settings [{}] The current settings
    /// @returns {string} - The csv string
    /// @async
    async stringify (obj: Object, settings: Object = {}): Promise<string> {
      const options = to.extend(
        { header: true, quotedString: true },
        ((settings.formats || {}).csv || {}).spacing || {},
      )
      const result = await csv.stringify(to.array(obj), options)
      return result.trim()
    },
  })
}

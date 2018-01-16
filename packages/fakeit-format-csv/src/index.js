import promisify from 'es6-promisify'
import csvParse from 'csv-parse'
import csvStringify from 'csv-stringify'
import to, { is } from 'to-js'

const csv = {
  parse: promisify(csvParse),
  stringify: promisify(csvStringify),
}

export default {
  parsers: {
    csv: {
      ///# @name parsers.csv.parse
      ///# @arg {string, object}
      ///# @returns {array} - The javascript object
      ///# @async
      async parse (obj) {
        const result = await csv.parse(obj, { columns: true })

        // The following should be an object but the csv parser returns it as a string so
        // this is used to fix that mistake
        // `"{\"latitude\":-6.081689835,
        // \"longitude\":145.3919983,\"level-2\":{\"level-3\":\"woohoo\"}}"`
        // it also doesn't handle numbers correctly so this fixes those instances as well
        function fix (a, b) {
          /* istanbul ignore if : too hard to create a test case for it */
          if (!a || !b) {
            return a
          }

          /* eslint-disable */
          for (const k in b) {
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
          /* eslint-enable */

          return a
        }

        return result.map((item) => fix({}, item))
      },

      ///# @name parsers.csv.stringify
      ///# @arg {object} obj
      ///# @arg {object} options [{ header: true, quotedString: true }] The csv options
      ///# @returns {string} - The yaml string
      ///# @async
      async stringify (obj, options) {
        if (typeof options !== 'object') {
          options = {}
        }
        options = to.extend({ header: true, quotedString: true }, options)
        const result = await csv.stringify(to.array(obj), options)
        return result.trim()
      },
    },
  },
}

import cson from 'cson'

export default {
  parsers: {
    cson: {
      ///# @name parsers.cson.parse
      ///# @arg {string, object} obj
      ///# @returns {object} - The javascript object
      ///# @async
      parse (obj) {
        return new Promise((resolve, reject) => {
          cson.parse(obj, {}, (err, result) => {
            /* istanbul ignore next */
            if (err) {
              return reject(err)
            }
            resolve(result)
          })
        })
      },

      ///# @name parsers.cson.stringify
      ///# @arg {object} obj
      ///# @arg {number} indent [2] The indent level
      ///# @returns {string} - The yaml string
      ///# @async
      stringify: (obj, indent = 2) => Promise.resolve(cson.stringify(obj, null, indent)),
    },
  },
}

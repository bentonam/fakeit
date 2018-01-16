export default {
  parsers: {
    json: {
      ///# @name parsers.json.parse
      ///# @arg {string, object} obj
      ///# @returns {object} - The javascript object
      ///# @async
      parse: (obj) => Promise.resolve(JSON.parse(obj)),

      ///# @name parsers.json.stringify
      ///# @arg {object} obj
      ///# @arg {number} indent [2] The indent level
      ///# @returns {string} - The yaml string
      ///# @async
      stringify (obj, indent = 2) {
        return Promise.resolve(JSON.stringify(obj, null, !parseInt(indent, 10) ? null : indent))
      },
    },
  },
}

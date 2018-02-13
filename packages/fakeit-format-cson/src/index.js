// @flow
import cson from 'cson'

export default function (config: Object): void {
  config.format('cson', {
    /// @name formats.cson.parse
    /// @arg {string} obj
    /// @returns {object} - The javascript object
    /// @async
    parse (obj: string): Promise<Object> {
      return new Promise((resolve, reject) => {
        cson.parse(obj, {}, (err, result: Object) => {
          /* istanbul ignore next */
          if (err) {
            return reject(err)
          }
          resolve(result)
        })
      })
    },

    /// @name formats.cson.stringify
    /// @arg {object} obj
    /// @arg {object} settings [{}] The current settings
    /// @returns {string} - The cson string
    /// @async
    stringify (obj: Object, settings: Object = {}): Promise<string> {
      const indent: number = ((settings.formats || {}).cson || {}).spacing || settings.spacing
      return Promise.resolve(cson.stringify(obj, null, indent))
    },
  })
}

// @flow

export default function (config: Object): void {
  config.format('json', {
    /// @name formats.json.parse
    /// @arg {string, object} obj
    /// @returns {object} - The javascript object
    /// @async
    parse (obj: string): Promise<Object> {
      return Promise.resolve(JSON.parse(obj))
    },

    /// @name formats.json.stringify
    /// @arg {object} obj
    /// @arg {object} settings [{}] The current settings
    /// @returns {string} - The json string
    /// @async
    stringify (obj: Object, settings: Object = {}): Promise<string> {
      const indent: number = ((settings.formats || {}).json || {}).spacing || settings.spacing
      return Promise.resolve(JSON.stringify(obj, null, indent))
    },
  })
}

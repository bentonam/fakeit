// @flow
import yaml from 'yamljs'

export default function (config: Object): void {
  config.format('yaml', {
    /// @name formats.yaml.parse
    /// @alias formats.yml.parse
    /// @arg {string, object} obj
    /// @returns {object} - The javascript object
    /// @async
    parse (obj: string): Promise<Object> {
      return Promise.resolve(yaml.parse(obj))
    },

    /// @name formats.yaml.stringify
    /// @alias formats.yml.stringify
    /// @arg {object} obj
    /// @arg {object} settings [{}] The current settings
    /// @returns {string} - The yaml string
    /// @async
    stringify (obj: Object, settings: Object = {}): Promise<string> {
      const indent: number = ((settings.formats || {}).yaml || {}).spacing || settings.spacing
      return Promise.resolve(yaml.stringify(obj, 100, indent)
        .trim())
    },
  })
  config.format('yml', config.formats.yaml)
}

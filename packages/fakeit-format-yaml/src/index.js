import yaml from 'yamljs'

const parsers = {}

parsers.yaml = {
  ///# @name parsers.yaml.parse
  ///# @alias parsers.yml.parse
  ///# @arg {string, object} obj
  ///# @returns {object} - The javascript object
  ///# @async
  parse: (obj) => Promise.resolve(yaml.parse(obj)),

  ///# @name parsers.yaml.stringify
  ///# @alias parsers.yml.stringify
  ///# @arg {object} obj
  ///# @arg {number} indent [2] The indent level
  ///# @returns {string} - The yaml string
  ///# @async
  stringify (obj, indent = 2) {
    return Promise.resolve(yaml.stringify(obj, 100, indent)
      .trim())
  },
}

parsers.yml = parsers.yaml

export default {
  parsers,
}

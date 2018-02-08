module.exports = function (config) {
  config.plugin('somePlugin', () => {
    return 'some-plugin'
  })
}

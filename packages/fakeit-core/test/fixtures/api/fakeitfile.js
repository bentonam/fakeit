function woohoo (config) {
  config.plugin('woohoo', () => {
    return 'hellz yeah'
  })
}

module.exports = {
  plugins: [ woohoo, './some-plugin.js' ],
  'merge-array-test': [ 'three', 'four' ],
  threads: 1,
}

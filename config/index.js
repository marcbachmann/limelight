var path = require('path')
var app = require('app')
var _ = require('lodash')
var userData = app.getPath('userData')

module.exports = {
  current: {},
  isLoaded: false,
  updateConfig: function (callback) {
    this.current = {
      pluginsDirectory: path.join(userData, 'plugins'),
      configDirectory: path.join(userData, 'config')
    }
    try {
      _.extend(this.current, require('./application'))
    } catch (err) {
      return callback(err)
    }
    this.isLoaded = true
    callback(null)
  }
}

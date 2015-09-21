module.exports = {}

Object.defineProperty(module.exports, 'update', {
  value: function (callback) {
    var _ = require('lodash')
    var path = require('path')
    var app = require('app')
    var userData = app.getPath('userData')

    var defaults = {
      pluginsDirectory: path.join(userData, 'plugins'),
      configDirectory: path.join(userData, 'config'),
      systemConfigFile: path.join(userData, 'config', 'system.json'),
      language: 'en',
      theme: 'default',
      shortcut: 'alt+space'
    }

    loadJson(defaults.systemConfigFile, function (err, json) {
      if (err) return callback(err)
      _.extend(module.exports, defaults, json, {isLoaded: true})
      callback(null)
    })
  }
})

function loadJson (filePath, callback) {
  var fs = require('fs')
  fs.readFile(filePath, 'utf8', function (err, json) {
    if (err && err.code !== 'ENOENT') return callback(err)
    try { json = JSON.parse(json||'{}') } catch (err) { return callback(err) }
    callback(null, json)
  })
}

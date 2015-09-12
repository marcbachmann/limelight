var npm = require('npm')
var config = require('../config')

module.exports = {
  install: function (module, callback) {
    command('install', module, callback)
  },
  uninstall: function (module, callback) {
    command('uninstall', module, callback)
  }
}

function command (action, module, callback) {
  if (!Array.isArray(module)) return callback(new Error('module must be an array'))
  var prefix = config.current.pluginsDirectory
  npm.load({dev: false, global: true, prefix: prefix}, function (err) {
    if (err) return callback(err)
    npm.commands[action](module, callback)
  })
}

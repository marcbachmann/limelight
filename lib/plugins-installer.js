var events = require('events')
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
  getNpm(function (err, npm) {
    if (err) return callback(err)
    npm.commands[action](module, callback)
  })
}

var npm
var wait = new events.EventEmitter()
function getNpm (callback) {
  if (npm) return callback(null, npm)
  wait.on('getNpm', callback)
  if (wait.listenerCount('getNpm') > 1) return

  var localNpm = require('npm')
  var prefix = config.current.pluginsDirectory
  localNpm.load({dev: false, global: true, prefix: prefix}, function (err) {
    if (err) return wait.emit('getNpm', err)
    npm = localNpm
    wait.emit('getNpm', null, npm)
  })
}

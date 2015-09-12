var app = require('app')
var path = require('path')
var globalShortcut = require('global-shortcut')
var Tray = require('tray')
var SearchWindow = require('./search_window')
var ConfigurationWindow = require('./configuration_window')
var config = require('../config')

function Application () {
  this.tray = undefined
  this.search = undefined
  this.configuration = undefined
  this.hideDockIcon()
}

Application.prototype.start = function (callback) {
  var self = this

  config.updateConfig(function (err) {
    if (err) console.error(err)
    start.call(self)
  })

  function start () {
    this.search = new SearchWindow()
    this.configuration = new ConfigurationWindow()
    this.configuration.on('show', function () { self.showDockIcon() })
    this.configuration.on('hide', function () { self.hideDockIcon() })

    // Initialize the application tray
    this.tray = new Tray(path.join(__dirname, './search@2x.png'))
    this.tray.setToolTip('Limelight')
    this.tray.on('clicked', function trayClicked () {
      self.search.toggleWindow()
    })

    this.tray.on('double-clicked', function trayDoubleClicked () {
      self.search.hide()
      self.configuration.show()
    })

    globalShortcut.register(config.current.shortcut, function () { self.search.toggleWindow() })
    this.configuration.start(function () {
      self.search.start(function (err) {
        if (err) return console.error(err)
        app.on('beforeunload', function () { self.stop() })
      })
    })
  }
}

Application.prototype.showDockIcon = function () {
  app.dock.show()
}

Application.prototype.hideDockIcon = function () {
  app.dock.hide()
}

Application.prototype.stop = function (callback) {
  callback = callback || function stopCallback (err) { if (err) throw err }

  var self = this
  globalShortcut.unregister(config.current.shortcut)
  this.search.stop(function (err) {
    if (err) return callback(err)
    self.configuration.stop(callback)
  })
}

module.exports = Application

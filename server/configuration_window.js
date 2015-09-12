var util = require('util')
var path = require('path')
var express = require('express')
var BaseWindow = require('./base_window')
var PluginCollection = require('../lib/plugins-loader')

function ConfigurationWindow () {
  BaseWindow.call(this, {frame: false, width: 800, height: 620, 'hide-on-blur': false, navigation: './configuration_window_menu'})
}

util.inherits(ConfigurationWindow, BaseWindow)

ConfigurationWindow.prototype.startServer = function (callback) {
  var self = this
  var app = express()
  app.use(express.static(path.join(__dirname, '../client/configuration')))
  app.use('/assets', express.static(path.join(__dirname, '../bower_components')))
  app.use('/assets/plugins', express.static(path.join(__dirname, '../plugins')))
  app.get('/plugins', function (req, res) { res.send('search') })
  app.get('/plugins/:plugin', function (req, res) {res.send('plugin: ' + req.params.plugin)})
  app.get('/plugins/:plugin/config', function (req, res) {res.send('config')})
  self.client.on('plugins', function (req, next) {
    var plugins = new PluginCollection()
    plugins.loadAll(path.join(__dirname, '../plugins'), next)
  })

  this.server = app.listen(0, function (err) {
    if (err) return callback(err)

    var port = self.server.address().port
    var host = 'localhost'
    self.server.options = {
      port: port,
      host: host,
      url: 'http://' + host + ':' + port
    }

    callback(null, self.server.options)
  })
}

ConfigurationWindow.prototype.start = function (callback) {
  var self = this
  this.startServer(function (err, server) {
    if (err) callback(err)
    self.window.loadUrl(server.url)
    callback(null, server)
  })
}

ConfigurationWindow.prototype.stop = function (callback) {
  this.window.close()
  this.client.destroy()
  this.server.close(callback)
  true
}

module.exports = ConfigurationWindow

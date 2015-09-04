var _ = require('lodash')
var path = require('path')
var util = require('util')
var express = require('express')
var BaseWindow = require('./base_window')
var PluginCollection = require('../lib/plugins-loader')

function SearchWindow () {
  var hideOnBlur = process.argv[2] !== 'debug'
  BaseWindow.call(this, {resizable: false, frame: false, 'hide-on-blur': hideOnBlur, navigation: './search_window_menu'})
  this.plugins = new PluginCollection()
  process.env.LIMELIGHT_APPEARANCE = 'dark'
  updateBounds.call(this)
  this.window.on('focus', updateBounds.bind(this))
}

util.inherits(SearchWindow, BaseWindow)

SearchWindow.prototype.start = function (callback) {
  var self = this

  this.startServer(function (err, server) {
    if (err) callback(err)
    self.window.loadUrl(server.url)
    self.client.on('expand', function () { self.expand() })
    self.client.on('shrink', function () { self.shrink() })
    callback(null, server)
  })
}

SearchWindow.prototype.startServer = function (callback) {
  var self = this
  var app = express()
  app.use(express.static(path.join(__dirname, '../client/search')))
  app.use('/assets', express.static(path.join(__dirname, '../bower_components')))
  self.client.on('search', function (req, callback) { self.search(req, callback) })
  app.get('/plugins/:plugin', function (req, res) {
    var query = JSON.parse(req.query.query)
    self.plugins.get(req.params.plugin, query, function (err, response) {
      if (err) return res.status(500).send(err.stack)
      if (!response) return res.sendStatus(404)
      res.set('content-type', 'text/html')
      res.send(response.html)
    })
  })

  self.client.on('run', function (req, callback) {
    console.log(JSON.stringify(req))
    self.plugins.run(req.body.item.plugin, req.body.item.query, callback)
  })

  app.use('/plugins/', express.static(path.join(__dirname, '../plugins')))

  this.server = app.listen(0, function (err) {
    if (err) return callback(err)

    var port = self.server.address().port
    var host = 'localhost'
    self.server.options = {
      port: port,
      host: host,
      url: 'http://' + host + ':' + port
    }

    self.plugins.loadAll(path.join(__dirname, '../plugins'), function (err) {
      if (err) console.log(err)
      callback(null, self.server.options)
    })
  })
}

SearchWindow.prototype.search = function (req, callback) {
  if (!req.body.query) return callback()
  if (this.currentSearch) this.currentSearch.cancel()
  this.currentSearch = this.plugins.search(req.body.query, function (err, results) {
    this.currentSearch = undefined
    if (err) return callback(err)
    callback(null, results)
  })
}

_.each(['expand', 'shrink'], function (st) {
  SearchWindow.prototype[st] = function () {
    var state = st + 'ed'
    var needsUpdate = this.state !== state
    this.state = state
    if (needsUpdate) updateBounds.call(this)
  }
})

SearchWindow.prototype.stop = function (callback) {
  this.window.close()
  this.client.destroy()
  this.server.close(callback)
  true
}

function updateBounds () {
  var screen = require('screen')
  var cursorPos = screen.getCursorScreenPoint()
  var display = screen.getDisplayNearestPoint(cursorPos)
  var width = 680
  var left = display.workArea.x + ((display.workArea.width - width) / 2)
  var top = display.workArea.y + 216
  var height = this.state === 'shrinked' ? 58 : 550
  this.bounds = {width: width, height: height, x: left, y: top}
  this.window.setBounds(this.bounds)

  // TODO: move the 'theme' initialization somewhere else
  ensureAppearance()
}

function ensureAppearance () {
  require('dark-mode').isDark(function (err, isDark) {
    if (err) return console.error(err)

    var mode
    if (isDark) mode = 'dark'
    else mode = 'light'
    process.env.LIMELIGHT_APPEARANCE = mode
  })
}

module.exports = SearchWindow

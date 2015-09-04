var util = require('util')
var EventEmitter = require('events').EventEmitter
var BrowserWindow = require('browser-window')
var Menu = require('menu')
var Server = require('electron-rpc/server')

function BaseWindow (options) {
  var self = this
  EventEmitter.call(this)
  this.window = new BrowserWindow({resizable: options.resizable, show: false, frame: options.frame || false, width: options.width, height: options.height, y: options.top, x: options.left})
  this.window.setVisibleOnAllWorkspaces(true)
  if (options.navigation) this._navigation = Menu.buildFromTemplate(require(options.navigation)(this.window))

  this.client = new Server()
  this.client.configure(this.window.webContents)
  this.client.on('hide', function () { self.hide() })
  require('ipc').on('hide', function (evt, data) {
    console.log(evt, data)
  })

  if (options['hide-on-blur']) this.window.on('blur', function () { self.hide() })
  if (options['hide-on-blur']) this.window.on('focus', function () { self.show() })
  this.window.on('close', function (evt) { self.hide(); evt.preventDefault() })
  this.window.webContents.on('dom-ready', function () { self.client.send('dom-ready') })
}

util.inherits(BaseWindow, EventEmitter)

BaseWindow.prototype.show = function () {
  var self = this
  if (this._navigation) Menu.setApplicationMenu(this._navigation)
  setImmediate(function () {
    self.emit('show')
    self.client.send('show')
    self.window.show()
  })
}

BaseWindow.prototype.hide = function () {
  this.emit('hide')
  this.client.send('hide')
  this.window.hide()
}

BaseWindow.prototype.toggleWindow = function () {
  if (!this.window.isVisible()) this.show()
  else this.hide()
}

module.exports = BaseWindow

var riot = require('riot')
var _ = require('lodash')
var Client = require('electron-rpc/client')
var client = new Client()

function route (path) {
  return {
    init: function () {
      var self = this
      self.route = {}
      riot.observable(self.route)

      riot.route(function (collection, id, action) {
        var current = [collection]
        if (id) current.push(id)
        if (id && action) current.push(action)
        self.route.collection = collection
        self.route.id = id
        self.route.action = action
        self.path = current.join('/')

        if (self.path === path.replace(':id', id)) {
          self.update({show: true})
          self.route.trigger('show')
        } else {
          self.update({show: false})
          self.route.trigger('hide')
        }
      })
    }
  }
}

var fs = require('fs')
var home = require('remote').require('app').getAppPath()
var path = require('path')

var readTemplate = function (name) {
  return fs.readFileSync(path.join(home, 'client/configuration/templates', name + '.html'), 'utf8')
}

var html = {
  list: readTemplate('list-plugins'),
  show: readTemplate('show-plugin'),
  configure: readTemplate('configure-plugin')
}

riot.tag('list-plugins', html.list, function (ctx) {
  var self = this
  this.mixin(route('plugins'))
  this.plugins = []

  this.goto = function (evt) {
    riot.route('plugins/' + evt.item.name)
  }

  this.route.on('show', function () {
    client.request('plugins', function (err, plugins) {
      if (err) return console.log(err)
      self.update({plugins: plugins})
    })
  })
})

riot.tag('show-plugin', html.show, function (ctx) {
  var self = this
  this.mixin(route('plugins/:id'))
  this.plugin = undefined

  this.route.on('show', function () {
    client.request('plugins', function (err, plugins) {
      if (err) return console.log(err)
      var plugin = _.find(plugins, {name: self.route.id})
      self.update({plugin: plugin})
    })
  })
})

riot.tag('configure-plugin', html.configure, function (ctx) {
  var self = this
  this.mixin(route('plugins/:id/configure'))
  this.plugins = []

  this.route.on('show', function () {
    client.request('plugins', function (err, plugins) {
      if (err) return console.log(err)
      self.update({plugins: plugins})
    })
  })
})

client.on('dom-ready', function () {
  riot.mount('*')
  riot.route.start()
  riot.route('plugins')
})

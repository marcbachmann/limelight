var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var async = require('async')
var Plugin = require('./plugin_model')
var Classifier = require('../query')

module.exports = PluginCollection

function PluginCollection () {
  this.classifier = new Classifier()
  this.plugins = []
}

PluginCollection.prototype.loadAll = function (pluginsDir, callback) {
  var self = this
  fs.readdir(pluginsDir, function (err, dirs) {
    if (err) return callback(err)
    dirs = _.filter(dirs, function (dir) {return !/^\./.test(dir) })
    dirs = _.map(dirs, function (dir) { return path.join(pluginsDir, dir) })
    async.map(dirs, Plugin.load, function (err, loadedPlugins) {
      if (err) console.log('Failed to load plugins:', err)
      _.each(loadedPlugins, function (plugin) {
        if (!plugin) return
        self.classifier.add(plugin)
        self.plugins.push(plugin)
      })
      callback(err)
    })
  })
}

PluginCollection.prototype.list = function (callback) {
  var p = _.map(this.plugins, function (p) { return _.pick(p, 'name', 'version', 'displayName', 'description') })
  callback(null, p)
}

// title: ''
// html: ''
// run_args: []
// webview_link_open_in_browser: true
// dont_force_top_hits: true
// webview_user_agent: ''
// webview_transparent_background: true
// pass_result_of_output_function_as_first_run_arg: true
// darkmode

function GroupsCollection () {
  this.groups = []
  this.groupIndex = {}
  this.addGroup({
    name: 'Top Hit',
    children: []
  })
}

GroupsCollection.prototype.addGroup = function (group) {
  if (!group) return
  if (!group.children.length) return

  if (!group.name) {
    group = {
      name: 'Top Hit',
      children: []
    }
  }

  var index = this.groupIndex[group.name]
  if (_.isNumber(index)) {
    var g = this.groups[index]
    g.children = g.children.concat(group.children)
  } else {
    index = this.groups.push(group) - 1
    this.groupIndex[group.name] = index
  }
}

GroupsCollection.prototype.getGroups = function () {
  return this.groups
}

PluginCollection.prototype.search = function (query, callback) {
  if (!query) return callback()

  var plugins = this.classifier.getMatches(query)
  plugins = _.uniq(plugins, 'plugin.name')
  var processes = []
  async.map(plugins, function (p, done) {
    processes.push(p.plugin.list(p.query, done))
  }, function (err, results) {
    if (err) return callback(err)
    var groups = new GroupsCollection()
    _.each(results, groups.addGroup, groups)
    callback(null, groups.getGroups())
  })

  return {
    cancel: function () {
      _.invoke(processes, 'kill')
    }
  }
}

PluginCollection.prototype.get = function (item, query, callback) {
  var plugin = _.find(this.plugins, {name: item.plugin})
  if (!plugin) return callback()
  plugin.get(item, query, callback)
}

PluginCollection.prototype.run = function (item, query, callback) {
  var plugin = _.find(this.plugins, {name: item.plugin})
  if (!plugin) return callback()
  plugin.run(item, query, callback)
}

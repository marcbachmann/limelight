/*
A valid manifest of a plugin
```
{
  "name": "emoji",
  "version": "1.0.0",
  "description": "Search and copy emoji.",
  "examples": ["emoji grin", "heart emoji", ":rocket:"],
  "displayName": "Emoji",
  "categories": ["Utilities", "Featured"],
  "author": { "name": "Marc Bachmann" },
  "icon": "Icon.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/marcbachmann/flashlight-emoji"
  }
}
```

// run can return
// title: ''
// html: ''
// run_args: []
// webview_link_open_in_browser: true
// dont_force_top_hits: true
// webview_user_agent: ''
// webview_transparent_background: true
// pass_result_of_output_function_as_first_run_arg: true
// darkmode

*/
var fs = require('fs')
var _ = require('lodash')
var path = require('path')
var spawn = require('child_process').spawn
var exec = require('child_process').exec

function Plugin (raw) {
  this.raw = raw || {}
  this.raw.limelight = this.raw.limelight || {}

  this.name = this.raw.name
  this.version = this.raw.version
  this.os = this.raw.os || ['darwin', 'debian', 'win']
  this.raw = this.raw
  this.sentences = this.sentences || []
  this._setMetadata(this.raw)
}

Plugin.prototype._setMetadata = function () {
  var raw = this.raw
  this.displayName = raw.limelight.displayName || raw.displayName
  this.description = raw.limelight.description || raw.description

  if (raw.author) {
    this.author = {
      name: raw.author.name || raw.author,
      email: raw.author.email,
      url: raw.author.url
    }
  }
}

Plugin.prototype.setPath = function (pluginDir) {
  this.path = pluginDir
  this.mainFilePath = path.join(pluginDir, this.raw.limelight.main)
}

Plugin.load = function (pluginDir, callback) {
  var manifestPath = path.join(pluginDir, 'package.json')
  fs.readFile(manifestPath, {encoding: 'utf8'}, function (err, manifest) {
    if (err && err.code === 'ENOENT') return callback()
    if (err) return callback(err)
    try {
      manifest = JSON.parse(manifest)
      var plugin = new Plugin(manifest)
      plugin.setPath(pluginDir)
    } catch (e) {
      return callback(err)
    }

    plugin.initSentences(function (err) {
      if (err) return callback(err)
      callback(null, plugin)
    })
  })
}

Plugin.prototype.initSentences = function (callback) {
  var self = this
  var examples = path.join(this.path, 'examples.txt')
  fs.readFile(examples, 'utf8', function (err, file) {
    if (err && err.code !== 'ENOENT') return callback(err)
    if (!file || !file.trim()) return callback()
    self.sentences = file.trim().split('\n').map(function (s) { return s.trim() })
    callback()
  })
}

function listTransform (query, callback) {
  return function transformMethod (err, response) {
    if (err) {
      console.log(err)
      return callback()
    }
    if (!response) return callback()
    if (!response.children) {
      response = {
        name: 'Top Hit',
        children: [{
          name: response.title,
          plugin: this.name
        }] }
    }

    response.children = _.map(response.children, function (child) {
      child.query = query
      return child
    })

    callback(null, response)
  }
}

var runNode = function (query, command, callback) {
  require(this.mainFilePath)[command](query, callback)
}

var runPython = function (query, command, callback) {
  var args = ['python', path.join(__dirname, 'run.py'), this.mainFilePath, command, "'"+JSON.stringify(query)+"'"].join(' ')
  var PYTHONPATH = '/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python:' + __dirname + '/helpers'
  var env = _.extend({}, process.env, {PYTHONPATH: PYTHONPATH})
  return exec(args, {timeout: 5000, env: env}, function (err, stdout, stderr) {
    if (err) return callback(new Error('Invalid response: ' + err.stack))
    if (stderr) return callback(new Error(stderr))
    if (!stdout) return callback()
    try {
      var output = JSON.parse(stdout)
    } catch (err) {
      return callback(err)
    }

    callback(null, output)
  })
}

Plugin.prototype.list = function (query, callback) {
  callback = listTransform(query, callback).bind(this)
  if (/\.js$/.test(this.mainFilePath)) runNode.call(this, query, 'list', callback)
  else return runPython.call(this, query, 'results', callback)
}

function runTransform (callback) {
  return function transformMethod (err, response) {
    if (err) {
      console.log(err)
      return callback()
    }
    callback(null, response)
  }
}

Plugin.prototype.get = function (query, callback) {
  if (/\.js$/.test(this.mainFilePath)) runNode.call(this, query, 'get', callback)
  else return runPython.call(this, query, 'results', callback)
}

Plugin.prototype.run = function (query, callback) {
  callback = runTransform(callback).bind(this)
  if (/\.js$/.test(this.mainFilePath)) require(this.mainFilePath).run(query, callback)
  else return runPython.call(this, query, 'run', callback)
}

module.exports = Plugin

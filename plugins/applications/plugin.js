var mdfind = require('../../lib/find')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')
var html = fs.readFileSync(path.join(__dirname, 'show.html'), 'utf8')

module.exports = {
  list: function (query, callback) {
    mdfind({
      type: 'app',
      query: query['~query'],
      directories: ['/Applications'],
      limit: 15
    }, function (err, apps) {
      if (err) console.log(err)
      apps = _.map(apps, function (app) {
        app.query = query
        app.plugin = 'applications'
        return app
      })
      callback(null, {name: 'Applications', children: apps})
    })
  },

  get: function (item, query, callback) {
    page = html
      .replace('{{feature.name}}', item.plugin)
      .replace('{{feature.description}}', '')
      .replace('{{feature.icon}}', 'Google Chrome.app' + '/Contents/Resources/app.icns')
    callback(null, {html: page})
  },

  run: function (item, query, callback) {

  }
}

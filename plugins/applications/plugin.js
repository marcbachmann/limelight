var mdfind = require('../../lib/find')
var _ = require('lodash')

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

  get: function (query, callback) {
      callback(null, {html: query})
  },

  run: function (query, callback) {

  }
}

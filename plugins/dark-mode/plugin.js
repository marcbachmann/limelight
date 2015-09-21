var darkMode = require('dark-mode')

module.exports = {
  list: function (query, callback) {
    callback(null, {name: 'Utilities', children: [{name: 'Toggle dark mode', plugin: 'dark-mode'}]})
  },

  get: function (item, query, callback) {
    darkMode.isDark(function (err, isDark) {
      if (err) return callback(err)
      var type = isDark? 'dark': 'light'
      callback(null, {html: 'Press return to toggle to ' + type + ' mode.'})
    })
  },

  run: function (item, query, callback) {
    darkMode.toggle(null, callback)
  }
}

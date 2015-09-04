var riot = require('riot')
var _ = require('lodash')
var Client = require('electron-rpc/client')
var client = new Client()
var tags = {}

// Inter Tag Communication
var EventEmitter = require('events').EventEmitter
var itc = new EventEmitter()

client.on('dom-ready', function () {
  client.request('shrink')

  // Hide window when user presses 'esc'
  document.addEventListener('keyup', function (evt) {
    if (evt.which === 27) {
      evt.preventDefault()
      client.request('hide')
    }
  })

  // Disable Pinch Zoom
  document.addEventListener('mousewheel', function (evt) {
    if (evt.ctrlKey) {
      evt.preventDefault()
    }
  })

  tags.search = riot.mount('.search', 'search')
  riot.mount('.list', 'list')
  riot.mount('.view', 'view')
})

client.on('show', function () {
  document.body.className = 'appearance-' + require('remote').process.env.LIMELIGHT_APPEARANCE
})

var fs = require('fs')
var home = require('remote').require('app').getAppPath()
var path = require('path')

var readTemplate = function (name) {
  return fs.readFileSync(path.join(home, 'client/search/templates', name + '.html'), 'utf8')
}

var html = {
  search: readTemplate('search'),
  list: readTemplate('list'),
  view: readTemplate('view')
}

riot.tag('search', html.search, function (ctx) {
  var self = this
  this.shadowText = undefined

  client.on('hide', function () {
    self.previousValue = undefined
  })

  client.on('show', function () {
    self.search.select()
  })

  this.searchChanged = function (e) {
    self.shadowText = self.search.value.replace(/\ /g, '\u00a0')
    if (self.search.value) {
      var search = self.search.value.trim()
      if (self.previousValue && search === self.previousValue) return
      self.previousValue = search
      self.triggerSearch(search)
    } else {
      self.previousValue = undefined
      self.defineSuggestion()
      client.request('shrink')
    }
  }

  this.triggerSearch = _.throttle(function (query) {
    self.defineSuggestion('– No Results')
    client.request('search', {query: query}, function (err, results) {
      var show = results ? 'expand' : 'shrink'
      client.request(show)
      if (err) return console.log(err)
    })
  }, 300)

  this.defineSuggestion = function (text) {
    self.update({suggestion: text})
  }

  this.onListKeyUp = function () {
    setTimeout(function () {self.search.select()}, 1)
  }

  this.onKeydown = function (evt) {
    if (event.keyCode === 13) {
      itc.emit('list-run-item', evt)
    }
    return true
  }

  this.on('mount', function () {
    itc.on('list-key-up', self.onListKeyUp)
  })

  this.on('unmount', function () {
    itc.removeListener('list-key-up', self.onListKeyUp)
  })
})

riot.tag('list', html.list, function (ctx) {
  var self = this
  this.groups = []

  this.handleRequest = function (err, result) {
    if (err || !result) return console.log(err)
    self.groups = result.groups
    // self.groups[0].children[0].highlighted = true
    self.update()
  }

  var resetHighlight = function () {
    var values = _(self.groups).pluck('children').flatten().value()
    var index = _.findIndex(values, {highlighted: true})
    values[index] && (values[index].highlighted = false)
    return {values: values, index: index}
  }

  function setHighlight (values, index) {
    var value = values[index]
    value.highlighted = true
    itc.emit('list-highlight-item', value)
    itc.emit('list-key-up', value)
  }

  this.onKeyDown = function (evt) {
    var vals, index
    if (evt.keyCode === 38) {
    // up
      vals = resetHighlight()
      index = Math.max(vals.index - 1, 0)
      setHighlight(vals.values, index)
      self.update()
    } else if (evt.keyCode === 40) {
    // down
      vals = resetHighlight()
      index = Math.min(vals.index + 1, vals.values.length - 1)
      setHighlight(vals.values, index)
      self.update()
    }
  }

  this.onItemClick = function (evt) {
    var vals = resetHighlight()
    var index = vals.values.indexOf(evt.item)
    if (index === -1) return
    itc.emit('list-item-click', evt)
    setHighlight(vals.values, index)
  }

  this.onItemDoubleClick = function (evt) {
    itc.emit('list-run-item', evt)
  }

  this.on('mount', function () {
    client.on('search', self.handleRequest)
    window.document.addEventListener('keydown', self.onKeyDown)
  })

  this.on('unmount', function () {
    client.removeListener('search', self.handleRequest)
    window.document.removeEventListener('keydown', self.onKeyDown)
  })
})

riot.tag('view', html.view, function (ctx) {
  var self = this

  this.handleRequest = _.throttle(function (err, res) {
    if (err) return console.log(err)
    if (_.isEmpty(res.groups)) return console.log('no content found')
    self.showItem(res.groups[0].children[0])
  }, 300)

  this.handleLinkClick = function (evt) {
    require('shell').openExternal(evt.url)
  }

  this.updateUrl = function (result) {
    if (result.useragent) self.webview.useragent = result.useragent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    if (result.src) self.webview.src = result.src
    self.update()
  }

  this.showItem = function (item) {
    if (!item) return
    var src = window.location.protocol + '//' + window.location.host+'/plugins/' + item.plugin + '/?query=' + JSON.stringify(item.query)
    self.updateUrl({src: src})
  }

  this.runItem = function (evt) {
    client.request('run', evt, function (err) {
      if (err) console.error(err.message)
      console.log('ran')
    })
  }

  this.on('mount', function () {
    client.on('search', self.handleRequest)
    self.webview.addEventListener('new-window', self.handleLinkClick)
    itc.on('list-highlight-item', self.showItem)
    itc.on('list-run-item', self.runItem)
  })

  this.on('unmount', function () {
    client.removeListener('search', self.handleRequest)
    self.webview.removeEventListener('new-window', self.handleLinkClick)
    itc.removeListener('list-highlight-item', self.showItem)
    itc.removeListener('list-run-item', self.runItem)
  })
})

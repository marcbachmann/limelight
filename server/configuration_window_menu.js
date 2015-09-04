module.exports = function (window) {
  return [{
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        selector: 'performMiniaturize:'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        selector: 'performClose:'
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        selector: 'terminate:',
        click: function () { require('app').quit(true) }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function () { window.reload() }
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function () { window.toggleDevTools() }
      }
    ]
  }]
}

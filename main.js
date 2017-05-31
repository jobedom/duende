const path = require('path')
const menubar = require('menubar')

const appPath = path.resolve(__dirname, 'app')
const iconPath = path.resolve(appPath, 'icons/IconTemplate.png')

const mb = menubar({
   dir: appPath,
   icon: iconPath,
   preloadWindow: true,
   width: 400,
   height: 400,

})

mb.on('after-hide', () => {
   mb.app.hide()
})

mb.on('ready', () => {
   console.log('app is ready')
})

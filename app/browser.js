const path = require('path')
const menubar = require('menubar')

const appPath = __dirname
const iconPath = path.resolve(appPath, 'icons/IconTemplate.png')

const DEVELOPMENT = process.env.NODE_ENV === 'development'
const PRODUCTION = !DEVELOPMENT

global.DEVELOPMENT = DEVELOPMENT
global.PRODUCTION = PRODUCTION

const mb = menubar({
   dir: appPath,
   icon: iconPath,
   preloadWindow: true,
   alwaysOnTop: DEVELOPMENT,
   width: 400,
   height: 400,

})

mb.on('after-hide', () => {
   mb.app.hide()
})

mb.on('ready', () => {
   if (DEVELOPMENT)
      mb.window.openDevTools()
})

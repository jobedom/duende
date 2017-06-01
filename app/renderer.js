const Vue = require('vue/dist/vue')
const stylus = require('stylus')
const remote = require('electron').remote
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const insertCss = require('insert-css')

window.DEVELOPMENT = remote.getGlobal('DEVELOPMENT')
window.PRODUCTION = remote.getGlobal('PRODUCTION')

if (DEVELOPMENT) {
   const devToolsInstaller = require('electron-devtools-installer')
   const installExtension = devToolsInstaller.default
   const VUEJS_DEVTOOLS = devToolsInstaller.VUEJS_DEVTOOLS
   installExtension(VUEJS_DEVTOOLS)
      .catch((error) => console.error('DevTools Error', error))
}

const defaultTemplate = '<slot></slot>'

const componentsPath = path.resolve(__dirname, 'components') + '/'
const componentsGlob = componentsPath + '**/index.js'
const stylesGlob = componentsPath + '**/styles.styl'

const stylesPath = path.resolve(__dirname, 'styles') + '/'
const definitionsPath = stylesPath + 'definitions/**'
const mixinsPath = stylesPath + 'mixins/**'

const mainStylesPath = path.resolve(__dirname, 'styles/main.styl')

glob(componentsGlob, (error, files) => {
   if (error)
      throw error
   _.each(files, file => {
      const name = file
         .replace(componentsPath, '')
         .replace(/\/index\.js$/, '')
         .replace(/\//g, '-')
      const folder = path.dirname(file) + '/'
      const templatePath = folder + 'template.html'
      let template = defaultTemplate
      try {
         template = fs.readFileSync(templatePath, 'utf8')
      } catch (e) { /* ... */ }
      template = `<div class="component-${name}">${template}</div>`
      const definition = require(file)
      definition.template = template
      Vue.component(name, definition)
   })

   const insertStylus = (source, filename) =>  {
      stylus(source)
         .set('filename', filename)
         .import(definitionsPath)
         .import(mixinsPath)
         .render((error, css) => {
            if (error)
               console.error(error.name, error.message)
            else
               insertCss(css)
         })
   }

   const mainStylesSource = fs.readFileSync(mainStylesPath, 'utf8')
   insertStylus(mainStylesSource, mainStylesPath)

   glob(stylesGlob, (error, files) => {
      if (error)
         throw error
      _.each(files, file => {
         const name = file
            .replace(componentsPath, '')
            .replace(/\/styles\.styl$/, '')
            .replace(/\//g, '-')
         const str = fs.readFileSync(file, 'utf8')
         const indentation = '    '
         const lines = str.split('\n')
         const indentedLines = _.map(lines, line => indentation + line)
         const indentedSource = indentedLines.join('\n')
         const finalSource =
            `div.component-${name}\n` +
            indentation + 'component()\n' +
            indentedSource
         insertStylus(finalSource, file)
      })
      new Vue({
         el: '#mount-point',
         template: '<duende></duende>'
      })
   })
})

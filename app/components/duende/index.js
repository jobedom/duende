const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const quote = require('regexp-quote')
const chokidar = require('chokidar')
const remote = require('electron').remote
const exec = require("child_process").exec

module.exports = {

   data() {
      return {
         docFilePath: null,
         title: '',
         apps: {},
         options: []
      }
   },

   methods: {
      loadDocument() {
         this.title = ''
         this.options = []
         if (!this.docFilePath)
            return
         fs.readFile(this.docFilePath, 'utf8', (error, str) => {
            if (error)
               console.error(error)
            else {
               const doc = JSON.parse(str)
               this.title = doc.title
               this.apps = doc.apps
               _.each(doc.options, item => {
                  const separator = (item === '-')
                  if (separator) {
                     const len = this.options.length
                     if (len > 0)
                        this.options[len - 1].separator = true
                  } else {
                     item.separator = false
                     this.options.push(item)
                  }
               })
            }
         })
      },

      setupDocumentWatcher() {
         this.watcher = chokidar.watch(this.docFilePath)
         this.watcher.on('change', () => {
            this.loadDocument()
         })
         this.watcher.on('unlink', () => {
            console.log('UNLINK!')
         })
      },

      removeDocumentWatcher() {
         this.watcher.close()
      },

      resizeWindow() {
         const win = remote.getCurrentWindow()
         const [width, ] = win.getSize()
         const content = this.$refs.content
         const newHeight = content.offsetHeight
         win.setSize(width, newHeight)
      },

      expandMacros(str) {
         if (!this.macros) {
            this.macros = []
            const macros = {
               p: `"${this.projectPath}"`
            }
            _.assign(macros, this.apps)
            _.each(macros, (value, name) => {
               const pattern = '%' + quote(name) + '\\b'
               const regexp = new RegExp(pattern, 'g')
               this.macros.push([regexp, value])
            })
         }
         let expanded = str
         _.each(this.macros, ([regexp, value]) => {
            expanded = expanded.replace(regexp, value)
         })
         return expanded
      },

      execute(cmd) {
         console.log(cmd)
         exec(cmd, error => {
            if (error)
               console.error('Execute error:', error)
         })
      }
   },

   mounted() {
      this.projectPath = path.resolve(__dirname, '../../..')
      this.docFilePath = path.resolve(this.projectPath, '.duende')
      this.loadDocument()
      this.setupDocumentWatcher()
   },

   updated() {
      this.resizeWindow()
   },

   destroyed() {
      this.removeDocumentWatcher()
   }

}

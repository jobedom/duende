const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const chokidar = require('chokidar')

module.exports = {

   data() {
      return {
         docFilePath: null,
         title: '',
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

      clickItem(item) {
         let cmd = item.cmd
         cmd = cmd.replace(/%p/g, this.projectPath)
         const matches = /^\s*([\w\s_]+\.app)\s*(.*)$/i.exec(cmd)
         if (matches)
            cmd = 'open -n -a "' + matches[1] + '" --args ' + matches[2]
         console.log(cmd)
         const exec = require("child_process").exec
         exec(cmd, error => {
            if (error)
               console.error('Launch error:', error)
         })
      }
   },

   mounted() {
      this.projectPath = path.resolve(__dirname, '../../..')
      this.docFilePath = path.resolve(this.projectPath, '.duende')
      this.loadDocument()
      this.setupDocumentWatcher()
   },

   destroyed() {
      this.removeDocumentWatcher()
   }

}

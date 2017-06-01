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
                  if (separator)
                     item = {
                        label: ''
                     }
                  item.separator = separator
                  this.options.push(item)
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
         console.log('item', JSON.stringify(item))
      }
   },

   mounted() {
      this.docFilePath = path.resolve(__dirname, '../../../.duende')
      this.loadDocument()
      this.setupDocumentWatcher()
   },

   destroyed() {
      this.removeDocumentWatcher()
   }

}

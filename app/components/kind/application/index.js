const _ = require('lodash')

module.exports = {
   props: [
      'expandMacros',
      'execute',
      'item'
   ],

   methods: {
      onClick() {
         let cmd = this.item.cmd
         cmd = this.expandMacros(cmd)
         const matches = /^\s*([\w\s_]+\.app)\s*(.*)$/i.exec(cmd)
         if (!matches) {
            console.error('Unknown command', cmd)
            return
         }
         cmd = 'open -n -a "' + matches[1] + '" --args ' + matches[2]
         this.execute(cmd)
      }
   }
}

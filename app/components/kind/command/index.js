const _ = require('lodash')

module.exports = {
   props: [
      'expandMacros',
      'execute',
      'item'
   ],

   methods: {
      onClick() {
         const cmd =
            `osascript &>/dev/null <<EOF
               tell application "iTerm"
                  tell current terminal
                     launch session "Default Session"
                     tell the last session
                        write text "cd %p"
                     end tell
                  end tell
               end tell
            EOF`
         this.execute(cmd)
      }
   }
}

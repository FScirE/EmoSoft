const vscode = require('vscode')
const DataHandler = require('./DataHandler')

class EventHandler {
    // Initilize variables
    allowNotificationFocus = true 
    allowNotificationCalm = true
    thresholdFocus = 30
    thresholdCalm = 60
    dataHandler = new DataHandler()

    // Check focus level and notifies user when focus drops below 30%
    async checkFocus() {
        var focus =  await this.dataHandler.getFocus()
        if (focus < this.thresholdFocus && this.allowNotificationFocus == true) {
            const text = 'This program is using the neurosity crown to measure '+
            'your live focus level. Your level recently dropped below 30% which might mean you are too '+
            'unfucosed to be productive in your development. Please check the chat for advice on how to '+
            'regain your focus.'
            vscode.window.showInformationMessage('You seem to be unfucosed.', 'Show more').then(_=>{
                vscode.window.showInformationMessage('Focus', {modal:true, detail:text})})
            this.allowNotificationFocus = false
        }
        if (this.allowNotificationFocus == false && focus > this.thresholdFocus+5) { //Reset boolean that allows notifications
            this.allowNotificationFocus = true
        }
    }
    // Check calmness level and notifies user when calmness drops below 30%
    async checkCalm() {
        var calm = await this.dataHandler.getCalm()
        if (calm < this.thresholdCalm && this.allowNotificationCalm == true) {
            const text = 'This program is using the neurosity crown to measure '+
            'your live calmness level. Your level recently dropped below 30% which might mean you are too '+
            'agitated to be productive in your development. Please check the chat for advice on how to '+
            'regain your calmness.'
            vscode.window.showInformationMessage('You seem to be agitated.', 'Show more').then(_=>{
                vscode.window.showInformationMessage('Calmness', {modal:true, detail:text})})
            this.allowNotificationCalm = false
        }
        if (this.allowNotificationCalm == false && calm > this.thresholdCalm+5) { //Reset boolean that allows notifications
            this.allowNotificationCalm = true
        }
    }


}

module.exports = EventHandler

// While program is running and can send notification (just once)
// If (Focus < 30)
// Notify
// Set allowNotificationFocus = 0
// If (Calm < 30)
// Notify
// Set allowNotificationCalm = 0
// A la mejor give generic example here
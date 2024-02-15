// import tommyskod
const vscode = require('vscode')

class EventHandler {
    // Initilize variables
    allowNotificationFocus = true 
    allowNotificationCalm = true

    checkFocus() {
        var focus = 50 // Ska vara focus = DataHandler.getFocus
        if (focus < 30 && this.allowNotificationFocus == true) {
            const text = 'This program is using the neurosity crown to measure '+
            'your live focus level. Your level recently dropped below 30% which might mean you are too '+
            'unfucosed to be productive in your development. Please check the chat for advice on how to '+
            'regain your focus.'
            vscode.window.showInformationMessage('You seem to be unfucosed.', 'Show more').then(_=>{
                vscode.window.showInformationMessage('Focus', {modal:true, detail:text})})
            this.allowNotificationFocus = false
        }
        if (this.allowNotificationFocus == false && focus > 40) {
            this.allowNotificationFocus = true
        }
    }
    checkCalm() {
        var calm = 50 // Ska vara calm = DataHandler.getCalm
        if (calm < 60 && this.allowNotificationCalm == true) {
            const text = 'This program is using the neurosity crown to measure '+
            'your live calmness level. Your level recently dropped below 30% which might mean you are too '+
            'agitated to be productive in your development. Please check the chat for advice on how to '+
            'regain your calmness.'
            vscode.window.showInformationMessage('You seem to be agitated.', 'Show more').then(_=>{
                vscode.window.showInformationMessage('Calmness', {modal:true, detail:text})})
            this.allowNotificationCalm = false
        }
        if (this.allowNotificationCalm == false && calm > 40) {
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
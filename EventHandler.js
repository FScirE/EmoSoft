const vscode = require('vscode')
const {AIHandler} = require('./AIHandler')

class EventHandler {
    // Initilize variables
    constructor (extensionPath, uiHandler) {
        this.allowNotificationFocus = true
        this.allowNotificationCalm = true
        this.thresholdFocus = 0.30
        this.thresholdCalm = 0.60
        this.aiHandler = new AIHandler("", "", extensionPath)
        this.uiHandler = uiHandler
    }

    async init(dataHandler) {
        this.dataHandler = dataHandler;
    }

    // Check focus level and notifies user when focus drops below 30%
    async checkFocus(focus) {
        if (focus < this.thresholdFocus && this.allowNotificationFocus == true) {
            this.allowNotificationFocus = false
            const text = 'This program is using the neurosity crown to measure '+
            'your live focus level. Your level recently dropped below 30% which might mean you are too '+
            'unfucosed to be productive in your development. Please check the chat for advice on how to '+
            'regain your focus.'
            vscode.window.showInformationMessage('You seem to be unfucosed.', 'Show more').then(e=>{ 
                if (e == 'Show more') {
                vscode.window.showInformationMessage('Focus', {modal:true, detail:text})}})
            await this.aiHandler.sendMsgToUnfocuesedDev()
            this.uiHandler.printAIMessage(this.aiHandler.output)
        }
        if (this.allowNotificationFocus == false && focus > this.thresholdFocus+0.1) { //Reset boolean that allows notifications
            this.allowNotificationFocus = true
        }
    }
    // Check calmness level and notifies user when calmness drops below 30%
    async checkCalm(calm) {
        if (calm < this.thresholdCalm && this.allowNotificationCalm == true) {
            this.allowNotificationCalm = false
            const text = 'This program is using the neurosity crown to measure '+
            'your live calmness level. Your level recently dropped below 30% which might mean you are too '+
            'agitated to be productive in your development. Please check the chat for advice on how to '+
            'regain your calmness.'
            vscode.window.showInformationMessage('You seem to be agitated.', 'Show more').then(e=>{
                if (e == 'Show more') {
                vscode.window.showInformationMessage('Calmness', {modal:true, detail:text})}})
            await this.aiHandler.sendMsgToAggitatedDev()
            this.uiHandler.printAIMessage(this.aiHandler.output)
        }
        if (this.allowNotificationCalm == false && calm > this.thresholdCalm+0.1) { //Reset boolean that allows notifications
            this.allowNotificationCalm = true
        }
    }


}

module.exports = {
    EventHandler
}

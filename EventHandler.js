const vscode = require('vscode')
const {AIHandler} = require('./AIHandler')

class EventHandler {
    // Initilize variables
    constructor (extensionPath, uiHandler) {
        this.allowNotificationFocus = true
        this.allowNotificationCalm = true

        this.thresholdFocus = 0.30
        this.thresholdCalm = 0.80
        this.aiHandler = new AIHandler("", "", extensionPath) // should probably only create one AIHandler in extension.js and use as a parameter here

        this.uiHandler = uiHandler
    }

    async init(dataHandler) {
        this.dataHandler = dataHandler;
    }

    async initUIMessage(context) {
        this.uiHandler.webView.webview.onDidReceiveMessage(async message => {
            switch (message.variable) {
            case 'user':
                //console.log(message.value);
                await this.aiHandler.sendMsgToAI("you are a coding assistant to a user, give short responses.", message.value, true);
                var responseFromAi = this.aiHandler.output
                this.uiHandler.webView.webview.postMessage({
                    variable: "airesponse",
                    value: responseFromAi
                })
                return;
            }
        },
        undefined,
        context.subscriptions);
    }

    // Check focus level and notifies user when focus drops below 30%
    async checkFocus(focus) {
        if (focus < this.thresholdFocus && this.allowNotificationFocus == true && !this.uiHandler.messagePending) {
            this.allowNotificationFocus = false
            const text = 'This program is using the neurosity crown to measure '+
            'your live focus level. Your focus level recently dropped below 30% which might mean you are too '+
            'unfucosed to be productive in your development. Please check the chat for advice on how to '+
            'regain your focus.'
            if (!this.uiHandler.webViewIsVisisble) {
                vscode.window.showInformationMessage('You seem to be unfocused.', 'Show more').then(e => {
                    if (e == 'Show more') {
                        vscode.window.showInformationMessage('Focus', {modal:true, detail:text})
                    }
            })}
            await this.aiHandler.sendMsgToUnfocusedDev(focus)
            this.uiHandler.printAIMessage(this.aiHandler.output, true)
            await sleep(120)
        }
        if (this.allowNotificationFocus == false && focus > this.thresholdFocus+0.15) { //Reset boolean that allows notifications
            this.allowNotificationFocus = true
        }
    }
    // Check calmness level and notifies user when calmness drops below 30%
    async checkCalm(calm) {
        if (calm < this.thresholdCalm && this.allowNotificationCalm == true && !this.uiHandler.messagePending && !this.uiHandler.webViewIsVisisble) {
            this.allowNotificationCalm = false
            const text = 'This program is using the neurosity crown to measure '+
            'your live calmness level. Your calmness recently dropped below 20% which might mean you are too '+
            'agitated to be productive in your development. Please check the chat for advice on how to '+
            'regain your calmness.'
            if (!this.uiHandler.webViewIsVisisble) {
                vscode.window.showInformationMessage('You seem to be agitated.', 'Show more').then(e => {
                    if (e == 'Show more') {
                        vscode.window.showInformationMessage('Calmness', {modal:true, detail:text})
                    }
            })}
            await this.aiHandler.sendMsgToAggitatedDev(calm)
            this.uiHandler.printAIMessage(this.aiHandler.output, false)
            await sleep(120)
        }
        if (this.allowNotificationCalm == false && calm > this.thresholdCalm+0.15) { //Reset boolean that allows notifications
            this.allowNotificationCalm = true
        }
    }
}

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s*1000));
}

module.exports = {
    EventHandler
}

const vscode = require('vscode')
const { AIHandler } = require('./AIHandler')
const { Evaluate } = require('./Evaluate')

class EventHandler {
    // Initilize variables
    constructor(extensionPath, uiHandler) {
        // Makes sure user doesn't gets spammed with notifications
        this.allowNotificationFocus = true
        this.allowNotificationCalm = true

        // Thresholds for when a user should get notifications. Goal is to add the ability for the user to manually change these later
        this.thresholdFocus = 0.30
        this.thresholdCalm = 0.20

        // Create AIHandler and uihandler for chat and Evaluate object for the evaluate session feature
        this.aiHandler = new AIHandler("", "", extensionPath) // should probably only create one AIHandler in extension.js and use as a parameter here
        this.evaluate = new Evaluate();
        this.uiHandler = uiHandler
    }

    async init(dataHandler) {
        this.dataHandler = dataHandler;
    }

    async initUIMessage(context) {
        
        await this.uiHandler.webView.webview.onDidReceiveMessage(async message => {
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

            case 'recording':
                if (message.value == true) {
                    this.dataHandler.isRecording = true;
                    await this.dataHandler.recordSession();
                }
                else {
                    this.dataHandler.isRecording = false;
                    this.evaluate.setFocusValues(this.dataHandler.focusValuesSession);
                    this.evaluate.setCalmValues(this.dataHandler.calmValuesSession);

                    vscode.window.showInformationMessage('Would you like to evaluate the session?', 'Yes', 'No').then(async e => {
                        if (e == 'Yes') {
                            console.log("Yes to evaluate")
                            await this.uiHandler.switchToPage("evaluate");
                            
                            this.uiHandler.evaluateWebView.webview.postMessage({
                                variable: "values",
                                value: [this.evaluate.focusValues, this.evaluate.calmValues]
                            })
                        }
                        if (e == 'No') {
                            console.log("No to evaluate")
                        }
                    })
                    
                }
                return;
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

    async initEvaluateReceiveMessage(context) {
        this.uiHandler.evaluateWebView.webview.onDidReceiveMessage(async message => {
        switch (message.variable) {
        case 'evaluateResponses':
            console.log("evaluate responses: ", message.value);
            this.evaluate.responses = message.value;
            this.evaluate.saveEvaluationToFile();
            this.uiHandler.evaluateWebView.dispose();
            return;
        }
        
    },
        this,
        context.subscriptions);
    }

    

    // Check focus level and notifies user when focus drops below 30%
    async checkFocus(focus) {
        if (focus < this.thresholdFocus && this.allowNotificationFocus == true && !this.uiHandler.messagePending) {
            this.allowNotificationFocus = false
            await this.aiHandler.sendMsgToUnfocusedDev(focus)
            this.uiHandler.printAIMessage(this.aiHandler.output, true)
            await sleepSeconds(120)
        }
        if (this.allowNotificationFocus == false && focus > this.thresholdFocus + 0.15) { //Reset boolean that allows notifications
            this.allowNotificationFocus = true
        }
    }
    // Check calmness level and notifies user when calmness drops below 30%
    async checkCalm(calm) {
        if (calm < this.thresholdCalm && this.allowNotificationCalm == true && !this.uiHandler.messagePending) {
            this.allowNotificationCalm = false
            await this.aiHandler.sendMsgToAggitatedDev(calm)
            this.uiHandler.printAIMessage(this.aiHandler.output, false)
            await sleepSeconds(120)
        }
        if (this.allowNotificationCalm == false && calm > this.thresholdCalm + 0.15) { //Reset boolean that allows notifications
            this.allowNotificationCalm = true
        }
    }
}


function sleepSeconds(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

module.exports = {
    EventHandler
}

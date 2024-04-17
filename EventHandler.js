
const vscode = require('vscode')
const { AIHandler } = require('./AIHandler')
const { Evaluate } = require('./Evaluate')

class EventHandler {
    // Initilize variables
    constructor(extensionPath, uiHandler, eyetracker, settings) {
        // Makes sure user doesn't gets spammed with notifications
        this.allowNotificationFocus = true
        this.allowNotificationCalm = true
        this.mutexFocus = false
        this.mutexCalm = false

        // Create AIHandler and uihandler for chat and Evaluate object for the evaluate session feature
        this.aiHandler = new AIHandler("", "", extensionPath) // should probably only create one AIHandler in extension.js and use as a parameter here
        this.evaluate = new Evaluate(extensionPath);
        this.settings = settings;
        this.uiHandler = uiHandler
        this.eyetracker = eyetracker

        // Mark when generated
        this.generated = false
    }

    async init(dataHandler) {
        this.dataHandler = dataHandler;
    }

    async initUIMessage(context) {
        
        await this.uiHandler.webView.webview.onDidReceiveMessage(async message => {
            switch (message.variable) {
                // User chats with AI assistent
                case 'user':
                    await this.aiHandler.sendMsgToAI("you are a coding assistant to a user, give short responses.", message.value, true);
                    var responseFromAi = this.aiHandler.output
                    this.uiHandler.webView.webview.postMessage({
                        variable: "airesponse",
                        value: responseFromAi
                    })
                    return;
                // Record a session
                case 'recording':
                    if (message.value == true) {
                        this.dataHandler.isRecording = true;
                        this.eyetracker.recordingStart()
                        await this.dataHandler.recordSession();
                    }
                    else {
                        this.dataHandler.isRecording = false;
                        this.eyetracker.recordingEnd()
                        this.evaluate.setFocusValues(this.dataHandler.focusValuesSession);
                        this.evaluate.setCalmValues(this.dataHandler.calmValuesSession);

                        vscode.window.showInformationMessage('Would you like to evaluate the session?', 'Yes', 'No').then(async e => {
                            if (e == 'Yes') {
                                console.log("Yes to evaluate")
                                this.generated = false

                                vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    cancellable: false
                                }, async (progress, _) => {
                                    progress.report({message: 'Generating evaluation data...'})
                                    while(!this.generated) {
                                        await sleepSeconds(0.2)
                                    }
                                })                         

                                await this.eyetracker.generateHeatmap()
                                var funcs = await this.eyetracker.calculateTopLines()

                                await this.uiHandler.switchToEvaluatePage();
                                await this.initEvaluateReceiveMessage(context);

                                await sleepSeconds(1) //safety
                                this.uiHandler.evaluateWebView.webview.postMessage({
                                    variable: "functions",
                                    value: funcs
                                })
                                this.uiHandler.evaluateWebView.webview.postMessage({
                                    variable: "values",
                                    value: [this.evaluate.focusValues, this.evaluate.calmValues]
                                })
                                this.uiHandler.evaluateWebView.webview.postMessage({
                                    variable: "evaluateids",
                                    value: this.evaluate.loadEvalIdList()
                                })
                            }
                            if (e == 'No') {
                                console.log("No to evaluate")
                                console.log(this.evaluate.loadEvalIdList());
                            }
                        })
                        
                    }
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
                this.evaluate.responses = message.value;
                console.log(this.evaluate.responses);
                if (this.evaluate.responses[5] != -1) {
                    vscode.window.showInformationMessage('Evaluation has been saved.');
                } 
                await this.evaluate.saveEvaluationToFile();
                this.uiHandler.evaluateWebView.dispose();
                vscode.commands.executeCommand('start.ui')
                return;
            case 'finished':
                console.log(message.value)
                this.generated = true
                return;
        }
    },
        this,
        context.subscriptions);
    }

    

    // Check focus level and notifies user when focus drops below threshold
    async checkFocus(focus) {
        var notificationsEnabled = this.settings.allownotifications;
        var thresholdFocus = this.settings.updatedthreshholdFocus/100;
        if (notificationsEnabled) {
            if (focus < thresholdFocus && this.allowNotificationFocus == true && !this.uiHandler.messagePending) {
                this.allowNotificationFocus = false
                await this.aiHandler.sendMsgToUnfocusedDev(focus)
                this.uiHandler.printAIMessage(this.aiHandler.output, true)
            }
            if (!this.mutexFocus && this.allowNotificationFocus == false && focus > thresholdFocus + 0.15) { //Reset boolean that allows notifications
                this.mutexFocus = true
                await sleepSeconds(120)
                this.allowNotificationFocus = true
                this.mutexFocus = false
            }
        }
    }
    // Check calmness level and notifies user when calmness drops below threshold
    async checkCalm(calm) {
        var notificationsEnabled = this.settings.allownotifications;
        var thresholdCalm = this.settings.updatedthreshholdCalm/100;
        if (notificationsEnabled) {
            if (calm < thresholdCalm && this.allowNotificationCalm == true && !this.uiHandler.messagePending) {
                this.allowNotificationCalm = false
                await this.aiHandler.sendMsgToAggitatedDev(calm)
                this.uiHandler.printAIMessage(this.aiHandler.output, false)
            }
            if (!this.mutexCalm && this.allowNotificationCalm == false && calm > thresholdCalm + 0.15) { //Reset boolean that allows notifications
                this.mutexCalm = true
                await sleepSeconds(120)
                this.allowNotificationCalm = true
                this.mutexFocus = false
            }
        }
    }
}

function sleepSeconds(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

module.exports = {
    EventHandler
}

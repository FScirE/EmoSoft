
const vscode = require('vscode')
const fs = require('fs')
const { AIHandler } = require('./AIHandler')
const { Evaluate } = require('./Evaluate')
const path = require('path');

class EventHandler {
    // Initilize variables
    constructor(extensionPath, uiHandler, eyetracker, settings) {
        // Makes sure user doesn't gets spammed with notifications
        this.allowNotificationFocus = true;
        this.allowNotificationCalm = true;
        this.mutexFocus = false
        this.mutexCalm = false

        // Create AIHandler and uihandler for chat and Evaluate object for the evaluate session feature
        this.aiHandler = new AIHandler("", "", extensionPath) // should probably only create one AIHandler in extension.js and use as a parameter here
        this.evaluate = new Evaluate(extensionPath);
        this.settings = settings;
        this.uiHandler = uiHandler;
        this.eyetracker = eyetracker;
        this.path = extensionPath;

        // Mark when generated
        this.generated = false;
    }

    async init(dataHandler) {
        this.dataHandler = dataHandler;
    }

    async initUIMessage(context) {
        this.uiHandler.webView.webview.onDidReceiveMessage(async message => {
            switch (message.variable) {
                // User chats with AI assistent
                case 'user':
                    await this.aiHandler.sendMsgToAI("you are a coding assistant to a user, give short responses.", message.value, true);
                    var responseFromAi = this.aiHandler.output
                    this.uiHandler.webView.webview.postMessage({
                        variable: "airesponse",
                        value: responseFromAi
                    })
                    break;
                case 'gotoEval':
                    await this.uiHandler.switchToEvaluatePage();
                    await this.initEvaluateReceiveMessage(context);
                    //Empty to have a blankslate
                    this.uiHandler.evaluateWebView.webview.postMessage({
                        variable: "values",
                        value: [[], [], [], [], []]
                    })
                    this.uiHandler.evaluateWebView.webview.postMessage({
                        variable: "evaluateNames",
                        value: this.evaluate.loadEvalNameList()
                    })
                    break;
                // Record a session
                case 'recording':
                    if (message.value == true) {
                        this.dataHandler.startRecording()
                        this.eyetracker.recordingStart()
                    }
                    else {
                        this.dataHandler.endRecording()
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
                                await this.evaluate.readFuncsFromFile();

                                await this.uiHandler.switchToEvaluatePage();
                                await this.initEvaluateReceiveMessage(context);

                                await sleepSeconds(1) //safety

                                this.uiHandler.evaluateWebView.webview.postMessage({
                                    variable: "functions",
                                    value: funcs
                                })
                                //await sleepSeconds(1) //safety
                                this.uiHandler.evaluateWebView.webview.postMessage({
                                    variable: "values",
                                    value: [this.evaluate.focusValues, this.evaluate.calmValues, this.evaluate.sessionFuncs, this.eyetracker.functionContents, this.evaluate.getDatapointsFromCurrentValues()]
                                })
                                //await sleepSeconds(1) //safety
                                this.uiHandler.evaluateWebView.webview.postMessage({
                                    variable: "evaluateNames",
                                    value: this.evaluate.loadEvalNameList()
                                })
                                console.log('Reached end of end evaluate call.')
                            }
                            if (e == 'No') {
                                console.log("No to evaluate")
                                console.log(this.evaluate.loadEvalNameList());
                            }
                        })

                    }
                    break;
            }
        },
            undefined,
            context.subscriptions);
    }

    async initEvaluateReceiveMessage(context) {
        await this.uiHandler.evaluateWebView.webview.onDidReceiveMessage(async message => {
        switch (message.variable) {
            case 'evaluateResponses':
                vscode.window.showInformationMessage('Are you sure you want to save? Saved session can not be changed at a later stage.', 'Yes', 'No').then(async e => {
                    if (e == 'Yes') {
                        this.evaluate.responses = message.value;
                        this.evaluate.topfuncs = message.value.topfuncs;
                        if (this.evaluate.responses.hasOwnProperty('focusValues')) {
                            this.evaluate.setFocusValues(this.evaluate.responses.focusValues);
                        }
                        if (this.evaluate.responses.hasOwnProperty('calmValues')) {
                            this.evaluate.setCalmValues(this.evaluate.responses.calmValues);
                        }
                        let savedNames = this.evaluate.loadEvalNameList();
                        await this.evaluate.saveEvaluationToFile();
                        // Save heatmap if it is a new session
                        if (!savedNames.includes(this.evaluate.responses.name)) {
                            this.saveHeatmap(this.evaluate.responses.name)
                        }

                        vscode.window.showInformationMessage('Evaluation has been saved.');
                        this.uiHandler.evaluateWebView.dispose();
                        vscode.commands.executeCommand('start.ui');
                    }
                });
                break;
            case 'nameRequest':
                console.log("Requesting " + message.value);
                var loadedData = await this.evaluate.loadEvalData(message.value);
                const heatmapsFolderPath = this.uiHandler.evaluateWebView.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'heatmaps'))).toString();
                this.uiHandler.evaluateWebView.webview.postMessage({
                    variable: "sessionData",
                    value: loadedData,
                    path: heatmapsFolderPath
                })
                break;
            case 'scrollFunction':
                console.log('Scroll to: ' + message.value)
                //old file-reading method
                var fileContent = fs.readFileSync(this.eyetracker.evaluateFilePath, "utf-8").split('\n')
                var lineCounter = 0
                for (let line of fileContent) {
                    if (line.includes(`def ${message.value}`))
                        break;
                    else
                        lineCounter++
                }
                vscode.window.visibleTextEditors[0].revealRange(new vscode.Range(lineCounter, 0, lineCounter + 1, 0), vscode.TextEditorRevealType.AtTop)
                break;
            // Sent from evaluatewebview
            case 'relevantDataForAi':
                await this.aiHandler.retrieveFeedback(message.value)
                console.log(this.aiHandler.output)
                //Send back ai output
                this.uiHandler.evaluateWebView.webview.postMessage({
                    variable: "aiFeedback",
                    value: this.aiHandler.output
                })
            case 'finished':
                if (this.uiHandler.webViewIsVisisble) this.uiHandler.webView.dispose() //might fix
                console.log(message.value)
                this.generated = true
                break;
        }
    },
        this,
        context.subscriptions);
    }

    async stuckOnFunction(functionText) {
        await this.aiHandler.sendMsgHelpWithFunc(functionText)
        this.uiHandler.printAIMessage(this.aiHandler.output, '')
    }

    // Check focus level and notifies user when focus drops below threshold
    async checkFocus(focus) {
        var notificationsEnabled = this.settings.allownotifications;
        var thresholdFocus = this.settings.updatedthreshholdFocus/100;
        if (notificationsEnabled) {
            if (focus < thresholdFocus && this.allowNotificationFocus == true && !this.uiHandler.messagePending) {
                this.allowNotificationFocus = false
                await this.aiHandler.sendMsgToUnfocusedDev(focus)
                this.uiHandler.printAIMessage(this.aiHandler.output, 'focusresponse')
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
                this.uiHandler.printAIMessage(this.aiHandler.output, 'calmresponse')
            }
            if (!this.mutexCalm && this.allowNotificationCalm == false && calm > thresholdCalm + 0.15) { //Reset boolean that allows notifications
                this.mutexCalm = true
                await sleepSeconds(120)
                this.allowNotificationCalm = true
                this.mutexFocus = false
            }
        }
    }

    async saveHeatmap(name) {
        // Create the heatmaps folder if it doesn't exist
        const heatmapsFolderPath = path.join(this.path, 'heatmaps');

        const oldFilePath = path.join(this.path, 'heatmaps/heatmap.png');
        const newFileName = `heatmap-${name}.png`;
        const newFilePath = path.join(heatmapsFolderPath, newFileName);
        fs.renameSync(oldFilePath, newFilePath)
    }
}

function sleepSeconds(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

module.exports = {
    EventHandler
}

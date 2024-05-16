const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

/**
 * @param {vscode.ExtensionContext} context
 */
class UIHandler{
    constructor (context) {
        //create the UI HTML element, will hold AI window and progress bars
        this.messagePending = false
        this.webViewIsVisisble = true;
        this.webView = createWebView(context, 'webview')
        this.statusBarButton = createStatusBarButton()
        context.subscriptions.push(this.webView)
        context.subscriptions.push(this.statusBarButton)
        //show button when closed
        this.webView.onDidDispose(e => { this.webViewIsVisisble = false; this.statusBarButton.show() })
        this.context = context;
        this.focusBar = createStatusBar('Focus', 1002)
        this.calmBar = createStatusBar('Calm', 1001)
    }

    init(context, eventHandler) {
        // Handle messages from the webview
        this.eventHandler = eventHandler
        this.eventHandler.initUIMessage(context)
        //setup button to make UI show up and hide button
        context.subscriptions.push(vscode.commands.registerCommand('start.ui', _ => {
            if (this.webViewIsVisisble) return
            this.webViewIsVisisble = true;
            this.webView = createWebView(context, 'webview');
            eventHandler.initUIMessage(context)
            this.webView.onDidDispose(_ => { this.webViewIsVisisble = false; this.statusBarButton.show() }) //show button when closed
            this.statusBarButton.hide()
            this.webView.webview.postMessage({
                variable: "recording",
                value: eventHandler.dataHandler.isRecording
            })
	    }))
    }

    setFocusProgress(focus) {
        this.webView.webview.postMessage({variable: 'focus', value: focus * 100})
    }

    setCalmProgress(calm) {
        this.webView.webview.postMessage({variable: 'calm', value: calm * 100})
    }

    // this is maybe not the cleanest way to do this,
    //    but this sets UIHandler.funcname to give the function that is outside the class in this file
    //setStatusBarBackgroundColor = setStatusBarBackgroundColor;

    async printAIMessage(text, cssClass) {
        this.messagePending = true;
        while (!this.webViewIsVisisble) {
            await sleep(100)
        }
        this.webView.webview.postMessage({
            variable: 'aimessage',
            value: text,
            type: cssClass
        })
        this.messagePending = false;
    }

    async switchToEvaluatePage() {
        //if (this.webViewIsVisisble) await this.webView.dispose(); //close ui window if open
        this.evaluateWebView = await createWebView(this.context, 'evaluate')
        await this.context.subscriptions.push(this.evaluateWebView)
    }

    async updateFocusCalmBarColors(focus, calm) {
        //#4fc553 focus
        //#03a9f4 calm
        this.focusBar.color = `#4fc553` + Math.round(focus * 255).toString(16)
        this.calmBar.color = `#03a9f4` + Math.round(calm * 255).toString(16)
    }
}

function createStatusBarButton() {
	const statusBarUI = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000)
	statusBarUI.text = "Open UI"
	statusBarUI.command = 'start.ui';
	statusBarUI.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
	statusBarUI.color = new vscode.ThemeColor('statusBarItem.warningForeground')
	statusBarUI.hide()
	return statusBarUI
}

function createStatusBar(content, weight) {
    var statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, weight)
    statusBar.text = '██████████';
    statusBar.color = 'rgba(0, 0, 0, 0)'
    statusBar.tooltip = content
    statusBar.show()
    return statusBar
}

function createWebView(context, html) {
	var webView = vscode.window.createWebviewPanel(
		'emoide',
		'EmoIDE',
		vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);
    webView.iconPath = vscode.Uri.file(context.extensionPath + '\\emoide-icon.png')

	webView.webview.html = fs.readFileSync(path.join(context.extensionPath, `./${html}.html`), 'utf-8')
        .replaceAll('./', webView.webview.asWebviewUri(vscode.Uri.file(context.extensionPath)).toString() + '/')
	return webView;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    UIHandler
}
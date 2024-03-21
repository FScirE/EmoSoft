const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

/**
 * @param {vscode.ExtensionContext} context
 */
class UIHandler{
    constructor (context) {

        // Cleanup suggestion: run 'start.ui' on startup to avoid code duplication

        //create the UI HTML element, will hold AI window and progress bars
        this.messagePending = false
        this.webViewIsVisisble = true;
        this.webView = createWebView(context)
        this.statusBarButton = createStatusBarButton()
        context.subscriptions.push(this.webView)
        context.subscriptions.push(this.statusBarButton)
        //show button when closed
        this.webView.onDidDispose(e => { this.webViewIsVisisble = false; this.statusBarButton.show() })
        this.context = context;
    }
    
    init(context, eventHandler) {
        // Handle messages from the webview
        this.eventHandler = eventHandler
        this.eventHandler.initUIMessage(context)
        //setup button to make UI show up and hide button
        context.subscriptions.push(vscode.commands.registerCommand('start.ui', _ => {
            if (this.webViewIsVisisble) return
            this.webViewIsVisisble = true;
            this.webView = createWebView(context);
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
    setStatusBarBackgroundColor = setStatusBarBackgroundColor;
    causeCancer = causeCancer;

    async printAIMessage(text, isFocus) {
        this.messagePending = true;
        while (!this.webViewIsVisisble) {
            await sleep(100)
        }
        this.webView.webview.postMessage({
            variable: 'aimessage', 
            value: text, 
            type: isFocus ? 'focus' : 'calm' 
        })
        this.messagePending = false;
    }


    async switchToPage(page) {
        if (page == "evaluate") {
            if (this.webViewIsVisisble)
                this.webView.dispose()

            var newWebView = vscode.window.createWebviewPanel(
                'emoide',
                'EmoIDE',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            //set source paths for style and script
            const styleSrc = newWebView.webview.asWebviewUri(vscode.Uri.file(path.join(...[this.context.extensionPath, './webview.css'])));
            const scriptSrc = newWebView.webview.asWebviewUri(vscode.Uri.file(path.join(...[this.context.extensionPath, './evaluateWebView.js'])));
            newWebView.webview.html = fs.readFileSync(path.join(this.context.extensionPath, './evaluate.html'), 'utf-8')
                .replace('./webview.css', styleSrc.toString())
                .replace('./evaluateWebView.js', scriptSrc.toString())
            
            this.evaluateWebView = newWebView
            this.context.subscriptions.push(this.evaluateWebView)
            
            //this.evaluateWebView.onDidDispose(e => {  })
            
            this.eventHandler.initEvaluateReceiveMessage(this.context)
        }
    }

}


/** Sets the color of the status bar background, 
 * by changing the .vscode/settings.json file **in the current project folder of the vscode instance with the extension running**.
 * It doesn't seem viable to programmatically change the global setting :(
 * Also it removes any existing colorCustomisation settings bcuz of bug
 * @param {String} color
 */
async function setStatusBarBackgroundColor(color) {
    var configuration = await vscode.workspace.getConfiguration();

    var newColorCustomization = {
        "statusBar.background":  color
    };

    var existingColorCustomizations = configuration.get("workbench.colorCustomizations");
    var updatedColorCustomizations = existingColorCustomizations ? {
        ...existingColorCustomizations,
        ...newColorCustomization
    } : newColorCustomization;

    await configuration.update("workbench.colorCustomizations", updatedColorCustomizations);
}

/**
 * Gives the user cancer of the specified color.
 * @param {String} color 
 */
async function causeCancer(color) {
    
    var configuration = await vscode.workspace.getConfiguration();

    var newColorCustomization = {
        "editor.background": color,
        "activityBar.background": color,
        "sideBar.background": color,
        "terminal.background": color,
        "problemsPanel.background": color,
        "output.background": color,
        "debugConsole.background": color,
        "ports.background": color
    };

    var existingColorCustomizations = configuration.get("workbench.colorCustomizations");
    var updatedColorCustomizations = existingColorCustomizations ? {
        ...existingColorCustomizations,
        ...newColorCustomization
    } : newColorCustomization;

    await configuration.update("workbench.colorCustomizations", updatedColorCustomizations);
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

function createWebView(context) {
	var webView = vscode.window.createWebviewPanel(
		'emoide',
		'EmoIDE',
		vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);
	//set source paths for style and script
	const styleSrc = webView.webview.asWebviewUri(vscode.Uri.file(path.join(...[context.extensionPath, './webview.css'])));
	const scriptSrc = webView.webview.asWebviewUri(vscode.Uri.file(path.join(...[context.extensionPath, './webview.js'])));
	webView.webview.html = fs.readFileSync(path.join(context.extensionPath, './webview.html'), 'utf-8')
        .replace('./webview.css', styleSrc.toString())
        .replace('./webview.js', scriptSrc.toString())
	return webView;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    UIHandler
}
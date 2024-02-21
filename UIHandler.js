const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

/**
 * @param {vscode.ExtensionContext} context
 */
class UIHandler{
    init(context) {
        //create the UI HTML element, will hold AI window and progress bars
        this.webViewIsVisisble = true;
        this.webView = createWebView(context)
        this.statusBarButton = createStatusBarButton()
        context.subscriptions.push(this.webView)
        context.subscriptions.push(this.statusBarButton)
        //show button when closed
        this.webView.onDidDispose(e => { this.webViewIsVisisble = false; this.statusBarButton.show() })
        //setup button to make UI show up and hide button
        context.subscriptions.push(vscode.commands.registerCommand('start.ui', e => {
            this.webViewIsVisisble = true;
            this.webView = createWebView(context);
            this.webView.onDidDispose(e => { this.webViewIsVisisble = false; this.statusBarButton.show() }) //show button when closed
            this.statusBarButton.hide()
	    }))
    }


    setFocusProgress(focus) {
        this.webView.webview.postMessage({variable: 'focus', value: focus * 100})
    }

    setCalmProgress(calm) {
        this.webView.webview.postMessage({variable: 'calm', value: calm * 100})
    }

	setNeurosityDataSourceText(dataSource){
		return;//this.webView.webview.postMessage({variable: 'neurosityDataSourceText', value: dataSource})
	}

    printAIMessage(text) {
        
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
        .replace('${styleSrc}', styleSrc.toString())
        .replace('${scriptSrc}', scriptSrc.toString())
  
	return webView;
}

module.exports = {
    UIHandler
}
// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "emoide" is now active!');
<<<<<<< HEAD

=======
	vscode.window.showInformationMessage('Hello World from emoide!');
	
>>>>>>> TommieBranch
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	//let disposable = vscode.commands.registerCommand('emoide.helloWorld', function () {
		// The code you place here will be executed every time your command is executed	
	//});
	//context.subscriptions.push(disposable);

<<<<<<< HEAD
	//create the UI HTML element, will hold AI window and progress bars
	var webView = createWebView(context)
	const statusBarButton = createStatusBarButton()
	context.subscriptions.push(webView)
	context.subscriptions.push(statusBarButton)
	//show button when closed
	webView.onDidDispose(e => { statusBarButton.show() }) 
	//setup button to make UI show up and hide button	
	context.subscriptions.push(vscode.commands.registerCommand('start.ui', e => {
		webView = createWebView(context);
		webView.onDidDispose(e => { statusBarButton.show() }) //show button when closed
		statusBarButton.hide()
	})) 
=======
	var newItem = vscode.window.createWebviewPanel(
		'fcLevels', 
		'Focus and Calmness', 
		vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);

	const styleSrc = newItem.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, ...['webview.css']));
	newItem.webview.html = getWebViewHTML(40, 60, styleSrc)
	context.subscriptions.push(newItem)

	const eventHandler = new EventHandler();
	await eventHandler.init();

	for (let i = 0; i < 300; i++){
		eventHandler.checkCalm();
		eventHandler.checkFocus();
        await new Promise(r => setTimeout(r, 1000));
	}
>>>>>>> TommieBranch

	//examples of setting progress values
	//webView.webview.postMessage({variable: 'focus', value: 50})
	//webView.webview.postMessage({variable: 'calm', value: 50})
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
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
	const styleSrc = webView.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, ...['webview.css']));
	const scriptSrc = webView.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, ...['webview.js']));
	webView.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<link rel="stylesheet" type="text/css" href="${styleSrc}">
		</head>
		<body>
			<div class="wrapper">
				<div class="header">
					<p>Header</p>
				</div>
				<div class="ai">
					<p>AI</p>
				</div>
				<div class="focus">
					<p>Focus </p>
					<progress value=0 max=100></progress>
				</div>
				<div class="calm">
					<p>Calm</p>
					<progress value=0 max=100></progress>
				</div>
			</div>
		</body>
		</html>
		<script src="${scriptSrc}"></script>
	`
	return webView;
}
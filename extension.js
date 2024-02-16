// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const EventHandler = require('./EventHandler.js')
const UIhandler = require('./UIHandler.js')
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "emoide" is now active!');
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	//let disposable = vscode.commands.registerCommand('emoide.helloWorld', function () {
		// The code you place here will be executed every time your command is executed	
	//});
	//context.subscriptions.push(disposable);

	var newItem = vscode.window.createWebviewPanel(
		'fcLevels', 
		'Focus and Calmness', 
		vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);
	const styleSrc = newItem.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, ...['webview.css']));
	newItem.webview.html = getWebViewHTML(40, 60, styleSrc)
	context.subscriptions.push(newItem)
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

function getWebViewHTML(focus, calm, styleSrc) {
	return `
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
				<progress value=${focus} max=100></progress>
			</div>
			<div class="calm">
				<p>Calm</p>
				<progress value=${calm} max=100></progress>
			</div>
		</div>
	</body>
	</html>
	`
}
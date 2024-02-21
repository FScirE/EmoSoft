// The module 'vscode' contains the VS Code extensibility API


// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path')

const { DataHandler } = require('./DataHandler')
const { EventHandler } = require('./EventHandler')
const { AIHandler } = require('./AIHandler')
const { UIHandler } = require('./UIHandler')


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

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
  

	this.dataHandler = new DataHandler()
	await this.dataHandler.init(context.extensionPath);

	this.eventHandler = new EventHandler()
	await this.eventHandler.init(this.dataHandler);

	this.uiHandler = new UIHandler()
	this.uiHandler.init(context)

	//examples of setting progress values
	//webView.webview.postMessage({variable: 'focus', value: 50})
	//webView.webview.postMessage({variable: 'calm', value: 50})

	setInterval(async () => {
		if (this.uiHandler.webViewIsVisisble) {
			this.uiHandler.setCalmProgress(await this.dataHandler.getCalm())
			this.uiHandler.setFocusProgress(await this.dataHandler.getFocus())

			await this.eventHandler.checkCalm();
			await this.eventHandler.checkFocus();

			this.uiHandler.setNeurosityDataSourceText(this.dataHandler.dataSourceType)
		}
	}, 500);

	//example of sending ai message
	/*const ai = new AIHandler('', '', context.extensionPath)
   	await ai.sendMsgToAggitatedDev()
   	console.log(ai.output)*/
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
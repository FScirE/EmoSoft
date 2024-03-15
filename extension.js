// The module 'vscode' contains the VS Code extensibility API

//TESTING
const EDITOR_START_Y = 0.107
const EDITOR_END_Y = 0.733
const EDITOR_START_X = 0.135
const LINE_HEIGHT = (EDITOR_END_Y - EDITOR_START_Y) / 30 //assume 30 lines


// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path')

const { DataHandler } = require('./DataHandler')
const { EventHandler } = require('./EventHandler')
const { AIHandler } = require('./AIHandler')
const { UIHandler } = require('./UIHandler')

const { EyeTracker } = require('./Eyetracker')

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

	this.uiHandler = new UIHandler()

	this.eventHandler = new EventHandler(context.extensionPath, this.uiHandler)
	await this.eventHandler.init(this.dataHandler);

	this.uiHandler.init(context, this.eventHandler)

	//examples of setting progress values
	//webView.webview.postMessage({variable: 'focus', value: 50})
	//webView.webview.postMessage({variable: 'calm', value: 50})

	this.eyetracker = new EyeTracker()

	//test --------------------------------
	const decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(125, 125, 125, 0.3)'
	})
	//-------------------------------------

	setInterval(async () => {
		var calm = await this.dataHandler.getCalm()
		var focus = await this.dataHandler.getFocus()

		if (this.uiHandler.webViewIsVisisble) {
			this.uiHandler.setCalmProgress(calm)
			this.uiHandler.setFocusProgress(focus)
		}

		//await this.eventHandler.checkCalm(calm);
		//await this.eventHandler.checkFocus(focus);

		console.log("X: " + this.eyetracker.getX())
		console.log("Y: " + this.eyetracker.getY() + "\n")

		//test --------------------------------
		var editor = vscode.window.visibleTextEditors[0]
		var decorationRange = []

		if (editor != undefined) {	
			var y = this.eyetracker.getY()
			var x = this.eyetracker.getX()
			if (y >= EDITOR_START_Y && y <= EDITOR_END_Y && x >= EDITOR_START_X) {

				var currentRange = editor.visibleRanges

				var current = Math.floor(((y - EDITOR_START_Y) * 30) / (EDITOR_END_Y - EDITOR_START_Y)) //assume 30 lines				
				var lineNumber = currentRange[0].start.line + current
				var line = editor.document.lineAt(lineNumber)
				
				if (!line.isEmptyOrWhitespace) {
					var start = new vscode.Position(lineNumber - 1, 0);
					var end = new vscode.Position(lineNumber + 1, line.text.length);
					var range = new vscode.Range(start, end);

					decorationRange = [range]
				}
			}
			editor.setDecorations(decorationType, decorationRange)
		}
		//x:0.23 explorer/editor
		//x:0.73 editor/extension
		//y:0.10 head/editor
		//y:0.60 editor/terminal

		//y:0.1076 editor start
		//y:0.7333 editor end
		//assume 30 lines visible
		//----------------------------------------

	}, 500);

	vscode.window.activeTextEditor

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
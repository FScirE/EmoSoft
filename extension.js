// The module 'vscode' contains the VS Code extensibility API


// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path')

const { DataHandler } = require('./DataHandler')
const { EventHandler } = require('./EventHandler')
const { EyeTracker } = require('./Eyetracker')
const { AIHandler } = require('./AIHandler')
const { UIHandler } = require('./UIHandler')
const { Settings } = require('./settings.js')


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
	
	async function closeEmptyTabs(recursionCount = 0) {
		const tabArray = vscode.window.tabGroups.all;
		
		console.log("Looking for empty tabs to close. This function has ran recursively this many times: ", recursionCount)
		for (let groupIndex = tabArray.length - 1; groupIndex >= 0; groupIndex--) {
			var group = tabArray[groupIndex];
			
		  	// for (let i = group.tabs.length - 1; i >= 0; i--) {
			// 	const tab = group.tabs[i];
				
			// 	// Check if the tab label is empty (usually shows VS Code logo)
			// 	// if (tab.label === '') {
			// 	// 	console.log("closing empty tab: ", tab)
			// 	// 	// note: this command probably doesn't actually exist lol
			// 	// 	await vscode.commands.executeCommand('workbench.action.closeEditorsInGroup', i);
			// 	// }
			// }
			
			if (group.tabs.length === 0) {
				console.log("Closing empty tab group:", group);
				
				try {
  					await vscode.window.tabGroups.close(tabArray[groupIndex]);
				}
				finally {
					// Recursion is necessary because removing a tabgroup messes with the array
					if (recursionCount < 100)
						closeEmptyTabs(recursionCount + 1);
					return;
				}
			}
		}
	}
	  
	await closeEmptyTabs();

	//initializations
	const settings = new Settings(context.extensionPath);
	
	this.eyetracker = new EyeTracker(context.extensionPath, settings);

	this.dataHandler = new DataHandler(settings);
	await this.dataHandler.init(context.extensionPath);

	this.uiHandler = new UIHandler(context, settings);

	this.eventHandler = new EventHandler(context.extensionPath, this.uiHandler, this.eyetracker, settings);
	await this.eventHandler.init(this.dataHandler);

	this.uiHandler.init(context, this.eventHandler);

	//main loop
	var setCalmFocusAndStatusBars = setInterval(async () => {

		var calm = await this.dataHandler.getCalm()
		var focus = await this.dataHandler.getFocus()

		if (this.uiHandler.webViewIsVisisble) {
			await this.uiHandler.setCalmProgress(calm)
			await this.uiHandler.setFocusProgress(focus)
		}

		await this.uiHandler.updateFocusCalmBarColors(focus, calm);
		
		await this.eventHandler.checkCalm(calm);
		await this.eventHandler.checkFocus(focus); //MESSAGE WITH AI REGARDING CURRENT FOCUS LEVELS / CALM LEVELS

		await this.eyetracker.getSetLinesInFocus()
    
	}, 500);

	function isWorkspaceOpen() {	
		return (vscode.workspace.workspaceFolders && 
			vscode.workspace.workspaceFolders.length > 0);
	}

	let disposable = vscode.commands.registerCommand('emoide.setCrownPassword', async () => {
        await settings.getCrownPassword();
    }); //KAN VARA BRA ATT HA VET INTE

	context.subscriptions.push(disposable);
	//example of sending ai message
	/*const ai = new AIHandler('', '', context.extensionPath)
   	await ai.sendMsgToAggitatedDev()
   	console.log(ai.output)*/

}

// This method is called when your extension is deactivated
function deactivate() {
	
}

module.exports = {
	activate,
	deactivate
}
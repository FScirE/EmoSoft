// The module 'vscode' contains the VS Code extensibility API


// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path')
const fs = require('fs')

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
	const heatmapsFolderPath = path.join(context.extensionPath, 'heatmaps');
	if (!fs.existsSync(heatmapsFolderPath)) {
		fs.mkdirSync(heatmapsFolderPath);
	}

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
	this.settings = new Settings(context.extensionPath);

	this.eyetracker = new EyeTracker(context.extensionPath, this.settings);

	this.dataHandler = new DataHandler(this.eyetracker);
	await this.dataHandler.init(context.extensionPath);
	this.settings.reinitDataHandlerCallback = async () => {
		await this.dataHandler.uninit();
		await this.dataHandler.init(context.extensionPath);
	};

	this.uiHandler = new UIHandler(context);

	this.eventHandler = new EventHandler(context.extensionPath, this.uiHandler, this.eyetracker, this.settings);
	await this.eventHandler.init(this.dataHandler);

	this.eyetracker.init(this.eventHandler)
	this.uiHandler.init(context, this.eventHandler);

	this.settings.setUIHandler(this.uiHandler)
	this.settings.setEyetracker(this.eyetracker)

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
        await this.settings.getCrownPassword();
    }); //KAN VARA BRA ATT HA VET INTE

	let disposableCalibrateEyeTracker = vscode.commands.registerCommand('emoide.calibrateEyeTracker', async () => {
        try {
            await this.eyetracker.calibrate();
        } catch (error) {
            console.error('Error while calibrating eye tracker:', error);
            vscode.window.showErrorMessage('Failed to start eye tracker calibration.');
        }
    });

    context.subscriptions.push(disposableCalibrateEyeTracker);

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
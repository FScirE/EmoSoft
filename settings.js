const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const colorDictionary = {
    'Green': '#4fc553',
    'Yellow': '#FFC300',
    'Blue': '#03a9f4',
    'Pink': '#FF00FF',
    'Purple': '#b967ff',
    'Cyan': '#00FFFF',
    'White': '#FFFFFF',
    'Mango': '#F4BB44'
}

class Settings {
    constructor(extensionPath) {
        console.log('Constructing Settings...')
        this.extensionPath = extensionPath
        this.config = vscode.workspace.getConfiguration('emoide');
        this.allownotifications = this.config.get('notifications');
        this.updatedthreshholdFocus = this.config.get('thresholdFocus');
        this.updatedthreshholdCalm = this.config.get('thresholdCalm');
        this.eyeIP = this.config.get('eyeTracker');
        this.stuckTime = this.config.get('stuckNotification');
        this.updatedCrownEmail = this.config.get('crownEmail');
        this.updatedCrownDeviceID = this.config.get('crownDeviceID');
        this.focusColorChange = this.config.get('focusColor');
        this.calmColorChange = this.config.get('calmColor');
        this.listenForConfigChanges();
        this.reinitDataHandlerCallback = async () => {}; // placeholder for reinitDataHandler, to be replaced in extension.js
        this.highlightEyetracker = this.config.get('highlightEye')
    }

    setUIHandler(uiHandler) {
        this.uiHandler = uiHandler
    }
    setEyetracker(eyetracker) {
        this.eyetracker = eyetracker
    }

    get highlightEye(){
        return this.config.get('highlightEye')
    }

    // Getter method for notifications configuration option
    get notificationsEnabled() {
        return this.config.get('notifications');
    }

    // Getter method for thresholdFocus configuration option
    get thresholdFocus() {
        return this.config.get('thresholdFocus');
    }

    // Getter method for thresholdCalm configuration option
    get thresholdCalm() {
        return this.config.get('thresholdCalm');
    }

    // Getter method for eyeTracker IP configuration option
    get eyeTracker() {
        return this.config.get('eyeTracker');
    }

    // Getter method for stuck timer configuration option
    get stuckTimer() {
        return this.config.get('stuckNotification')
    }

    // Getter method for crown Email configuration option
    get crownEmail() {
        return this.config.get('crownEmail');
    }

    // Getter method for crown device ID configuration option
    get crownDeviceID() {
        return this.config.get('crownDeviceID');
    }

    get focusColor() {
        return this.config.get('focusColor');
    }

    get calmColor() {
        return this.config.get('calmColor');
    }

    // Getter method for crown device ID configuration option

    // Getter method for focus color configuration option
    // get focusColor() {
    //     return this.formattedRGB(this.config.get('focusColor'));
    // }

    // // Getter method for calm color configuration option
    // get calmColor() {
    //     return this.formattedRGB(this.config.get('calmColor'));
    // }

    // // Function to format RGB
    // formattedRGB(color) {
    //     const nums = color.split(',').map(num => parseInt(num.trim()));
    //     const [x, y, z] = nums;
    //     const RGB = { x, y, z };
    //     return RGB;
    // }

    async getCrownPassword() {
        const password = await vscode.window.showInputBox({
            placeHolder: 'Enter your Crown password',
            password: true // This hides the input text
        });
        return password; //NEEDS TO BE DIRECTLY LINKED TO THE ENV
    }

    async checkFileExists(filePath) {
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
            return true;
        } catch (error) {
            return false;
        }
    }

    async createEnvFile(fileName) {
        try {
            const extensionPath = this.extensionPath;
            const filePath = path.join(extensionPath, fileName);

            // Check if the file exists and delete it if it does
            const fileExists = await this.checkFileExists(filePath);
            if (fileExists) {
                await vscode.workspace.fs.delete(vscode.Uri.file(filePath));
            }

            // Get configuration values
            const email = this.updatedCrownEmail;
            const deviceID = this.updatedCrownDeviceID;
            const password = await this.getCrownPassword(); // Wait for password input

            // Create env data
            const envData = `
                PASSWORD=${password}
                EMAIL=${email}
                DEVICE_ID=${deviceID}
            `;

            // Write data to file
            const envDataBuffer = Buffer.from(envData, 'utf-8');
            await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), envDataBuffer);
            console.log('.env file created successfully.');
        } catch (err) {
            console.error('Error creating .env file:', err);
        }
    }

    async changeWebviewColors(focus, color) {
        const cssFilePath = path.join(this.extensionPath, './webview.css');

        // Read the contents of webview.css
        fs.readFile(cssFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading webview.css:', err);
                return;
            }

            // Modify the CSS variables
            if (focus)
                data = data.replace(/--focus-color:.*?;/, `--focus-color: ${color};`);
            else
                data = data.replace(/--calm-color:.*?;/, `--calm-color: ${color};`);

            // Write the updated contents back to webview.css
            fs.writeFile(cssFilePath, data, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to webview.css:', err);
                } else {
                    console.log('webview.css updated successfully.');

                    // Reload the webview to apply the changes
                    this.uiHandler.webView.webview.postMessage({ command: 'reload' });
                }
            });
        });
    }

    sendColorChange(focus, color) {
        if (this.uiHandler.webViewIsVisisble) {
            this.uiHandler.webView.webview.postMessage({ variable: focus ? 'focusColor' : 'calmColor', value: color })
        }
        this.changeWebviewColors(focus, color)
    }

    listenForConfigChanges() {
        // IT WORKS
        vscode.workspace.onDidChangeConfiguration(async (event) => {
            if (event.affectsConfiguration('emoide.crownDeviceID')) {
                // Handle changes to crownDeviceID
                const newDeviceID = vscode.workspace.getConfiguration('emoide').get('crownDeviceID');
                console.log('crownDeviceID changed to:', newDeviceID);
                this.updatedCrownDeviceID = newDeviceID
                await this.createEnvFile('envNeurosity.env');
                await this.reinitDataHandlerCallback();
            }

            if (event.affectsConfiguration('emoide.crownEmail')) {
                // Handle changes to crownEmail
                const newEmail = vscode.workspace.getConfiguration('emoide').get('crownEmail');
                console.log('crownEmail changed to:', newEmail);
                this.updatedCrownEmail = newEmail;
                await this.createEnvFile('envNeurosity.env');
                await this.reinitDataHandlerCallback();
            }

            if (event.affectsConfiguration('emoide.notifications')) {
                const newNotifications = vscode.workspace.getConfiguration('emoide').get('notifications');
                console.log('notifications changed to:', newNotifications);
                this.allownotifications = newNotifications; // Update allownotifications directly
            }

            if (event.affectsConfiguration('emoide.thresholdFocus')) {
                var newThresholdFocus = vscode.workspace.getConfiguration('emoide').get('thresholdFocus');
                if (newThresholdFocus < 0){newThresholdFocus = 0}
                if (newThresholdFocus > 100){newThresholdFocus = 100}
                console.log('thresholdFocus changed to:', newThresholdFocus);
                this.updatedthreshholdFocus = newThresholdFocus
                vscode.workspace.getConfiguration('emoide').update('thresholdFocus', newThresholdFocus, vscode.ConfigurationTarget.Global);
            }

            if (event.affectsConfiguration('emoide.thresholdCalm')) {
                var newThresholdCalm = vscode.workspace.getConfiguration('emoide').get('thresholdCalm');
                if (newThresholdCalm < 0){newThresholdCalm = 0}
                if (newThresholdCalm > 100){newThresholdCalm = 100}
                console.log('thresholdCalm changed to:', newThresholdCalm);
                this.updatedthreshholdCalm = newThresholdCalm;
                vscode.workspace.getConfiguration('emoide').update('thresholdCalm', newThresholdCalm, vscode.ConfigurationTarget.Global);
            }

            if (event.affectsConfiguration('emoide.eyeTracker')) {
                const newEyeTracker = vscode.workspace.getConfiguration('emoide').get('eyeTracker');
                console.log('eyeTracker changed to:', newEyeTracker);
                this.eyeIP = newEyeTracker;
                this.eyetracker.reconnect() //attempt reconnect to eyetracker
            }

            if (event.affectsConfiguration('emoide.stuckNotification')) {
                const newStuckTime = vscode.workspace.getConfiguration('emoide').get('stuckNotification');
                if (newStuckTime < 20) {
                    this.stuckTime = 20
                }
                else {
                    this.stuckTime = newStuckTime;
                }
                console.log('Stuck timer changed to:', this.stuckTime);
            }

            if (event.affectsConfiguration('emoide.focusColor')) {
                const newFocusColor = vscode.workspace.getConfiguration('emoide').get('focusColor');
                console.log('Focus color changed to:', newFocusColor);
                this.focusColorChange = newFocusColor;
                this.sendColorChange(true, colorDictionary[this.focusColorChange])
            }

            if (event.affectsConfiguration('emoide.calmColor')) {
                const newCalmColor = vscode.workspace.getConfiguration('emoide').get('calmColor');
                console.log('Calm color changed to:', newCalmColor);
                this.calmColorChange = newCalmColor;
                this.sendColorChange(false, colorDictionary[this.calmColorChange])
            }

            if (event.affectsConfiguration('emoide.highlightEye')) {
                const newhighlightEye = vscode.workspace.getConfiguration('emoide').get('highlightEye')
                console.log('Highlight Eyetracker changed to:', newhighlightEye)
                this.highlightEyetracker = newhighlightEye
            }
        });
    }

}

module.exports = {
    Settings
};

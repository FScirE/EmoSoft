const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class Settings {
    constructor(extensionPath) {
        console.log('Constructing Settings...')
        this.extensionPath = extensionPath
        this.config = vscode.workspace.getConfiguration('emoide');
        this.allownotifications = this.config.get('notifications');
        this.updatedthreshholdFocus = this.config.get('thresholdFocus');
        this.updatedthreshholdCalm = this.config.get('thresholdCalm');
        this.eyeIP = this.config.get('eyeTracker');
        this.updatedCrownEmail = this.config.get('crownEmail')
        this.updatedCrownDeviceID = this.config.get('crownDeviceID')
        this.listenForConfigChanges();
        this.reinitDataHandlerCallback = async () => {}; // placeholder for reinitDataHandler, to be replaced in extension.js
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

    // Getter method for thresholdCalm configuration option (minutes)
    get sessionLength() {
        return this.config.get('sessionLength');
    }

    // Getter method for eyeTracker IP configuration option
    get eyeTracker() {
        return this.config.get('eyeTracker');
    }

    // Getter method for crown Email configuration option
    get crownEmail() {
        return this.config.get('crownEmail');
    }

    // Getter method for crown device ID configuration option
    get crownDeviceID() {
        return this.config.get('crownDeviceID');
    }

    // Getter method for focus color configuration option
    get focusColor() {
        return this.formattedRGB(this.config.get('focusColor'));
    }

    // Getter method for calm color configuration option
    get calmColor() {
        return this.formattedRGB(this.config.get('calmColor'));
    }

    // Function to format RGB
    formattedRGB(color) {
        const nums = color.split(',').map(num => parseInt(num.trim()));
        const [x, y, z] = nums;
        const RGB = { x, y, z };

        return RGB;
    }

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
                const newThresholdFocus = vscode.workspace.getConfiguration('emoide').get('thresholdFocus');
                console.log('thresholdFocus changed to:', newThresholdFocus);
                this.updatedthreshholdFocus = newThresholdFocus
            }

            if (event.affectsConfiguration('emoide.thresholdCalm')) {
                const newThresholdCalm = vscode.workspace.getConfiguration('emoide').get('thresholdCalm');
                console.log('thresholdCalm changed to:', newThresholdCalm);
                this.updatedthreshholdCalm = newThresholdCalm;
            }

            if (event.affectsConfiguration('emoide.eyeTracker')) {
                const newEyeTracker = vscode.workspace.getConfiguration('emoide').get('eyeTracker');
                console.log('eyeTracker changed to:', newEyeTracker);
                this.eyeIP = newEyeTracker
            }
            
        });
    }
    
}

module.exports = {
    Settings
};

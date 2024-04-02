const vscode = require('vscode');

class Settings {
    constructor() {
        this.config = vscode.workspace.getConfiguration('emoide');
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

}

module.exports = {
    Settings
};

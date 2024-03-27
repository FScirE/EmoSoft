const vscode = require('vscode');

class Settings {
    constructor() {
        this.config = vscode.workspace.getConfiguration('emoide')
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

    // Getter method for thresholdCalm configuration option
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

    // Getter method for crown Password configuration option
    get crownPassword() {
        return this.config.get('crownPassword');
    }

    // Getter method for crown device ID configuration option
    get crownDeviceID() {
        return this.config.get('crownDeviceID');
    }

    // Getter method for focus color configuration option
    get focusColor() {
        return this.config.get('focusColor');
    }

    // Getter method for calm color configuration option
    get calmColor() {
        return this.config.get('calmColor');
    }
}

module.exports = {
    Settings
}


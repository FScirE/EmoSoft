import * as vscode from 'vscode';

class Settings {
    constructor(){
        this.config = vscode.workspace.getConfiguration('emoide');
    }

    get notificationsEnable(){
        return this.config.get('emoide.notifications.allowNotification', true); 
    }
    get notificationsFocusThreshHold(){
        return this.config.get('emoide.notifications.thresholdNotificationFocus', 30) / 10;
    
    }
    get notificationCalmThreshHold(){
        return this.config.get('emoide.notifications.thresholdNotificationCalm', 20) / 10;
    }
    

    get sessionMaxLength(){
        return this.config.get('emoide.session', 30); 
    }

}

module.exports = {
    Settings
}


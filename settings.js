const fs = require('fs');

class Settings {
    constructor() {
        // Read package.json file
        const packageJSON = fs.readFileSync('./package.json', 'utf-8');
        const packageData = JSON.parse(packageJSON);

        // Extract configuration options
        this.configOptions = packageData.contributes.configuration.properties.emoide;
    }

    // Getter method for notifications configuration option
    get notificationsEnabled() {
        return this.configOptions.notifications.default;
    }

    // Getter method for thresholdFocus configuration option
    get thresholdFocus() {
        return this.configOptions.thresholdFocus.default;
    }

    // Getter method for thresholdCalm configuration option
    get thresholdCalm() {
        return this.configOptions.thresholdCalm.default;
    }

    // Define getter methods for other configuration options as needed
}

module.exports = {
    Settings
}


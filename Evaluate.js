const fs = require('fs');


class Evaluate {
    constructor(path) {
        // Path to save json file att correct place
        this.path = path;

        // Current session before it has been saved to json
        this.tempSession = {};

        // Focus and calm values
        this.focusValues = [];
        this.calmValues = [];

        // Data to be stored
        this.responses = {};
    }

    // ------------- Setter and getter functions -------------------------------------------------------------//
    setFocusValues(focusValues) {
        this.focusValues = focusValues;
    }
    setCalmValues(calmValues) {
        this.calmValues = calmValues;
    }

    getMaxFocus() {
        return Math.max(...this.focusValues);
    }
    getMinFocus() {
        return Math.min(...this.focusValues);
    }
    getMaxCalm() {
        return Math.max(...this.calmValues);
    }
    getMinCalm() {
        return Math.min(...this.calmValues);
    }
    
    setResponse(question, number) {
        var response = {question, number};
        this.responses.push(response);
    }
//------------------------------------------------------------------------------//
    saveEvaluationToFile() {
        // Open file
        var jsonData = [];
        try {
            const fileContent = fs.readFileSync(this.path + '\\evaluations.json', 'utf8');
            jsonData = JSON.parse(fileContent);
        } catch (err) {
            console.log("evaluations.json does not exist or is empty. The file will be created.")
        }
    
        // The data that shall be written
        const dataList = {};

        // Evaluation Name
        dataList.name = this.responses.name;
        
        // Date
        const currentDate = new Date(); // Todays date
        const dateString = currentDate.toISOString().split('T')[0]; // Transform date as a string
        dataList.date = dateString;

        // Focus and calm values
        dataList.focusValues = this.focusValues;
        dataList.calmValues = this.calmValues;
        
        // Responses
        dataList.responses = {focusAnswer: this.responses.focusAnswer, calmAnswer: this.responses.calmAnswer, 
                              expectedWorkAnswer: this.responses.expectedWorkAnswer, finishedWorkAnswer: this.responses.finishedWorkAnswer};
        
        // Write to JSON file
        jsonData.push(dataList);
        fs.writeFileSync(this.path + '\\evaluations.json', JSON.stringify(jsonData, null, 2));
        console.log('Data saved to evaluations.json');
    }
    loadEvalNameList() {
        // List of eval IDs
        var dataList = [];

        // Load json data
        var jsonData = [];
        try {
            const fileContent = fs.readFileSync(this.path + '\\evaluations.json', 'utf8');
            jsonData = JSON.parse(fileContent);
        } catch (err) {
            console.log("evaluations.json does not exist or is empty.")
        }

        // Get each evalID
        for (let i = 0; i < jsonData.length; i++) {
            dataList[i] = jsonData[i].name;
        }

        return dataList;
    }
    loadEvalData(name) {
        // Load json data
        var jsonData = [];
        try {
            const fileContent = fs.readFileSync(this.path + '\\evaluations.json', 'utf8');
            jsonData = JSON.parse(fileContent);
        } catch (err) {
            console.log("evaluations.json does not exist or is empty.")
        }

        // Find correct evaluation
        var i = 0;
        while (jsonData[i].name != name && i < jsonData.length) {
            i++;
        }
        if (i == jsonData.length) { // Evaluation ID not found
            return -1;
        }

        return jsonData[i];
    }
}

//------------------------------------------------------------------------------//
module.exports = {
    Evaluate
};
const fs = require('fs');


class Evaluate {
    constructor(path) {
        this.path = path;
        this.tempSession = [];

        // Values, not sure yet if we need them in this
        this.focusValues = [];
        this.calmValues = [];

        // Questions
        this.responses = [];
        this.question1 = "I was focused during this session."
        this.question2 = "I was calm during this session."
        this.question3 = "I expected to finish a lot of work during this session.";
        this.question4 = "I managed to finish a lot of work during this session.";
        
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
        if (this.responses[5] == -1) {
            this.tempSession = this.responses;
            return;
        }

        // Open file
        var jsonData = [];
        try {
            const fileContent = fs.readFileSync(this.path + '\\evaluations.json', 'utf8');
            jsonData = JSON.parse(fileContent);
        } catch (err) {
            console.log("evaluations.json does not exist or is empty. The file will be created.")
        }

        // Find correct evaluation
        var i = 0;
        while (jsonData[i].evaluationID != this.responses[5] && i < jsonData.length) {
            i++;
        }

        // The data that shall be written
        const dataList = {};

        // ID
        dataList.evaluationID = jsonData.length + 1
        if (i < jsonData.length) {
            jsonData.splice(i, 1);
        }

        // Evaluation Name
        dataList.name = this.responses[4];

        // Date
        const currentDate = new Date(); // Todays date
        const dateString = currentDate.toISOString().split('T')[0]; // Transform date as a string
        dataList.date = dateString;

        // Focus and calm values
        dataList.focusValues = this.focusValues;
        dataList.calmValues = this.calmValues;

//------------------------------------------------------------------------------//
        // Responses
        dataList.responses = [this.responses[2], this.responses[3], this.responses[0], this.responses[1]];

        // Write to JSON file
        jsonData.push(dataList);
        fs.writeFileSync(this.path + '\\evaluations.json', JSON.stringify(jsonData, null, 2));
        console.log('Data saved to evaluations.json');
    }
    loadEvalIdList() {
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
            dataList[i] = {evaluationID: jsonData[i].evaluationID, name: jsonData[i].name};
        }

        return dataList;
    }
    loadEvalData(evaluationID) {
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
        while (jsonData[i].evaluationID != evaluationID && i < jsonData.length) {
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
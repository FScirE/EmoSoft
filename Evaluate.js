const fs = require('fs');


class Evaluate {
    constructor(path) {
        this.path = path;

        // Values, not sure yet if we need them in this
        this.focusValues = [];
        this.calmValues = [];

        // Questions
        this.responses = [];
        this.question1 = "I was focused during this session."
        this.question2 = "I was calm during this session."
        this.question3 = "I expected to finish a lot of work during this session.";
        this.question4 = "I managed to finish a lot of work during this session.";
        
        // Saving
        this.filename = './evaluations.txt';
        this.evalID = '#none' // Should later be able to enter by user (I think)
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

        // Evaluation ID
        dataList.evalID = this.evalID;

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
        var IdList = [];

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
            IdList[i] = jsonData[i].evalID;
        }

        return IdList;
    }
}

//------------------------------------------------------------------------------//
module.exports = {
    Evaluate
};
const fs = require('fs');
const path = require('path');

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

        //top funcs
        this.topfuncs = [];
        
        //funcs for graph
        this.sessionFuncs = [];
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

    readFuncsFromFile() {
        this.sessionFuncs = []
        var lines = fs.readFileSync(this.path + '\\fullDictionaryFile.txt', 'utf-8').split('\n')
        let time = 0 //yeah
        for (var line of lines.slice(0, lines.length - 2)) { //skip last func
            let topKey = 'No function'
            let topValue = 0
            for (var entry of line.trim().substring(1, line.length - 1).split(', ')) {
                let key = entry.split(':')[0]
                let value = parseInt(entry.split(':')[1])
                if (key == '-1' || key == '}' || value < topValue) 
                    continue;
                topKey = key
                topValue = value
            }

            this.sessionFuncs.push({ x: time, y: topKey })
            time += 10
        }
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
        // Remove if name already exists (overwrite)
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i].name == this.responses.name) {
                jsonData.splice(i, 1);
            }
        }
    
        // The data that shall be written
        const dataList = {};

        // Evaluation Name
        dataList.name = this.responses.name;
        
        // Date
        const currentDate = new Date(); // Todays date
        const uniqueID = currentDate.getTime();
        const dateString = currentDate.toISOString().split('T')[0]; // Transform date as a string

        if (this.responses.ID == -1) {
            dataList.ID = uniqueID;
        } 
        else {
            // Remove if ID already exists (overwrite)
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i].ID == this.responses.ID) {
                    let lastName = jsonData[i].name;
                    const heatmapsFolderPath = path.join(this.path, 'heatmaps');
                    const lastFileName = 'heatmaps/heatmap-' + lastName + '.png';
                    const oldFilePath = path.join(this.path, lastFileName);
                    const newFileName = `heatmap-${dataList.name}.png`;
                    const newFilePath = path.join(heatmapsFolderPath, newFileName);
                    fs.renameSync(oldFilePath, newFilePath)
                    jsonData.splice(i, 1);
                }
            }
            dataList.ID = this.responses.ID;
        }
        dataList.date = dateString;

        // Renaming focus and calm values to JSON
        let tempFocus = [];
        let tempCalm = [];
        for (let i = 0; i < this.focusValues.length; i++) {
            tempFocus[i] = { time: this.focusValues[i].x, focusValue: this.focusValues[i].y };
        }
        for (let j = 0; j < this.calmValues.length; j++) {
            tempCalm[j] = { time: this.calmValues[j].x, calmValue: this.calmValues[j].y };
        }
        dataList.focusValues = tempFocus;
        dataList.calmValues = tempCalm;

        // Eyetracker stats
        dataList.sessionFuncs = this.responses.sessionFuncs;
        dataList.topfuncs = this.topfuncs;
        
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

        if (name == "New Session") { // Evaluation ID not found
            return -1;
        }
        
        // Find correct evaluation
        var i = 0;
        while (jsonData[i].name != name && i < jsonData.length) {
            i++;
        }

        // Renaming focus and calm values so that graph can read them
        let tempFocus = [];
        let tempCalm = [];
        for (let j = 0; j < jsonData[i].focusValues.length; j++) {
            tempFocus[j] = { x: jsonData[i].focusValues[j].time, y: jsonData[i].focusValues[j].focusValue };
        }
        for (let k = 0; k < jsonData[i].calmValues.length; k++) {
            tempCalm[k] = { x: jsonData[i].calmValues[k].time, y: jsonData[i].calmValues[k].calmValue };
        }
        jsonData[i].focusValues = tempFocus;
        jsonData[i].calmValues = tempCalm;

        return jsonData[i];
    }
}

//------------------------------------------------------------------------------//
module.exports = {
    Evaluate
};
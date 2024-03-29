const fs = require('fs');


class Evaluate {
    constructor() {
        // Values, not sure yet if we need them in this
        this.focusValues = [];
        this.calmValues = [];

        // Questions
        this.responses = [];
        this.question1 = "Q1 - Slider - Focus"
        this.question2 = "Q2 - Slider - Calm"
        this.question3 = "How much work did you expect to finish this session?";
        this.question4 = "How much work did you manage to finish during this session?";
        this.question5 = "How accurate do you feel the calm and focus levels were in this session?";
        
        // Saving
        this.filename = './evaluations.txt';
        this.evalID = '#none' // Should later be able to enter by user (I think)
    }

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

    saveEvaluationToFile() {
        // Open file
        fs.open(this.filename, 'wx', (err, fd) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log('File already exists.');
                    return;
                }
                console.error('Error creating file:', err);
                return;
            }
            console.log('File created successfully!');
            
            
            // Close the file
            fs.close(fd, (err) => {
                if (err) {
                    console.error('Error closing file:', err);
                }
            });
        });
        console.log(this.responses)
        console.log(process.cwd());
        // The data that shall be written
        const dataList = []; 
        dataList.push(this.evalID); // ID
        const currentDate = new Date(); // Todays date
        const dateString = currentDate.toISOString().split('T')[0]; // Transform date as a string
        var dateStringFormatted = "Date: " + dateString; // Format date string
        dataList.push(dateStringFormatted);
        dataList.push("Focus:");
        // String for all focus values with time stamps
        for (let i = 0; i < this.focusValues.length; i++) {
            var str = "x: " + this.focusValues[i].x + ", y: " + this.focusValues[i].y;
            dataList.push(str);
        }
        dataList.push("Calm:")
        // String for all calm values with time stamps
        for (let i = 0; i < this.calmValues.length; i++) {
            var str = "x: " + this.calmValues[i].x + ", y: " + this.calmValues[i].y;
            dataList.push(str);
        }
        // Questions with answers
        // console.log('Responses in evaluate.js', this.responses) Responses innehåller array med 5 element
        dataList.push(this.question1);
        dataList.push(this.responses[3]);
        dataList.push(this.question2);
        dataList.push(this.responses[4]);
        dataList.push(this.question3);
        dataList.push(this.responses[0]);
        dataList.push(this.question4);
        dataList.push(this.responses[1]);
        dataList.push(this.question5);
        dataList.push(this.responses[2]);

        // Split for next eval
        dataList.push("------------------------------------------------")

        // Iterate through the list and append each element to the file with a newline character
        dataList.forEach(data => {
            try {
                fs.appendFileSync(this.filename, data + '\n');
                console.log(`Data "${data}" appended to file successfully!`);
            } catch (err) {
                console.error('Error appending to file:', err);
            }
        });
    }
}

module.exports = {
    Evaluate
};
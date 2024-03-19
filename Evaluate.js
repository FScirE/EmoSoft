

class Evaluate {
    constructor() {
        // Values, not sure yet if we need them in this
        this.focusValues = [];
        this.calmValues = [];

        // Questions
        this.responses = [];
        

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
        var response = {question, number}
        this.responses.push(response);
    }

    saveEvaluationToFile() {
        
    }
}
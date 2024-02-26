
// const vscode = require('vscode');
// /**
//  * @param {vscode.ExtensionContext} context
//  */

const dotenv = require('dotenv');
/*import OpenAI from 'openai';*/
const { retrieveResponse } = require('./OpenAIExtension.js');

dotenv.config();

// Constants, Standard messages to promt against chatGPT
const MESSAGE_HELP_UNFOCUSED_DEV = "Help a programmer who is unfocused become more focused. Give 3 example of what he can do to become more focused with two sentances.  ";
const MESSAGE_TAKE_BREAK = "Generate a friendly messsage telling a developer to take a short brake. 2 sentances. ";
const MESSAGE_CALM_DOWN = "Help a programmer who is not calm to calm down in a friendly manner, but not weird. 2 sentaces. ";
const CONTEXT_HELPADEV = "You are a helpful AI assitant with the goal to boost a developers productivity and focus. Short respones. ";

class AIHandler {
    constructor(codeinput, standardinput, extensionpath){
        
        this.codeinput = codeinput;
        this.standardinput = standardinput;
        this.extensionpath = extensionpath
        this.output = '';
        
    }
    //WORK IN PROGESS, no idea if it works tbh......... (stolen from chatgpt)
    retrieveContext(filePath, lineNumber, contextLines = 5){
        const fs = require('fs');
            try {
                const lines = fs.readFileSync(filePath, 'utf8').split('\n');
                const startLine = Math.max(0, lineNumber - contextLines - 1);
                const endLine = Math.min(lines.length, lineNumber + contextLines);
                return lines.slice(startLine, endLine).map((line, index) => ({
                    line: startLine + index + 1,
                    content: line.trim()
                }));
            } catch (err) {
                console.error('Error reading file:', err);
                return [];
            }
        
    }
    //Typ klar behövs test
    async sendMsgToAI(preset,msg){
        var templist = []
        // sends a message and preset to the AI. Returns an array contains all words in each slot. 
        await retrieveResponse(preset, msg, this.extensionpath).then(response => {
            templist.push(response);
            this.output = templist[0].join('');
        });
    };
    async sendMsgToUnfocusedDev(){
        // sends a message to the AI with standard message telling the user to focus. Returns an array contains all words in each slot. 
        await this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_HELP_UNFOCUSED_DEV);
    }
    async sendMsgToAggitatedDev(){
        // sends a message to the AI with standard message telling the user to calm down. Returns an array contains all words in each slot. 
        await this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_CALM_DOWN);
    }  
    async sendMsgToTakeBreak(){
        // sends a message to the AI with standard message telling the user to take a break. Returns an array contains all words in each slot. 
        await this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_TAKE_BREAK);
    }
}

module.exports = {
    AIHandler
}

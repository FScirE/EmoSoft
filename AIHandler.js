
// const vscode = require('vscode');
// /**
//  * @param {vscode.ExtensionContext} context
//  */

import dotenv from 'dotenv';
import OpenAI from 'openai';
import {retrieveResponse} from './openai-test';

dotenv.config();


const MESSAGE_HELP_UNFOCUSED_DEV = "Help a programmer who is unfocused become more focused. Give 3 example of what he can do to become more focused with two sentances.  ";
const MESSAGE_TAKE_BREAK = "Generate a friendly messsage telling a developer to take a short brake. 2 sentances. ";
const MESSAGE_CALM_DOWN = "Help a programmer who is not calm to calm down in a friendly manner, but not weird. 2 sentaces. ";
const CONTEXT_HELPADEV = "You are a helpful AI assitant with the goal to boost a developers productivity and focus. Short respones. ";

class AIhandler {
    constructor(codeinput, standardinput){
        
        this.codeinput = codeinput;
        this.standardinput = standardinput;
        this.output = [];
        
    }
    //WORK IN PROGESS,
    retrieveContext(){
        
    }
    //Typ klar behövs test
    async sendMsgToAI(preset,msg){
        var templist = []
        // sends a message and preset to the AI. Returns an array contains all words in each slot. 
        await retrieveResponse(preset, msg).then(response => {
            templist.push(response);
            this.output = templist[0];
        });
    };

    sendMsgToUnfocuesedDev(){
        // sends a message to the AI with standard message telling the user to focus. Returns an array contains all words in each slot. 
        this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_HELP_UNFOCUSED_DEV);
    }

    async sendMsgToAggitatedDev(){
        // sends a message to the AI with standard message telling the user to calm down. Returns an array contains all words in each slot. 
        await this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_CALM_DOWN);
    }
    
    sendMsgToTakeBreak(){
        // sends a message to the AI with standard message telling the user to take a break. Returns an array contains all words in each slot. 
        this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_TAKE_BREAK);
    }
    
    // CONSTANT STANDRAD MESSAGES
}

module.exports = {
    AIhandler
}






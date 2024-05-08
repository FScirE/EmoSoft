// const vscode = require('vscode');
// /**
//  * @param {vscode.ExtensionContext} context
//  */

const dotenv = require('dotenv');
/*import OpenAI from 'openai';*/
const { retrieveResponse } = require('./OpenAIExtension.js');

dotenv.config();

// Constants, Standard messages to promt against chatGPT
const MESSAGE_HELP_UNFOCUSED_DEV = "Help a programmer who is at a certain focus level to become more focused. Give one example of what he can do to become more focused with two sentences. You must use the focus level in your message once. Don't give pomodore example";
const MESSAGE_TAKE_BREAK = "Generate a friendly messsage telling a developer to take a short brake. in 2 sentences. ";
const MESSAGE_CALM_DOWN = "Help a programmer who is at a certain calm level to calm down in a friendly manner, but not weird. in 2 sentences. Be creative so you don't give the same tip every time. You must use the calm level in your message once";
const CONTEXT_HELPADEV = "You are a helpful AI assistant with the goal to boost a developers productivity and focus. Short respones.";
const CONTEXT_HELPCODE = "You are a helpful AI assistant with the goal to boost a developers productivity and focus. Short responses and any code snippets should be kept concise.";
const SUFFIX_STUCK_ON_LINE = "This is the code in python. I am stuck here, can you help me explain it briefly. Max 5 short sentences?"
const CONTEXT_FEEDBACK = "Evaluate this session the x value indicates time in seconds and y is the focus / calm levels in percentage. Ontop of that there is also which functions the users were looking at where x is time and y is the name of the function. Refer only to the points were a notable shift is seen. Keep it short"

class AIHandler {
    constructor(codeinput, standardinput, extensionpath){
        
        this.codeinput = codeinput;
        this.standardinput = standardinput;
        this.extensionpath = extensionpath;
        this.output = '';
        this.aipreviousmsg = '';
        
    }

    async sendMsgToAI(preset, msg, chatActive){
        var templist = []
        if (chatActive == true){
            preset += ",This is the code assistant (you) previous message: " + this.aipreviousmsg;
        }
        // sends a message and preset to the AI.
        await retrieveResponse(preset, msg, this.extensionpath).then(response => {
            templist.push(response);
            this.output = templist[0].join('');
            if (chatActive == true) {
                this.aipreviousmsg = this.output;
                this.output = this.output
                    .replace(/&/g, "&amp")
                    .replace(/</g, "&lt")
                    .replace(/>/g,"&gt")
                    .replace(/```/, "<code>")
                    .replace(/```/, "</code>");
            }         
        });
    };
    async sendMsgToUnfocusedDev(focus){
        focus *= 100;
        focus = focus.toFixed(0);
        focus = "This is the focus level in percent:  " + focus.toString() + "%. ";

        // sends a message to the AI with standard message telling the user to focus. 
        await this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_HELP_UNFOCUSED_DEV + focus, false);
    }
    async sendMsgToAggitatedDev(calm){
        // sends a message to the AI with standard message telling the user to calm down. 
        calm *= 100;
        calm = calm.toFixed(0);
        calm = "This is the calm level in percent:  " + calm.toString() + "%. ";
        await this.sendMsgToAI(CONTEXT_HELPADEV , MESSAGE_CALM_DOWN + calm, false);
    }  
    async sendMsgToTakeBreak(){
        // sends a message to the AI with standard message telling the user to take a break.
        await this.sendMsgToAI(CONTEXT_HELPADEV, MESSAGE_TAKE_BREAK, false);
    }
    async sendMsgHelpWithFunc(functionText) {
        await this.sendMsgToAI(CONTEXT_HELPCODE, functionText + '\n' + SUFFIX_STUCK_ON_LINE, true)
    }
    
    async retrieveFeedback(sessionData) {
        //create Context
        var messageBuild = "This is the session data give feedback on this: "
        var focusValuesToString = JSON.stringify(sessionData.focusValues)
        var calmValuesToString = JSON.stringify(sessionData.calmValues)
        var functionsToString = JSON.stringify(sessionData.sessionFuncs)
        
        //format data to message
        messageBuild += "Focus Values: " + focusValuesToString + ", Calm Values: " + calmValuesToString + ", name of functions looked at: " + functionsToString
        await this.sendMsgToAI(CONTEXT_FEEDBACK, messageBuild, false)
        
    }
}

module.exports = {
    AIHandler
}

// const vscode = require('vscode');
// /**
//  * @param {vscode.ExtensionContext} context
//  */

class AIhandler {
    constructor(codeinput, standardinput){
        
        this.codeinput = codeinput;
        this.standardinput = standardinput;
        this.output = [];
        
    }
    //WORK IN PROGESS,
    retrieveContext(){
        
    };
    //Typ klar behövs test
    sendMsgToAI(preset,msg){
        // sends a message and preset to the AI. Returns an array contains all words in each slot. 
        import ('./openai-test.mjs').then(async module => {
            this.output.push(await module.retrieveResponse(preset,msg)); 
            console.log(this.output);
        });
       
 
    };

    sendMsgToUnfocuesedDev(){
        // sends a message to the AI with standard message telling the user to focus. Returns an array contains all words in each slot. 
        this.sendMsgToAI(this.CONTEXT_HELPADEV, this.MESSAGE_HELP_UNFOCUSED_DEV);
    }

    sendMsgToAggitatedDev(){
        // sends a message to the AI with standard message telling the user to calm down. Returns an array contains all words in each slot. 
        this.sendMsgToAI(this.CONTEXT_HELPADEV, this.MESSAGE_CALM_DOWN);
    }

    sendMsgToTakeBreak(){
        // sends a message to the AI with standard message telling the user to take a break. Returns an array contains all words in each slot. 
        this.sendMsgToAI(this.CONTEXT_HELPADEV, this.MESSAGE_TAKE_BREAK);
    }
    
    // CONSTANT STANDRAD MESSAGES
    MESSAGE_HELP_UNFOCUSED_DEV = "Help a programmer who is unfocused become more focused. Give 3 example of what he can do to become more focused with two sentances.  "
    MESSAGE_TAKE_BREAK = "Generate a friendly messsage telling a developer to take a short brake. 2 sentances. "
    MESSAGE_CALM_DOWN = "Help a programmer who is not calm to calm down in a friendly manner, but not weird. 2 sentaces. "
    CONTEXT_HELPADEV = "You are a helpful AI assitant with the goal to boost a developers productivity and focus. Short respones. "

}





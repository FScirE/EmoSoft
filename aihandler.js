
// const vscode = require('vscode');
// /**
//  * @param {vscode.ExtensionContext} context
//  */

class AIhandler {
    constructor(codeinput, standardinput, output){
        
        this.codeinput = codeinput;
        this.standardinput = standardinput;
        this.output = output;
    }
    //WORK IN PROGESS,
    retrieveContext(){
        
    };
    //Typ klar behövs test
    sendMsgToAI(preset,msg){
        
        import ('./openai-test.mjs').then(module => {
            this.output = module.retrieveResponse(preset,msg); 
        });
 
    };

    sendMsgToUnfocuesedDev(){
        import ('./openai-test.mjs').then(module => {
            this.output = module.retrieveResponse(this.CONTEXT_HELPADEV,this.MESSAGE_HELP_UNFOCUSED_DEV); 
        });
    }

    sendMsgToAggitatedDev(){
        import ('./openai-test.mjs').then(module => {
            this.output = module.retrieveResponse(this.CONTEXT_HELPADEV,this.MESSAGE_CALM_DOWN); 
        });
    }

    sendMsgToTakeBreak(){
        import ('./openai-test.mjs').then(module => {
            this.output = module.retrieveResponse(this.CONTEXT_HELPADEV,this.MESSAGE_TAKE_BREAK); 
        });
    }
    
    // CONSTANTS 
    MESSAGE_HELP_UNFOCUSED_DEV = "Help a programmer who is unfocused become more focused. Give 3 example of what he can do to become more focused with two sentances.  "
    MESSAGE_TAKE_BREAK = "Generate a friendly messsage telling a developer to take a short brake. 2 sentances. "
    MESSAGE_CALM_DOWN = "Help a programmer who is not calm to calm down in a friendly manner, but not weird. 2 sentaces. "
    CONTEXT_HELPADEV = "You are a helpful AI assitant with the goal to boost a developers productivity and focus. Short respones. "

}



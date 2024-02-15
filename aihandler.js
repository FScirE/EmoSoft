
const vscode = require('vscode');
/**
 * @param {vscode.ExtensionContext} context
 */

class AIhandler {
    constructor(codeinput, standardinput, output){
        
        this.codeinput = codeinput;
        this.standardinput = standardinput;
        this.output = output;
    }
    retrieveContext(){
        
    };
    
    sendMsgToAI(context,msg){
        var inputToAI=context+msg;
        import ('./openai-test.mjs').then(module => {
            module.main(); 
        });
        (async () => {
            const module = await import('./openai-test.mjs');
            module.main(inputToAI); // Kör funktionen från den importerade modulen
        })();
    };
    // CONSTANTS 
    MESSAGE_HELP_UNFOCUSED_DEV = "Hjälp en programmerare som är ofokuserad att bli mer fokuserad. Ge 3 exempel på vad han kan göra med två meningar per exempel. "
    MESSAGE_TAKE_BREAK = "Generera ett vänligt meddelande som uppmanar en programmerare till att ta en paus. "
    CONTEXT_HELPADEV = "You are a helpful AI assitant with the goal to boost a developers productivity and focus. "
}


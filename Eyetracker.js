
const net = require('net')
const vscode = require('vscode')
const { exec } = require('child_process')
var DOMParser = require('xmldom').DOMParser;

const MAX_LENGTH = 60

const EDITOR_START_Y = 0.107
const EDITOR_END_Y = 0.733
const EDITOR_START_X = 0.135
const LINE_HEIGHT = (EDITOR_END_Y - EDITOR_START_Y) / 30 //assume 30 lines

const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(200, 200, 200, 0.3)'
})

class EyeTracker {
    constructor(path) {
        this.socket = new net.Socket();
        this.path = path
        this.X = [0.0]
        this.Y = [0.0]
        this.long_X = []
        this.long_Y = []

        // Connect to the server
        this.socket.connect(4242, '172.30.112.1', () => {
            console.log('Connected to EyeTracker server');
            
            // Sending initial command after the connection is established
            this.socket.write(
                '<SET ID="ENABLE_SEND_DATA" STATE="1" />\r\n' +
                '<SET ID="ENABLE_SEND_POG_FIX" STATE="1" />\r\n')
        });

        this.socket.on('data', (data) => {
            //console.log(data.toString())
            const parsedXml = new DOMParser().parseFromString(data.toString(), 'text/xml')
            const record = parsedXml.getElementsByTagName('REC')[0]

            var newX = parseFloat(record.getAttribute('FPOGX'))
            var newY = parseFloat(record.getAttribute('FPOGY'))
            this.X.push(newX)
            this.Y.push(newY)
            if (newX >= 0 && newX < 1 && newY >= 0 && newY < 1) {
                this.long_X.push(newX)
                this.long_Y.push(newY)
            }

            if (this.X.length > MAX_LENGTH)
                this.X.shift()
            if (this.Y.length > MAX_LENGTH)
                this.Y.shift()
        });

        this.socket.on('close', () => {
            console.log('Connection closed');
        });

        // this.socket.on('error', (err) => {
        //     console.error('Error:', err.message);
        // });
    }

    getX() {
        return this.X.reduce((a, b) => a + b, 0) / this.X.length
    }

    getY() {
        return this.Y.reduce((a, b) => a + b, 0) / this.Y.length
    }

    getSetLinesInFocus() {
        var editor = vscode.window.visibleTextEditors[0]
		var decorationRange = []
        var returnText = ''

        //console.log("X: " + this.eyetracker.getX())
		//console.log("Y: " + this.eyetracker.getY() + "\n")

		if (editor != undefined) {	
			var y = this.getY()
			var x = this.getX()
            //var y = 0.12
            //var x = 0.21
			if (y >= EDITOR_START_Y && y <= EDITOR_END_Y && x >= EDITOR_START_X) {

				var currentRange = editor.visibleRanges

				var current = Math.floor(((y - EDITOR_START_Y) * 30) / (EDITOR_END_Y - EDITOR_START_Y)) //assume 30 lines	
                if (current < 0) current = 0 //avoid negative lines			
				var lineNumber = currentRange[0].start.line + current
				var line = editor.document.lineAt(lineNumber)
				
				if (!line.isEmptyOrWhitespace) {
                    var startLine = current == 0 ? lineNumber : lineNumber - 1
                    var endLine = current == 29 ? lineNumber : lineNumber + 1

					var start = new vscode.Position(startLine, 0);
					var end = new vscode.Position(endLine, editor.document.lineAt(endLine).text.length);
					var range = new vscode.Range(start, end);

					decorationRange = [range]
                    returnText = editor.document.getText(range) //return text ofr the 3 lines
				}
			}
			editor.setDecorations(decorationType, decorationRange)
		}
        return returnText

        //x:0.1347 editor start
		//y:0.1076 editor start
		//y:0.7333 editor end
		//assume 30 lines visible
    }

    generateHeatMap() {
        exec(`python heatmapGenerator.py ${this.long_X.toString()} ${this.long_Y.toString()}`, {cwd: this.path})
    }

    calibrate() {
        this.socket.write(
            '<SET ID="CALIBRATE_SHOW" VALUE="1" />\r\n' + 
            //'<SET ID="CALIBRATE_RESET" />\r\n' + kanske inte behövs
            '<SET ID="CALIBRATE_START" VALUE="1" />\r\n')
        //wait for calibrate to send finish message ------
        this.socket.write('<SET ID="CALIBRATE_SHOW" VALUE="0" />\r\n')
    }
}

module.exports = {
    EyeTracker
}
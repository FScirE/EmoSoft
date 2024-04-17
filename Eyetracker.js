const net = require('net')
const vscode = require('vscode')
const { execSync } = require('child_process')
var DOMParser = require('xmldom').DOMParser;
const fs = require('fs')

const MAX_LENGTH = 30
var readFunctionDelay = 10 //in seconds

// ericvärden
//const EDITOR_START_Y = 0.103
//const EDITOR_END_Y = 0.738
//const EDITOR_START_X = 0.14
// hugovärden
const EDITOR_START_Y = 0.12
const EDITOR_END_Y = 0.777
const EDITOR_START_X = 0.20
const LINE_HEIGHT = (EDITOR_END_Y - EDITOR_START_Y) / 30 //assume 30 lines
var timeOut = false;

const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(200, 200, 200, 0.3)'
})

class EyeTracker {
    constructor(path, settings) {
        this.socket = new net.Socket();
        this.path = path
        this.X = [0.0]
        this.Y = [0.0]
        this.long_X = []
        this.long_Y = []
        this.lookedLines = {}
        this.recording = false
        this.settings = settings;

        //UNDER IS THE IP ADRESS USE IT
        //this.settings.eyeIP

        this.init()

        // this.socket.on('error', (err) => {
        //     console.error('Error:', err.message);
        // });
    }

    init() {
        // Connect to the server
        this.socket.connect(4242, this.settings.eyeTracker, () => {
            console.log('Connected to EyeTracker server');
            
            // Sending initial command after the connection is established
            this.socket.write(
                '<SET ID="ENABLE_SEND_DATA" STATE="1" />\r\n' +
                '<SET ID="ENABLE_SEND_POG_FIX" STATE="1" />\r\n')
        });

        this.socket.on('data', (data) => {
            const parsedXml = new DOMParser().parseFromString(data.toString(), 'text/xml')

            var records = parsedXml.getElementsByTagName('REC')
            for (var i = 0; i < records.length; i++) {
                var newX = parseFloat(records[i].getAttribute('FPOGX'))
                var newY = parseFloat(records[i].getAttribute('FPOGY'))
                if (newX != 0 || newY != 0)
                {
                    this.X.push(newX)
                    this.Y.push(newY)
                }
                if (!timeOut && this.recording && newX > 0 && newX < 1 && newY > 0 && newY < 1) {
                    this.long_X.push(newX)
                    this.long_Y.push(newY)
                    timeOutMutex(100)                     
                }

                if (this.X.length > MAX_LENGTH)
                    this.X.shift()
                if (this.Y.length > MAX_LENGTH)
                    this.Y.shift()
            }

            var calibs = parsedXml.getElementsByTagName('CAL')
            for (var i = 0; i < calibs.length; i++) {
                var calID = calibs[i].getAttribute('ID')
                if (calID == 'CALIB_RESULT') {
                    console.log('Close calibrate window')
                    this.socket.write(
                        '<SET ID="CALIBRATE_SHOW" STATE="0" />\r\n' +
                        '<SET ID="TRACKER_DISPLAY" STATE="0" />\r\n')
                    vscode.window.showInformationMessage('Eye tracker calibration finished.');
                }
            }          
        });

        this.socket.on('close', () => {
            console.log('Connection closed');
        });

        var disposableInterval = setInterval(async () => {
            if (this.recording)
                await this.getMostFocusedFunction()
        }, readFunctionDelay * 1000)
    }

    getX() {
        return this.X.reduce((a, b) => a + b, 0) / this.X.length
    }

    getY() {
        return this.Y.reduce((a, b) => a + b, 0) / this.Y.length
    }

    async getSetLinesInFocus() {
        var editor = vscode.window.visibleTextEditors[0]
		var decorationRange = []
        var returnText = ''

        //console.log("X: " + this.eyetracker.getX())
		//console.log("Y: " + this.eyetracker.getY() + "\n")

		if (editor != undefined) {	
			var y = this.getY()
			var x = this.getX()
            // var y = 0.5
            // var x = 0.5
			if (y >= EDITOR_START_Y && y <= EDITOR_END_Y && x >= EDITOR_START_X) {

				var currentRange = editor.visibleRanges
                const lineCount = editor.document.lineCount
                this.filePath = editor.document.fileName

				var current = Math.floor(((y - EDITOR_START_Y) * 30) / (EDITOR_END_Y - EDITOR_START_Y)) //assume 30 lines	
                if (current < 0) current = 0 //avoid negative lines			
				var lineNumber = currentRange[0].start.line + current
                if (lineNumber > lineCount - 1) lineNumber = lineCount - 1 //avoid lines outside range
				var line = editor.document.lineAt(lineNumber)
				
				if (!line.isEmptyOrWhitespace) {
                    var startLine = lineNumber == 0 ? lineNumber : lineNumber - 1
                    var endLine = lineNumber == lineCount - 1 ? lineNumber : lineNumber + 1

					var start = new vscode.Position(startLine, 0);
					var end = new vscode.Position(endLine, editor.document.lineAt(endLine).text.length);
					var range = new vscode.Range(start, end);
                    
                    if (lineNumber in this.lookedLines)
                        this.lookedLines[lineNumber] += 1
                    else
                        this.lookedLines[lineNumber] = 1

					decorationRange = [range]
                    returnText = editor.document.getText(range) //return text of the 3 lines
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

    recordingStart() { 
        this.long_X = []
        this.long_Y = [] //clear lists
        fs.writeFileSync(this.path + '\\fullDictionaryFile.txt', '') //empty old file
        this.recording = true
    }
    recordingEnd() {
        this.recording = false
    }
    
    generateHeatmap() {
        fs.writeFileSync(this.path + '\\xValues.txt', this.long_X.toString())
        fs.writeFileSync(this.path + '\\yValues.txt', this.long_Y.toString())
        execSync(`python heatmapGenerator.py ${this.path}`, { cwd: this.path })
    }

    getMostFocusedFunction() {
        fs.writeFileSync(this.path + '\\lineDictionary.txt', '')
        for (let [key, value] of Object.entries(this.lookedLines)) {
            fs.appendFileSync(this.path + '\\lineDictionary.txt', `${key}:${value}\n`)
        }       
        execSync(`python findFuncFromLines.py ${this.filePath}`, { cwd: this.path })
        this.lookedLines = {} //empty
    }

    calculateTopLines(){
        var topFuncs = {}
        var data = fs.readFileSync(this.path + '\\fullDictionaryFile.txt').toString()
        for (var line of data.split('\n')) {
            var stripLine = line.substring(1, line.length - 2)
            for (var entry of stripLine.split(', ')) {
                var key = entry.split(':')[0]
                var value = parseInt(entry.split(':')[1])
                if (key != '' && key != '-1' && key != '-2')
                {
                    if (key in topFuncs)
                        topFuncs[key] += value
                    else
                        topFuncs[key] = value
                }
            }
        }
        
        var keyValues = []
        for (var key in topFuncs) {
            keyValues.push([key, topFuncs[key]])
        }
        keyValues.sort((a, b) => { return b[1] - a[1] }) //sort
        keyValues.slice(0, 3) //top 3 values

        return keyValues
    }

    calibrate() {
        console.log('Calibrating')
        this.socket.write(
            '<SET ID="CALIBRATE_SHOW" STATE="1" />\r\n' + 
            '<SET ID="CALIBRATE_START" STATE="1" />\r\n')
    }
}

async function timeOutMutex(time) {
    timeOut = true
    await sleep(time)
    timeOut = false
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    EyeTracker
}
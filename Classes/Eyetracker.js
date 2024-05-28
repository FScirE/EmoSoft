const net = require('net')
const vscode = require('vscode')
const { execSync } = require('child_process')
var DOMParser = require('xmldom').DOMParser;
const fs = require('fs')

const MAX_LENGTH = 30

// ericvärden
const EDITOR_START_Y = 0.103
const EDITOR_END_Y = 0.738
const EDITOR_START_X = 0.14
// hugovärden
/*const EDITOR_START_Y = 0.12
const EDITOR_END_Y = 0.777
const EDITOR_START_X = 0.20*/
var timeOut = false;
var stuckFunc = ''
var stuckCounter = 0

const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(200, 200, 200, 0.2)'
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
        this.functionContents = {}
        //this.functionSpans = {}
        this.recording = false
        this.settings = settings;

        //UNDER IS THE IP ADRESS USE IT
        //this.settings.eyeIP

        // this.socket.on('error', (err) => {
        //     console.error('Error:', err.message);
        // });
    }

    init(eventHandler) {
        this.eventHandler = eventHandler

        // Close old connection and reconnect to the server
        this.reconnect()
    }

    reconnect() {
        this.socket.destroy() //close old connection
        this.socket.removeAllListeners() //remove old listener

        this.socket.connect(4242, this.settings.eyeIP, () => {
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
            //var y = 0.5
            //var x = 0.5
			if (y >= EDITOR_START_Y && y <= EDITOR_END_Y && x >= EDITOR_START_X) {

				var currentRange = editor.visibleRanges
                const lineCount = editor.document.lineCount
                this.filePath = editor.document.fileName

				var current = Math.floor(((y - EDITOR_START_Y) * 30) / (EDITOR_END_Y - EDITOR_START_Y)) //assume 30 lines
                if (current < 0) current = 0 //avoid negative lines
				var lineNumber = currentRange[0].start.line + current
                var skip = (lineNumber > lineCount - 1) //lineNumber = lineCount - 1 //avoid lines outside range

				if (!skip && !editor.document.lineAt(lineNumber).isEmptyOrWhitespace) {
                    var startLine = lineNumber == 0 ? lineNumber : lineNumber - 1
                    var endLine = lineNumber == lineCount - 1 ? lineNumber : lineNumber + 1

					var start = new vscode.Position(startLine, 0);
					var end = new vscode.Position(endLine, editor.document.lineAt(endLine).text.length);
					var range = new vscode.Range(start, end);

                    if (lineNumber in this.lookedLines)
                        this.lookedLines[lineNumber] += 1
                    else
                        this.lookedLines[lineNumber] = 1
                    //console.log(lineNumber)

					decorationRange = [range]
                    returnText = editor.document.getText(range) //return text of the 3 lines

                    if (!this.settings.highlightEyetracker) {
                        decorationRange = []
                    }
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
        this.lookedLines = {}
        this.long_X = []
        this.long_Y = [] //clear lists
        fs.writeFileSync(this.path + '\\fullDictionaryFile.txt', '') //empty old file
        this.recording = true
    }
    recordingEnd() {
        this.getMostFocusedFunction() //get rest of looked lines
        this.recording = false
        this.evaluateFilePath = this.filePath
    }

    generateHeatmap() {
        fs.writeFileSync(this.path + '\\xValues.txt', this.long_X.toString())
        fs.writeFileSync(this.path + '\\yValues.txt', this.long_Y.toString())
        execSync(`python Python/heatmapGenerator.py ${this.path}`, { cwd: this.path })
    }

    async getMostFocusedFunction() { //might not work with async
        fs.writeFileSync(this.path + '\\lineDictionary.txt', '')
        for (let [key, value] of Object.entries(this.lookedLines)) {
            fs.appendFileSync(this.path + '\\lineDictionary.txt', `${key}:${value}\n`)
        }
        execSync(`python Python/findFuncFromLines.py ${this.filePath}`, { cwd: this.path })
        //console.log(this.lookedLines)
        this.lookedLines = {} //empty

        var stuckFileContent = fs.readFileSync(this.path + '\\stuckLine.txt').toString().split(':')
        stuckCounter = stuckFunc == stuckFileContent[0] ? stuckCounter + 1 : 1
        // console.log(`${stuckCounter}:${stuckFileContent[0]}:${stuckFileContent[1]}`)
        if (this.settings.allownotifications && stuckCounter == Math.trunc(this.settings.stuckTime / 10) && stuckFunc != '' && stuckFunc != '-1' && stuckFunc != '}') //same a few times in a row
            vscode.window.showInformationMessage(`It seems you are stuck, do you need assistance?`, ...['Yes', 'No']).then((answer) => {
                console.log(answer + ' to stuck')
                if (answer == 'Yes') {
                    let span = stuckFileContent[1].trim().substring(1, stuckFileContent[1].length - 1).split(', ')
                    var functionText = this.getFuncFromSpan(span[0], span[1])
                    this.eventHandler.stuckOnFunction(functionText)
                }
            })
        stuckFunc = stuckFileContent[0]
    }

    getFuncFromSpan(first, last) {
        var editor = vscode.window.visibleTextEditors[0]

        let startLine = first - 1 < 0 ? 0 : first - 1
        let endLine = last > editor.document.lineCount ? editor.document.lineCount - 1 : last - 1

        var start = new vscode.Position(startLine, 0);
        var end = new vscode.Position(endLine, editor.document.lineAt(endLine).text.length);
        var range = new vscode.Range(start, end);

        return editor.document.getText(range)
    }

    calculateTopLines() {
        var topFuncs = {}
        var data = fs.readFileSync(this.path + '\\fullDictionaryFile.txt').toString()
        for (var line of data.split('\n')) {
            var stripLine = line.trim().substring(1, line.length - 1)
            for (var entry of stripLine.split(', ')) {
                let entrySplit = entry.split(':')
                var key = entrySplit[0]
                var value = parseInt(entrySplit[1])
                var start = parseInt(entrySplit[2])
                var end = parseInt(entrySplit[3])
                if (key != '' && key != '-1' && key != '}')
                {
                    if (key in topFuncs)
                        topFuncs[key] += value
                    else
                        topFuncs[key] = value
                    this.functionContents[key] = this.getFuncFromSpan(start, end)
                    //this.functionSpans[key] = [start, end]
                }
            }
        }

        var keyValues = []
        for (var key in topFuncs) {
            keyValues.push([key, topFuncs[key]])
        }
        keyValues.sort((a, b) => { return b[1] - a[1] }) //sort
        keyValues = keyValues.slice(0, 3) //top 3 values

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
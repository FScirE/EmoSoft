
const net = require('net')
const { exec } = require('child_process')
var DOMParser = require('xmldom').DOMParser;

const MAX_LENGTH = 60

class EyeTracker {
    constructor(path) {
        this.socket = new net.Socket();
        this.path = path
        this.X = [0.0]
        this.Y = [0.0]
        this.long_X = []
        this.long_Y = []

        // Connect to the server
        this.socket.connect(4242, '192.168.105.230', () => {
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

    generateHeatMap() {
        exec(`python heatmapGenerator.py ${this.long_X.toString()} ${this.long_Y.toString()}`, {cwd: this.path})
    }
}

module.exports = {
    EyeTracker
}
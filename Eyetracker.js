
const net = require('net')
var DOMParser = require('xmldom').DOMParser;

const MAX_LENGTH = 60

class EyeTracker {
    constructor() {
        this.socket = new net.Socket();
        this.X = [0.0]
        this.Y = [0.0]

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

            this.X.push(parseFloat(record.getAttribute('FPOGX')))
            this.Y.push(parseFloat(record.getAttribute('FPOGY')))

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
}

module.exports = {
    EyeTracker
}
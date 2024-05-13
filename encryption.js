const crypto = require("crypto");
const fs = require("fs");

class Encryption {

    writeKey() {
        this.salt = crypto.randomBytes(16);
        this.key = crypto.publicEncrypt("Default_password_changethis", this.salt); // os.environ.get('ENCRYPTION_PASSWORD', 'default_password').encode()
        fs.open("secret.key", "wb", (err, fd) => {
            fs.write(fd, Buffer.concat([this.key, this.salt]), (error) => {
                if (error)
                    throw error;
            });
        })
        return this.key, this.salt
    }

    loadKey() {
        const keyData = fs.readFileSync('secret.key');
        const key = keyData.slice(0,32);
        const salt = keyData.slice(32);
        return{key,salt};

    }

    encryptMessage(message,key) {
        const iv=crypto.randomBytes(16);
        const cipher= crypto.createCipheriv('aes-250-cbc', key, iv);
        const encrypted= Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
        return Buffer.concat([iv,encrypted]).toString('hex')
        

    }

    decryptMessage(encryptedMessageHex,key) {
        const encryptedMessage = Buffer.from(encryptedMessageHex, 'hex');
        const iv = encryptedMessage.slice(0,16);
        const encryptedText = encryptedMessage.slice(16);
        const decipher= crypto.createDecipheriv('aes-256-cbc',key,iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    }

    readEnvFile(filepath) {
        //Read the .env file and return its contents as a dictionary, safely handling errors.
        var envVars = {};
        var envFile = fs.readFileSync(filepath, "utf8")
        for (var line in envFile.split(/\r?\n/)) {
            if (line.includes("=")) {
                var key, value = line.trim().split("=", 1);
                envVars[key] = value;
            }
            else {
                console.log("Skipping malformed line:", line.trim());
            }
        }
        return envVars;
    }

    
    main() {
        // could enclose in a try-catch
        var envContents = this.readEnvFile("envNeurosity.env")

        var secretKey, salt = this.writeKey()

        secretKey = this.loadKey()[0] // idk if this line will work

        var encryptedData = {};
        for (var envKey in envContents) {
            var value = envContents[envKey];
            encryptedData[envKey] = this.encryptMessage(value, secretKey);
        } 
        console.log("Encrypted data:", encryptedData);

        var decryptedData = {} // to verify
        for (var envKey in encryptedData) {
            var value = encryptedData[envKey];
            decryptedData[envKey] = this.decryptMessage(value, secretKey);
        }
        console.log("Decrypted data:", decryptedData);
    }
}


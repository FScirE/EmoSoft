

const { Neurosity } = require("@neurosity/sdk");
const path = require('path');


/**
 * DataHandler object. Needs "await dataHandler.init();" before use!
 * TODO: make password safe and handle it correctly
 * @class
 */
class DataHandler {
    #password = ""; // private property

    constructor() {
        this.createFakeDataIfNotLoggedIn = true;

        
        this.currentFocus = NaN;
        this.currentCalm = NaN;


    } // end of constructor


    async init(extensionPath) {
        try { // login and connect to Neurosity device
            const dotenvRequire = require('dotenv').config({
                path: path.join(extensionPath, '/envNeurosity.env')
            }); // may be async? idk, seems to work anyway ¯\_(ツ)_/¯
            
            this.deviceId = process.env.DEVICE_ID || "";
            this.email = process.env.EMAIL || "";
            this.#password = process.env.PASSWORD || "";
            
            const verifyEnvs = (email, password, deviceId) => {
                const invalidEnv = (env) => {
                    return env === "" || env === 0;
                };
                if (invalidEnv(email) || invalidEnv(password) || invalidEnv(deviceId)) {
                    console.error("deviceId, email, or password not in envNeurosity.env (incorrectly formatted, or file not found). See 'Readme for Neurosity setup.txt'");
                }
            };
            
            verifyEnvs(this.email, this.#password, this.deviceId);
            console.log(`Neurosity email "${this.email}" attempting to authenticate to deviceId "${this.deviceId}"`);
            
            this.neurosity = new Neurosity({deviceId: this.deviceId});
    
            await this.neurosity
                .login({
                    email: this.email,
                    password: this.#password
                })
            console.log("Logged in to Neurosity");
            this.loggedIn = true;
        }
        catch (e) { // login failed
            console.error("DataHandler.init() Neurosity login: ", e);
            this.loggedIn = false;
        }
        
        if (this.loggedIn) {
            console.log("DataHandler is setting this.currentFocus and this.currentCalm to real data from Neurosity device");
            this.neurosity.focus().subscribe((focus) => {
                this.currentFocus = focus.probability;
            });

            this.neurosity.calm().subscribe((calm) => {
                this.currentCalm = calm.probability;
            });
        }
        else if (this.createFakeDataIfNotLoggedIn) {
            console.warn("DataHandler is setting this.currentFocus and this.currentCalm to fake (random) values");
            setInterval(() => {
                this.currentCalm = Math.random();
                this.currentFocus = Math.random();
            }, 1000);
        }
        else {
            console.error("DataHandler is not setting this.currentFocus and this.currentCalm to anything (they're NaN)");
        }

    } // end of init function


    getFocus() { // should probably use an average over a few seconds or smth
        return this.currentFocus;
    }

    getCalm() {
        return this.currentCalm;
    }


}


module.exports = {
	DataHandler
}
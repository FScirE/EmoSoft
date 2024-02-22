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
        
        this.recentCalm = [0.5];
        this.recentCalmTimestamps = [Date.now()];
        this.recentCalmDuration = 20000; // how long to keep values in recent list (ms)
        this.recentFocus = [0.5];
        this.recentFocusTimestamps = [Date.now()];
        this.recentFocusDuration = 20000; // how long to keep values in recent list (ms)

        this.dataSourceType = "none";

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

            this.dataSourceType = "real data from Crown";

            this.neurosity.calm().subscribe((calm) => {
                this.recentCalm.push(calm.probability);
                this.recentCalmTimestamps.push(Date.now())
                
                if (this.recentCalmTimestamps[0] < Date.now() - this.recentCalmDuration){
                    this.recentCalm.shift();
                    this.recentCalmTimestamps.shift();
                }
                
            });

            this.neurosity.focus().subscribe((focus) => {
                this.recentFocus.push(focus.probability);
                this.recentFocusTimestamps.push(Date.now())
                
                if (this.recentFocusTimestamps[0] < Date.now() - this.recentFocusDuration){
                    this.recentFocus.shift();
                    this.recentFocusTimestamps.shift();
                }
            });

        }
        else if (this.createFakeDataIfNotLoggedIn) {
            console.warn("DataHandler is setting this.currentFocus and this.currentCalm to fake (random) values");

            this.dataSourceType = "simulated (fake) data"

            setInterval(() => {
                var fakeCalmValue = this.recentCalm[this.recentCalm.length - 1] + (Math.random() - 0.5);
                var fakeCalmValue = Math.min(Math.max(fakeCalmValue, 0), 1);

                this.recentCalm.push(fakeCalmValue);
                this.recentCalmTimestamps.push(Date.now())
                
                if (this.recentCalmTimestamps[0] < Date.now() - this.recentCalmDuration){
                    this.recentCalm.shift();
                    this.recentCalmTimestamps.shift();
                }

                
                var fakeFocusValue = this.recentFocus[this.recentFocus.length - 1] + (Math.random() - 0.5);
                var fakeFocusValue = Math.min(Math.max(fakeFocusValue, 0), 1);

                this.recentFocus.push(fakeFocusValue);
                this.recentFocusTimestamps.push(Date.now())
                
                if (this.recentFocusTimestamps[0] < Date.now() - this.recentFocusDuration){
                    this.recentFocus.shift();
                    this.recentFocusTimestamps.shift();
                }
            }, 1000);
        }
        else {
            console.error("DataHandler is not setting this.currentFocus and this.currentCalm to anything (they're NaN)");
        }

    } // end of init function

    

    getCalm() {
        return this.recentCalm.reduce((acc, num) => acc + num, 0) / this.recentCalm.length;
    }

    getFocus() {
        return this.recentFocus.reduce((acc, num) => acc + num, 0) / this.recentFocus.length;
    }


}


module.exports = {
	DataHandler
}
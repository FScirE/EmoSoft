const { Neurosity } = require("@neurosity/sdk");
require("dotenv").config({path:"./envNeurosity.env"});


/**
 * DataHandler object. Needs "await dataHandler.init();" before use!
 * TODO: make password safe and handle it correctly
 * @class
 */
class DataHandler {
    #password = ""; // private property

    constructor() {
        this.deviceId = process.env.DEVICE_ID || "01a9368c36e800dfbe6fc447f40f8857";
        this.email = process.env.EMAIL || "tommievanklaveren@gmail.com";
        this.#password = process.env.PASSWORD || "";
        
        this.currentFocus = NaN;
        this.currentCalm = NaN;
        
        const verifyEnvs = (email, password, deviceId) => {
            const invalidEnv = (env) => {
                return env === "" || env === 0;
            };
            if (invalidEnv(email) || invalidEnv(password) || invalidEnv(deviceId)) {
                console.error("Please verify deviceId, email and password are in .env file, quitting...");
                process.exit(0);
            }
        };
        
        verifyEnvs(this.email, this.#password, this.deviceId);
        console.log(`${this.email} attempting to authenticate to ${this.deviceId}`);
        
        this.neurosity = new Neurosity({deviceId: this.deviceId});

        

    } // end of constructor

    async init() {
        await this.neurosity
            .login({
                email: this.email,
                password: this.#password
            })
            .catch((error) => {
                console.log(error);
                throw new Error(error);
            });
        console.log("Logged in to Neurosity");
        
        this.neurosity.focus().subscribe((focus) => {
            this.currentFocus = focus.probability;
        });

        this.neurosity.calm().subscribe((calm) => {
            this.currentCalm = calm.probability;
        });

    }

    async getFocus() { // should probably use an average over a few seconds or smth
        return this.currentFocus;
    }

    async getCalm() {
        return this.currentCalm;
    }


}

async function testDataHandler() {
    // Usage:
    const dHandler = new DataHandler();
    await dHandler.init();

    for (let i = 0; i < 300; i++){
        await new Promise(r => setTimeout(r, 1000));

        console.log("calm: ", await dHandler.getCalm());
        console.log("focus: ", await dHandler.getFocus());
    }
}

testDataHandler();

module.exports = {
	DataHandler
}
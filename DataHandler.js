const { Neurosity } = require("@neurosity/sdk");
require("dotenv").config();

var do_exit = false;

var start_time = (new Date()).getTime()

var session_data = [[], [], [], [], [], [], [], []]


//TODO: remove check_for_exit and testfuncignoredis, and also do_exit, start_time, session_data
const check_for_exit = async () => {
    if ((new Date()).getTime() > start_time + 10000) { // .getTime() returns milliseconds
        console.log("Exiting!");
        exit(0) // Cannot find name exit, but that's okay,  because it works anyway lol (albeit with the wrong exit code)
    }
};

const testfuncignoredis = async () => {
    return;
    await neurosity
        .login({
        email,
        password
        })
        .catch((error) => {
        console.log(error);
        throw new Error(error);
        });
    console.log("Logged in");
    
    return;
    console.log("running brainwaves test stuff, this function should probably return before this");
        // raw, rawUnfiltered and several other options exist
    neurosity.brainwaves("raw").subscribe((data) => {
        
        for (var i = 0; i < data.data.length; i++) {
            for (var j = 0; j < data.data[i].length; j++) {
                session_data[i].push(data.data[i][j])
            }
        }

        console.log(session_data);
        
    });

    var exit_checker = setInterval(check_for_exit, 1000);

    console.log("exiting??")
};




class DataHandler {
    constructor() {
        
        const this.deviceId = process.env.DEVICE_ID || "";
        const this.email = process.env.EMAIL || "";
        const this.password = process.env.PASSWORD || "";
        
        
        var this.currentFocus = 0;
        var this.currentCalm = 0;
        
        const verifyEnvs = (email, password, deviceId) => {
            const invalidEnv = (env) => {
                return env === "" || env === 0;
            };
            if (invalidEnv(email) || invalidEnv(password) || invalidEnv(deviceId)) {
                console.error("Please verify deviceId, email and password are in .env file, quitting...");
                process.exit(0);
            }
        };
        
        verifyEnvs(this.email, this.password, this.deviceId);
        console.log(`${this.email} attempting to authenticate to ${this.deviceId}`);
        
        const this.neurosity = new Neurosity({
            this.deviceId
        });

        

        await this.neurosity
            .login({
                this.email,
                this.password
            })
            .catch((error) => {
            console.log(error);
            throw new Error(error);
            });
        console.log("Logged in to Neurosity");
        
        this.neurosity.focus().subscribe((focus) => {
            this.currentFocus = focus;
        });

        this.neurosity.calm().subscribe(({ calm }) => {
            this.currentCalm = calm;
        });

    } // end of constructor

    async getFocus {
        return currentFocus;
    }

    async getCalm {
        return currentCalm;
    }


}
  
  // Usage:
const dataHandlerTest = new DataHandler();
  

  
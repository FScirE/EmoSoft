



// This file is a WIP and ironically untested, just pretend it doesn't exist until Tommie fixes it




const assert = require('assert');

// const vscode = require('vscode');

const path = require('path');

const {DataHandler} = require('../DataHandler');


/**
 * Await for a promise with a timeout. 
 * Note that this function should be awaited, but the function you want to wait for should be async but without an await. e.g.
 * "await AwaitWithTimeout(obj.func(arg0, arg1), timeoutDuration);"
 * 
 * @function
 */
async function AwaitWithTimeout(promise, milliseconds){
	const timeoutPromise = new Promise((resolve, reject) => {
		const timeoutId = setTimeout(reject, milliseconds, new Error('timeout'));
		return () => clearTimeout(timeoutId); // Cancel timeout on promise completion
	  });

	
	return await Promise.race([promise, timeoutPromise]);
}


async function RunDataHandlerTests (duration = 20) {


	// situation as of 240229: Initializing realDHandler first causes BOTH the real and fake ones to log in (the fake one should fail login)
	// running the fake one first causes the fake DataHandler to correctly fail login and use simulated data 
	//    (although getCalm/getFocus seem fucked up when ran from this func),
	//    and the realDHandler seems to correctly log in.
	// I suspect that there is an issue in DataHandler that causes is to share data between instances,
	//    possibly because of the fact that the require neurosity is outside of the class.


	var initTimeout = 5000;
	var getTimeout = 2000;

	console.log("Testing DataHandler constructor and init with a correct envNeurosity.env path, and again with an invalid path. ")
	
	

	// log in to Neurosity
	var realDHandler = new DataHandler();
	await AwaitWithTimeout(realDHandler.init(path.join(__dirname, '/../')), initTimeout); // IDK fix path ig
	assert.ok(realDHandler.dataSourceType.includes("real"), 
	'realDHandler.dataSourceType should be real data, and include str "real". Instead got ' + String(realDHandler.dataSourceType));

	console.log("You should see an error after this line telling you that the login failed beause of a .env issue ")
	var fakeDHandler = new DataHandler();
	await AwaitWithTimeout(fakeDHandler.init("invalid/path/to/file"), initTimeout);
	assert.ok(fakeDHandler.dataSourceType.includes("fake"), 
	'fakeDHandler.dataSourceType should be fake data, and include str "fake". Instead got ' + String(fakeDHandler.dataSourceType));


	console.log("DataHandler constructor and init testing finished. ")

	console.log("Testing dataHandler.GetCalm and dataHandler.getFocus. ")

	for (let i = 0; i < duration; i++) {
		var rc = await AwaitWithTimeout(realDHandler.getCalm, getTimeout);
		var rf = await AwaitWithTimeout(realDHandler.getFocus, getTimeout);
		var fc = await AwaitWithTimeout(fakeDHandler.getCalm, getTimeout);
		var ff = await AwaitWithTimeout(fakeDHandler.getFocus, getTimeout);
		
		assert.ok(typeof rc === 'number', 'rc must be a number');
		assert.ok(typeof rf === 'number', 'rf must be a number');
		assert.ok(typeof fc === 'number', 'fc must be a number');
		assert.ok(typeof ff === 'number', 'ff must be a number');

		// Assert that each variable is within the range [0, 1]
		assert.ok(0 <= rc && rc <= 1, 'rc must be between 0 and 1 (inclusive)');
		assert.ok(0 <= rf && rf <= 1, 'rf must be between 0 and 1 (inclusive)');
		assert.ok(0 <= fc && fc <= 1, 'fc must be between 0 and 1 (inclusive)');
		assert.ok(0 <= ff && ff <= 1, 'ff must be between 0 and 1 (inclusive)');

	}

	console.log("Finished testing dataHandler.GetCalm and dataHandler.getFocus. ")

}


RunDataHandlerTests()


module.exports = {
	RunDataHandlerTests
}
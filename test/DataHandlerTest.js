const assert = require('assert');

const vscode = require('vscode');


const {DataHandler} = require('../DataHandler');



async function RunWithTimeout(func, milliseconds){
	var timeout = setTimeout(() => {
		throw new Error('timeout');
	}, milliseconds)

	return Promise.race([func(), timeout])
}

async function RunDataHandlerTests (duration) {


	var initTimeout = 5000;
	var getTimeout = 2000;

	// log in to Neurosity
	var realDHandler = new DataHandler();
	await RunWithTimeout(realDHandler.init, initTimeout); // IDK fix path ig
	assert.ok(realDHandler.dataSourceType.includes("real"), 'realDHandler.dataSourceType should be real data, and include str "real"');

	var fakeDHandler = new DataHandler();
	await RunWithTimeout(fakeDHandler.init("invalid/path/to/file"), initTimeout);
	assert.ok(fakeDHandler.dataSourceType.includes("fake"), 'fakeDHandler.dataSourceType should be fake data, and include str "fake"');

	for (let i = 0; i < duration; i++) {
		var rc = await RunWithTimeout(realDHandler.getCalm(), getTimeout);
		var rf = await RunWithTimeout(realDHandler.getFocus(), getTimeout);
		var fc = await RunWithTimeout(fakeDHandler.getCalm(), getTimeout);
		var ff = await RunWithTimeout(fakeDHandler.getFocus(), getTimeout);
		
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

}



module.exports = {
	RunDataHandlerTests
}
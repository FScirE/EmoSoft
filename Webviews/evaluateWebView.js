
// @ts-ignore
const vscode = acquireVsCodeApi() //ignore error

var focusValues = []
var calmValues = []
var functions = []
var evaluateNames = []
var responses = {}
var newestSession = {}
var functionContents = {}
var dataPoints = []
var funcs = []
var path = []
var loaded = false
var pathHeat = ""
var ID = -1

// @ts-ignore
//KOMMENTERA UT IFALL NI ANVÄNDER LIVE SERVER
document.querySelector('body').style.visibility = 'hidden'

//inputs
const focusSlider = document.getElementById("focusSlider");
const focusOutput = document.getElementById("focusValue");

focusOutput.innerHTML = focusSlider.value;

focusSlider.oninput = function() {
	focusOutput.innerHTML = this.value;
};
const calmSlider = document.getElementById("calmSlider");
const calmOutput = document.getElementById("calmValue");

calmOutput.innerHTML = calmSlider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
calmSlider.oninput = function() {
    calmOutput.innerHTML = this.value;
};

function createChart() {
	//feedbackContainer.innerHTML = '<p id="textfromAi"><span class="loader"></span></p>'
	// Calculate the range of x-values
    let minX = Math.min(...focusValues.map(point => point.x));
    let maxX = Math.max(...focusValues.map(point => point.x));

    // Calculate the interval
    let interval = (maxX - minX) / 9; // Divide by 9 to get 10 intervals

    // Generate x-values with even interval
    let xValues = [];
    for (let i = 0; i <= 9; i++) {
        xValues.push(minX + i * interval);
    }

	var chart = new CanvasJS.Chart("chartContainer", {
		animationEnabled: true,
		zoomEnabled: true,
		theme: "dark2",
		interactivityEnabled: true,
		//title: {
			//text: "Session"
		//},
		axisX: {
			title: "Time (s)",
			valueFormatString: "####",
			interval: interval,
			tickValues: xValues,
			titleFontSize: 16,
			minimum: 0
		},
		toolTip: {
			shared: true,

		},
		axisY: {
			logarithmic: false, //change it to false
			title: "Focus & Calm",
			titleFontSize: 16,
			gridThickness: 0,
			lineThickness: 1,
			labelFormatter: addSymbols,
			suffix: "%",
			includeZero: true,
			maximum: 110
		},
		legend: {
			verticalAlign: "top",
			fontSize: 16,
			dockInsidePlotArea: true,
			y: -5
		},
		data: [{
			type: "line",
			color: "#4fc553",
			xValueFormatString: "Time (s): ####",
			showInLegend: true,
			name: "Focus (%)",
			click: clickedFunctionCanvas,
			dataPoints: focusValues
		},
		{
			type: "line",
			color: "#03a9f4",
			xValueFormatString: "####",
			showInLegend: true,
			name: "Calm (%)",
			click: clickedFunctionCanvas,
			dataPoints: calmValues
		},
		{
			type: "line",
			color: "#DF73FF",
			xValueFormatString: "Function: ###############",
			showInLegend: false,
			name: "Function",
			click: clickedFunctionCanvas,
			dataPoints: functions
		}
	]
	});
	chart.render();
	document.querySelector('body').style.visibility = 'visible'
	gatherResponses()
	vscode.postMessage({
		variable: 'relevantDataForAi',
		value: responses
	})
	vscode.postMessage({
		variable: 'finished',
		value: `Chart generated`
	})
}

function addSymbols(e) {
	var suffixes = ["", "K", "M", "B", "T"];

	var order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)), 0);
	if(order > suffixes.length - 1)
		order = suffixes.length - 1;

	var suffix = suffixes[order];
	return CanvasJS.formatNumber(e.value / Math.pow(1000, order), "#,##0.##") + suffix;
}

function gatherResponses() {

	const topfuncs = funcs

	const focusSliderValue = document.getElementById("focusSlider").value;
    const calmSliderValue = document.getElementById("calmSlider").value;

    const q1Rating = document.querySelector('input[name="q1rating"]:checked');
	const q2Rating = document.querySelector('input[name="q2rating"]:checked');

	const q1Value = q1Rating ? q1Rating.value : null;
	const q2Value = q2Rating ? q2Rating.value : null;

	responses.focusValues = focusValues;
	responses.calmValues = calmValues;
	responses.sessionFuncs = functions;
	responses.topfuncs = topfuncs;
	responses.functionContents = functionContents;

	//needed for ai feedback on newest session
	responses.dataPoints = dataPoints

	// Add all evaluate response to a dict
	responses.expectedWorkAnswer = q1Value;
	responses.finishedWorkAnswer = q2Value;
	responses.focusAnswer = focusSliderValue;
	responses.calmAnswer = calmSliderValue;
}

function saveEvaluateResponses() {
	// Fetch data from HTML
	var name = document.getElementById("textInput").value;
	var count = 0;
	gatherResponses()
	if (loaded == false) {
		if (name == "") {
			name = new Date().toISOString().split('T')[0];
		}
		for (var i = 0; i < evaluateNames.length; i++) {
			if (evaluateNames[i] == name) {
				count++;
			}
		}
		if (count > 0){
			name = name + "(" + count + ")";
		}
	}
	responses.name = name;
	responses.ID = ID;

	// Send data to eventhandler
    vscode.postMessage({
        variable: "evaluateResponses",
        value: responses
    })

}

function setTopFunctions(funcs) {
	var innerHTML = ''
	for (var f of funcs) {
		innerHTML += `
			<li><code class="function" onclick="scrollToFunction('${f[0]}')">${f[0]}</code>: ${parseInt(f[1]) / 2}s</li>
		`
	}
	document.querySelector('#topFunctions ol').innerHTML = innerHTML
}

function scrollToFunction(funcName) {
	vscode.postMessage({
		variable: 'scrollFunction',
		value: funcName
	})
}
function clickedFunctionCanvas(e) {
	for (var i = 0; i < functions.length; i++) {
		if (functions[i].x == e.dataPoint.x) {
			var nameOfFunction = functions[i].y.toString().replaceAll("'", "")
		}
	}
	setFunctionContentArea(nameOfFunction != 'No function', functionContents[nameOfFunction])
}

function setFunctionContentArea(visible, text) {
	var functionTextArea = document.getElementById("contentViewer")
	if (visible) {
		functionTextArea.style.visibility = 'visible'
		functionTextArea.style.position = 'relative'
		functionTextArea.querySelector('textarea').textContent = text
	}
	else {
		functionTextArea.style.visibility = 'hidden'
		functionTextArea.style.position = 'absolute'
	}
}

function setAiResponse(aioutput) {
	document.getElementById("feedbackAiMessage").innerHTML = `<p id="textfromAi">${aioutput}</p>`
}

function populatedropdown(){
	var dropdown = document.getElementById("History");
	for (var i = 0; i < evaluateNames.length; i++) {
		var inner = dropdown.innerHTML;
		var option = `
		<option value="${evaluateNames[i]}">${evaluateNames[i]}</option>
		`
		inner = inner + option;
		dropdown.innerHTML = inner;
	}
}

function toggleRatingInputs() {
	var elements = document.querySelectorAll('input:not(#textInput)')
	for (let i = 0; i < elements.length; i++)
		elements[i].disabled = loaded ? true : false
}

function changeHeatmapImageSrc(newSrc) {
    const heatmapImg = document.querySelector('#heatmap img');
	heatmapImg.setAttribute('src', newSrc)
}
function loadSession(extensionPath) {
	document.getElementById("feedbackAiMessage").innerHTML = '<p id="textfromAi"><span class="loader"></span></p>'
	var name = responses.name
	if (name != "New Session") {
		document.getElementById("textInput").value = name;
	}
	else {
		document.getElementById("textInput").value = "";
	}

	setFunctionContentArea(false) //hide function definition window

	toggleRatingInputs()

	//SET TOP FUNCS
	funcs = responses.topfuncs;
	setTopFunctions(funcs)

	//SET FUNCTION DEFINITIONS
	functionContents = responses.functionContents

	//CHART LOAD
	focusValues = responses.focusValues;
	calmValues = responses.calmValues;
	functions = responses.sessionFuncs;

	//for ai evaluation fix
	dataPoints = responses.dataPoints

	createChart() //this ereases the local values from responses, use after defining them

	//LOAD HEATMAP
	var FullPathHeatmap = extensionPath + '\\' +  responses.pathHeat;
	changeHeatmapImageSrc(FullPathHeatmap)

	//SLIDER LOAD
	focusSlider.value = responses.responses.focusAnswer
    focusOutput.innerHTML = responses.responses.focusAnswer

	calmSlider.value = responses.responses.calmAnswer
    calmOutput.innerHTML = responses.responses.calmAnswer

	//RADIO BUTTON LOAD
	var q1Rating = responses.responses.expectedWorkAnswer
    var q2Rating = responses.responses.finishedWorkAnswer

    // Check the radio buttons for question 1
    var q1RadioButtons = document.querySelectorAll('input[name="q1rating"]');
    for (var i = 0; i < q1RadioButtons.length; i++) {
        if (q1Rating && q1RadioButtons[i].value === q1Rating) {
			q1RadioButtons[i].checked = true;
		} else {
			q1RadioButtons[i].checked = false; // Uncheck the radio button
		}
    }

    // Check the radio buttons for question 2
    var q2RadioButtons = document.querySelectorAll('input[name="q2rating"]');
    for (var i = 0; i < q2RadioButtons.length; i++) {
        if (q2Rating && q2RadioButtons[i].value === q2Rating) {
			q2RadioButtons[i].checked = true;
		} else {
			q2RadioButtons[i].checked = false; // Uncheck the radio button
		}
    }
}

var selectElement = document.getElementById("History");

selectElement.addEventListener("change", function(event) {
	var sessionName = selectElement.value
	vscode.postMessage({
		variable: 'nameRequest',
		value: sessionName
	})
});

selectElement.addEventListener("focus", function(event) {
	if (selectElement.value == "New Session"){
		newestSession.name = "New Session";
		newestSession.responses = {};
		newestSession.focusValues = focusValues;
		newestSession.calmValues = calmValues;
		newestSession.sessionFuncs = functions;
		newestSession.functionContents = functionContents;
		newestSession.dataPoints = dataPoints //
		newestSession.responses.focusAnswer = document.getElementById("focusSlider").value;
		newestSession.responses.calmAnswer = document.getElementById("calmSlider").value;
		newestSession.topfuncs = funcs;
		newestSession.pathHeat = "heatmap.png"

		const q1Rating = document.querySelector('input[name="q1rating"]:checked');
		const q2Rating = document.querySelector('input[name="q2rating"]:checked');

		const q1Value = q1Rating ? q1Rating.value : null;
		const q2Value = q2Rating ? q2Rating.value : null;

		newestSession.responses.expectedWorkAnswer = q1Value;
		newestSession.responses.finishedWorkAnswer = q2Value;
	}
});


window.addEventListener("message", e => {
	const message = e.data; // The JSON data our extension sent

	switch (message.variable) {
		case "values":
			focusValues = message.value[0]
			calmValues = message.value[1]
			functions = message.value[2]
			functionContents = message.value[3]
			dataPoints = message.value[4] //
			createChart()
			break;
		case "functions":
			funcs = message.value
			setTopFunctions(funcs)
			break;
		case "evaluateNames":
			evaluateNames = message.value
			populatedropdown()
			break;
		case "aiFeedback":
			setAiResponse(message.value)
			break;
		case "sessionData":
			if (message.value == -1) {
				responses = newestSession;
				ID = -1;
				loaded = false;
			} else {
				responses = message.value;
				ID = responses.ID;
				loaded = true;
				responses.pathHeat = "heatmap-" + responses.name + ".png"
			}
			loadSession(message.path);
			break;
	}
})

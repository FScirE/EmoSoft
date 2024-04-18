//functions to change values in UI webview


// @ts-ignore
const vscode = acquireVsCodeApi() //ignore error
	
var focusValues = []
var calmValues = []
var evaluateNames = []
var responses = {}

//KOMMENTERA UT IFALL NI ANVÄNDER LIVE SERVER
document.querySelector('body').style.visibility = 'hidden'

function createChart() {
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
			xValueFormatString: "####",
			showInLegend: true,
			name: "Focus (%)",
			dataPoints: focusValues
			
		},
		{
			type: "line",
			color: "#03a9f4",
			xValueFormatString: "####",
			showInLegend: true,
			name: "Calm (%)",
			dataPoints: calmValues
		}]
	});
	chart.render();
	document.querySelector('body').style.visibility = 'visible'
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
	const focusSliderValue = document.getElementById("focusSlider").value;
    const calmSliderValue = document.getElementById("calmSlider").value;

    const q1Rating = document.querySelector('input[name="q1rating"]:checked');
	const q2Rating = document.querySelector('input[name="q2rating"]:checked');
	
	const q1Value = q1Rating ? q1Rating.value : null;
	const q2Value = q2Rating ? q2Rating.value : null;
    
	// Add all evaluate response to a dict
	responses.expectedWorkAnswer = q1Value;
	responses.finishedWorkAnswer = q2Value;
	responses.focusAnswer = focusSliderValue
	responses.calmAnswer = calmSliderValue
	
}

function saveEvaluateResponses() {
	// Fetch data from HTML
	var name = document.getElementById("textInput").value;
	gatherResponses()
	responses.name = name;
	

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
			<li><code>${f[0]}</code>: ${parseInt(f[1]) / 2}s</li>
		`
	}
	document.querySelector('#topFunctions ol').innerHTML = innerHTML
}

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

function loadSession() {
	focusValues = responses.focusValues;
	calmValues = responses.calmValues;
	createChart()
	
	focusSlider.value = responses.responses.focusAnswer
    focusOutput.innerHTML = responses.responses.focusAnswer

	calmSlider.value = responses.responses.calmAnswer
    calmOutput.innerHTML = responses.responses.calmAnswer

	var name = responses.name
	document.getElementById("textInput").value = name;

	var q1Rating = responses.responses.expectedWorkAnswer;
    var q2Rating = responses.responses.finishedWorkAnswer;

    // Check the radio buttons for question 1
    var q1RadioButtons = document.querySelectorAll('input[name="q1rating"]');
    for (var i = 0; i < q1RadioButtons.length; i++) {
        if (q1RadioButtons[i].value === q1Rating) {
            q1RadioButtons[i].checked = true;
        }
    }

    // Check the radio buttons for question 2
    var q2RadioButtons = document.querySelectorAll('input[name="q2rating"]');
    for (var i = 0; i < q2RadioButtons.length; i++) {
        if (q2RadioButtons[i].value === q2Rating) {
            q2RadioButtons[i].checked = true;
        }
    }
}

var selectElement = document.getElementById("History");

selectElement.addEventListener("change", function(event) {
    // Code to execute when the selection changes
	var sessionName = selectElement.value
	if (responses.name == "New Session") {
		gatherResponses()
		newestSession = responses;
		loadSession()
	}
	vscode.postMessage({
		variable: 'nameRequest',
		value: sessionName
	})
});

window.addEventListener("message", e => {
	const message = e.data; // The JSON data our extension sent
	
	switch (message.variable) {
		case "values":			
			focusValues = message.value[0]
			calmValues = message.value[1]
			createChart()
			break;
		case "functions":
			setTopFunctions(message.value)
			break;
		case "evaluateNames":
			evaluateNames = message.value
			populatedropdown()
			break;
		case "sessionData":
			if (message.value == -1) {
				responses = {};
			} else {
				responses = message.value;
			}
			loadSession();
			break;
	}
})

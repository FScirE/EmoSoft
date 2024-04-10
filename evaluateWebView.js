//functions to change values in UI webview


// @ts-ignore
const vscode = acquireVsCodeApi() //ignore error
	
var focusValues = []
var calmValues = []

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

function saveEvaluateResponses() {

	const focusSliderValue = document.getElementById("focusSlider").value;
    const calmSliderValue = document.getElementById("calmSlider").value;

    const radioButtonGroups = [	document.getElementsByName("q1rating"),
                                document.getElementsByName("q2rating"),
                                document.getElementsByName("q3rating")]
    
    var responses = []
    
    for (var group = 0; group < radioButtonGroups.length; group++) 
        for (var button = 0; button < radioButtonGroups[group].length; button++) 
            if (radioButtonGroups[group][button].checked) 
                responses[group] = radioButtonGroups[group][button].value
	
	responses.push(focusSliderValue)
	responses.push(calmSliderValue)
    console.log(responses);

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
	}
})
//functions to change values in UI webview


// @ts-ignore
const vscode = acquireVsCodeApi() //ignore error

window.onload = function () {
	
	var focusValues = []
	var calmValues = []

	window.addEventListener("message", e => {
		const message = e.data; // The JSON data our extension sent
		
		switch (message.variable) {
			case "values":
				
				focusValues = message.value[0]
				calmValues = message.value[1]
				createChart()
				break
	}
})



function createChart() {
	var chart = new CanvasJS.Chart("chartContainer", {
		animationEnabled: true,
		zoomEnabled: true,
		theme: "dark2",
		title: {
			text: "Session"
		},
		axisX: {
			title: "Time",
			valueFormatString: "####",
			interval: 10
		},
		axisY: {
			logarithmic: false, //change it to false
			
			titleFontColor: "#4fc553",
			lineColor: "#4fc553",
			gridThickness: 0,
			lineThickness: 1,
			labelFormatter: addSymbols
		},
		axisY2: {
			
			titleFontColor: "#03a9f4",
			logarithmic: false, //change it to true
			lineColor: "#03a9f4",
			gridThickness: 0,
			lineThickness: 1,
			labelFormatter: addSymbols
		},
		legend: {
			verticalAlign: "top",
			fontSize: 16,
			dockInsidePlotArea: true
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
			axisYType: "secondary",
			showInLegend: true,
			name: "Calm (%)",
			dataPoints: calmValues
		}]
	});
	chart.render();
}

function addSymbols(e) {
	var suffixes = ["", "K", "M", "B", "T"];

	var order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)), 0);
	if(order > suffixes.length - 1)
		order = suffixes.length - 1;

	var suffix = suffixes[order];
	return CanvasJS.formatNumber(e.value / Math.pow(1000, order), "#,##0.##") + suffix;
}

}

function saveEvaluateResponses() {
    const radioButtonGroups = [ document.getElementsByName("q1rating"),
                                document.getElementsByName("q2rating"),
                                document.getElementsByName("q3rating")]
    
    const responses = ["-1", "-1", "-1"]
    
    for (var group = 0; group < radioButtonGroups.length; group++) 
        for (var button = 0; button < radioButtonGroups[group].length; button++) 
            if (radioButtonGroups[group][button].checked) 
                responses[group] = radioButtonGroups[group][button].value
    

    vscode.postMessage({
        variable: "evaluateResponses",
        value: responses
    })
}

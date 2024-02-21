//functions to change values in UI webview

window.addEventListener('message', e => {
    const message = e.data; // The JSON data our extension sent
    switch (message.variable) {
        case 'focus':
            setFocusValue(message.value)
            break
        case 'calm':
            setCalmValue(message.value)
            break
    }
});

function setFocusValue(value) {
    document.querySelector(".focus").getElementsByTagName("progress")[0].value = value
    document.querySelector(".focus p").textContent = "Focus (" + value.toFixed(0) + "%)"
}

function setCalmValue(value) {
    document.querySelector(".calm").getElementsByTagName("progress")[0].value = value
    document.querySelector(".calm p").textContent = "Calm (" + value.toFixed(0) + "%)"
}
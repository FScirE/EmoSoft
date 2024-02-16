//ignore error messages
//functions to change values in UI webview

window.addEventListener('message', e => {
    const message = e.data; // The JSON data our extension sent
    switch (message.variable) {
        case 'focus':
            setFocusValue(message.value)
            break;
        case 'calm':
            setCalmValue(message.value)
    }
});

function setFocusValue(value) {
    document.querySelector(".focus progress").value = value
}

function setCalmValue(value) {
    document.querySelector(".calm progress").value = value
}
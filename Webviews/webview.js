//functions to change values in UI webview


const MAX_LENGTH = 500
// @ts-ignore
const vscode = acquireVsCodeApi() //ignore error

var canSendMessage = true
var canClickRecord = true

function setFocusValue(value) {
    document.querySelector(".focus").getElementsByTagName("progress")[0].value = value
    document.querySelector(".focus p").textContent = "Focus (" + value.toFixed(0) + "%)"
}

function setCalmValue(value) {
    document.querySelector(".calm").getElementsByTagName("progress")[0].value = value
    document.querySelector(".calm p").textContent = "Calm (" + value.toFixed(0) + "%)"
}

function addUserMessage() {
    if (!canSendMessage) return
    //user message
    canSendMessage = false
    const text = document.querySelector("textarea").value.trim()
    if (text === "") return
    const messageHTML = `
    <div class="message right">
        <p>${text}</p>
    </div>
    `
    vscode.postMessage({
        variable: "user",
        value: text
    })
    var innerHTML = document.querySelector("#textbox").innerHTML
    document.querySelector("#textbox").innerHTML = messageHTML + innerHTML
    document.querySelector("textarea").value = ""
    textareaChanged()
    //ai message
    const aiHTML = `
    <div class="message left">
        <p><i class="fa-solid fa-robot fa-2xl"></i><span class="loader"></span></p>
    </div>
    `
    innerHTML = document.querySelector("#textbox").innerHTML
    document.querySelector("#textbox").innerHTML = aiHTML + innerHTML
}

function setAIResponse(text) {
    canSendMessage = true
    const lineHTML = `
    <p><i class="fa-solid fa-robot fa-2xl"></i>${text}</p>
    `
    document.querySelectorAll(".left:not(.calmresponse, .focusresponse)")[0].innerHTML = lineHTML
}

function addAIMessage(text, type) {
    const messageHTML = `
    <div class="message left ${type}">
        <p>${text}</p>
    </div>
    `
    const innerHTML = document.querySelector("#textbox").innerHTML
    document.querySelector("#textbox").innerHTML = messageHTML + innerHTML
}

function textareaChanged(element) {
    var content = document.querySelector("textarea").value
    if (content.length > MAX_LENGTH) {
        content = content.substring(0, MAX_LENGTH)
        document.querySelector("textarea").value = content
    }
    document.querySelector("#counter").textContent = content != "" ? content.length + "/" + MAX_LENGTH : " "
}

document.querySelector("textarea").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        addUserMessage()
        e.preventDefault()
    }
})

function setRecordingButton(recording) {
    if (recording) {
        var button = document.querySelector('.recordboxstart')
        button.classList.remove('recordboxstart')
        button.classList.add('recordboxend')
        button.textContent = 'End session';
    }
}

function record(button){
    if (!canClickRecord)
        return
    setRecordTimeout()

    if (button.classList.contains('recordboxstart')) {
        button.classList.remove('recordboxstart');
        button.classList.add('recordboxend');
        button.textContent = 'End session';
    } else {
        button.classList.remove('recordboxend');
        button.classList.add('recordboxstart');
        button.textContent = 'Start session';
    }

    var isRecording = false

    // Additional logic based on the button click can go here
    if (button.classList.contains('recordboxend')) {
        isRecording = true;
    } else {
        isRecording = false;
    }

    vscode.postMessage({
        variable: "recording",
        value: isRecording
    })
}
async function setRecordTimeout() {
    canClickRecord = false
    await sleep(1000)
    canClickRecord = true
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('message', e => {
    const message = e.data; // The JSON data our extension sent
    switch (message.variable) {
        case 'focus':
            setFocusValue(message.value)
            break
        case 'calm':
            setCalmValue(message.value)
            break
        case "airesponse":
            setAIResponse(message.value)
            break
        case "aimessage":
            addAIMessage(message.value, message.type)
            break
        case "recording":
            setRecordingButton(message.value)
            break
        case "focusColor":
            document.documentElement.style.setProperty("--focus-color", message.value)
            break
        case "calmColor":
            document.documentElement.style.setProperty("--calm-color", message.value)
            break
    }
})

function gotoEvaluate(){
    vscode.postMessage({
        variable: "gotoEval",
    })
}


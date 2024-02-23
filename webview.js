//functions to change values in UI webview

const MAX_LENGTH = 500
const vscode = acquireVsCodeApi() //ignore error

var canSendMessage = true

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
    document.getElementsByClassName("left")[0].innerHTML = lineHTML
}

function textareaChanged(element) {
    var content = document.querySelector("textarea").value
    if (content.length > MAX_LENGTH) {
        content = content.substr(0, MAX_LENGTH)
        document.querySelector("textarea").value = content
    }
    document.querySelector("#counter").textContent = content != "" ? content.length + "/" + MAX_LENGTH : " "
}
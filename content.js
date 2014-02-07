var startTime = new Date().getTime(); // start the clock

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.text && (msg.text == "getTitle")) {
        sendResponse(document.title);
    }
    else if (msg.text && (msg.text == "getHTML")) {
        sendResponse(document.all[0].outerHTML);
    }
    else if (msg.text && (msg.text == "getTime")) {
        sendResponse(startTime);
    }

});
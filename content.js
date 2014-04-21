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
    else if (msg.text && (msg.text == "getScrollbarData")) {
        
        // window height and scroll positions
        data = {};

        data.scrollY = window.scrollY;
        data.scrollX = window.scrollX;
        data.innerHeight = window.innerHeight;
        data.scrollHeight = document.body.scrollHeight;

        sendResponse(data);
    }

});
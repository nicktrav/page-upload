var data = JSON.parse('{"timestamp": "", "title": "", "url": "", "html": ""}');
// var temp_dom = 'None';
var myToken = '';
var project = 'page-upload';
var bucket = 'page-uploads-1';

// get the page data
function getData() {

  // get the URL
  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {

      // Send a request to the content script.
      chrome.tabs.sendMessage(tab[0].id, {text: "report_back"}, function(response) {

          data.html = response;
          data.url = tab[0].url;
          data.timestamp = new Date().toJSON();
          // data.title = response.title;

      });

  });

};

function authenticate() {

  chrome.identity.getAuthToken({ 'interactive': true }, function(t) {myToken = t; console.log('Authenticated, with token: ' + myToken)});

};

function sendREST(token) {

  res = $.ajax({

    url: "https://www.googleapis.com/storage/v1beta2/b?project=" + project,
    type: "GET",
    headers: {"Authorization": "Bearer " + token},
    success: function(response) {console.log(response)},
    error: function() {console.log(response)}

  });

};

function logger() {

  // get data
  getData();

  console.log(data);

};

// authenticate
authenticate();

// on click of button, get the page data
chrome.browserAction.onClicked.addListener(logger);
// define the version of the script
var VERSION = '0.1.2';
var URL = 'http://23.251.159.124:1337';

var data = {
  "version": VERSION,
  "timestamp": undefined,
  "timeOnPage": undefined,
  "url": undefined,
  "title": undefined,
  "html": undefined
};


function getURL() {

  var deferred = $.Deferred();

  console.log('Getting page URL ...');

  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
    data.url = tab[0].url;
    deferred.resolve(data);
  });

  return deferred.promise();

};

function getTitle() {

  var deferred = $.Deferred();

  console.log('Getting page title ...');

  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {

    chrome.tabs.sendMessage(tab[0].id, {text: "getTitle"}, function(response) {

      data.title = response;
      deferred.resolve(data);

    });

  });

  return deferred.promise();

};

function getHTML() {

  var deferred = $.Deferred();

  console.log('Getting page HTML ...');

  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {

    chrome.tabs.sendMessage(tab[0].id, {text: "getHTML"}, function(response) {

      data.html = response;
      deferred.resolve(data);

    });

  });

  return deferred.promise();

};

function uploadObject(tab) {

  s = JSON.stringify(data);

  res = $.ajax({

    url: URL + "/page",
    type: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: s
  })
    .done(function(data){
      console.log('Upload OK');

      // change badge to green with text 'OK'
      chrome.browserAction.setBadgeBackgroundColor({"color": "#00FF00"});
      chrome.browserAction.setBadgeText({"text": "OK", "tabId": tab.id});

    })
    .fail(function(data, textStatus){
      console.log('Upload failed');
      console.log(data);
      console.log(textStatus);

      // change badge to red with text 'X'
      chrome.browserAction.setBadgeBackgroundColor({"color": "#FF0000"});
      chrome.browserAction.setBadgeText({"text": "X", "tabId": tab.id});
    });

};

// get time page has been active
function getPageActiveTime(time) {

  var deferred = $.Deferred();

  // set the time the page was opened
  data.timestamp = time.toJSON();

  console.log('Getting page active time ...');

  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {

    chrome.tabs.sendMessage(tab[0].id, {text: "getTime"}, function(response) {

      var timeOnPage = (time.getTime() - response);
      data.timeOnPage = timeOnPage;

      console.log('Time on page (ms):', timeOnPage);

      deferred.resolve(data);

    });

  });

  return deferred.promise();

};

function main(tab) {

  // get the time the button was clicked
  var timeClicked = new Date();

  // make sure all the data collection has been performed first
  var collectDataPromise = $.when(getURL(), getTitle(), getHTML(), getPageActiveTime(timeClicked));
  // once all data collection complete, commence data upload
  collectDataPromise.done(function() {console.log('Collected all data.', data)});

  // upload once all data is collected
  var uploadPromise = $.when(collectDataPromise);
  uploadPromise.done(function(){
    uploadObject(tab);
  });

};

// add the listener to the click button
// calls the main() function when clicked
chrome.browserAction.onClicked.addListener(main);
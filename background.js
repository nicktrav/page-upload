// define the version of the script
var VERSION = '0.1.2';

var data = {
  "version": VERSION,
  "timestamp": undefined,
  "timeOnPage": undefined,
  "url": undefined,
  "title": undefined,
  "html": undefined,
  "device": undefined,
  "client": undefined
};
var myToken = '';
var bucket = 'page-uploads-1';

function getDevice() {
  var deferred = $.Deferred();

  console.log('Getting device ...');

  chrome.runtime.getPlatformInfo(function(platformInfo) {data.device = platformInfo});
  data.client = chrome.runtime.getManifest().oauth2.client_id;

  deferred.resolve();

  return deferred.promise();
}

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

function authenticate() {

  var deferred = $.Deferred();

  console.log('Authenticating ...');

  chrome.identity.getAuthToken({ 'interactive': true }, function(t) {
    myToken = t;
    deferred.resolve(t);
  });

  return deferred.promise();

};

function uploadObject() {

  var deferred = $.Deferred();

  s = JSON.stringify(data);

  res = $.ajax({

    url: "https://www.googleapis.com/upload/storage/v1beta2/b/" + bucket + "/o?uploadType=media&name=upload-" + data.timestamp,
    type: "POST",
    headers: {
      "Authorization": "Bearer " + myToken,
      "Content-Type": "application/json",
    },
    data: s,
    success: function(response) {
      deferred.resolve(response);
    },
    error: function(response) {
      deferred.reject(response);
    }

  });

  return deferred.promise();

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

  // simultaneously authenticate with Google
  var uploadCabablePromise = $.when(authenticate());
  uploadCabablePromise.done(function(t) {console.log('Authentication tasks complete.', t)});

  // make sure all the data collection has been performed first
  var collectDataPromise = $.when(getURL(), getTitle(), getHTML(), getPageActiveTime(timeClicked), getDevice());
  // once all data collection complete, commence data upload
  collectDataPromise.done(function() {console.log('Collected all data.', data)});

  // make sure the authentication and data collection is done
  var combinedPromise = $.when(uploadCabablePromise, collectDataPromise);
  // once both are done, upload data
  combinedPromise.done(function() {
    uploadObject();
  });

  // notify the user of the outcome
  var uploadPromise = $.when(combinedPromise);
  uploadPromise.done(function(){

    console.log('Upload complete!');

    // change badge to green with text 'OK'
    chrome.browserAction.setBadgeBackgroundColor({"color": "#00FF00"});
    chrome.browserAction.setBadgeText({"text": "OK", "tabId": tab.id});

  });
  uploadPromise.fail(function(response){
    console.error('Upload failed. See log.');
    console.error(response);

    // change badge to red with text 'X'
    chrome.browserAction.setBadgeBackgroundColor({"color": "#FF0000"});
    chrome.browserAction.setBadgeText({"text": "X", "tabId": tab.id});
  });

};

// add the listener to the click button
// calls the main() function when clicked
chrome.browserAction.onClicked.addListener(main);
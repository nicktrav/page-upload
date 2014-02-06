var data = {"timestamp": undefined, "url": undefined, "title": undefined, "html": undefined};
var myToken = '';
var bucket = 'page-uploads-1';

function getTimestamp() {

  var deferred = $.Deferred();

  data.timestamp = new Date().toJSON();

  deferred.resolve(data);

  return deferred.promise();

};

function getURL() {

  var deferred = $.Deferred();

  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
    data.url = tab[0].url;
    deferred.resolve(data);
  });

  return deferred.promise();

};

function getTitle() {

  var deferred = $.Deferred();

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

  chrome.identity.getAuthToken({ 'interactive': true }, function(t) {myToken = t; deferred.resolve(t);});

  return deferred.promise();

};

function uploadObject() {

  var deferred = $.Deferred();

  s = JSON.stringify(data);
  console.log('\tData to upload:', s);

  res = $.ajax({

    url: "https://www.googleapis.com/upload/storage/v1beta2/b/" + bucket + "/o?uploadType=media&name=upload-" + data.timestamp,
    type: "POST",
    headers: {
      "Authorization": "Bearer " + myToken,
      "Content-Type": "application/json",
    },
    data: s,
    success: function(response) {deferred.resolve(response)},
    error: function(response) {deferred.reject(response)}

  });

  return deferred.promise();

};

function main() {

  // simultaneously authenticate with Google
  var uploadCabablePromise = $.when(authenticate());
  uploadCabablePromise.done(function(t) {console.log('Authentication complete.', t)});

  // make sure all the data collection has been performed first
  var collectDataPromise = $.when(getTimestamp(), getURL(), getTitle(), getHTML());
  // once all data collection complete, commence data upload
  collectDataPromise.done(function() {console.log('Collected all data.', data)});

  // make sure the authentication and data collection is done
  var combinedPromise = $.when(uploadCabablePromise, collectDataPromise);
  // once both are done, upload data
  combinedPromise.done(function() {
    console.log('Uploading object ...');
    uploadObject();
  });

  // notify the user of the outcome
  var uploadPromise = $.when(combinedPromise);
  uploadPromise.done(function(){console.log('Upload complete!')});
  uploadPromise.fail(function(response){console.log('Upload failed. See log.'); console.log(response)});

};



chrome.browserAction.onClicked.addListener(main);
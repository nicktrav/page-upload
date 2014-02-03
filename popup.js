// ---------------------------------------
// Created: Nick Travers
// Date:    2014-02-03
//
// Description: My first chrome extension
//
// ---------------------------------------

// Gets key information from the currently active page
function samplePageInfo() {

  var tablink = chrome.tabs.getSelected(null,function(tab) {
    return tab.url;
  });

  alert(tablink);

  return 1;

};

// a link to the submit button
var submitBtn = document.getElementById('submitBtn');

// add a listener to the submit button
submitBtn.addEventListener('click', function() {
    var res = samplePageInfo();

    var text = document.getElementById('text');

    if (res == 1) {
      text.innerHTML = 'Success!';
    }
    else {
      text.innerHTML = 'Failed.';
    };

}, false);
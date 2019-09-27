/*
 *
 * Copyright (c) 2010-2015 EVE GROUP PTE. LTD.
 *
 */

var platformInfo = {};

function makeURL(toolchain, config) {
  return 'index.html?tc=' + toolchain + '&config=' + config + '&arch' + platformInfo.nacl_arch;
}

function createWindow(url) {
  console.log('createWindow loading ' + url);
  chrome.app.window.create(url, {
    width: 1360,
    height: 800
  });
}

function createWindowHidden(url) {
  console.log('createWindowHidden (proxy mode) loading ' + url);
  chrome.app.window.create(url, {
    width: 1280,
    height: 800,
    hidden: true,
    id:'1'    //for singleton
  });
}

function onLaunched(launchData) {

// Load platformInfo before continuing.
  chrome.runtime.getPlatformInfo(function(info) {
    platformInfo = info;
//console.log('background.js platformInfo.nacl_arch');
console.log('background.js url=' + launchData.url);
console.log('background.js source=' + launchData.source);

  // Send and XHR to get the URL to load from a configuration file.
  // Normally you won't need to do this; just call:
  //
  // chrome.app.window.create('<your url>', {...});
  //
  // In the SDK we want to be able to load different URLs (for different
  // toolchain/config combinations) from the commandline, so we to read
  // this information from the file "run_package_config".
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'run_package_config', true);
  xhr.onload = function() {
    var toolchain_config = this.responseText.split(' ');
	if(launchData.source == 'url_handler'){
	    createWindowHidden(makeURL.apply(null, toolchain_config));
	}else{
    	    createWindow(makeURL.apply(null, toolchain_config));
	}
  };
  xhr.onerror = function() {
    // Can't find the config file, just load the default.
	if(launchData.source == 'url_handler'){
    		createWindowHidden('index.html');
	}else{
    		createWindow('index.html');
	}
  };
  xhr.send();
 });
}

chrome.app.runtime.onLaunched.addListener(onLaunched);

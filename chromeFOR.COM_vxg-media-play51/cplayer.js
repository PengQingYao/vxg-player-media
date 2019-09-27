/*
 *
 * Copyright (c) 2010-2015 EVE GROUP PTE. LTD.
 *
 */


function moduleDidLoad() {
  //common.hideModule();
  document.querySelector('#connect button').disabled = false;
  document.querySelector('#latency button').disabled = false;
  document.querySelector('#avsync button').disabled = false;
  document.querySelector('#mutetrigger button').disabled = false;
  document.querySelector('#volumeup button').disabled = false;
  document.querySelector('#volumedown button').disabled = false;
  document.querySelector('#showlog button').disabled = false;
  progress.style.display = 'none';//(progress.style.display == 'none') ? 'block' : 'none';
	if(chrome.app.window.current().id == '1'){
		//proxy mode
		playerSetVersion();
  		playerStartWebss();
	}
}


function attachListeners() {  
	document.querySelector('#connect input').addEventListener('keyup', 
		function(ekey) {    
		  var enter_key = 13;
		  if(enter_key == ekey.which){
			playerOpen();
		  }
		});  

	document.querySelector('#connect button').addEventListener('click', 
		function() {    
		playerOpen();
		});  
	document.querySelector('#latency button').addEventListener('click', 
		function() {    
		playerSetLatency();
		});  
	document.querySelector('#avsync button').addEventListener('click', 
		function() {    
		playerSetAVSync();
		});  

	document.querySelector('#mutetrigger button').addEventListener('click', 
		function() {    
		playerToggleMute();
		});  
	document.querySelector('#volumeup button').addEventListener('click', 
		function() {    
		playerVolumeUp();
		});  
	document.querySelector('#volumedown button').addEventListener('click', 
		function() {    
		playerVolumeDown();
		});  
	document.querySelector('#showlog button').addEventListener('click', 
		function() {    

			if(document.getElementById('logtd').style.display == 'none'){
				document.getElementById('logtd').style.display='';
				document.getElementById('showlogbutton').innerHTML = 'Hide Log';
			}else{
				document.getElementById('logtd').style.display='none';
				document.getElementById('showlogbutton').innerHTML = 'Show Log';
			}
		});  
}


function makeMessage(command, path) {
  // Package a message using a simple protocol containing:
  // [command, <path>, <extra args>...]
  var msg = [command, path];
  for (var i = 2; i < arguments.length; ++i) {
    msg.push(arguments[i]);
  }
  return msg;
}

function playerSetVersion() {
  if (common.naclModule) {
    common.naclModule.postMessage(makeMessage('setversion', chrome.runtime.getManifest()['version']));
  }
}

function playerStartWebss() {
  if (common.naclModule == undefined) {
  	common.logMessage('=playerStartWebss err common.naclModule undefined');
	return;
  }

	//start Websocket server
  common.naclModule.postMessage(makeMessage('startwebsserver', '8778'));


	//start Native server  
  common.naclModule.postMessage(makeMessage('startnativeserver', '1'));

	//adjust listeners
  chrome.runtime.onConnectExternal.addListener(function (port){
	common.logMessage('=onConnectExternal='+port.name);

	port.onDisconnect.addListener(function(p) {
			common.logMessage('=>onDisconnect port='+p.name);
			if( p.name in common.naclPorts ){
				common.naclModule.postMessage(makeMessage(port.name,'disconnect'));
				delete common.naclPorts[p.name];
			}
			common.logMessage('<=onDisconnect port='+p.name);
		});
		
	port.onMessage.addListener(function(msg) {
		//common.logMessage('=onMessage='+msg.id);
		if(msg == undefined)
			return;
		if(msg.id == undefined && msg[0].charAt(0) == '@'){
			if(port.name != msg[0]){
				port.name = msg[0];
				common.logMessage('=onConnectExternal new port='+port.name);
				common.naclPorts[msg[0]] = port;
				common.naclModule.postMessage(makeMessage(port.name,'connect'));
			}
			
			common.logMessage('=onMessage='+msg+' test port='+common.naclPorts[msg[0]]);
			common.naclModule.postMessage(msg);
		}else{
			common.logMessage('=onMessage id='+msg.id+' cmd='+msg.cmd+' data='+msg.data);
			if(msg.cmd == 'getversionapp'){
				msg.data = "VERSION_APP "+chrome.runtime.getManifest()['version'];
				port.postMessage( msg );
			}else{
				common.logMessage('=onMessage unknown='+msg.id);	
			}
		}
	});
  });

}

function playerOpen() {
  if (common.naclModule) {
    //var useragent = 'MMP/3.0 ' + navigator.userAgent;
    //common.naclModule.postMessage(makeMessage('setuseragent', useragent));
    var urlName = document.querySelector('#connect input').value;
    common.naclModule.postMessage(makeMessage('open', urlName));
  }
}

function playerSetLatency() {
  if (common.naclModule) {
    var nLatency = document.querySelector('#latency input').value;
    //common.logMessage(nLatency);
    common.naclModule.postMessage(makeMessage('setlatency', nLatency));
  }
}

function playerSetAVSync() {
  if (common.naclModule) {
    var isChecked = document.querySelector('#avsync input').checked;
    //common.logMessage(isChecked);
    common.naclModule.postMessage(makeMessage('setavsync', isChecked?'1':'0'));
  }
}

function playerToggleMute() {
  if (common.naclModule) {
    common.naclModule.postMessage(makeMessage('mutetrigger','1'));
  }
}

function playerVolumeUp() {
  if (common.naclModule) {
    common.naclModule.postMessage(makeMessage('volumeup','1'));
  }
}

function playerVolumeDown() {
  if (common.naclModule) {
    common.naclModule.postMessage(makeMessage('volumedown','1'));
  }
}

// Called by the common.js module.
function handleMessage(message_event) {

	if(message_event.data[0].charAt(0) == '@'){
		//proto native send to plg
		if(common.naclPorts[message_event.data[0]] != undefined)
			common.naclPorts[message_event.data[0]].postMessage(message_event.data);
		else{
			common.logMessage('port='+message_event.data[0]+' not found');
			common.naclModule.postMessage(makeMessage(message_event.data[0],'disconnect'));
		}
	}else{
	  common.logMessage(message_event.data);
	}
}


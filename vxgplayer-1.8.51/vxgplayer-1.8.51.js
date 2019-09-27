window.vxgplayer = function(id, options_){
	window.vxgplayer.version="1.8.51"; //version is updated by 'npm run build'
	window.vxgplayer.players = window.vxgplayer.players || {};

	if(!document.getElementById(id)){
		console.error(" Player with " + id + " did not found");
		return undefined;
	}

	if(!window.vxgplayer.players[id]){

		if(typeof chrome == "undefined"){
			vxgplayer.showAvailableInChrome(id);
			return undefined;
		}

		if(navigator.userAgent.match(/Android/i)
		  || navigator.userAgent.match(/webOS/i)
  		  || navigator.userAgent.match(/iPhone/i)
  		  || navigator.userAgent.match(/iPad/i)
  		  || navigator.userAgent.match(/iPod/i)
  		  || navigator.userAgent.match(/BlackBerry/i)
  		  || navigator.userAgent.match(/Windows Phone/i)
 			){
 			vxgplayer.showAvailableInChrome(id);
  			return undefined;
 		};

		if(!vxgplayer.browserSupportsPluginPnacl()){
			console.log("Not installed vxg_media_player");
			vxgplayer.showNotInstalled(id);

			var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
			if (fs) {
				fs(window.TEMPORARY,100,function(){},function(){ vxgplayer.showNotInstalledInIncognitoMode(id); });
			}
			return undefined;
		}

		// magic run app
		var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
		if (!fs) {
  			//console.log("RequestFileSystem failed");
			window.location.href = "https://www.videoexpertsgroup.com/player_start/";
		} else {
  			fs(window.TEMPORARY, 1, function(){
			    //console.log("not in incognito mode");
			    if(!vxgplayer.isFrame()){
					//console.log("Start Chrome App");
					window.location.href = "https://www.videoexpertsgroup.com/player_start/";
				}
  			},
  			function(){
				console.log("Not installed vxg_media_player");
  			});
		}

		// check web socket server
		if(window.location.protocol != "https:" && !vxgplayer.isFrame()){
			vxgplayer.checkWebSocket().done(function(result){
				//console.log('websocket: success');
			}).fail(function(err){
				// check incognito mode
				fs(window.TEMPORARY,1,function(){ vxgplayer.showWebSocketFailed(id); },function(){ vxgplayer.showNotStartedInIncognitoMode(id); });
			});
		}

		if(window.location.protocol != "https:" && vxgplayer.isFrame()){
			vxgplayer.checkWebSocket().done(function(result){
				//console.log('websocket: success');
			}).fail(function(err){
				vxgplayer.showNotStartedInIFrame(id);
			});
		}

		//window.location.href = "https://videoexpertsgroup.com/player_start/";
		window.vxgplayer.players[id] = new function(id, opts){
			const self = this;
			self.id = id;
			self.player = document.getElementById(id);
			/* init options */
			window.vxgplayer.initOptions(self, opts);

			self.playerWidth=self.options.width || 640;
			self.playerHeight=self.options.height || 480;
			self.playerWidth = parseInt(self.player.getAttribute('width'),10) || self.playerWidth;
			self.playerHeight = parseInt(self.player.getAttribute('height'),10) || self.playerHeight;
			self.player.style.width = self.playerWidth + 'px';
			self.player.style.height = self.playerHeight + 'px';

			var html = ''
				+ '<div class="vxgplayer-loader" style="display: inline-block"></div>'
				+ '<div class="vxgplayer-screenshot-loading" style="display: none">'
				+ '		<div class="vxgplayer-screenshot-loading">'
				+ '     </div>'
				+ '</div>'
				+ '<div class="vxgplayer-error" style="display: none">'
				+ '	<div class="vxgplayer-error-text" style="display: none"></div>'
				+ '</div>'
				+ '<div class="vxgplayer-controls-zoom-position">'
				+ '		<div class="vxgplayer-zoom-position-cursor"></div>'
				+ '</div>'
				+ '<div class="vxgplayer-controls-zoom">'
				+ '	<div class="vxgplayer-zoom-up"></div>'
				+ '	<div class="vxgplayer-zoom-progress zoom10x"></div>'
				+ '	<div class="vxgplayer-zoom-down"></div>'
				+ '</div>'
				+ '<div class="vxgplayer-controls">'
				+ '	<div class="vxgplayer-volume-mute"></div>'
				+ '	<div class="vxgplayer-volume-down"></div>'
				+ '	<div class="vxgplayer-volume-progress vol7"></div>'
				+ '	<div class="vxgplayer-volume-up"></div>'
				+ '	<div class="vxgplayer-play"></div>'
				+ '	<div class="vxgplayer-pause" style="display: none"></div>'
				+ '	<div class="vxgplayer-stop" style="display: none"></div>'
				+'	<div class="vxgplayer-fullscreen"></div>'
				+'	<div class="vxgplayer-takescreenshot"></div>'
				+'	<div class="vxgplayer-scale"></div>'
				+ '</div>'
				+ window.vxgplayer.generateEmbededElement(self);

			self.player.innerHTML = html;

			var el_controls = self.player.getElementsByClassName('vxgplayer-controls')[0];
			var el_controls_zoom = self.player.getElementsByClassName('vxgplayer-controls-zoom')[0];
			var el_controls_zoom_position = self.player.getElementsByClassName('vxgplayer-controls-zoom-position')[0];
			var el_play = self.player.getElementsByClassName('vxgplayer-play')[0];
			var el_pause = self.player.getElementsByClassName('vxgplayer-pause')[0];
			var el_stop = self.player.getElementsByClassName('vxgplayer-stop')[0];
			var el_fullscreen = self.player.getElementsByClassName('vxgplayer-fullscreen')[0];
			var el_takescreenshot = self.player.getElementsByClassName('vxgplayer-takescreenshot')[0];
			var el_screenshot_loading = self.player.getElementsByClassName('vxgplayer-screenshot-loading')[0];
			var el_scale = self.player.getElementsByClassName('vxgplayer-scale')[0];
			var el_zoomUp = self.player.getElementsByClassName('vxgplayer-zoom-up')[0];
			var el_zoomDown = self.player.getElementsByClassName('vxgplayer-zoom-down')[0];
			var el_zoomProgress = self.player.getElementsByClassName('vxgplayer-zoom-progress')[0];
			var el_zoomPositionCursor = self.player.getElementsByClassName('vxgplayer-zoom-position-cursor')[0];
			var el_loader = self.player.getElementsByClassName('vxgplayer-loader')[0];
			var el_error = self.player.getElementsByClassName('vxgplayer-error')[0];
			var el_error_text = self.player.getElementsByClassName('vxgplayer-error-text')[0];
			var el_btnstart = document.getElementById(id + '_btnstart');
			self.module = document.getElementById(id + '_nacl_module');
			self.module.command = function(){
				var cmd = [];
				for(var i = 0; i < arguments.length; i++){
					cmd.push(arguments[i]);
				}
				if(id != self.id || self.id + '_nacl_module' != self.module.id){
					console.error("Mixed player id");
				}
				
				if(self.m.debug){
					console.log('Player: ' + self.id + ' cmd=[' + cmd.join('] '));
				}
				self.module.postMessage(cmd);
				// self.module.postMessage(arguments);
			}

			// Request the offsetTop property to force a relayout. As of Apr 10, 2014    
			// this is needed if the module is being loaded on a Chrome App's    
			// background page (see crbug.com/350445).    
			self.module.offsetTop;

			self.m.versionapp = "unknown";
			self.m.debug = self.options.debug || self.player.hasAttribute('debug') || false;
			self.m.autostart = self.player.hasAttribute('autostart');
			self.m.is_opened = false;
			self.m.latency = 10000;
			self.m.controls = true;
			self.m.avsync = self.options.avsync || false;
			self.m.vxgReadyState = 0;
			self.m.autohide = self.options.autohide || 2000;
			self.m.lastErrorCode = -1;
			self.m.lastErrorDecoder = 0;
			self.m.autoreconnect = self.options.autoreconnect || 0;
			self.m.connection_timeout = self.options.connection_timeout || 0;
			self.m.connection_udp = self.options.connection_udp || 0;
			self.m.isCustomDigitalZoom = self.options.custom_digital_zoom || false;

			self.currentZoom = 10;
			self.m.snapshotFile = "";
			self.m.snapshotPTS = "-1";
			self.m.PTSVideo = "-1";
			self.m.PTSAudio = "-1";
			
			vxgplayer.initVolumeControls(self, false);

			if(self.m.debug){
				console.log("Player " + self.id + " - init new player");
			}

			self.set_controls_opacity = function(val){
				el_controls.style.opacity = val;
				el_controls_zoom.style.opacity = val;
				el_controls_zoom_position.style.opacity = val;
			}
			
			self.set_controls_display = function(val){
				el_controls.style.display = val;
				if(self.m.isCustomDigitalZoom == true){
					el_controls_zoom.style.display = "none";
					el_controls_zoom_position.style.display = "none";
				}else{
					el_controls_zoom.style.display = val;
					el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
				}
			}
			if(self.m.isCustomDigitalZoom == false){
				el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
			}

			if(self.player.hasAttribute('custom-digital-zoom')){
				self.m.isCustomDigitalZoom = true;
				el_controls_zoom.style.display = "none";
				el_controls_zoom_position.style.display = "none";
			}

			if(!self.player.hasAttribute('controls')){
				self.m.controls = false;
				self.set_controls_display("none");
			}
			
			if(self.options.controls && self.options.controls == true){
				self.m.controls = true;
				self.set_controls_display("");
			}

			self.m.avsync = self.player.hasAttribute('avsync');
			self.m.aspectRatio = (self.player.hasAttribute('aspect-ratio') || self.player.hasAttribute('aspect-ratio-mode'))?1:0;
			
			if(self.player.hasAttribute('autohide')){
				self.m.autohide = parseInt(self.player.getAttribute('autohide'),10)*1000;
			}else if(self.options.autohide){
				self.m.autohide = self.options.autohide*1000;
			}
			
			self.timeout = undefined;

			self.loadSettings = function(){

				if(self.m.debug){
					console.log('Player ' + self.id + ' - loadSettings');
				}

				if(self.player.hasAttribute('useragent-prefix')){
					self.module.command('setuseragent', self.player.getAttribute('useragent-prefix') + ' ' + navigator.userAgent)
				}else if(self.options.useragent_prefix){
					self.module.command('setuseragent', self.options.useragent_prefix + ' ' + navigator.userAgent)
				}
				self.module = document.getElementById(self.id + '_nacl_module');
				self.module.command = function(){
					var cmd = [];
					for(var i = 0; i < arguments.length; i++){
						cmd.push(arguments[i]);
					}
					if(id != self.id || self.id + '_nacl_module' != self.module.id){
						console.error("Mixed player id");
					}
					
					if(self.m.debug){
						console.log('Player: ' + self.id + ' cmd=[' + cmd.join('] '));
					}
					self.module.postMessage(cmd);
					// self.module.postMessage(arguments);
				}
				self.module.offsetTop;
				
				self.module.command('setversion', window.vxgplayer.version);
				//self.m.autoreconnect = 0;
				if(self.player.hasAttribute('auto-reconnect') || self.options.autoreconnect){
					self.m.autoreconnect = 1;
					self.module.command('setautoreconnect', '1');	
				}
				if(self.player.hasAttribute('connection-timeout')){
					self.m.connection_timeout = parseInt(self.player.getAttribute('connection-timeout'), 10);
				}
				if(self.options.connection_timeout != 0){
					self.module.command('setconnection_timeout', self.m.connection_timeout.toString());	
				}
				if(self.player.hasAttribute('connection-udp') || self.m.connection_udp){
					self.m.connection_udp = 1;
					self.module.command('setconnection_udp', '1');	
				}

				self.m.avsync = self.player.hasAttribute('avsync');
				self.m.aspectRatio = (self.player.hasAttribute('aspect-ratio') || self.player.hasAttribute('aspect-ratio-mode'))?1:0;

				if(self.player.hasAttribute('aspect-ratio-mode')){
					self.m.aspectRatio = parseInt(self.player.getAttribute('aspect-ratio-mode'), 10);
				}else if(self.options.aspect_ratio_mode){
					self.m.aspectRatio = self.options.aspect_ratio_mode;
				}
				self.m.aspectRatioMode = (self.m.aspectRatio !=0) ? self.m.aspectRatio:1;
				self.module.command('setaspectratio', self.m.aspectRatio.toString());
				self.module.command('setavsync', self.m.avsync ? '1' : '0');
				if(self.player.hasAttribute('latency')){
					self.m.latency = parseInt(self.player.getAttribute('latency'), 10);
					self.module.command('setlatency', self.m.latency.toString());
				}else if(self.options.latency){
					self.m.latency = self.options.latency;
					self.module.command('setlatency', self.m.latency.toString());
				}
			
				window.vxgplayer.initVolumeControls(self, true);

				if(self.player.hasAttribute('autohide')){
					self.m.autohide = parseInt(self.player.getAttribute('autohide'),10)*1000;
				}else if(self.options.autohide){
					self.m.autohide = self.options.autohide*1000;
				}
			}
			
			self.moduleDidLoad = function(){
				if(self.m.debug){
					console.log('Player ' + self.id + ' - moduleDidLoad');
				}

				self.loadSettings();
				
				if(window.location.protocol == "https:"){
					//use Native protocol
					self.connectToApp();
				}else{
					//use Websocket protocol
					self.module.command('startwebsclient', vxgplayer.webserverport)
				}
			}
			self.playerDidLoad = function(){
				if(self.m.debug){
					console.log('Player ' + self.id + " - playerDidLoad");
				}
				el_loader.style.display = "none";
				if(self.onReadyStateCallback){
					self.m.is_opened = false;
					self.onReadyStateCallback();
				}else{
					self.src(self.m.url);
				}
			}

			self.connectToApp = function(){
				if(self.m.debug){
					console.log('Player ' + self.id + ' connectToApp');
				}
				self.m.port = chrome.runtime.connect("hncknjnnbahamgpjoafdebabmoamcnni");
				//self.m.port = chrome.runtime.connect("invalid");
				if(self.m.debug){
					console.log('Player ' + self.id + ' connected port='+self.m.port);
				}
				self.m.port.name = ""+ new Date().getTime();

				self.m.port.onDisconnect.addListener(function(){
					if(self.m.debug)
						console.log('disconnected port.name='+self.m.port.name);
					self.module.command( 'stopnativeclient', '@'+self.m.port.name);

					self.m.port = undefined;
				});

				if(self.m.debug)
					console.log('connected port.name='+self.m.port.name);

				self.m.port.onMessage.addListener(function(msg) {
					if( msg != undefined && msg.id == undefined && msg[0] != undefined && msg[0].charAt(0) == '@'){
						if(self.module.postMessage == undefined){
							self.m.port.disconnect();
						}else{
							self.module.postMessage(msg);
						}
					}else
					if( msg != undefined && msg.cmd == 'getversionapp'){
						if(0 == msg.data.indexOf("VERSION_APP")){
							self.m.versionapp = msg.data.split(' ')[1];
							if(self.m.debug){
								console.log('Player ' + self.id + ' =VERSION_APP '+self.m.versionapp);
							}

							self.module.command( 'setappversion', self.m.versionapp);
							self.module.command( 'startnativeclient', '@'+self.m.port.name);
							self.playerDidLoad();
						}else{
							console.log('Player ' + self.id + ' Invalid VERSION_APP msg.data='+msg.data);
						}
					}else{
						console.log('Player ' + self.id + 'getversionapp unknown msg=', msg);
					}
				});
				self.m.port.postMessage({id: ""+self.m.port.name, cmd: "getversionapp", data: ""} );

			}

			self.showerror = function(text){
				el_loader.style.display = "none";
				el_error.style.display = "inline-block";
				el_error_text.style.display = "inline-block";
				el_error_text.innerHTML = text;
			}
			
			self.hideerror = function(text){
				el_error.style.display = "none";
				el_error_text.style.display = "none";
			}

			self.readyState = function(){
				return self.m.vxgReadyState;
			}

			self.onReadyStateChange = function(cb){
				self.onReadyStateCallback = cb;
			}
			self.ready = self.onReadyStateChange;

			self.onStateChange = function(cb){
				self.onStateChangeCallback = cb;
			}
			
			self.onBandwidthError = function(cb){
				self.m.handlerBandwidthError = cb;
			}

			self.onError = function(cb){
				self.m.handlerError = cb;
			}

			self.handleMessage = function(msgEvent){
				if(self.m.debug){
					console.log('Player ' + self.id + ' handleMessage: ' + msgEvent.data);
				}
				if(msgEvent == undefined || msgEvent.data == undefined)
					return;
				if(msgEvent.data[0] != undefined && msgEvent.data[0].charAt(0) == '@'){
					//proto native send to app
					if(self.m.port != undefined)
						self.m.port.postMessage(msgEvent.data);
				}else if(0 == msgEvent.data.indexOf("PLAYER_INITED")){
					self.moduleDidLoad();
				}else if(0 == msgEvent.data.indexOf("PLAYER_INIT_ERR")){
					str = "PLAYER_INIT_ERR ";
					err = parseInt(msgEvent.data.split(' ')[1], 10);
					err_type = (err >> 16)&0xffff;
					console.log('err_type='+err_type);
					switch(err_type){
					case 4:	
						str += "Init audio output error ";		
						break;
					case 2:	
						str += "Init video decoder error ";		
						break;
					default:
						str += "Init D3D error ";		
						break;
					}
					str += ""+err.toString();
					vxgplayer.showInitFailed(id, str);
				}else

				// Player source error=60935 WSS status=6
				// Player listener2: Skip picture: 170, frame_duration: 41, latencyms: 0<=frames_buf:0, b: 0, p: 0
				if(0 == msgEvent.data.indexOf("VERSION_APP")){
					self.m.versionapp = msgEvent.data.split(' ')[1];
					if(self.m.debug)
						console.log('=VERSION_APP '+self.m.versionapp);
					self.playerDidLoad();
				}else if(0 == msgEvent.data.indexOf("PTS_VIDEO")){
					self.m.PTSVideo = msgEvent.data.split(' ')[1];
					//console.log('=PTS_VIDEO '+self.m.PTSVideo);
				}else if(0 == msgEvent.data.indexOf("PTS_AUDIO")){
					self.m.PTSAudio = msgEvent.data.split(' ')[1];
					//console.log('=PTS_AUDIO '+self.m.PTSAudio);
				}else if(0 == msgEvent.data.indexOf("TAKE_SNAPSHOT")){
					snap_status = msgEvent.data.split(' ')[1];
					snap_pts = msgEvent.data.split(' ')[2];
					console.log('TAKE_SNAPSHOT snap_status='+snap_status+' snap_pts='+snap_pts);
					if(0 != snap_status.indexOf("ERROR")){
						self.m.snapshotFile = snap_status;
						if(snap_pts != undefined)
							self.m.snapshotPTS = snap_pts;
						window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
						window.requestFileSystem(window.TEMPORARY, 1, function(fs) {
							fs.root.getFile(self.m.snapshotFile, {create: false}, function(fileEntry) { // /test is filename
								var pom = document.createElement('a');
								pom.setAttribute('href', fileEntry.toURL());
								if(self.m.snapshotPTS == -1){
									pom.setAttribute('download', "snapshot.jpg");
								}else{
									pom.setAttribute('download', "snapshot_"+self.m.snapshotPTS+".jpg");
								}
								pom.style.display = 'none';
								document.body.appendChild(pom);
								pom.click();
								document.body.removeChild(pom);
							}, function(e) {
								console.error("[VXGPLAYER] TAKE_SNAPSHOT fs.root.getFile FAILED")
							});
						}, function(e) {
							console.error("[VXGPLAYER] TAKE_SNAPSHOT requestFileSystem window.TEMPORARY FAILED")
						});
					}
				}else if(msgEvent.data == "MEDIA_ERR_URL"){
					self.showerror('Problem with URL');
					self.m.lastErrorCode = 0;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_NETWORK")){
					self.showerror('Problem with network');
					self.m.lastErrorCode = 1;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_SOURCE")){
					self.showerror('Problem with source');
					self.m.lastErrorCode = 2;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_CARRIER")){
					self.showerror('Problem with carrier');
					self.m.lastErrorCode = 3;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_AUDIO")){
					self.showerror('Problem with audio');
					self.m.lastErrorCode = 4;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_VIDEO")){
					self.showerror('Problem with video');
					self.m.lastErrorCode = 5;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_AUTHENTICATION")){
					self.showerror('Problem with authentification');
					self.m.lastErrorCode = 6;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_BANDWIDTH")){
					//self.stop();
					self.m.lastErrorCode = 7;
					if(self.m.handlerError)
						self.m.handlerError(self);
					if(self.m.handlerBandwidthError){
						self.m.handlerBandwidthError(self);
					}else{
						//self.showerror('Problem with bandwidth');
					}
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_EOF")){
					self.showerror('End of File');
					self.m.lastErrorCode = 8;
					if(self.m.handlerError)
						self.m.handlerError(self);
				}else if(0 == msgEvent.data.indexOf("MEDIA_ERR_DECODER")){
					var arr = msgEvent.data.split(' ');
					self.m.lastErrorDecoder = (arr.length > 1) ? parseInt(arr[1],10) : 0;
					if(self.m.debug)
						console.log('=MEDIA_ERR_DECODER '+self.m.lastErrorDecoder + ' ' + (self.m.lastErrorDecoder == 0)?'Decoder resumed':'');
					if(self.m.lastErrorDecoder == 0){
						self.m.lastErrorCode = -1;
						//self.hideerror();
					}else{
						self.m.lastErrorCode = 9;
						//self.showerror('Decoder error '+self.m.lastErrorDecoder);
					}
					if(self.m.handlerError)
						self.m.handlerError(self);
					
				}else if(0 == msgEvent.data.indexOf("PLAYER_CONNECTING")){
					self.m.vxgReadyState = 1;
					//el_play.style.display = "none";
					// el_stop.style.display = "none";
					// self.hideerror();
					el_loader.style.display = "inline-block";
					el_takescreenshot.style.display = "none";
					if(self.onStateChangeCallback)
						self.onStateChangeCallback(self.m.vxgReadyState);
				}else if(0 == msgEvent.data.indexOf("PLAYER_PLAYING")){
					//console.log('PLAYER_PLAYING');
					self.m.vxgReadyState = 2;
					el_play.style.display = "none";
					el_stop.style.display = "inline-block";
					el_pause.style.display = "inline-block";
					el_takescreenshot.style.display = "inline-block";
					self.hideerror();
					el_loader.style.display = "none";
					if(self.onStateChangeCallback)
						self.onStateChangeCallback(self.m.vxgReadyState);
				}else if(0 == msgEvent.data.indexOf("PLAYER_STOPPING")){
					self.m.vxgReadyState = 3;
					// el_error.style.display = "none";
					// el_loader.style.display = "inline-block";
					el_play.style.display = "none";
					el_stop.style.display = "none";
					el_pause.style.display = "none";
					el_takescreenshot.style.display = "none";
				}else if(0 == msgEvent.data.indexOf("PLAYER_STOPPED")){
					self.m.vxgReadyState = 0;
					el_play.style.display = "inline-block";
					el_stop.style.display = "none";
					el_pause.style.display = "none";
					el_takescreenshot.style.display = "none";
					if(self.onStateChangeCallback)
						self.onStateChangeCallback(self.m.vxgReadyState);
				}else if(0 == msgEvent.data.indexOf("PLAYER_PAUSED")){
					//console.log('PLAYER_PAUSED');
					self.m.vxgReadyState = 4;
					el_play.style.display = "inline-block";
					el_stop.style.display = "inline-block";
					el_pause.style.display = "none";
					// el_takescreenshot.style.display = "none";
					if(self.onStateChangeCallback)
						self.onStateChangeCallback(self.m.vxgReadyState);
				}
			}

			self.handleError = function(){
				el_loader.style.display = "none";
				el_error.style.display = "block";
				console.error("ERROR");
				self.showerror('Unknown error');
			}

			self.handleCrash = function(){
				el_loader.style.display = "none";
				el_error.style.display = "block";
				self.showerror('Crashed');
			}

			self.restartTimeout = function(){
				if(self.m.autohide <= 0){
					self.set_controls_opacity("0");
					return;
				}
				self.set_controls_opacity("0.7");
				clearTimeout(self.timeout);
				self.timeout = setTimeout(function(){
					self.set_controls_opacity("0");
				},self.m.autohide);
			};

			self.player.addEventListener('mousemove', function(){
				self.restartTimeout();
			}, true);

			self.restartTimeout();
			//self.module.addEventListener('load', self.moduleDidLoad, true);
			self.module.addEventListener('message', self.handleMessage, true);
			self.module.addEventListener('error', self.handleError, true);
			self.module.addEventListener('crash', self.handleCrash, true);

			if (typeof window.attachListeners !== 'undefined') {
			  window.attachListeners();
			}

			self.error = function(){
				return self.m.lastErrorCode;
			}
			self.errorDecoder = function(){
				return self.m.lastErrorDecoder;
			}

			self.controls = function(val){
				if(val == undefined){
					return self.m.controls;
				}else{
					if(val == true){
						self.set_controls_display("");
						self.m.controls = true;
					}else if(val == false){
						self.set_controls_display("none");
						self.m.controls = false;
					}
				}
			}

			self.debug = function(val){
				if(val == undefined){
					return self.m.debug;
				}else{
					self.m.debug = val;
				}			
			}

			self.play = function(){
				self.hideerror();

				if(self.m.debug)
					console.log( 'self.play self.m.url='+self.m.url + ' self.m.is_opened='+self.m.is_opened);

				if(self.m.url.length < 1){
					console.log("invalid url");
					return;
				}
				if(!self.m.is_opened){
					self.m.is_opened = true;
					self.module.command('open', self.m.url);
				}

				el_play.style.display = "none";
				if(self.m.vxgReadyState != 4) //not paused=>play, show progress
					el_loader.style.display = "inline-block";
				self.module.command('play', '0');
				self.applyVolume();
			};

			self.stop = function(){
				self.module.command('stop', '0');
				el_loader.style.display = "none";
			};

			self.pause = function(){
				//console.log("pause");
				self.module.command('pause', '0');
				el_loader.style.display = "none";
			};
			
			self.autohide = function(val){
				if(val){
					self.m.autohide = val*1000;
				}else{
					return self.m.autohide/1000;
				}
			}

			self.autoreconnect = function(val){
				if(val == undefined){
					return self.m.autoreconnect;
				}else{
					self.m.autoreconnect = parseInt(val,10);
					self.module.command('setautoreconnect', self.m.autoreconnect.toString());
				}
			};


			self.latency = function(val){
				if(val){
					self.m.latency = parseInt(val,10);
					self.module.command('setlatency', val.toString());
				}else{
					return self.m.latency;
				}
			};
			self.connection_timeout = function(val){
				if(val){
					self.m.connection_timeout = parseInt(val,10);
					self.module.command('setconnection_timeout', val.toString());
				}else{
					return self.m.connection_timeout;
				}
			};
			self.connection_udp = function(val){
				if(val){
					self.m.connection_udp = parseInt(val,10);
					self.module.command('setconnection_udp', val.toString());
				}else{
					return self.m.connection_udp;
				}
			};

			self.aspectRatio = function(val){
				if(val == undefined){
					return self.m.aspectRatio?true:false;
				}else{
					self.m.aspectRatio = (val)?self.m.aspectRatioMode:0;
					self.module.command('setaspectratio', self.m.aspectRatio.toString());
				}
			}
			self.aspectRatioMode = function(val){
				if(val == undefined){
					return self.m.aspectRatioMode;
				}else{
					self.m.aspectRatioMode = (val > 0)?val:self.m.aspectRatioMode;
					self.m.aspectRatio = val;
					self.module.command('setaspectratio', self.m.aspectRatio.toString());
				}
			}
			
			self.avsync = function(val){
				if(val == undefined){
					return self.m.avsync;
				}else{
					self.m.avsync = val;
					self.module.command('setavsync', self.m.avsync ? '1':'0');
				}
			}

			self.isPlaying = function(){
				return (self.m.vxgReadyState == 2);
			}
			self.versionPLG = function(){
				return window.vxgplayer.version;
			}
			self.versionAPP = function(){
				return self.m.versionapp;
			}

			self.size = function(width, height){
				if(width && height){
					if(Number.isInteger(width) && Number.isInteger(height)){
						var w = parseInt(width,10);
						var h = parseInt(height,10);
						self.playerWidth = self.playerWidth != w ? w : self.playerWidth;
						self.playerHeight = self.playerHeight != h ? h : self.playerHeight;
						self.player.style.width = width + 'px';
						self.player.style.height = height + 'px';
					}else{
						self.player.style.width = width;
						self.player.style.height = height;
					}
				}else{
					return  { width: self.playerWidth, height: self.playerHeight };
				}
			};

			self.changedFullscreen = function(){
				console.log('changedFullscreen');
				if (document.webkitIsFullScreen){
					self.size('100%', '100%');
					console.log('changedFullscreen -> fullscreen');
				}else{
					self.size(self.playerWidth + 'px', self.playerHeight + 'px');
					console.log('changedFullscreen -> NOT fullscreen');
				}
			};

			if (document.addEventListener){
				document.addEventListener('webkitfullscreenchange', self.changedFullscreen, false);
				document.addEventListener('mozfullscreenchange', self.changedFullscreen, false);
				document.addEventListener('fullscreenchange', self.changedFullscreen, false);
				document.addEventListener('MSFullscreenChange', self.changedFullscreen, false);
			}

			self.fullscreen = function(){
				console.log("fullscreen: clicked");
				if(document.webkitIsFullScreen == true){
					document.webkitCancelFullScreen();
				}else{
					if(self.player.requestFullscreen) {
						self.player.requestFullscreen();
					} else if(self.player.webkitRequestFullscreen) {
						self.player.webkitRequestFullscreen();
					} else if(self.player.mozRequestFullscreen) {
						self.player.mozRequestFullScreen();
					}
				}
			};

			self.takescreenshot = function(){
					self.module.command('take_snapshot', '1');
					
					el_screenshot_loading.style.display = "block";
					setTimeout(function(){
						el_screenshot_loading.style.display = "";
					},5000);
			};
			self.getScreenshotPTS = function(){
				return self.m.snapshotPTS;
			};
			self.getPTSVideo = function(){
				return self.m.PTSVideo;
			};
			self.getPTSAudio = function(){
				return self.m.PTSAudio;
			};

			self.src = function(url){
				if(url != undefined){
					self.m.url = url;
					console.log('Player ' + self.id+' src='+self.m.url+' autostart='+self.m.autostart+' is_opened='+self.m.is_opened);
					if(self.m.url.length > 0 && self.m.autostart){
						self.m.is_opened = true;
						self.module.command('open', url);
					}else{
						self.m.is_opened = false;
						//el_play.style.display = "inline-block";
						//el_stop.style.display = "none";
						//el_loader.style.display = 'none';
						self.stop();
					}
				}else{
					return self.m.url;
				}
			}

			self.dispose = function(){
				self.player.innerHTML = "";
				delete window.vxgplayer.players[self.id];
			}

			self.custom_digital_zoom = function(newval){
				if(newval != undefined){
					if(self.m.isCustomDigitalZoom == false && newval == true){
						self.m.isCustomDigitalZoom = true;
						self.setCustomDigitalZoom(100,0,0); // reset
						self.set_controls_display("");
					}else if(self.m.isCustomDigitalZoom == true && newval == false){
						self.m.isCustomDigitalZoom = false;
						self.set_controls_display("");
						self.setNewZoom(10);
					}
				}else{
					return self.m.isCustomDigitalZoom;
				}
			}
				
			self.setCustomDigitalZoom = function(ratio, x, y){
				if (ratio !== parseInt(ratio, 10) || x !== parseInt(x, 10) || y !== parseInt(y, 10)){
					throw "[VXGPLAYER] setDigitalZoom / Some values is not integer";
				}
				if(ratio < 100 || ratio > 500){
					throw "[VXGPLAYER] setDigitalZoom / Parameter Ratio must be 100..500";
				}
				if(self.m.isCustomDigitalZoom != true){
					throw "[VXGPLAYER] setDigitalZoom / Please enable custom digital zoom";
				}
				
				self.module.style.transform = "scale(" + (ratio/100) + ")";
				el_controls_zoom_position.style.display = "none";
				var s = self.size();
				var newx = x - s.width/2;
				var newy = y - s.height/2;
				var neww = s.width*(100/ratio);
				var newh = s.height*(100/ratio);
				var left = Math.floor(-100*(newx + neww/2)/neww);
				var top = Math.floor(-100*(newy + newh/2)/newh);
				self.module.style.left = left + '%';
				self.module.style.top = top + '%';
			}
			
			self.setNewZoom = function(v){
				if(v >= 30){ v = 30; }
				if(v <= 10){ v = 10; }
				
				if(self.currentZoom != v){
					self.currentZoom = v;
					self.module.style.transform = "scale(" + (self.currentZoom/10) + ")";
					el_zoomPositionCursor.style.transform = "scale(" + (10/self.currentZoom) + ")";
					el_zoomProgress.className = el_zoomProgress.className.replace(/zoom\d+x/g,'zoom' + Math.ceil(self.currentZoom) + 'x');
					el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
					self.module.style.left = '';
					self.module.style.top = '';
					el_zoomPositionCursor.style.left = '';
					el_zoomPositionCursor.style.top = '';
				}
			}
			
			self.zoomUp = function(){
				self.setNewZoom(self.currentZoom + 5)
			}
			self.zoomDown = function(){
				self.setNewZoom(self.currentZoom - 5);
			}
			self.zoomProgressDownBool = false;
			self.zoomProgressDown = function(e){
				self.zoomProgressDownBool = true;
			}
  
			self.zoomProgressMove = function(e){
				if(self.zoomProgressDownBool == true){
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
					var height = el_zoomProgress.offsetHeight;
					var steps = height/5;
					y = 10*(Math.floor((height-y)/steps)/2 + 1);
					self.setNewZoom(y);				
				}
			}
			self.zoomProgressLeave = function(e){
				self.zoomProgressDownBool = false;
			}
			self.zoomProgressUp = function(e){
				if(self.zoomProgressDownBool == true){
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
					var height = el_zoomProgress.offsetHeight;
					var steps = height/5;
					y = 10*(Math.floor((height-y)/steps)/2 + 1);
					self.setNewZoom(y);	
				}
				self.zoomProgressDownBool = false;
			}
			
			self.zoomCursorDownBool = false;
			self.zoomCursorX = 0;
			self.zoomCursorY = 0;
			self.zoomCursorWidth = 160;
			self.zoomCursorHeight = 120;
			self.zoomControlsWidth = 0;
			self.zoomControlsHeight = 0;
			self.zoomCursorDown = function(e){
				self.zoomCursorX = e.pageX;
				self.zoomCursorY = e.pageY;
				self.zoomCursorWidth = el_zoomPositionCursor.offsetWidth;
				self.zoomCursorHeight = el_zoomPositionCursor.offsetHeight;
				self.zoomControlsWidth = el_controls_zoom_position.offsetWidth;
				self.zoomControlsHeight = el_controls_zoom_position.offsetHeight;
				self.zoomCursorDownBool = true;
			}
			
			self.zoomCursorUp = function(e){
				console.log("zoomCursorUp");
				self.zoomCursorDownBool = false;
			}
			
			self.zoomCursorMove = function(e){
				if(self.zoomCursorDownBool == true){
					var diffX = self.zoomCursorX - e.pageX;
					var diffY = self.zoomCursorY - e.pageY;
					self.zoomCursorX = e.pageX;
					self.zoomCursorY = e.pageY;
					var newx = el_zoomPositionCursor.offsetLeft - diffX;
					var newy = el_zoomPositionCursor.offsetTop - diffY;
					var d2x = (self.zoomControlsWidth - self.zoomCursorWidth*(10/self.currentZoom));
					var d2y = (self.zoomControlsHeight - self.zoomCursorHeight*(10/self.currentZoom));
					var minX = -1*d2x/2;
					var maxX = d2x/2;
					var minY = -1*d2y/2;
					var maxY = d2y/2;
					if(newx < minX) newx = minX;
					if(newy < minY) newy = minY;
					if(newx >= maxX) newx = maxX;
					if(newy >= maxY) newy = maxY;
					el_zoomPositionCursor.style.left = newx + "px";
					el_zoomPositionCursor.style.top = newy + "px";
					var zoom = self.currentZoom/10 - 1;
					var left = Math.floor(-100*((newx/d2x)*zoom));
					var top = Math.floor(-100*((newy/d2y)*zoom));
					self.module.style.left = left + '%';
					self.module.style.top = top + '%';
				}
			}

			self.setNewZoom = function(v){
				if(v >= 30){ v = 30; }
				if(v <= 10){ v = 10; }
				
				if(self.currentZoom != v){
					self.currentZoom = v;
					self.module.style.transform = "scale(" + (self.currentZoom/10) + ")";
					el_zoomPositionCursor.style.transform = "scale(" + (10/self.currentZoom) + ")";
					el_zoomProgress.className = el_zoomProgress.className.replace(/zoom\d+x/g,'zoom' + Math.ceil(self.currentZoom) + 'x');
					el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
					self.module.style.left = '';
					self.module.style.top = '';
					el_zoomPositionCursor.style.left = '';
					el_zoomPositionCursor.style.top = '';
				}
			}
			
			self.zoomUp = function(){
				self.setNewZoom(self.currentZoom + 5)
			}
			self.zoomDown = function(){
				self.setNewZoom(self.currentZoom - 5);
			}
			self.zoomProgressDownBool = false;
			self.zoomProgressDown = function(e){
				self.zoomProgressDownBool = true;
			}
  
			self.zoomProgressMove = function(e){
				if(self.zoomProgressDownBool == true){
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
					var height = el_zoomProgress.offsetHeight;
					var steps = height/5;
					y = 10*(Math.floor((height-y)/steps)/2 + 1);
					self.setNewZoom(y);				
				}
			}
			self.zoomProgressLeave = function(e){
				self.zoomProgressDownBool = false;
			}
			self.zoomProgressUp = function(e){
				if(self.zoomProgressDownBool == true){
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
					var height = el_zoomProgress.offsetHeight;
					var steps = height/5;
					y = 10*(Math.floor((height-y)/steps)/2 + 1);
					self.setNewZoom(y);	
				}
				self.zoomProgressDownBool = false;
			}
			
			self.zoomCursorDownBool = false;
			self.zoomCursorX = 0;
			self.zoomCursorY = 0;
			self.zoomCursorWidth = 160;
			self.zoomCursorHeight = 120;
			self.zoomControlsWidth = 0;
			self.zoomControlsHeight = 0;
			self.zoomCursorDown = function(e){
				self.zoomCursorX = e.pageX;
				self.zoomCursorY = e.pageY;
				self.zoomCursorWidth = el_zoomPositionCursor.offsetWidth;
				self.zoomCursorHeight = el_zoomPositionCursor.offsetHeight;
				self.zoomControlsWidth = el_controls_zoom_position.offsetWidth;
				self.zoomControlsHeight = el_controls_zoom_position.offsetHeight;
				self.zoomCursorDownBool = true;
			}
			
			self.zoomCursorUp = function(e){
				console.log("zoomCursorUp");
				self.zoomCursorDownBool = false;
			}
			
			self.zoomCursorMove = function(e){
				if(self.zoomCursorDownBool == true){
					var diffX = self.zoomCursorX - e.pageX;
					var diffY = self.zoomCursorY - e.pageY;
					self.zoomCursorX = e.pageX;
					self.zoomCursorY = e.pageY;
					var newx = el_zoomPositionCursor.offsetLeft - diffX;
					var newy = el_zoomPositionCursor.offsetTop - diffY;
					var d2x = (self.zoomControlsWidth - self.zoomCursorWidth*(10/self.currentZoom));
					var d2y = (self.zoomControlsHeight - self.zoomCursorHeight*(10/self.currentZoom));
					var minX = -1*d2x/2;
					var maxX = d2x/2;
					var minY = -1*d2y/2;
					var maxY = d2y/2;
					if(newx < minX) newx = minX;
					if(newy < minY) newy = minY;
					if(newx >= maxX) newx = maxX;
					if(newy >= maxY) newy = maxY;
					el_zoomPositionCursor.style.left = newx + "px";
					el_zoomPositionCursor.style.top = newy + "px";
					var zoom = self.currentZoom/10 - 1;
					var left = Math.floor(-100*((newx/d2x)*zoom));
					var top = Math.floor(-100*((newy/d2y)*zoom));
					self.module.style.left = left + '%';
					self.module.style.top = top + '%';
				}
			}

			el_play.onclick = self.play;
			el_pause.onclick = self.pause;
			el_stop.onclick = self.stop;
			el_fullscreen.onclick = self.fullscreen;
			el_takescreenshot.onclick = self.takescreenshot;
			el_zoomUp.onclick = self.zoomUp;
			el_zoomDown.onclick = self.zoomDown;
			el_zoomPositionCursor.addEventListener('mousedown',self.zoomCursorDown,false);
			el_zoomPositionCursor.addEventListener('mousemove',self.zoomCursorMove,false);
			el_zoomPositionCursor.addEventListener('mouseleave',self.zoomCursorUp,false);
			el_zoomPositionCursor.addEventListener('mouseup',self.zoomCursorUp,false);
			el_zoomProgress.addEventListener('mousedown',self.zoomProgressDown,false);
			el_zoomProgress.addEventListener('mousemove',self.zoomProgressMove,false);
			el_zoomProgress.addEventListener('mouseleave',self.zoomProgressLeave,false);
			el_zoomProgress.addEventListener('mouseup',self.zoomProgressUp,false);

		}(id, options_);
	}else{
		// console.warn(id + " -  already exists player");
	}
	return window.vxgplayer.players[id];
};

window.vxgplayer.webserverport = '8778';

window.vxgplayer.isFrame = function() {
	try { return window.self !== window.top; } catch (e) { return true; }
}

window.vxgplayer.browserSupportsPluginPnacl = function() {
	return navigator.mimeTypes['application/x-pnacl'] !== undefined &&
		navigator.mimeTypes['application/vxg_media_player'] !== undefined;
}

window.vxgplayer.showGlobalErrorMessage = function(id, html){
	var player = document.getElementById(id);
	var width=640;
	var height=480;
	width = parseInt(player.width,10) || width;
	height = parseInt(player.height,10) || height;
	player.style.width = width + 'px';
	player.style.height = height + 'px';
	player.innerHTML = html;
	return undefined;
}

window.vxgplayer.showNotInstalled = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ '	<a href="https://www.videoexpertsgroup.com/player_start/" ' + (vxgplayer.isFrame() ? 'target="_blank"' : '')+ '>Click here for install plugin</a>'
		+ '	<br/><br/> or visit in webstore <a href="https://chrome.google.com/webstore/detail/vxg-media-player/hncknjnnbahamgpjoafdebabmoamcnni" target="_blank">VXG Media Player</a>'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showAvailableInChrome = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ ' Available in <a href="https://www.google.com/chrome/" target="_blank">Chrome for Desktop PC only</a>'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showWebSocketFailed = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ ' Could not connect to plugin (WebSocket Error). Please try restart your browser.'
		+ '	</div> '
		+ '</div>');
}

window.vxgplayer.showNotInstalledInIncognitoMode = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content"> You have opened this page in incognito mode. Please open it in a regular tab, install the plugin and then come back.'
		+ '	<br/><br/> Also you can install <a href="https://chrome.google.com/webstore/detail/vxg-media-player/hncknjnnbahamgpjoafdebabmoamcnni" target="_blank">VXG Media Player</a> from webstore in regular tab.'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showNotStartedInIncognitoMode = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content"> You have opened this page in incognito mode. Please open it in a regular tab and then come back.'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.startPlayerInNewTab = function(){
	console.log('start player');
	var params = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes"
	var win = window.open('https://www.videoexpertsgroup.com/player_start/', "_blank", params)
	setTimeout(function(){
		win.close();
		location.reload();
		/*for(var id in window.vxgplayer.players){
			console.log("Restart player: " + id);
		}*/
	},1000);
}

window.vxgplayer.showNotStartedInIFrame = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content"> You have opened this page in frame.<br>'
		+ ' Please click on <a href="javascript:void(0);" onclick="window.vxgplayer.startPlayerInNewTab();">this link</a> for start Chrome App (VXG Media Player).'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showInitFailed = function(id, str){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ ' Chrome plugin init error. Try to update Video/Audio drivers. '
		+ str
		+ '	</div> '
		+ '</div>');
}

window.vxgplayer.Promise = function(){
	var completed = false;
	
	this.done = function(callback){
		this.done_callback = callback;
		if(this.completed){
			this.done_callback(this.err);
		}
		return this;
	}
	
	this.fail = function(callback){
		this.fail_callback = callback;
		if(this.completed){
			this.fail_callback(this.err);
		}
		return this;
	}
	
	this.resolve = function(result) {
		if(!this.completed){
			this.result = result;
			this.done_callback(result);
		}
		this.completed = true;
	}
	this.reject = function(err) {
		if(!this.completed){
			this.err = err;
			this.fail_callback(err);
		}
		this.completed = true;
	}
};

window.vxgplayer.checkWebSocket = function(){
	var p = new vxgplayer.Promise();
	setTimeout(function(){
		var	testWebSocket = new WebSocket('ws://127.0.0.1:' + vxgplayer.webserverport + '/');
		testWebSocket.onerror=function(event){
			p.reject();
		}
		testWebSocket.onmessage = function(evt){
			console.log(evt);
		}
		testWebSocket.onopen=function(){
			testWebSocket.close();
			p.resolve();
		}
	},60000);
	return p;
}

// helper funxtion
window.vxgplayer.getAbsolutePosition = function(element){
	var r = { x: element.offsetLeft, y: element.offsetTop };
	if (element.offsetParent) {
	var tmp = vxgplayer.getAbsolutePosition(element.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

// init options
window.vxgplayer.initOptions = function(self, options){
	self.options = options || {};
	self.m = {};
	self.m.url = self.player.getAttribute('url') || self.options.url || "";
	
	var nmf_path = "media_player.nmf";
	var nmf_src = "pnacl/Release/media_player.nmf";
	self.m.nmf_path = self.player.getAttribute('nmf-path') || self.options.nmf_path || nmf_path;
	console.log(self.player);
	self.m.nmf_src = self.player.getAttribute('nmf-src') || self.options.nmf_src || nmf_src;
	self.m.autostart_parameter = self.player.hasAttribute('autostart') ? '1' : '0';
	self.m.audio_parameter = (self.player.hasAttribute('audio') && parseInt(self.player.getAttribute('audio', 10)) == 0) ? '0' : '1';
	self.m.mute_parameter = (self.player.hasAttribute('mute') && parseInt(self.player.getAttribute('mute', 10)) == 1) ? '1' : '0';
}

// generate embeded element for nacl player
window.vxgplayer.generateEmbededElement = function(self){
	return ''
	+ '<embed class="vxgplayer-module" style="transform: scale(1); z-index: -1;" '
	+ '		autostart_parameter="' + self.m.autostart_parameter + '"'
	+ '		mute_parameter="' + self.m.mute_parameter + '" '
	+ '		audio_parameter="' + self.m.audio_parameter + '" ' 
	+ '		name="nacl_module" '
	+ '		id="' + self.id + '_nacl_module" '
	+ '		path="' + self.m.nmf_path + '" '
	+ '		src="' + self.m.nmf_src + '" '
	+ '		url="' + self.m.url + '" '
	+ '		type="application/x-pnacl" />';
}

// init volumes
window.vxgplayer.initVolumeControls = function(self, onloadsettings){
	self.m.volume = self.options.volume || 0.7;
	var el_volumeMute = self.player.getElementsByClassName('vxgplayer-volume-mute')[0];
	var el_volumeDown = self.player.getElementsByClassName('vxgplayer-volume-down')[0];
	var el_volumeProgress = self.player.getElementsByClassName('vxgplayer-volume-progress')[0];
	var el_volumeUp = self.player.getElementsByClassName('vxgplayer-volume-up')[0];
	
	if(self.player.hasAttribute('volume')){
		self.m.volume = parseFloat(self.player.getAttribute('volume'));
		self.m.volume = Math.ceil(self.m.volume*10)/10;
		if(onloadsettings){
			self.module.command('setvolume', self.m.volume.toFixed(1));
		}
	}else if(self.options.volume){
		console.warn("TODO volume");
	}

	self.m.mute = self.options.mute || self.m.volume == 0 || self.m.mute_parameter == '1';
	if(self.m.mute){
		el_volumeDown.style.display='none';
		el_volumeProgress.style.display='none';
		el_volumeUp.style.display='none';
	}
	
	el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));

	self.isMute = function(){
		return self.m.mute;
	}

	self.applyVolume = function(){
		if(self.isMute()){
			el_volumeDown.style.display='none';
			el_volumeProgress.style.display='none';
			el_volumeUp.style.display='none';
			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol0')
		}else{
			el_volumeDown.style.display='inline-block';
			el_volumeProgress.style.display='inline-block';
			el_volumeUp.style.display='inline-block';
			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.floor(self.m.volume*10));
		}
		self.module.command('setvolume', self.m.mute? '0': '' + self.m.volume.toFixed(1));
	}

	self.mute = function(){
		self.restartTimeout();
		self.m.mute = !self.m.mute;
		self.applyVolume();
	}

	self.volume = function(val){
		if(val != undefined){
			val = val > 1 ? 1 : val;
			val = val < 0 ? 0 : val;
			self.m.volume = Math.ceil(val*10)/10;
			self.applyVolume();
		}else{
			return self.m.volume;
		}
	}

	self.volup = function(){
		self.restartTimeout();
		if(Math.round(self.m.volume*10) < 10){
			self.m.volume = self.m.volume + 0.1;
			self.applyVolume();
		}
	};

	self.voldown = function(){
		self.restartTimeout();
		if(Math.round(self.m.volume*10) > 0){
			self.m.volume = self.m.volume - 0.1;
			self.applyVolume();
		}
	};

	el_volumeMute.onclick = self.mute;
	el_volumeDown.onclick = self.voldown;
	el_volumeUp.onclick = self.volup;
}

// document.addEventListener('DOMContentLoaded', function() {

// 	console.log("vxgplayer isFrame: " + window.vxgplayer.isFrame());
// 	console.log("vxgplayer browserSupportsPluginPnacl: " + window.vxgplayer.browserSupportsPluginPnacl());

// 	// search all vxgplayers
// 	var els = document.getElementsByClassName("vxgplayer");
// 	for (var i = 0; i < els.length; i++) {
// 		console.log('1123',els[i].id)
// 		if(els[i].id){
// 			vxgplayer(els[i].id);
// 		}else{
// 			console.error("Player has not id", els[i]);
// 		}
// 	}

	
// 	// TODO check ws
// 	// TODO start Chrome App
// });

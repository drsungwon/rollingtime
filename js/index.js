var httpd = null;

var app = {

    initialize: function () {
        this.bind();
    },
    bind: function () {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function () {

		// Phase.1: NFC receiver initiralization
    
        function failure(reason) {
            navigator.notification.alert(reason, function() {}, "There was a problem");
        }

        nfc.addNdefListener(
            app.onNdef,
            function() {
                console.log("Listening for NDEF tags.");
            },
            failure
        );

        if (device.platform == "Android") {
        
			// nfc.addTagDiscoveredListener()        
            // Android reads non-NDEF tag. BlackBerry and Windows don't.
            
            nfc.addTagDiscoveredListener(
                app.onNfc,
                function() {
                    console.log("Listening for non-NDEF tags.");
                },
                failure
            );
            
			// nfc.addMimeTypeListener()
            // Android launches the app when tags with mime type text/pg are scanned
            // because of an intent in AndroidManifest.xml.
            // phonegap-nfc fires an ndef-mime event (as opposed to an ndef event)
            // the code reuses the same onNfc handler
            
            nfc.addMimeTypeListener(
                'text/pg',
                app.onNfc,
                function() {
                    console.log("Listening for NDEF mime tags with type text/pg.");
                },
                failure
            );
        }
        
        // Phase.2: Web server initialization
        httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;

		if ( httpd ) {
			app.startServer('htdocs');
    	} else {
    		alert('CorHttpd plugin not available/ready.');
    	}
    },
    //
    // NFC reader
    // http://plugreg.com/plugin/chariotsolutions/phonegap-nfc
	//
    onNfc: function (nfcEvent) {
        
        var tag = nfcEvent.tag;
        
        function alertDismissed() {
			// do something
		}

		navigator.notification.alert(
			'아이디(' + nfc.bytesToHexString(tag.id) + ')', // message
			alertDismissed, // callback
			'NFC가 인식되었습니다.', // title
			'종료' // buttonName
		);
                
    },
    //
    // Barcode scanner
    // http://plugins.cordova.io/#/package/com.phonegap.plugins.barcodescanner
	//
    scan: function() {
        cordova.plugins.barcodeScanner.scan(
        
			function (result) {
            	function alertDismissed() {
					// do something
				}			
				navigator.notification.alert(
					"결과:" + result.text, // message
					alertDismissed, // callback
					'코드를 인식하였습니다.', // title
					'확인' // buttonName
				);
			}, 

			function (error) {
            	function alertDismissed() {
					// do something
				}
				navigator.notification.alert(
					' ', // message
					alertDismissed, // callback
					'코드를 인식하지 못하였습니다.', // title
					'확인' // buttonName
				);			
			}
		);
    },
    //
    // Activate Web server
    // https://github.com/floatinghotpot/cordova-httpd
    //
    startServer: function( wwwroot ) { 
    	if ( httpd ) {
    	    httpd.getURL(function(url){
    	    	if(url.length > 0) {
    				document.getElementById('url').innerHTML = "서버상태: 정상 <a href='" + url + "' target='_blank'>(" + url + ")</a>";
	    	    } else {
    	    	    httpd.startServer({
    	    	    	'www_root' : wwwroot,
    	    	    	'port' : 8080
    	    	    }, function( url ){
	    				document.getElementById('url').innerHTML = "서버상태: 시작 <a href='" + url + "' target='_blank'>(" + url + ")</a>";
                        app.updateStatus();
    	    	    }, function( error ){
	    				document.getElementById('url').innerHTML = "서버상태: 시작시 오류 발생";
    	    	    });
    	    	}
    	    },function(){
    	    });
    	} else {
    		alert('CorHttpd plugin not available/ready.');
    	}
    },    
    updateStatus: function() {
//    	document.getElementById('location').innerHTML = "document.location.href: " + document.location.href;
		
    	if( httpd ) {
    	    httpd.getLocalPath(function(path){
//    			document.getElementById('localpath').innerHTML = "<br/>localPath: " + path;
        	});
    		httpd.getURL(function(url){
    			if(url.length > 0) {
    				document.getElementById('url').innerHTML = "서버상태: 정상 <a href='" + url + "' target='_blank'>(" + url + ")</a>";
    			} else {   			
    				document.getElementById('url').innerHTML = "서버상태: 정지";
    			}
    		});
       	} else {
    		alert('CorHttpd plugin not available/ready.');
    	}
    }, 
    stopServer: function() {    
    	if ( httpd ) {
    	    httpd.stopServer(function(){
    			document.getElementById('url').innerHTML = "서버상태: 정지";
                this.updateStatus();
    	    },function( error ){
    			document.getElementById('url').innerHTML = "서버상태: 정지시 오류 발생";
    	    });
    	} else {
    		alert('CorHttpd plugin not available/ready.');
    	}
    }
};
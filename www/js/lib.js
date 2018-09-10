

// ------------- GEOLOCATION -------------- //

	// onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onGeolocationSuccess = function(position) {
		app.dialog.alert('Latitude: '          + position.coords.latitude          + '\n' +
						 'Longitude: '         + position.coords.longitude         + '\n' +
						 'Altitude: '          + position.coords.altitude          + '\n' +
						 'Accuracy: '          + position.coords.accuracy          + '\n' +
						 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
						 'Heading: '           + position.coords.heading           + '\n' +
						 'Speed: '             + position.coords.speed             + '\n' +
						 'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onGeolocationError(error) {
		app.dialog.alert('code: '    + error.code    + '\n' +
						 'message: ' + error.message + '\n');
    }

    //navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError);
    
// ------------- GLOBALIZATION ---------------- //
function SetUserLanguage(lng) {
	lng = lng.substr(0,2).toLowerCase();
	//app.preloader.show();
	app.request.json('langs/'+lng+'.json',{},
		function(data,status,xhr){lang=data;app.init();/*console.log('success');console.log(data);console.log(status);console.log(xhr);*/},
		function(xhr,status){app.dialog.alert('Error getting language: '+status+'\n');/*console.log('error');console.log(status);console.log(xhr);*/}
	);
}
function InitGlobalPreferredLanguage() {
	navigator.globalization.getPreferredLanguage(
        function(data){SetUserLanguage(data.value);},
        function(){SetUserLanguage('en');}
	);
}



function GlobalPreferredLanguage() {
	navigator.globalization.getPreferredLanguage(
        function (data) {alert('language: ' + data.value + '\n');},
        function () {alert('Error getting language\n');}
	);
}

function GlobalLocaleName() {
	navigator.globalization.getLocaleName(
        function (data) {alert('localename: ' + data.value + '\n');},
        function () {alert('Error getting language\n');}
	);
}

function GlobalCurrencyPattern() {
	navigator.globalization.getCurrencyPattern(
        function (data) {alert('language: ' + data.value + '\n');},
        function () {alert('Error getting language\n');}
	);
}

// ---------- DEVICE ----------------- //
function GetDeviceProperties() {
	app.dialog.alert('cordova: ' + device.cordova + '\n' +
					 'model: ' + device.model + '\n' +
					 'platform: ' + device.platform + '\n' +
					 'uuid: ' + device.uuid + '\n' +
					 'version: ' + device.version + '\n' +
					 'manufacturer: ' + device.manufacturer + '\n' +
					 'isVirtual: ' + device.isVirtual + '\n' +
					 'serial: ' + device.serial + '\n');
}

// ---------- STORAGE --------------- //
function ReadAllCookies() {
	alert(document.cookie ? document.cookie : 'is empty');
}
function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}
function deleteCookie(name) {
  setCookie(name, "", {
    expires: -1
  })
}
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function ReadAllLS() {
	var t = localStorage.getItem('test');
	if(t!==undefined) alert('val: '+t);
	else alert('val undefined');
}
function SetLSItem(val) {
	localStorage.setItem('test',val);
}
// --------- NETWORK ------------- //
function checkConnection() {
    var networkState = navigator.connection.type;
 
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
 
    app.dialog.alert('Connection type: ' + states[networkState]);
}
// -------- CONTACTS ----------- //
/*function onContactsSuccess(contacts) {
    alert('Found ' + contacts.length + ' contacts.');
};
function onContactsError(contactError) {
    alert('onError!');
};
function FindContacts(srch) {
	// find all contacts with 'Bob' in any name field
	var options      = new ContactFindOptions();
	options.filter   = srch; //"a";
	options.multiple = true;
	options.desiredFields = [navigator.contacts.fieldType.id];
	options.hasPhoneNumber = true;
	var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
	navigator.contacts.find(fields, onContactsSuccess, onContactsError, options);
}*/
function FindContacts() {
	navigator.contactsPhoneNumbers.list(function(contacts) {
      app.dialog.alert(contacts.length + ' contacts found');
      for(var i = 0; i < contacts.length; i++) {
         console.log(contacts[i].id + " - " + contacts[i].displayName);
         for(var j = 0; j < contacts[i].phoneNumbers.length; j++) {
            var phone = contacts[i].phoneNumbers[j];
            console.log("===> " + phone.type + "  " + phone.number + " (" + phone.normalizedNumber+ ")");
         }
      }
   }, function(error) {
      console.error(error);
   });
}
// ------- CAMERA ----------- //
function GetMyPhoto() {
	navigator.camera.getPicture(onSuccessCamera, onFailCamera, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}
function onSuccessCamera(imageURI) {
    var image = document.getElementById('myPhoto');
    image.src = imageURI;
}
function onFailCamera(message) {
    app.dialog.alert('Failed because: ' + message);
}
function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something
	    var image = document.getElementById('myPhoto');
	    image.src = imageUri;

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}
function createNewFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

    }, onErrorResolveUrl);
}

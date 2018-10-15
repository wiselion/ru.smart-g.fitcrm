// application langs
var lang = {};
// application data && maybe setted to localStorage
var app_data = {};
// application params
var app_prms = {
	url: {},
	tmpl: {}
};
var authorize = true;
var userdata = {};

// ------------- SYS LIB --------------- //
String.prototype.printf = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};
// использование Math.round() даст неравномерное распределение!
function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// ------------- INITIALIZATION --------------- //
// Init/Create application
function InitApplication() {
	app.init();
	app.request.post(app_prms.url.userdata, {}, (req) => {
		userdata = req;
		InitViews();
	},
	(xhr, status) => {
		app.preloader.hide();
		if(status==401 || status==403) SetNotAuth();
		else app.dialog.alert(lang.login.disconnect);
	},'json');
}
// Init/Create views
function InitViews() {
	if(homeView===undefined) homeView = app.views.create('#view-home',{url:'/'});
	if(searchView===undefined) searchView = app.views.create('#view-search',{url:'/search/'});
	if(menuView===undefined) menuView = app.views.create('#view-menu',{url:'/menu/'});
	if(messagesView===undefined) messagesView = app.views.create('#view-messages',{url:'/messages/'});
	if(noticesView===undefined) noticesView = app.views.create('#view-notices',{url:'/notices/'});
	app.preloader.hide();
}
function InitAppAfterLogin() {
	loginScreen.close();
	InitViews();
}
function SendAuthRequest(url,data) {
	app.preloader.show();
	app.request.post(url, data, (req) => {
		app.preloader.hide();
		if(req.status) InitAppAfterLogin();
		else app.dialog.alert(req.error);
	},
	(xhr, status) => {
		app.preloader.hide();
		app.dialog.alert(lang.login.disconnect);
		//if(status==401 || status==403) SetNotAuth(); //console.log('show login screen');
	},'json');
}
// if get 401 or 403 code
function SetNotAuth() {
	// наверное стоит перезагружать те функции, которые прилетели без авторизации
	if(!authorize) return;
	//app.dialog.alert('not auth');
	loginScreen.open();
	// init view
	// .........
}
// ------------- GLOBALIZATION ---------------- //
function SetUserLanguage(lng) {
	lng = lng.substr(0,2).toLowerCase();
	//app.preloader.show();
	app.request.json('langs/'+lng+'.json',{},
		function(data,status,xhr){lang=data;InitApplication();},
		function(xhr,status){app.dialog.alert('Error getting language: '+status+'\n');/*console.log('error');console.log(status);console.log(xhr);*/}
	);
}
// HTML5 version
function InitGlobalPreferredLanguage() {
	var lang = navigator.language!==undefined ? navigator.language : 'en';
	SetUserLanguage(lang);
}
// plugin version
function InitGlobalPreferredLanguagePlugin() {
	navigator.globalization.getPreferredLanguage(
        function(data){SetUserLanguage(data.value);},
        function(){SetUserLanguage('en');}
	);
}

// ------------- LOADING --------------- //
function LoadItemsToInfiniteTape(url,container,tmpl,f_beforecomplete,f_aftercomplete) {
	//console.log('load items to scroll');
	//console.log(url);
	//console.log(container);
	//console.log(tmpl);
	if(container.hasClass('loadstate')) return;
	container.addClass('loadstate');
	app.request.post(url, {}, (reqdata) => {
		if(f_beforecomplete!==undefined) f_beforecomplete();
		var html = tmpl(reqdata);
		//console.log(html);
		// js not init
		container.append(html).removeClass('loadstate');
		app.swiper.create(container.find('.swiper-container'),{pagination:{el:".swiper-pagination"}});
		//$$(html).appendTo(container);
		//container.removeClass('loadstate');
		// :TODO: remove if end of tape
		if(f_aftercomplete!==undefined) f_aftercomplete();
	},
	(xhr, status) => {
		console.log('error xhr loading');
		console.log(status);
		if(status==401 || status==403) SetNotAuth(); //console.log('show login screen');
	},'json');
}

// ------------- MESSAGES --------------- //
function LoadMessagesToPage(url,container,f_beforecomplete,f_aftercomplete) {
	if(container.hasClass('loadstate')) return;
	container.addClass('loadstate');
	//console.log(container);
	var mess_container = app.messages.get(container);
	//console.log(app.messages);
	//console.log(mess_container);
	app.request.post(url, {}, (md) => {
		if(f_beforecomplete!==undefined) f_beforecomplete();
		if(md.messages!==undefined) {
			SetMessages(mess_container,md.messages,'prepend');
			container.removeClass('loadstate');
		}
		if(f_aftercomplete!==undefined) f_aftercomplete();
	},
	(xhr, status) => {
		console.log('error xhr messages loading');
		console.log(status);
		if(status==401 || status==403) SetNotAuth(); //console.log('show login screen');
	},'json');
}
function GetMessageObj(ms) {
	var mo = {};
	if(ms.type===undefined) ms.type='s';
	mo.footer = GetSmartShortDateTimeTS(ms.timestamp);
	if(ms.message!==undefined) mo.text = ms.message;
	if(ms.image!==undefined) mo.imageSrc = ms.image;
	switch(ms.type) {
		case 's':
			mo.type = 'sent';
		break;
		case 'r':
			mo.type = 'received';
			if(ms.author!==undefined) {
				mo.name = ms.author.name;
				mo.avatar = ms.author.photo;
			}
		break;
	}
	return mo;
}
function GetSmartShortDateTime(d) {
	return (d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();
}
function GetSmartShortDateTimeTS(ts) {
	var d = new Date(ts*1000);
//	return '{0}:{1}'.printf(d.getHours(),d.getMinutes());
	return (d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();
}
function SetMessages(mobj,ms,dir) {
	var mss = [];
	for(var i=0;i<ms.length;i++) mss.push(GetMessageObj(ms[i]));
	//console.log(mss);
	mobj.addMessages(mss,dir);
	mobj.addMessages(mss,'prepend');
}
function SetMessage(mobj,ms,dir) {
	mobj.addMessage(GetMessageObj(ms),dir);
}
function SendMessage(mbc,mc,url) {
	if(!mbc.val()) return;
	app.request.post(url, {message:mbc.val()}, (res) => {
		if(res.status) {
			var mess_container = app.messages.get(mc);
			var d = new Date();
			mess_container.addMessage({
				text:mbc.val(),
				footer:GetSmartShortDateTime(d)
			},'append');
			mbc.val('');
			// TEST
			setTimeout(function(){SendRandTyping(mess_container);},1000);
			setTimeout(function(){SendRandMessage(mess_container);},4000);
		} else {
			app.dialog.alert(res.error);
		}
	},
	(xhr, status) => {
		console.log('error xhr send message loading');
		console.log(status);
		if(status==401 || status==403) console.log('show login screen');
	},'json');
}
function SendRandTyping(mess_container) {
	var auth = [
		{"id":1,"photo":"https:\/\/lifeis.dance\/app\/i\/p1.jpg","name":"Alexander Pushkin","alias":"alex_pushkin"},
		{"id":2,"photo":"https:\/\/lifeis.dance\/app\/i\/p2.jpg","name":"Alexander Ostrovsky","alias":"theatre"},
		{"id":3,"photo":"https:\/\/lifeis.dance\/app\/i\/p3.jpg","name":"Ivan Turgenev","alias":"fathers_sons"},
		{"id":4,"photo":"https:\/\/lifeis.dance\/app\/i\/p4.jpg","name":"Leo Tolstoy","alias":"pacifist"},
		{"id":5,"photo":"https:\/\/lifeis.dance\/app\/i\/p5.jpg","name":"Noname Nofamily","alias":"noname"},
		{"id":6,"photo":"https:\/\/lifeis.dance\/app\/i\/p6.jpg","name":"Alexander Griboedov","alias":"a_griboedov"}];
	var ind = getRandomInt(0,auth.length);
	mess_container.showTyping({header:auth[ind].name+' is typing',avatar:auth[ind].photo});
}
function SendRandMessage(mess_container) {
	mess_container.hideTyping();
	var messages = [
		{"id":223,"timestamp":1537806797,"type":"r","message":"Lorem ipsum dolor sit amet, consectetur adipisicing elit.","author":{"id":1,"photo":"https:\/\/lifeis.dance\/app\/i\/p1.jpg","name":"Alexander Pushkin","alias":"alex_pushkin"}},
		{"id":220,"timestamp":1537806377,"type":"r","message":"Hi, I am good!","author":{"id":2,"photo":"https:\/\/lifeis.dance\/app\/i\/p2.jpg","name":"Alexander Ostrovsky","alias":"theatre"}},
		{"id":219,"timestamp":1537806197,"type":"r","message":"Hi there, I am also fine, thanks! And how are you?","author":{"id":3,"photo":"https:\/\/lifeis.dance\/app\/i\/p3.jpg","name":"Ivan Turgenev","alias":"fathers_sons"}},
		{"id":215,"timestamp":1537804577,"type":"r","message":"Nice!","author":{"id":4,"photo":"https:\/\/lifeis.dance\/app\/i\/p4.jpg","name":"Leo Tolstoy","alias":"pacifist"}},
		{"id":214,"timestamp":1537803557,"type":"r","message":"Like it very much!","author":{"id":5,"photo":"https:\/\/lifeis.dance\/app\/i\/p5.jpg","name":"Noname Nofamily","alias":"noname"}},
		{"id":213,"timestamp":1537803017,"type":"r","message":"Awesome! (213)","author":{"id":6,"photo":"https:\/\/lifeis.dance\/app\/i\/p6.jpg","name":"Alexander Griboedov","alias":"a_griboedov"}}];
	var ind = getRandomInt(0,messages.length);
	SetMessage(mess_container,messages[ind]);
}

/*
id
timestamp
type
message
author {
	id
	photo
	name
	alias
}

text	string		Message text
header	string		Single message header
footer	string		Single message footer
name	string		Sender name
avatar	string		Sender avatar URL string
type	string	sent	Message type - sent or received
textHeader	string		Message text header
textFooter	string		Message text footer
image	string		Message image HTML string, e.g. <img src="path/to/image">. Can be used instead of imageSrc parameter
imageSrc	string		Message image URL string. Can be used instead of image parameter
isTitle	boolean		Defines whether it should be rendered as a message or as a messages title
*/

// !!! ВСЕ ЧТО НИЖЕ НАДО УПОРЯДОЧИТЬ !!! //


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

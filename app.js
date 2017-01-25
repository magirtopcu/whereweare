
var util  = {
	makeid: function(){


		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
		},

	getUserType	:function(){
		var h  = location.hash.substr(1);
		if(h){
			return "host";
		}
		else return "guest";
	},

	getLocationUid : function(){
			var h  = location.hash.substr(1);
			if(h){
				return h;
			}
			else return this.makeid();
	}
	
}

var  App = function(){
	var me = Me.getMe();
	var people = {};
	this.location_uid  = util.getLocationUid();
	this.state = new State();
	var self  =this;
	var connectionProvider = null;

	var onLocationChanged = function(loc){
		if(connectionProvider){
			connectionProvider.sendData(self.location_uid,me.id,loc);
		}
		
	}

	var onDataChanged = function(data){
			var key = data.key;
			if(me.id == key){
				var marker = me.marker;
				if(!marker){
					me.marker = mapProvider.createMarkerOnMap(data.val(),"me");
				}
				else{
					mapProvider.moveMarkerOnMap(marker,data.val());
				}
				return;
			}
			var friend = people[key];
			if(!friend){
				friend = people[key] = {};
			}

			
			if(!friend.marker){
				friend.marker = mapProvider.createMarkerOnMap(data.val(),"friend");
			}
			else{
				mapProvider.moveMarkerOnMap(friend.marker,data.val());
			}

	}

	var locationProvider = null;
	try{
			locationProvider   = new LocationProvider(onLocationChanged);
			$(".share_link").text(location+"#"+self.location_uid);
	}
	catch(e){
			alert("browser doesnt support geolocation");
	}
	
	var mapProvider = new MapProvider();
	mapProvider.initMap();

	connectionProvider =  new PeerConnectionProvider();
	
	connectionProvider.onDataChanged(self.location_uid,onDataChanged);
}


var State = function(){

}

var Me = function(){
	
}


Me.getMe = function(){
	var m = new Me();
	m.id = util.makeid();
	m.loc = {};

	m.type = util.getUserType();
	return m;
}

var  PeerConnectionProvider  = function(){
	var config = {
    apiKey: "AIzaSyDO_1XsGc2cjwq-yMQUC9RuqzqWrzfPjcs",
    authDomain: "whereweare-1485205412406.firebaseapp.com",
    databaseURL: "https://whereweare-1485205412406.firebaseio.com",
    storageBucket: "whereweare-1485205412406.appspot.com",
    messagingSenderId: "428483340200"
   };
   firebase.initializeApp(config);

     this.db  = firebase.database();
 	 this.db.goOnline();
}

PeerConnectionProvider.prototype.sendData=function(locationUid,subPath,data){
		this.db.ref('locations/' + locationUid+ "/"+subPath).set(data);
}

PeerConnectionProvider.prototype.onDataChanged = function(locationUid,onDataChanged){

		this.db.ref('locations/'+locationUid).on('child_changed',function(data){
  							onDataChanged(data);
  					});

  		this.db.ref('locations/'+locationUid).on('child_added',function(data){
  							onDataChanged(data);
  					});

}


var LocationProvider = function(onLocationChanged){
		if(!navigator.geolocation){
			throw new Error("not supported geolocation");
		}

		var notifyLocation = function(geo){
			onLocationChanged({lat :geo.coords.latitude, lng : geo.coords.longitude});
		}
		navigator.geolocation.getCurrentPosition(function(geo){
			 notifyLocation(geo);
		});

		this.watchId = navigator.geolocation.watchPosition(function(geo){
			console.log("location_changed");
			notifyLocation(geo);
		});
}


var MapProvider = function (config){
	this.config = { center :{lat:41.0829132 , lng:29.0013657}, el : document.getElementById('map') ,zoom : 8 } ;
	if(config){
		for(var k in config){
				this.config[k] = config[k];
		}
	}
	

}

MapProvider.prototype.initMap = function(){
	var self = this;
	self.map = new google.maps.Map(self.config.el, {
    	center: self.config.center ,
    	zoom: self.config.zoom
  	});

}

MapProvider.prototype.createMarkerOnMap = function(loc,title){
		var self = this;
		var marker = new google.maps.Marker({
          position: loc,
          map: self.map,
          title:title
        });

        return marker;
}

MapProvider.prototype.moveMarkerOnMap = function(marker,loc){
   marker.position = loc;
}


function initMap() {
  
	var app = new App();
 
}


function saveData() {
    var name = document.getElementById('city').value;
    var Api = "https://maps.googleapis.com/maps/api/geocode/json?address="+name+"&key=AIzaSyDKuHWh4AmeZln9iexPJ76u8d39-Ap2Uww";
    fetch(Api)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        let cordenates = myJson.results;
        return cordenates.map(function(cordenate) {
            var centerlat = parseFloat(`${cordenate.geometry.location.lat}`);
            var centerlng = parseFloat(`${cordenate.geometry.location.lng}`);
            var nelat = parseFloat(`${cordenate.geometry.bounds.northeast.lat}`);
            var nelng = parseFloat(`${cordenate.geometry.bounds.northeast.lng}`);
            var swlat = parseFloat(`${cordenate.geometry.bounds.southwest.lat}`);
            var swlng = parseFloat(`${cordenate.geometry.bounds.southwest.lng}`);
            getEarthquakes(centerlat, centerlng, nelat, nelng, swlat, swlng);
           })
    });
}

function getEarthquakes(centerlat, centerlng, nelat, nelng, swlat, swlng){
    
    var infowindow = new google.maps.InfoWindow()   
    var newApi = "http://api.geonames.org/earthquakesJSON?north="+nelat+"&south="+swlat+"&east="+nelng+"&west="+swlng+"&username=lmtrujillo";
    
    var map = new google.maps.Map(document.getElementById('map'),{
        zoom:10,
        center: {lat: centerlat, lng: centerlng}
    })

    /*
    Recursive Function:
    - Plots the earthquakes that are on the city area
    - When finished looks up for nearby earthquakes
    - Calls s
    */
    recursive(newApi);
    // 0 when it is the first time, 1 when its al least second
    var time = 0
    // counts number of plotted markers
    var plotted = 0
    function recursive(newApi){
        fetch(newApi)
        .then(function(response) {
        return response.json();
        })
        .then(function(myJson) {
            size = (Object.keys(myJson.earthquakes).length);
            
            // If has 10 earthquakes the first time
            if(size==10 && time==0){
                missingMarks(newApi,plotted);
                screen_zoom(swlng,nelng,map);
            // If doesn't have 10 earthquakes the first time
            }else if(size<10 && time==0){
            time = 1
            // Plots the earthquakes on the current area     
            let cordenates = myJson.earthquakes;
            cordenates.map(function(cordenate) {
             marker = new google.maps.Marker({
                position: {lat: parseFloat(`${cordenate.lat}`), lng: parseFloat(`${cordenate.lng}`)} ,
                map: map,
                date: `${cordenate.datetime}`,
                magnitude: `${cordenate.magnitude}`,
                });
              content = message(marker.date, marker.magnitude);
              google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
                  return function() {
                      infowindow.setContent(content);
                      infowindow.open(map,marker,map);
                  };
              })(marker,content,infowindow)); 
            });
            plotted=size; 
            recursive(newApi) 
            // If has 10 at least the second time
            }else if(size==10 && time==1){
                missingMarks(newApi,plotted)
                screen_zoom(swlng,nelng,map);
            // If has less than 10 multiple times and not first time
            }else if(size<10 && time==1){ 
                swlat=swlat-0.15;
                swlng=swlng-0.15; 
                nelat=nelat+0.15; 
                nelng=nelng+0.15;
                newApi = "http://api.geonames.org/earthquakesJSON?north="+nelat+"&south="+swlat+"&east="+nelng+"&west="+swlng+"&username=lmtrujillo";
                recursive(newApi)
            } 
        });

    }

    // Counts how many plotted marks has
    var counter = 0;
    function missingMarks(newApi, plotted){
        fetch(newApi)
        .then(function(response) {
        return response.json();
        })
        .then(function(myJson) {
            let cordenates = myJson.earthquakes;
            return cordenates.map(function(cordenate) { 
                // When have been already plotted the others, plots the new ones
                if(counter<10-plotted){
                    marker = new google.maps.Marker({
                        position: {lat: parseFloat(`${cordenate.lat}`), lng: parseFloat(`${cordenate.lng}`)} ,
                        map: map,
                        date: `${cordenate.datetime}`,
                        magnitude: `${cordenate.magnitude}`
                        });
        
                      content = message(marker.date, marker.magnitude);
                      google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
                          return function() {
                              infowindow.setContent(content);
                              infowindow.open(map,marker);
                          };
                      })(marker,content,infowindow));    
                }
                    counter=counter+1;        
            });


        })

    }
}
/*
Changes the zoom depending the location on the markers
*/
function screen_zoom(swlng,nelng,map){
        zoom_level = (Math.abs(swlng-nelng));
        if(zoom_level>2&&zoom_level<4.5){
            map.setZoom(8);
        }else if(zoom_level>4.5&&zoom_level<7){
            map.setZoom(7);
        }else if(zoom_level>7){
            map.setZoom(5);
        }
}
/*
Customizes the message from the markers
*/
function message(){
    var year = marker.date.substring(0, 4);
    var month = marker.date.substring(5, 7);
    var day = marker.date.substring(8, 10);
    return '<h6>' +"Date: " +day + "/"+ month+"/"+year +'</h6>'+ '<h6>'+ "Intensity: " + marker.magnitude + '</h6>';

}

/*
Inicializes de map in the main page
*/
function initMap() {

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 3,
      center: {lat: 0, lng: 0}
    });

    
}
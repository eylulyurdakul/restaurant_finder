// Eylül Dicle Yurdakul
// October 29, 2017

"use strict";

let geoCoder,
    map,
    slider = document.getElementById("range"),
    output = document.getElementById("value");

output.innerHTML = slider.value;  // prints current slider value to the page

slider.oninput = function() {  // changes slider value when playing slider
    output.innerHTML = this.value;
};

function toRadians(angleInDegrees) {  // converts given degree to radian
    return angleInDegrees * Math.PI / 180;
}

function toDegrees(angleInRadians) {  // converts given radian to degree
    return angleInRadians * 180 / Math.PI;
}

function offset(center, radius, bearing) {
    let latitude= toRadians(center[1]),  // gets the latitude of the center in radians
        longitude = toRadians(center[0]),  // gets the longitude of the center in radians
        dByR = radius / 6378137,  // calculates the distance divided by 6378137 (radius of the earth)
        finalLatitude = Math.asin(Math.sin(latitude) * Math.cos(dByR) + Math.cos(latitude) * Math.sin(dByR) * Math.cos(bearing)),
        finalLongitude = longitude + Math.atan2(Math.sin(bearing) * Math.sin(dByR) * Math.cos(latitude),
            Math.cos(dByR) - Math.sin(latitude) * Math.sin(finalLatitude));

    return [toDegrees(finalLongitude), toDegrees(finalLatitude)];  // returns the final latitude and longitude in degrees
}

function circleToPolygon(center, radius, numberOfSegments) {  // converts the circle to a polygon using its center and radius
    let n = numberOfSegments ? numberOfSegments : 32,  //  edge number of the polygon is optional, defaults to 32
        flatCoordinates = [],
        coordinates = [];

    for (let i = 0; i < n; ++i) {
        flatCoordinates.push.apply(flatCoordinates, offset(center, radius, 2 * Math.PI * i / n));
    }

    flatCoordinates.push(flatCoordinates[0], flatCoordinates[1]);

    for (let i = 0, j = 0; j < flatCoordinates.length; j += 2) {
        coordinates[i++] = flatCoordinates.slice(j, j + 2);
    }

    return {  // returns a GeoJSON object representing the polygon
        type: "FeatureCollection",
        features: [{ "type": "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [coordinates]
            },
            properties: {
                property0: " ",
                property1: {" ": " "}
            }
        }]
    };
}

let centerCoordinates, mapOptions;

function initializeMap() {  // initializes the map
    geoCoder = new google.maps.Geocoder();
    centerCoordinates = new google.maps.LatLng(0, 0);
    mapOptions = {
        zoom: 5,
        center: centerCoordinates
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    document.getElementById('address').focus();  // selects address box for entering input
    document.getElementById('address').select();

    document.getElementById("address").addEventListener("keyup", function(event) {  // enables Enter to activate Find button
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("find").click();
        }
    });
    document.getElementById('find').addEventListener('click', function() {  // enables mouse to activate Find button
        find(geoCoder, map);
    })
}

let marker, cityCircle, polygon, polygonData;
const numberOfEdges = 15;

function find() {  // geocodes the address, marks & circles it, converts circle to polygon, displays polygon data as GeoJSON
    let address = document.getElementById('address').value,
        location = [];

    geoCoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {  // if there is not any validation problem
            location[0] = results[0].geometry.location.lng();
            location[1] = results[0].geometry.location.lat();
            map.setCenter(results[0].geometry.location);

            if(marker) {  // removes previous marker if exists
                marker.setMap(null);
            }
            if(cityCircle) {  // removes previous circle if exists
                cityCircle.setMap(null);
            }
            if(polygonData) {  // removes previously added polygon data if exists
                 map.data.remove(polygonData[0]);
            }

            marker = new google.maps.Marker({  // creates & places the marker
                map: map,
                position: results[0].geometry.location
            });

            cityCircle = new google.maps.Circle({  // creates & places the circle
                strokeColor: '#ff1727',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#ff1727',
                fillOpacity: 0.15,
                map: map,
                center: results[0].geometry.location,
                radius: slider.value * 10000
            });

            polygon = circleToPolygon(location, slider.value * 10000, numberOfEdges);  // converts circle to polygon
            polygonData = map.data.addGeoJson(polygon);  // draws the polygon to the map

            document.getElementById("out").innerHTML = JSON.stringify(polygon, undefined, 2);  // prints polygon data as GeoJSON
        } else {
            if(status == google.maps.GeocoderStatus.INVALID_REQUEST) {  // does validation check for empty address box
                alert('Please fill in the address box.');
            }
            else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {  // does validation check for invalid addresses
                alert('This address is invalid. Please enter a valid one');
            }
            else if(status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {  // does validation check for invalid addresses
                alert('This address is invalid. Please enter a valid one');
            }
        }
    });
}





const polyline = require('polyline');

var GoogleMapsAPI = require('googlemaps');
var homes = [
  {lat: 40.7128, long: -73.935242, name: 'NYC'},
  {lat: 32.7767, long: -96.7970, name: 'Dallas'},
  {lat: 37.6213, long: -122.3790, name: 'SFO'},
  {lat: 50.1109, long: 8.6821, name: 'Frankfurt'},
  {lat: 48.1351, long: 11.5820, name: 'Munich'},
  {lat: 55.6761, long: 12.5683, name: 'Copenhagen'}
];

function randomPoint(center, dire) {
  center = center || {lat: 39.11303, long: -84.51931};
  var l = dire ? 6 : 0.3;
  return (center.lat + (Math.random() - 0.5) * l).toString() + ',' + (center.long + (Math.random() - 0.5) * l).toString();
}

var publicConfig = {
  //key: 'AIzaSyB7NyUpf2JfeiUQBkzczr31J6lgZ_-wPXY',
  key: 'AIzaSyDE6s-x0D3YgIzYEO9GjbgvCs8oHmZPwfU',
  // stagger_time:       1000, // for elevationPath
  encode_polylines: false
  // secure:             true, // use https
  // proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};

var gmApi = new GoogleMapsAPI(publicConfig);

function randomPath(start, cb) {

  var request = { // driving by default
    origin: randomPoint(start),
    destination: randomPoint(start, true),
  };

  // ds.route({origin: new google.maps.LatLng(1, 2), destination: new google.maps.LatLng(2, 2), travelMode: google.maps.TravelMode.DRIVING}, function(r) {console.warn(r)})

  gmApi.directions(request, function (error, response) {

    if (response.status === 'OK') {
      console.warn('response', response)
      var meters = response.routes[0].legs[0].distance.value;
      var overview_path = polyline.decode(response.routes[0].overview_polyline.points);
      cb(null, overview_path, meters);
    } else if (response.status === 'ZERO_RESULTS') {
      randomPath(start, cb);
    } else if (response.status === 'OVER_QUERY_LIMIT') {
      console.log('OVER_QUERY_LIMIT');
      setTimeout(function () {
        randomPath(start, cb);
      }, 10000);
    } else {
      console.error('wrong gmapi responce status', response.status);
      cb(error);
    }


  });
}

export default randomPath; //(null, function(e, r) {return JSON.stringify(r)});
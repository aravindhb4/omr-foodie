// Javascript file using Google Maps API and Zomato API. 
// Knockout JS framework is used.
// Alert user when googleMaps is not loaded
function mapNotLoaded() {
    alert('Unable to load Google Maps. Please refresh the page');
}

// Model
// restaurantData contains the top 12 food places in OMR with details
var restaurantData = [{
    name: 'OMR Food Street',
    restaurantId: 73176,
    lat: 12.936892,
    lng: 80.234603,
    imgSrc: 'img/omr_food_street.jpg',
    imgAttribute: 'Photo from omrfoodstreet.com',
    url: 'http://www.omrfoodstreet.com/omr-food-street-blog',
}, {
    name: 'Dindigul Thalapakatti',
    restaurantId: 65145,
    lat: 12.925778,
    lng: 80.230418,
    imgSrc: 'img/dindigul_thalappakatti.jpg',
    imgAttribute: 'Photo from tripadvisor.com',
    url: 'http://www.thalappakatti.com',
}, {
    name: 'Barbeque Nation',
    restaurantId: 71405,
    lat: 12.943841,
    lng: 80.237892,
    imgSrc: 'img/barbeque_nation.jpg',
    imgAttribute: 'Photo from Zomato',
    url: 'http://www.barbeque-nation.com',
}, {
    name: 'Rasavid Multi Cuisine',
    restaurantId: 66497,
    lat: 12.915403,
    lng: 80.229308,
    imgSrc: 'img/rasavid.jpg',
    imgAttribute: 'Photo from omrpedia.com',
    url: 'http://rasavid.in',
}, {
    name: 'Savoury Sea Shell',
    restaurantId: 71554,
    lat: 12.924776,
    lng: 80.230500,
    imgSrc: 'img/sea_shell.jpg',
    imgAttribute: 'Photo from seashellchennai.com',
    url: 'http://www.seashellchennai.com/',
}, {
    name: 'Sigree Global Grill',
    restaurantId: 68864,
    lat: 12.930215,
    lng: 80.231824,
    imgSrc: 'img/sigree.jpg',
    imgAttribute: 'Photo from thehindu.com',
    url: 'http://www.seashellchennai.com',
}, {
    name: 'Paradise Biriyani',
    restaurantId: 73279,
    lat: 12.972703,
    lng: 80.249899,
    imgSrc: 'img/paradise_biriyani.jpg',
    imgAttribute: 'Photo from twitter.com',
    url: 'http://www.zomato.com/chennai/paradise-perungudi',
}, {
    name: 'FB Cake House',
    restaurantId: 68854,
    lat: 12.913762,
    lng: 80.228814,
    imgSrc: 'img/fb_cake_house.jpg',
    imgAttribute: 'Photo from Zomato',
    url: 'http://www.fbcakehouse.com',
}, {
    name: 'Cream Stone',
    restaurantId: 72584,
    lat: 12.927413,
    lng: 80.230861,
    imgSrc: 'img/cream_stone.jpg',
    imgAttribute: 'Photo from meethichhuri',
    url: 'http://www.creamstoneconcepts.com',
}, {
    name: 'Junior Kuppanna',
    restaurantId: 71541,
    lat: 12.969368,
    lng: 80.248759,
    imgSrc: 'img/junior_kuppanna.jpg',
    imgAttribute: 'Photo from Zomato',
    url: 'http://www.hoteljuniorkuppanna.com',
}, {
    name: 'Domino\'s Pizza',
    restaurantId: 71522,
    lat: 12.957943,
    lng: 80.243797,
    imgSrc: 'img/dominos_pizza.jpg',
    imgAttribute: 'Photo from Zomato',
    url: 'http://www.dominos.co.in',
}, {
    name: 'Hotel Saravana Bhavan',
    restaurantId: 68885,
    lat: 12.967413,
    lng: 80.247971,
    imgSrc: 'img/hotel_saravana_bhavan.jpg',
    imgAttribute: 'Photo from Zomato',
    url: 'http://www.saravanabhavan.com',
}];

// Create a constructor class for restaurant data
var Place = function(data) {
    this.name = data.name;
    this.resId = data.restaurantId;
    this.lat = data.lat;
    this.lng = data.lng;
    this.imgSrc = data.imgSrc;
    this.imgAttribute = data.imgAttribute;
    this.url = data.url;
};

// Initialize ViewModel
function restaurantViewModel() {

    var self = this;
    var map, infowindow;

    // Initial list of restaurants as observable array
    this.restaurantList = ko.observableArray([]);

    // For review title
    this.restaurantName = ko.observable('');

    // Array to store map markers
    this.mapMarkers = ko.observableArray([]);

    // Messages to user
    this.message = ko.observable('Please select a restaurant to view the recent reviews');

    // Data from API will be loaded into this array
    this.reviewList = ko.observableArray([]);

    // Current position to render map, also useful in centering map
    this.currentLat = ko.observable(12.944153);
    this.currentLng = ko.observable(80.23892);

    // Make place object from each item in restaurant list then push to observable array.
    restaurantData.forEach(function(item) {
        this.restaurantList.push(new Place(item));
    }, this);


    // When a restaurant on the list is clicked, go to corresponding marker and open its info window.
    this.setPlace = function(clicked) {
        var restaurantName = clicked.name;
        var restaurantId = clicked.resId;
        for (var key in self.mapMarkers()) {
            if (restaurantName === self.mapMarkers()[key].marker.title) {
                map.panTo(self.mapMarkers()[key].marker.position);
                map.setZoom(14);
                infowindow.setContent(self.mapMarkers()[key].content);
                infowindow.open(map, self.mapMarkers()[key].marker);
                map.panBy(0, -150);

            }
        }

        // Inform user that we are loading the reviews from API
        self.message('Loading Zomato Reviews...');

        // Call Zomato API
        getZomatoReviews(restaurantId, restaurantName);
    };

    this.search = ko.observable('');

    // Filter location name with value from search field.
    this.filteredItems = ko.computed(function() {
        var searchTerm = self.search().toLowerCase();
        if (!searchTerm) {
            return self.restaurantList();
        } else {
            return ko.utils.arrayFilter(self.restaurantList(), function(item) {
                // return true if found the keyword, false if not found.
                return item.name.toLowerCase().indexOf(searchTerm) !== -1;
            });
        }
    });


    // Initialize Google map and render markers for restaurantList array.
    function mapInitialize() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 12.944153,
                lng: 80.23892
            },
            zoom: 13,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM,
                style: google.maps.ZoomControlStyle.small
            },
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            mapTypeControl: false,
            panControl: false
        });

        google.maps.event.addDomListener(window, "resize", function() {
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        });

        // Place the markers of the restaurant list
        mapMarkers(self.restaurantList());

        // initialize infowindow
        infowindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

    }

    // Create and place markers and info windows on the map based on restaurantData
    function mapMarkers(array) {
        $.each(array, function(index, value) {
            var latitude = value.lat,
                longitude = value.lng,
                geoLoc = new google.maps.LatLng(latitude, longitude),
                thisRestaurant = value.name;

            var contentString =
                '<div class="info-content">' + '<h3 class="text-pink">' + value.name + '</h3>' + '<img height=300 width=300 alt="' + value.name + '" src="' + value.imgSrc + '">' + '<em class="text-muted small">' + value.imgAttribute + '</em>' + '<br>' + '<strong><a href = "' + value.url + '">Take me to their website</a></strong>' + '</div>';

            var marker = new google.maps.Marker({
                position: geoLoc,
                title: thisRestaurant,
                map: map,
                icon: 'img/map-pin-default.png'
            });

            // Load markers array with marker details and infowindow content
            self.mapMarkers.push({
                marker: marker,
                content: contentString
            });

            //generate infowindows for each restaurant
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(contentString);
                map.setZoom(14);
                map.setCenter(marker.position);
                infowindow.open(map, marker);
                map.panBy(0, -150);
            });
        });
    }


    // Get reviews of restaurants from Zomato API
    function getZomatoReviews(resId, resName) {

        var name, rating, time, text;

        // Perform ajax call with restaurant ID and number of reviews needed as 5
        $.ajax({
            dataType: 'jsonp',
            url: 'https://developers.zomato.com/api/v2.1/reviews?res_id=' + resId + '&apikey=1a70546f28c6740c7c48858d1f29b16a&count=5',
            success: function(data) {

                var count = data.reviewsShown;

                // Clear existing review list in the observable array
                self.reviewList([]);

                // Loop thru the data and store 
                for (var i = 0; i < count; i++) {

                    name = data.userReviews[i].review.user.name;
                    rating = data.userReviews[i].review.rating;
                    time = data.userReviews[i].review.reviewTimeFriendly;
                    text = data.userReviews[i].review.reviewText;

                    // Load the reviewList observableArray with the values from API
                    self.reviewList.push({
                        reviewerName: name,
                        restaurantRating: 'Rating: ' + rating,
                        reviewDate: time,
                        reviewText: text,
                    });

                }
                self.message('Recent reviews from Zomato');
                self.restaurantName(resName);
            },

            // If there is any problem in the AJAX call process, inform the user.
            error: function() {
                self.message('Unable to load Zomato reviews. Please refresh the page');
            }

        });
    }

    //Move the map to intial center if you have moved the map farther away
    this.centerMap = function() {
        infowindow.close();
        var currCenter = map.getCenter();
        var initialCenter = new google.maps.LatLng(self.currentLat(), self.currentLng());
        if (initialCenter === currCenter) {
            alert('Map is already centered');
        } else {
            map.panTo(initialCenter);
            map.setZoom(13);
        }
    };

    // Initialize google Maps
    mapInitialize();

}

// Initialize Knockout View Model
ko.applyBindings(new restaurantViewModel());
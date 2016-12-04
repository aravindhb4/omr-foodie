// Javascript file using Google Maps API and Zomato API. 
// Knockout JS framework is used.
// Initialize Model
(function() {

    var restaurantData = [{
        name: 'OMR Food Street',
        restaurantId: 73176,
        lat: 12.936892,
        lng: 80.234603,
        imgSrc: 'img/omr_food_street.jpg',
        imgAttribute: 'Photo from omrfoodstreet.com',
        url: 'http://www.omrfoodstreet.com/omr-food-street-blog/',
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

    // Constructor for Place
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
    var ViewModel = function() {
        var self = this;
        // Set restaurant list observable array from restaurantData
        this.restaurantList = ko.observableArray([]);
        // Get value from search field.
        this.search = ko.observable('');
        // Make place object from each item in restaurant list then push to observable array.
        restaurantData.forEach(function(item) {
            this.restaurantList.push(new Place(item));
        }, this);
        // Initial current restaurant to be the first one.
        this.currentPlace = ko.observable(this.restaurantList()[0]);
        // Functions invoked when user clicked an item in the list.
        this.setPlace = function(clickedPlace) {
            // Set current restaurant to which the user clicked.
            self.currentPlace(clickedPlace);
            // Find index of the clicked restaurant and store for use in activation of marker.
            var index = self.filteredItems().indexOf(clickedPlace);
            // Prepare content for Google Maps infowindow
            self.updateContent(clickedPlace);
            // Activate the selected marker to change icon.
            // function(marker, context, infowindow, index)
            self.activateMarker(self.markers[index], self, self.infowindow)();
            // Invoke function for Zomato API call with restaurant ID and name.
            self.zomatoReviews(clickedPlace.resId, clickedPlace.name);
        };
        // Filter location name with value from search field.
        this.filteredItems = ko.computed(function() {
            var searchTerm = self.search().toLowerCase();
            if (!searchTerm) {
                return self.restaurantList();
            } else {
                return ko.utils.arrayFilter(self.restaurantList(), function(item) {
                    // return true if found the keyword typed, false if not found.
                    return item.name.toLowerCase().indexOf(searchTerm) !== -1;
                });
            }
        });

        // Initialize Google Maps
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 12.944153,
                lng: 80.23892
            },
            zoom: 14,
        });

        // Initialize markers
        this.markers = [];

        // Initialize infowindow
        this.infowindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

        // Render all markers with data from the data model.
        this.renderMarkers(self.restaurantList());

        // Render map markers based on filtered places with subscribe function
        this.filteredItems.subscribe(function() {
            self.renderMarkers(self.filteredItems());
        });

        // Add event listener for map click event (when user click on other areas of the map beside of markers)
        google.maps.event.addListener(self.map, 'click', function(event) {
            // Every click change all markers icon back to defaults.
            self.deactivateAllMarkers();
            // Every click close all infowindows.
            self.infowindow.close();
        });
    };

    // Method for clear all markers.
    ViewModel.prototype.clearMarkers = function() {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
    };

    // Method for render all markers.
    ViewModel.prototype.renderMarkers = function(arrayInput) {
        // Clear old markers before render
        this.clearMarkers();
        var infowindow = this.infowindow;
        var context = this;
        var placeToShow = arrayInput;
        // Create new marker for each place in array and push to markers array
        for (var i = 0, len = placeToShow.length; i < len; i++) {
            var location = {
                lat: placeToShow[i].lat,
                lng: placeToShow[i].lng
            };
            var marker = new google.maps.Marker({
                position: location,
                map: this.map,
                icon: 'img/map-pin-default.png'
            });
            this.markers.push(marker);
            //render the markers in map
            this.markers[i].setMap(this.map);
            // add event listener for click event to the newly created marker
            marker.addListener('click', this.activateMarker(marker, context, infowindow, i));
        }
    };

    // Set all marker icons back to default icons.
    ViewModel.prototype.deactivateAllMarkers = function() {
        var markers = this.markers;
        for (var i = 0; i < markers.length; i++) {
            markers[i].setIcon('img/map-pin-default.png');
        }
    };

    // Set the target marker to change icon and open infowindow
    // Call from user click on the menu list or click on the marker
    ViewModel.prototype.activateMarker = function(marker, context, infowindow, index) {
        return function() {
            // check if have an index. If have an index mean request come from click on the marker event
            if (!isNaN(index)) {
                var place = context.filteredItems()[index];
                context.updateContent(place);
            }
            // closed opened infowindow
            infowindow.close();
            // deactivate all markers
            context.deactivateAllMarkers();
            // Open targeted infowindow and change its icon.
            infowindow.open(context.map, marker);
            marker.setIcon('img/map-pin-selected.png');
        };
    };

    // Change the content of infowindow
    ViewModel.prototype.updateContent = function(place) {
        var html = '<div class="info-content">' + '<h4>' + place.name + '</h4>' + '<img height=300 width=300m alt="' + place.name + '" src="' + place.imgSrc + '">' + '<em class="text-muted small">' + place.imgAttribute + '</em>' + '<br>' + '<a class="text-pink" href = "' + place.url + '">Take me to their website</a>' + '</div>';
        this.infowindow.setContent(html);
    };

    // Method for Zomato API call
    ViewModel.prototype.zomatoReviews = function(resId, name) {
        // Prepare variables
        var infoBox = $('#review-header');
        var reviewerName = [];
        var rating = [];
        var reviewDate = [];
        var reviewText = [];

        // Hide previous reviews and let the user we're loading the new one.
        $('#review-area').hide();
        infoBox.show().removeClass('text-pink').addClass('text-muted text-center').text("Loading...");

        // Make AJAX call with the resId
        // This call will fetch latest 5 reviews of the restaurant
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            cache: true,
            url: 'https://developers.zomato.com/api/v2.1/reviews?res_id=' + resId + '&apikey=1a70546f28c6740c7c48858d1f29b16a&count=5'
        }).done(function(data) {

            // Loop thru the returned value and store them in our array variables
            for (i = 0; i < data.reviewsShown; i++) {
                reviewerName.push(data.userReviews[i].review.user.name);
                rating.push(data.userReviews[i].review.rating);
                reviewDate.push(data.userReviews[i].review.reviewTimeFriendly);
                reviewText.push(data.userReviews[i].review.reviewText);
            }

            // Create an ul to display the returned reviews
            var reviewContainer = $('<ul class="review-nav">');

            // Append the html of list of reviews by looping thru the stored data
            for (var j = 0; j < data.reviewsShown; j++) {
                reviewContainer.append('<li class="zomato-div"><h5 class="text-pink">' + reviewerName[j] + '</h5><p class="small text-muted">Rating: ' + rating[j] + '</p><p class="small text-muted">Rated: ' + reviewDate[j] + '</p><br><p class="small">' + reviewText[j] + '</p><hr></li>');
            }
            $('#review-area').html(reviewContainer).show();
            $('#review-header').removeClass('text-muted').addClass('text-pink').html('Recent reviews from &nbsp <a style="color:white" href="http://www.zomato.com">Zomato</a>' + '<br><h4>' + name + '</h4><hr>');

            // Response is successful, do not display error message
            clearTimeout(zomatoRequestTimeout);
        });

        // But if there're any problem in the AJAX call process, inform the user after 8 seconds.
        var zomatoRequestTimeout = setTimeout(function() {
            infoBox.addClass('text-center').text('Unable to load Zomato reviews');
        }, 8000);
    };

    // Initialize Knockout View Model
    ko.applyBindings(new ViewModel());
})();
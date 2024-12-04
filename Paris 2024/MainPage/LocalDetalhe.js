var NameMap = ko.observable('');

var vm = function () {
    var self = this;
    console.log("ViewModel initiated...");

    //--- Variáveis locais
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/venues/');
    self.displayName = 'venues Details';
    self.Photo = ko.observable('');
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.URL = ko.observable('');
    self.Sports = ko.observable('');
    self.DateStart = ko.observable('');
    self.DateEnd = ko.observable('');
    self.Tag = ko.observable('');

    self.records = ko.observableArray([]);
    self.map = null;
    self.route = [];
    self.bounds = [];

    self.activate = function (id) {
        console.log('CALL: getvenues...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Photo(data.Photo);
            console.log(data.Photo);
            self.Id(data.Id);
            self.Name(data.Name);
            self.URL(data.URL);
            self.Sports(data.Sports);
            self.DateStart(data.DateStart);
            self.DateEnd(data.DateEnd);
            self.Tag(data.Tag);
            NameMap(data.Name);
            self.loadData();
        });
    };

    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call [" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function showLoading() {
        $('#myModal').modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').modal('hide');
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName;

        for (var i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }

    self.initMap = function () {
        self.map = L.map('map').setView([48.8566, 2.3522], 12); // Increased zoom level to 12

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(self.map);
    };

function addMarkerToMap(coords, name) {
    if (coords) {
        var marker = L.marker([coords.lat, coords.lng]).addTo(self.map)
            .bindPopup(name);
        self.map.setView([coords.lat, coords.lng], 15); // Define o zoom para 15
    } else {
        console.log(`Local não encontrado: ${name}`);
    }
}

    self.loadData = function () {
        var name = NameMap();
        console.log("Nome", name);

        getCoordinates(name, function (coords) {
            addMarkerToMap(coords, name);
        });
    };

    const OPENCAGE_API_KEY = '6320ddc3579b4ae288ed9bcf75570d8b';

function getCoordinates(venueName, callback) {
    var query = `${venueName}, Paris, FR`;
    var url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${OPENCAGE_API_KEY}`;
    $.ajax({
        url: url,
        success: function(data) {
            if (data.results.length > 0) {
                var coords = data.results[0].geometry;
                console.log("Coordinates found:", coords);
                callback(coords);
            } else {
                console.log("No coordinates found for:", venueName);
                callback(null);
            }
        },
        error: function() {
            console.log("Error fetching coordinates for:", venueName);
            callback(null);
        }
    });
}

    // --- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg === undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    var viewModel = new vm();
    ko.applyBindings(viewModel);
    viewModel.initMap();
});

$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});
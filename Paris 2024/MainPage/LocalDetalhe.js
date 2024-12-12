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
    self.Lat = ko.observable('');
    self.Lon = ko.observable('');
    self.records = ko.observableArray([]);
    self.map = null;

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
            self.Lat(data.Lat);
            console.log(data.Lat);
            self.Lon(data.Lon);
            console.log(data.Lon);
            self.addMarkerToMap(self.Lat(), self.Lon(), self.Name());
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
        self.map = L.map('map').setView([48.8566, 2.3522], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(self.map);
    };

    self.addMarkerToMap = function (lat, lon, name) {
        if (lat && lon) {
            var marker = L.marker([lat, lon]).addTo(self.map)
                .bindPopup(name);
            self.map.setView([lat, lon], 15);  // Isso serve para o zoom ficar a 15% das coordenadas que vem da API
        }
    };

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
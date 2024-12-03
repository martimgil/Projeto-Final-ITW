// ViewModel Knockout
var vm = function () {
    var self = this; // Definir `self` adequadamente
    console.log("ViewModel initiated...");

    //--- Variáveis locais
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Technical_officials/');
    self.displayName = 'Detalhes do Árbitro';
    self.Photo = ko.observable('');
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.BirthDate = ko.observable('');
    self.Category = ko.observable('');
    self.Function = ko.observable('');
    self.OrganisationCode = ko.observable('');
    self.Organisation = ko.observable('');
    self.OrganisationLong = ko.observable('');
    self.URL = ko.observable('');
    self.Sports = ko.observable('');



    self.activate = function (id) {
        console.log('CALL: getTechnical_official...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Photo(data.Photo);
            console.log(data.Photo);
            self.Id(data.Id);
            self.Name(data.Name);
            self.Sex(data.Sex);
            self.BirthDate(new Date(data.BirthDate).toLocaleDateString());
            self.Category(data.Category);
            self.Function(data.Function);
            self.OrganisationCode(data.OrganisationCode);
            self.Organisation(data.Organisation);
            self.OrganisationLong(data.OrganisationLong);
            self.URL(data.URL);
            self.Sports(data.Sports);
            console.log(("Sports"), data.Sports);
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
    function Competitions () {


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
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});
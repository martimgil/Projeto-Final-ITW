// ViewModel Knockout
var vm = function () {
    var self = this;
    console.log("ViewModel initiated...");

    //--- Variáveis locais
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Teams/');
    self.displayName = 'Teams Details';
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.Num_athletes = ko.observable('');
    self.Num_coaches = ko.observable('');
    self.Teams = ko.observableArray([]);
    self.Coaches = ko.observableArray([]);
    self.NOC = ko.observableArray([]);
    self.Sport = ko.observableArray([]);
    self.Medals = ko.observableArray([]);
    self.activate = function (id) {
        console.log('CALL: getTeam...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Id(data.Id);
            self.Name(data.Name);
            self.Sex(data.Sex);
            self.Num_athletes(data.Num_athletes);
            self.Num_coaches(data.Num_coaches);
            self.Teams(data.Teams);
            self.Coaches(data.Coaches);
            self.NOC(data.NOC);
            self.Sport(data.Sport);
            self.Medals(data.Medals);

        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("AJAX Call [" + composedUri + "] Fail...");
            self.error(errorThrown);
        }).always(function () {
            hideLoading(); // Ensure hideLoading is called after the AJAX call completes
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
var vm = function () {
    console.log('ViewModel initiated...');
    //--- Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/CountryMedals?Countries=200&Order=4');
    self.displayName = 'Medalheiro';
    self.records = ko.observableArray([]);
    self.error = ko.observable('');
    self.CountryCode = ko.observable('');
    self.CountryName = ko.observable('');
    self.GoldMedal = ko.observable('');
    self.SilverMedal = ko.observable('');
    self.BronzeMedal = ko.observable('');
    self.Total = ko.observable('');

    //--- Page Events
    self.activate = function () {
        console.log('CALL: getMedals...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            if (Array.isArray(data)) {
                // Supondo que data é uma lista de objetos
                self.records(data);
            } else {
                self.CountryCode(data.CountryCode);
                self.CountryName(data.CountryName);
                self.GoldMedal(data.GoldMedal);
                self.SilverMedal(data.SilverMedal);
                self.BronzeMedal(data.BronzeMedal);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            self.error("AJAX Call[" + composedUri + "] Fail...");
        });
    };

    //--- start ....
    self.activate();
    console.log("VM initialized!");
};

function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX Call[" + uri + "] Fail...");
        }
    });
}

$(document).ready(function () {
    console.log("ready!");
    if (!ko.dataFor(document.body)) {
        ko.applyBindings(new vm());
    }
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});
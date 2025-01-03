var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/CountryMedals?Countries=5');
    self.displayName = 'Medalheiro - Top 5';
    self.records = ko.observableArray([]);
    self.error = ko.observable('');
    self.CountryCode = ko.observable('');
    self.CountryName = ko.observable('');
    self.GoldMedal = ko.observable('');
    self.SilverMedal = ko.observable('');
    self.BronzeMedal = ko.observable('');
    self.Total = ko.observable('');

    self.activate = function () {
        console.log('CALL: getMedals...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            if (Array.isArray(data)) {
                self.records(data);
                createChart(data);
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

    self.activate();
    console.log("VM initialized!");
};

function createChart(data) {
    var ctx = document.getElementById('medalChart').getContext('2d');
    var countries = data.map(item => item.CountryName);
    var goldMedals = data.map(item => item.GoldMedal);
    var silverMedals = data.map(item => item.SilverMedal);
    var bronzeMedals = data.map(item => item.BronzeMedal);

    var medalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countries,
            datasets: [
                {
                    label: 'Gold Medals',
                    data: goldMedals,
                    backgroundColor: 'rgba(255, 215, 0, 0.6)',
                    borderColor: 'rgba(255, 215, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Silver Medals',
                    data: silverMedals,
                    backgroundColor: 'rgba(192, 192, 192, 0.6)',
                    borderColor: 'rgba(192, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Bronze Medals',
                    data: bronzeMedals,
                    backgroundColor: 'rgba(205, 127, 50, 0.6)',
                    borderColor: 'rgba(205, 127, 50, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

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
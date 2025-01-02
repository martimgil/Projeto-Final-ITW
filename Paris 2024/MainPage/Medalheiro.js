var chartInstance;

var ChartViewModel = function () {
    console.log('ChartViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/CountryMedals?Countries=200&Order=4');
    self.records = ko.observableArray([]);
    self.error = ko.observable('');

    self.activate = function () {
        console.log('CALL: getMedals...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            if (Array.isArray(data)) {
                self.records(data);
                createChart(data);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            self.error("AJAX Call[" + composedUri + "] Fail...");
        });
    };

    self.favoriteNOCs = function (id, event) {
        let favNOCs = JSON.parse(window.localStorage.getItem('favNOCs')) || [];
        let button = event.target.closest('button');
        if (!favNOCs.includes(id)) {
            favNOCs.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favNOCs = favNOCs.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favNOCs')));
    };

    self.activate();
    console.log("ChartViewModel initialized!");
};



function createChart(data) {
    var ctx = document.getElementById('medalChart').getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }
    var countries = data.map(item => item.CountryName);
    var goldMedals = data.map(item => item.GoldMedal);
    var silverMedals = data.map(item => item.SilverMedal);
    var bronzeMedals = data.map(item => item.BronzeMedal);

    chartInstance = new Chart(ctx, {
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
        ko.applyBindings(new ChartViewModel(), document.getElementById('medalChart'));
    }
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});
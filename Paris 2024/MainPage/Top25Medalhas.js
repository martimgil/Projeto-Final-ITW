var vm = function () {
    console.log('ViewModel initiated...');
    //--- Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Medals/Top25');
    self.displayName = 'TOP 25 Atletas';
    self.records = ko.observableArray([]);
    self.error = ko.observable('');
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Medals = ko.observable('');
    self.Gold = ko.observable('');
    self.Silver = ko.observable('');
    self.Bronze = ko.observable('');

    //--- Page Events
    self.activate = function () {
        console.log('CALL: getMedals...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            if (Array.isArray(data)) {
                // Supondo que data é uma lista de objetos
                self.records(data);
                createChart(data); // Adicione esta linha para criar o gráfico
            } else {
                self.Id(data.Id);
                self.Name(data.Name);
                self.Medals(data.Medals);
                self.Gold(data.Gold);
                self.Silver(data.Silver);
                self.Bronze(data.Bronze);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            self.error("AJAX Call[" + composedUri + "] Fail...");
        });
    };

    //--- start ....
    self.activate();
    console.log("VM initialized!");
};

var medalChart; // Variável global para armazenar o gráfico

function createChart(data) {
    var ctx = document.getElementById('medalChart').getContext('2d');
    var name = data.map(item => item.Name);
    var goldMedals = data.map(item => item.Gold);
    var silverMedals = data.map(item => item.Silver);
    var bronzeMedals = data.map(item => item.Bronze);
    var totalMedals = data.map(item => item.Medals);

    // Destruir o gráfico existente, se houver
    if (medalChart) {
        medalChart.destroy();
    }

    medalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: name,
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
                },
                {
                    label: 'Total Medals',
                    data: totalMedals,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y', // Configura o gráfico para ser horizontal
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        },
                        stepSize: 1
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}

function updateChart() {
    var goldCheckbox = document.getElementById('goldCheckbox').checked;
    var silverCheckbox = document.getElementById('silverCheckbox').checked;
    var bronzeCheckbox = document.getElementById('bronzeCheckbox').checked;
    var totalCheckbox = document.getElementById('totalCheckbox').checked;

    medalChart.data.datasets[0].hidden = !goldCheckbox;
    medalChart.data.datasets[1].hidden = !silverCheckbox;
    medalChart.data.datasets[2].hidden = !bronzeCheckbox;
    medalChart.data.datasets[3].hidden = !totalCheckbox;

    medalChart.update();
}

document.getElementById('goldCheckbox').addEventListener('change', updateChart);
document.getElementById('silverCheckbox').addEventListener('change', updateChart);
document.getElementById('bronzeCheckbox').addEventListener('change', updateChart);
document.getElementById('totalCheckbox').addEventListener('change', updateChart);
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
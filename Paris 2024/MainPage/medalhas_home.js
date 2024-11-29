var vm = function () {
    console.log('ViewModel initiated...');
    //--- Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/NOCs');
    self.displayName = 'Paris 2024 NOCs';
    self.records = ko.observableArray([]);

    //--- Page Events
    self.activate = function () {
        console.log('CALL: getNOCs...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);

            // Ordenar os países pelo total de medalhas
            let sortedData = data.NOCs.sort((a, b) => (b.Medals - a.Medals));

            // Obter Top 5
            let top5 = sortedData.slice(0, 5);

            // Verificar se Portugal está presente
            let portugal = sortedData.find(country => country.Country.toLowerCase() === "portugal");

            // Adicionar Portugal ao Top 5 se não estiver
            if (portugal && !top5.includes(portugal)) {
                top5.push(portugal);
            }

            // Atualizar os dados observáveis para exibição
            self.records(top5);
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

$('document').ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

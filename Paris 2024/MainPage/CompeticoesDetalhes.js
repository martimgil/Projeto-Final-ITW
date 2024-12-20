// ViewModel Knockout
var vm = function () {
    var self = this;
    console.log("ViewModel initiated...");

    //--- Variáveis locais
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Competitions/');
    self.displayName = 'Detalhes da Competição';
    self.CompInfo = ko.observableArray([]);
    self.CompInfo2 = ko.observableArray([]);
    self.SName = ko.observable('');


    self.activate = function (id) {
        console.log('CALL: getAthlete...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            hideLoading();

            self.CompInfo(data);

            var SportUri = 'http://192.168.160.58/Paris2024/api/Sports/' + data.SportId;
            ajaxHelper(SportUri, 'GET').done(function (data) {
                self.CompInfo().Sport = data.Name;
                self.CompInfo2(self.CompInfo());
            });
            console.log(self.CompInfo());
        });
    };

    function ajaxHelper(uri, method, data) {
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

    function getUrlParameters() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            params = {};

        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === 'sportId') {
                params.sportId = sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            } else if (sParameterName[0] === 'name') {
                params.name = sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }


        if (params.sportId && params.name) {
            return `?sportId=${params.sportId}&name=${params.name}`;
        }
    }

    // --- start ....
    showLoading();
    var pg = getUrlParameters();
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
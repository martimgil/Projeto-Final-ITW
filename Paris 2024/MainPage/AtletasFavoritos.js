var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Athletes');
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    //--- Page Events
    self.activate = function () {
        console.log('CALL: getAtletas...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            if (JSON.parse(window.localStorage.getItem('favAthletes')) == null) {
                self.records(null)
            } else {
                var AthletesList = [];
                var favAthletesList = JSON.parse(window.localStorage.getItem('favAthletes'));
                for (var i = 0; i < data.List.length; i++) {
                    for (var k = 0; k < favAthletesList.length; k++) {
                        if (favAthletesList[k] == data.List[i].Id) {
                            AthletesList.push(data.List[i])
                        }
                    }
                }
                self.records(AthletesList)
            }
            hideLoading();
        });
        console.log(self.records())
    };
    self.removeFavourite = function (id) {
        console.log(id)
        a = JSON.parse(window.localStorage.getItem('favAthletes'));
        console.log(a)
        if (a.length > 1) {
            for (i = 0; i < a.length; i++) {
                if (a[i] == id) {
                    a.splice(i, 1)
                    window.localStorage.setItem('favAthletes', JSON.stringify(a))
                    self.activate()
                } else if (a == null) {
                    window.localStorage.clear();
                    self.activate()
                }
            }
        } else {
            window.localStorage.clear()
            self.activate()
        }
    }
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error('');
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }



    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }

    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    $("#clearFavourites").click(function() {
        if (!(JSON.parse(window.localStorage.getItem('favAthlete')) == null)) {
            window.localStorage.clear()
            window.location.reload()
        } else {
            alert("Não tem favoritos para limpar!")
        }
    })
});
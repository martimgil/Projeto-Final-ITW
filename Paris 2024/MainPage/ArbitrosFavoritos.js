var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Technical_officials/');
    self.error = ko.observable('');
    self.records = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getFavouriteTechnical_officials...');
        var favTechnical_officialsList = JSON.parse(window.localStorage.getItem('favTechnical_officials')) || [];
        console.log("favoritos", favTechnical_officialsList);
        if (favTechnical_officialsList.length === 0) {
            self.records(null);
            hideLoading();
            return;
        }

        var requests = favTechnical_officialsList.map(function (id) {
            return ajaxHelper(self.baseUri() + id, 'GET');
        });

        Promise.all(requests).then(function (responses) {
            self.records(responses);
            console.log("respostas", responses);
            hideLoading();
        }).catch(function (error) {
            console.log("Failed to fetch athlete details", error);
            self.error(error);
            hideLoading();
        });
    };

    self.favoriteTechnical_official = function (id, event) {
        console.log(id);
        var favTechnical_officialsList = JSON.parse(window.localStorage.getItem('favTechnical_officials')) || [];
        if (!favTechnical_officialsList.includes(id)) {
            favTechnical_officialsList.push(id);
            window.localStorage.setItem('favTechnical_officials', JSON.stringify(favTechnical_officialsList));
        }
    };

    self.removeFavourite = function (id) {
        console.log(id);
        var favTechnical_officialsList = JSON.parse(window.localStorage.getItem('favTechnical_officials')) || [];
        var index = favTechnical_officialsList.indexOf(id);
        if (index > -1) {
            favTechnical_officialsList.splice(index, 1);
            window.localStorage.setItem('favTechnical_officials', JSON.stringify(favTechnical_officialsList));
            self.activate();
        }
    };

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
                self.error(errorThrown);
            }
        });
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').modal('hide');
    }

    showLoading();
    self.activate();
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    $("#clearFavourites").click(function() {
        if (JSON.parse(window.localStorage.getItem('favTechnical_officials'))) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            alert("Não tem favoritos para limpar!");
        }
    });
});
var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Teams/');
    self.error = ko.observable('');
    self.records = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getFavouriteTeams...');
        var favTeamsList = JSON.parse(window.localStorage.getItem('favTeams')) || [];
        console.log("favoritos", favTeamsList);
        if (favTeamsList.length === 0) {
            self.records(null);
            hideLoading();
            return;
        }

        var requests = favTeamsList.map(function (id) {
            return ajaxHelper(self.baseUri() + id, 'GET');
        });

        Promise.all(requests).then(function (responses) {
            self.records(responses);
            console.log("respostas", responses);
            hideLoading();
        }).catch(function (error) {
            console.log("Failed to fetch Team details", error);
            self.error(error);
            hideLoading();
        });
    };

    self.removeFavourite = function (id) {
        console.log(id);
        var favTeamsList = JSON.parse(window.localStorage.getItem('favTeams')) || [];
        var index = favTeamsList.indexOf(id);
        if (index > -1) {
            favTeamsList.splice(index, 1);
            window.localStorage.setItem('favTeams', JSON.stringify(favTeamsList));
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
        if (JSON.parse(window.localStorage.getItem('favTeams'))) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            alert("Não tem favoritos para limpar!");
        }
    });
});
var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Competitions/');
    self.error = ko.observable('');
    self.records = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getFavouriteCompetitions...');
        var favCompetitionsList = JSON.parse(window.localStorage.getItem('favCompetitions')) || [];
        console.log("favoritos", favCompetitionsList);
        if (favCompetitionsList.length === 0) {
            self.records(null);
            hideLoading();
            return;
        }

        var requests = favCompetitionsList.map(function (sportId, Name) {
            return ajaxHelper(self.baseUri() + '?sportId='+ sportId +'&name=' + Name, 'GET');
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

    self.removeFavourite = function (SportId, Name) {
        console.log(SportId, Name);
        var favCompetitionsList = JSON.parse(window.localStorage.getItem('favCompetitions')) || [];
        var index = favCompetitionsList.findIndex(item => item.id === SportId && item.Name === Name);
        if (index > -1) {
            favCompetitionsList.splice(index, 1);
            window.localStorage.setItem('favCompetitions', JSON.stringify(favCompetitionsList));
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
        if (JSON.parse(window.localStorage.getItem('favCompetitions'))) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            alert("Não tem favoritos para limpar!");
        }
    });
});
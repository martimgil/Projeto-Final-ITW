var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/athletes/');
    self.error = ko.observable('');
    self.records = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getFavouriteAthletes...');
        var favAthletesList = JSON.parse(window.localStorage.getItem('favAthletes')) || [];
        console.log("favoritos", favAthletesList);
        if (favAthletesList.length === 0) {
            self.records(null);
            hideLoading();
            return;
        }

        var requests = favAthletesList.map(function (id) {
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

    self.removeFavourite = function (id) {
        console.log(id);
        var favAthletesList = JSON.parse(window.localStorage.getItem('favAthletes')) || [];
        var index = favAthletesList.indexOf(id);
        if (index > -1) {
            favAthletesList.splice(index, 1);
            window.localStorage.setItem('favAthletes', JSON.stringify(favAthletesList));
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-PT', options);
}

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    $("#clearFavourites").click(function() {
        if (JSON.parse(window.localStorage.getItem('favAthletes'))) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            alert("Não tem favoritos para limpar!");
        }
    });
});
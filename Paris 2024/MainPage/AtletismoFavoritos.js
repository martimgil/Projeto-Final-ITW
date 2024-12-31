var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Athletics/');
    self.error = ko.observable('');
    self.records = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getFavouriteAthletics...');
        var favAthleticsList = JSON.parse(window.localStorage.getItem('favAthletics')) || [];
        console.log("favoritos", favAthleticsList);
        if (favAthleticsList.length === 0) {
            self.records(null);
            hideLoading();
            return;
        }

        var requests = favAthleticsList.map(function (id) {
            return ajaxHelper(self.baseUri() + id, 'GET');
        });

        Promise.all(requests).then(function (responses) {
            self.records(responses);
            console.log("respostas", responses);
            hideLoading();
        }).catch(function (error) {
            console.log("Failed to fetch Athletics details", error);
            self.error(error);
            hideLoading();
        });
    };

    self.removeFavourite = function (id) {
        console.log(id);
        var favAthleticsList = JSON.parse(window.localStorage.getItem('favAthletics')) || [];
        var index = favAthleticsList.indexOf(id);
        if (index > -1) {
            favAthleticsList.splice(index, 1);
            window.localStorage.setItem('favAthletics', JSON.stringify(favAthleticsList));
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
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    $("#clearFavourites").click(function() {
        if (JSON.parse(window.localStorage.getItem('favAthletics'))) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            alert("Não tem favoritos para limpar!");
        }
    });
});
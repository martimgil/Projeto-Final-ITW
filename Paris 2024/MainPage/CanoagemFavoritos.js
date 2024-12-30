var vm = function () {
    console.log('ViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Canoe_Sprints/');
    self.error = ko.observable('');
    self.records = ko.observableArray([]);

    self.activate = function () {
        console.log('CALL: getFavouriteCanoe_Sprints...');
        var favCanoe_SprintsList = JSON.parse(window.localStorage.getItem('favCanoe_Sprints')) || [];
        console.log("favoritos", favCanoe_SprintsList);
        if (favCanoe_SprintsList.length === 0) {
            self.records(null);
            hideLoading();
            return;
        }

        var requests = favCanoe_SprintsList.map(function (id) {
            return ajaxHelper(self.baseUri() + id, 'GET');
        });

        Promise.all(requests).then(function (responses) {
            self.records(responses);
            console.log("respostas", responses);
            hideLoading();
        }).catch(function (error) {
            console.log("Failed to fetch Canoe_Sprints details", error);
            self.error(error);
            hideLoading();
        });
    };

    self.removeFavourite = function (id) {
        console.log(id);
        var favCanoe_SprintsList = JSON.parse(window.localStorage.getItem('favCanoe_Sprints')) || [];
        var index = favCanoe_SprintsList.indexOf(id);
        if (index > -1) {
            favCanoe_SprintsList.splice(index, 1);
            window.localStorage.setItem('favCanoe_Sprints', JSON.stringify(favCanoe_SprintsList));
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
        if (JSON.parse(window.localStorage.getItem('favCanoe_Sprints'))) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            alert("Não tem favoritos para limpar!");
        }
    });
});
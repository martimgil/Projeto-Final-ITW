// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Technical_officials');
    self.displayName = 'Lista de Árbitros';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Technical_officials = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);

    self.search = function() {
        console.log('searching');
        if ($("#searchbar").val() === "") {
            showLoading();
            var pg = getUrlParameter('page');
            console.log(pg);
            if (pg == undefined)
                self.activate(1);
            else {
                self.activate(pg);
            }
        } else {
            var changeUrl = 'http://192.168.160.58/Paris2024/api/Search/Technical_officials?q=' + $("#searchbar").val();
            self.Technical_officials([]);
            ajaxHelper(changeUrl, 'GET').done(function (data) {
                console.log(data.length);
                if (data.length == 0) {
                    return alert('Não foram encontrados resultados');
                }
                self.totalPages(1);
                console.log(data);

                showLoading();
                self.Technical_officials(data);
                self.totalRecords(data.length);
                hideLoading();
            });
        }
    };

    self.favoriteTechnical_Official = function(id, event) {
        let favTechnical_officials = JSON.parse(window.localStorage.getItem('favTechnical_officials')) || [];
        if (!favTechnical_officials.includes(id)) {
            favTechnical_officials.push(id);
            window.localStorage.setItem('favTechnical_officials', JSON.stringify(favTechnical_officials));
            console.log('O arbitro foi adicionado aos favoritos!');
        } else {
            console.log('O arbitro já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favTechnical_officials')));
    };

    self.onEnter = function(d, e) {
        e.keyCode === 13 && self.search();
        return true;
    };

    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };

    //--- Page Events
self.activate = function (id) {
    console.log('CALL: getTechnical_officials...');
    var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
    console.log("composedUri=", composedUri);
    ajaxHelper(composedUri, 'GET').done(function (data) {
        console.log("Data", data);
        if (data.Technical_officials) {
            self.Technical_officials(data.Technical_officials);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize);
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalOfficials);
        } else {
            console.error("Technical_officials not found in response data");
        }
        hideLoading();
    });
};
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
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

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $("#myModal").modal('hide');
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
    }

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
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});
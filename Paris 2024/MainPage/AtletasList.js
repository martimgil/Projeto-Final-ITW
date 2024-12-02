// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/athletes');
    self.displayName = 'Lista de Atletas';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.athletes = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.search = function() {
        console.log('searching')
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
            var changeUrl = 'http://192.168.160.58/Paris2024/api/Search/Athletes?q=' + $("#searchbar").val();
            self.Athleteslist = [];
            ajaxHelper(changeUrl, 'GET').done(function (data) {
                console.log(data.length)
                if (data.length == 0) {
                    return alert('Não foram encontrados resultados')
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.athletes(data);
                self.totalRecords(data.length);
                hideLoading();
                for (var i in data) {
                    self.Athleteslist.push(data[i]);
                }
            });
        }
        ;
    };
    self.favoriteAthlete = function(id, event) {
        let favAthletes = JSON.parse(window.localStorage.getItem('favAthletes')) || [];
        if (!favAthletes.includes(id)) {
            favAthletes.push(id);
            window.localStorage.setItem('favAthletes', JSON.stringify(favAthletes));
            console.log('O atleta foi adicionado aos favoritos!');
        } else {
            console.log('O atleta já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favAthletes')));
    };
    self.onEnter = function(d, e) {
        e.keyCode === 13 && self.search()
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
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        console.log("composedUri=", composedUri);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log("Data", data);
            hideLoading();
            self.athletes(data.Athletes);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize);
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalAthletes);

            self.athletes().forEach(function (athlete) {
                self.getAthleteDetails(athlete.Id).done(function (details) {
                    Object.assign(athlete, details);
                });
            });
        });
    };
    self.getAtheleteDetails = function (id) {
        var detailUri = self.baseUri() + "/" + id;
        return ajaxHelper(detailUri, 'GET').done(function (data) {
            console.log("Athlete details:", data);
            return data;
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

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds) ;
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
        });
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
    self.search = function (){
        console.log("searching")
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
            var changeUrl = 'http://192.168.160.58/Paris2024/api/Search/Athletes?q=' + $("#searchbar").val();
            self.Athleteslist = [];
            ajaxHelper(changeUrl, 'GET').done(function(data) {
                console.log(data.length)
                if (data.length == 0) {
                    return alert('No results found')
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.records(data);
                self.totalRecords(data.length);
                hideLoading();
                for (var i in data) {
                    self.Athleteslist.push(data[i]);
                }
            });
        };
    };

            self.onEnter = function (d, e) {
                e.keyCode === 13&&self.search()
                    self.search();
            };
    $.ui.autocomplete.filter = function (array, term) {
        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
        return $.grep(array, function (value) {
            return matcher.test(value.label || value.value || value);
        });
    };

    $("#searchbar").autocomplete({
        source: function( request, response ) {
            $.ajax({
                url: "http://192.168.160.58/Paris2024/API/Players/Search?q=" + request.term,
                dataType: "json",
                success: function( data ) {
                    var playerNames = data.map(function(record) {
                        return record.Name;
                    });
                    var filteredNames = $.ui.autocomplete.filter(playerNames, request.term);
                    response( filteredNames );
                }
            });
        },
        minLength: 1,
        select: function( event, ui ) {
            log( "Selected: " + ui.item.value + " aka " + ui.item.id );
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    });
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

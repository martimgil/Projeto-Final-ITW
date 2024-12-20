// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/NOCs');
    self.displayName = 'Comités Olímpicos Nacionais';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.NOCs = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.NOCDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.NOCs2 = ko.observableArray([]);

    self.search = function () {
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
            var searchUrl = 'http://192.168.160.58/Paris2024/API/NOCs/Search?q=' + $("#searchbar").val();
            self.NOCs([]);
            ajaxHelper(searchUrl, 'GET').done(async function (data) {
                console.log(data);
                if (data.length == 0) {
                    hideLoading();
                    return alert("Não foram encontrados resultados");
                }
                self.totalPages(1);
                console.log(data);
                showLoading();
                self.NOCs(data);
                self.totalRecords(data.length);

                await fetchAllNOCDetails();



                self.NOCs2(self.NOCs());
                hideLoading();
            });
        }
    };
    self.favoriteNOC = function (id, event) {
        let favNOCs = JSON.parse(window.localStorage.getItem('favNOCs')) || [];
        if (!favNOCs.includes(id)) {
            favNOCs.push(id);
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            console.log('O Comité foi adicionado aos favoritos!');
        } else {
            console.log('O Comité já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favNOCs')));
    };
    self.onEnter = function (d, e){
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
        console.log('CALL: getNOCs...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.NOCs(data.NOCs);
            console.log("NOCs=", self.NOCs());
            self.currentPage(data.CurrentPage);
            console.log("currentPage=", self.currentPage());
            self.hasNext(data.HasNext);
            console.log("hasNext=", self.hasNext());
            self.hasPrevious(data.HasPrevious);
            console.log("hasPrevious=", self.hasPrevious());
            self.pagesize(data.PageSize);
            console.log("pagesize=", self.pagesize());
            self.totalPages(data.TotalPages);
            console.log("totalPages=", self.totalPages());
            console.log("length=", data.NOCs.length);
            self.totalRecords(data.TotalNOCs);
            console.log("totalRecords=", self.totalRecords());

            await fetchAllNOCDetails();
            self.NOCs2(self.NOCs());
            console.log("NOCs2", self.NOCs2());



        });
    };

    function getPhotoUrl(id){
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/NOCs/' + id;
        return ajaxHelper(detailsUrl, 'GET').done(function(data){
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchNOCDetails(NOC) {
        console.log("id", NOC.Id);
        const data = await getPhotoUrl(NOC.Id);
        console.log("detalhes", data);

        NOC.Photo = data.Photo || 'identidade/PersonNotFound.png';
        console.log("photo", NOC.Photo);
        NOC.Note = data.Note;
        console.log("note", NOC.Note);

        NOC.Athletes = data.Athletes ? data.Athletes.length : 0;
        console.log("athletes count", NOC.Athletes);
        NOC.Coaches = data.Coaches? data.Coaches.length : 0;
        console.log("coaches count", NOC.Coaches);
        NOC.Medals = data.Medals ? data.Medals.length : 0;
        console.log("medals count", NOC.Medals);
        NOC.Teams = data.Teams ? data.Teams.length : 0;
        console.log("teams count", NOC.Teams);
    }


    async function fetchAllNOCDetails() {
        for (const NOC of self.NOCs()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchNOCDetails(NOC); //Chama a outra assincrona
            await delay(100); // Intervalo de 100ms entre cada gajo
        }

        hideLoading();

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
            success: function (data) {
                console.log("AJAX Call[" + uri + "] Success...");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
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
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    $("#searchbar").autocomplete({
        minLength: 3,
        autoFill: true,
        source: function (request, response){
            $.ajax({
                type: 'GET',
                url: 'http://192.168.160.58/Paris2024/API/NOCs/Search?q=' + $("#searchbar").val(),
                success: function (data){
                    response($.map(data, function(item){
                        return item.Name;
                    }));
                },
                error: function(result){
                    alert(result.statusText);
                },
            });
        },
        select: function(e, ui){
            $.ajax({
                type: 'GET',
                url: 'http://192.168.160.58/Paris2024/API/NOCs/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'NOCDetalhe.html?id=' + data[0].Id;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});
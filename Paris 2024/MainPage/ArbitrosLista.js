// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Technical_officials');
    self.displayName = 'Árbitros';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Technical_officials = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.Technical_officialDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Technical_officials2 = ko.observableArray([]);
    self.Sex = ko.observable('');

    self.search = function () {
        console.log('searching');
        if ($("#searchbar").val() === ""){
            showLoading();
            var pg = getUrlParameter('page');
            console.log(pg);
            if(pg == undefined)
                self.activate(1);
            else{
                self.activate(pg);
            }
        } else {
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Technical_officials/Search?q=' + $("#searchbar").val();
            self.Technical_officialslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Technical_officials(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.Technical_officialslist.push(data[i]);
                }
                
                await fetchAllTechnical_officialDetails();
                
                self.Technical_officials2(self.Technical_officials());
                console.log("Technical_officials2", self.Technical_officials2());
                hideLoading()
                checkFavourite();
            });
        };
    };
    self.Erase = function (){
        //showLoading();
        $("#searchbar").val("");
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Technical_officials(data);
        });
    };
    
    self.favoriteTechnical_official = function (id, event) {
        let favTechnical_officials = JSON.parse(window.localStorage.getItem('favTechnical_officials')) || [];
        let button = event.target.closest('button');
        if (!favTechnical_officials.includes(id)) {
            favTechnical_officials.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favTechnical_officials', JSON.stringify(favTechnical_officials));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favTechnical_officials = favTechnical_officials.filter(favId => favId !== id);
            window.localStorage.setItem('favTechnical_officials', JSON.stringify(favTechnical_officials));
            console.log('O treinador já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favTechnical_officials')));
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

    function checkFavourite(){
        let favTechnical_officials = JSON.parse(window.localStorage.getItem('favTechnical_officials')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favTechnical_officials);
        let buttons = document.getElementsByClassName("fav-btn");
        for(let button of buttons){
            let Technical_officialId = parseInt(button.getAttribute("data-Technical_official-id"));
            if(favTechnical_officials.includes(Technical_officialId)){
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }


    self.activate = function (id) {
        console.log('CALL: getTechnical_officials...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.Technical_officials(data.Technical_officials);
            console.log("Technical_officials=", self.Technical_officials());
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
            self.totalRecords(data.TotalOfficials);
            console.log("totalRecords=", self.totalRecords());
            await fetchAllTechnical_officialDetails();
            self.Technical_officials2(self.Technical_officials());
            console.log("Technical_officials2", self.Technical_officials2());
            self.Sex(data.Sex);
            checkFavourite();

        });
        checkFavourite();
    };

    function getPhotoUrl(id){
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Technical_officials/' + id;
        return ajaxHelper(detailsUrl, 'GET').done(function(data){
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchTechnical_officialDetails(Technical_official) {
        console.log("id", Technical_official.Id);
        const data = await getPhotoUrl(Technical_official.Id);
        console.log("detalhes", data);
        Technical_official.Photo = data.Photo || 'identidade/PersonNotFound.png';
        console.log("photo", Technical_official.Photo);
        Technical_official.Country = data.Country;
        console.log("Country", Technical_official.Country);
        self.Photo = ko.observable(Technical_official.Photo);
        Technical_official.Organisation = data.Organisation;
        console.log("Organisation", Technical_official.Organisation);
        Technical_official.Function = data.Function;
        console.log("Function", Technical_official.Function);
        Technical_official.OrganisationLong = data.OrganisationLong;
        console.log("OrganisationLong", Technical_official.OrganisationLong);
        Technical_official.Sex = data.Sex
        self.Sex(data.Sex)

    }

    async function fetchAllTechnical_officialDetails() {
        for (const Technical_official of self.Technical_officials()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchTechnical_officialDetails(Technical_official); //Chama a outra assincrona
            await delay(100); // Intervalo de 500ms entre cada solicitação
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
        checkFavourite();
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
                url: 'http://192.168.160.58/Paris2024/API/Technical_officials/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Technical_officials/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'ArbitrosDetalhe.html?id=' + data[0].Id;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});
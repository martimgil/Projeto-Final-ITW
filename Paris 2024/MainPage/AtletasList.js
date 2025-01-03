// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Athletes');
    self.displayName = 'Atletas';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Athletes = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.AthleteDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Athletes2 = ko.observableArray([]);
    self.BirthDate = ko.observable('');
    self.Sex = ko.observable('');


    self.search =  function () {
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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Athletes/Search?q=' + $("#searchbar").val();
            self.Athleteslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Athletes(data);
                for(var i in data){
                    self.Athleteslist.push(data[i]);
                }


                await fetchAllAthleteDetails();

                self.Athletes2(self.Athletes());

                console.log("Athletes2", self.Athletes2());
                self.totalRecords(data.length);
                console.log("totalRecords updated to:", self.totalRecords());
                self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
                console.log("totalPages recalculated to:", self.totalPages());

                self.currentPage(1);
                hideLoading();
                checkFavourite();
            });
        };
    };
    self.Erase = function (){
        showLoading();
        $("#searchbar").val("");
        self.activate(1);
    };

    self.favoriteAthlete = function (id, event) {
        let favAthletes = JSON.parse(window.localStorage.getItem('favAthletes')) || [];
        let button = event.target.closest('.fav-btn');
        if (!favAthletes.includes(id)) {
            favAthletes.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favAthletes', JSON.stringify(favAthletes));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favAthletes = favAthletes.filter(item => item !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favAthletes', JSON.stringify(favAthletes));
            console.log('O treinador já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favAthletes')));
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
    function checkFavourite() {
        let favAthletes = JSON.parse(window.localStorage.getItem('favAthletes')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favAthletes);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let AthleteId = parseInt(button.getAttribute("data-Athlete-id"));
            if (favAthletes.includes(AthleteId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }
    
    
    self.activate = function (id) {
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.Athletes(data.Athletes);
            console.log("Athletes=", self.Athletes());
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
            self.totalRecords(data.TotalAhletes);
            console.log("totalRecords=", self.totalRecords());
            await fetchAllAthleteDetails();
            self.Athletes2(self.Athletes());
            console.log("Athletes2", self.Athletes2());
            checkFavourite();

        });
        checkFavourite();
    };

    function getPhotoUrl(id){
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Athletes/' + id;
        return ajaxHelper(detailsUrl, 'GET').done(function(data){
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchAthleteDetails(Athlete) {
        console.log("id", Athlete.Id);
        const data = await getPhotoUrl(Athlete.Id);
        console.log("detalhes", data);
        Athlete.Photo = data.Photo || 'identidade/PersonNotFound.png';
        console.log("photo", Athlete.Photo);
        Athlete.Country = data.Country;
        console.log("Country", Athlete.Country);
        self.Photo = ko.observable(Athlete.Photo);
        Athlete.Sports = data.Sports;
        console.log("Sport", Athlete.Sport);
        Athlete.Competitions = data.Competitions;
        console.log("Competitions", Athlete.Competitions);
        Athlete.BirthPlace = data.BirthPlace;
        console.log("BirthPlace", Athlete.BirthPlace);
        Athlete.BirthDate = data.BirthDate;
        self.BirthDate(data.BirthDate);
        Athlete.Sex = data.Sex
        self.Sex(data.Sex)
        console.log(self.Sex)

    }

    async function fetchAllAthleteDetails() {
        for (const Athlete of self.Athletes()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchAthleteDetails(Athlete); //Chama a outra assincrona
            await delay(1); // Intervalo de 500ms entre cada solicitação
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
                url: 'http://192.168.160.58/Paris2024/API/Athletes/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Athletes/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'Atleta.html?id=' + data[0].Id;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-PT', options);
}
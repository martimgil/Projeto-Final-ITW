// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Coaches');
    self.displayName = 'Treinadores';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.coaches = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.coachDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.coaches2 = ko.observableArray([]);
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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Coaches/Search?q=' + $("#searchbar").val();
            self.coacheslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.coaches(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.coacheslist.push(data[i]);
                }
                await fetchAllCoachDetails();
                self.coaches2(self.coaches());
                console.log("coaches2", self.coaches2());
                hideLoading();
                checkFavourite(); // Chame a função aqui após os dados serem renderizados
            });
        }
    };

    self.Erase = function (){
        showLoading();
        $("#searchbar").val("");
        self.activate(1);
    };


    self.favoriteCoach = function (id, event) {
        let favCoaches = JSON.parse(window.localStorage.getItem('favCoaches')) || [];
        let button = event.target.closest('button');
        if (!favCoaches.includes(id)) {
            favCoaches.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favCoaches', JSON.stringify(favCoaches));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favCoaches = favCoaches.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favCoaches', JSON.stringify(favCoaches));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favCoaches')));
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
        let favCoaches = JSON.parse(window.localStorage.getItem('favCoaches')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favCoaches);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let coachId = parseInt(button.getAttribute("data-coach-id"));
            if (favCoaches.includes(coachId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }

    self.activate = function (id) {
        console.log('CALL: getCoaches...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.coaches(data.Coaches);
            console.log("coaches=", self.coaches());
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
            self.totalRecords(data.TotalCoaches);
            console.log("totalRecords=", self.totalRecords());

            await fetchAllCoachDetails();
            self.coaches2(self.coaches());
            console.log("coaches2", self.coaches2());
            checkFavourite();
        });
        checkFavourite();
    };

    function getPhotoUrl(id){
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Coaches/' + id;
        return ajaxHelper(detailsUrl, 'GET').done(function(data){
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchCoachDetails(coach) {
        console.log("id", coach.Id);
        const data = await getPhotoUrl(coach.Id);
        console.log("detalhes", data);
        coach.Photo = data.Photo || 'identidade/PersonNotFound.png';
        console.log("photo", coach.Photo);
        coach.Country = data.Country;
        console.log("Country", coach.Country);
        self.Photo = ko.observable(coach.Photo);
        coach.Sports = data.Sports;
        console.log("Sports", coach.Sports);
        coach.Sex = data.Sex
        self.Sex(data.Sex)
        coach.Function = data.Function;
    }

    async function fetchAllCoachDetails() {
        for (const coach of self.coaches()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchCoachDetails(coach); //Chama a outra assincrona
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
                url: 'http://192.168.160.58/Paris2024/API/Coaches/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Coaches/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'TreinadorDetalhe.html?id=' + data[0].Id;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});
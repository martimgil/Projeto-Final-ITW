// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Athletics');
    self.displayName = 'Atletismo';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Athletics = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.AthleticsDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Athletics2 = ko.observableArray([]);
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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Athletics/Search?q=' + $("#searchbar").val();
            self.Athleticslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Athletics(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.Athleticslist.push(data[i]);
                }
                await fetchAllAthleticsDetails();
                self.Athletics2(self.Athletics());
                console.log("Athletics2", self.Athletics2());
                hideLoading();
                checkFavourite(); // Chame a função aqui após os dados serem renderizados
            });
        };
    };
    self.favoriteAthletics = function (id, event) {
        let favAthletics = JSON.parse(window.localStorage.getItem('favAthletics')) || [];
        let button = event.target.closest('button');
        if (!favAthletics.includes(id)) {
            favAthletics.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favAthletics', JSON.stringify(favAthletics));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favAthletics = favAthletics.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favAthletics', JSON.stringify(favAthletics));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favAthletics')));
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
        let favAthletics = JSON.parse(window.localStorage.getItem('favAthletics')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favAthletics);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let AthleticsId = parseInt(button.getAttribute("data-Athletics-id"));
            if (favAthletics.includes(AthleticsId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }

    self.activate = function (id) {
        console.log('CALL: getAthletics...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.Athletics(data.Athletics);
            console.log("Athletics=", self.Athletics());
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
            self.totalRecords(data.TotalAthletics);
            console.log("totalRecords=", self.totalRecords());

            await fetchAllAthleticsDetails();
            self.Athletics2(self.Athletics());
            console.log("Athletics2", self.Athletics2());
            checkFavourite();
        });
        checkFavourite();
    };

    function getPhotoUrl(id){
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Athletics/' + id;
        return ajaxHelper(detailsUrl, 'GET').done(function(data){
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchAthleticsDetails(Athletics) {
        console.log("id", Athletics.Id);
        const data = await getPhotoUrl(Athletics.Id);
        console.log("detalhes", data);
        Athletics.Photo = data.Photo || 'identidade/PersonNotFound.png';
        console.log("photo", Athletics.Photo);
        Athletics.Country = data.Country;
        console.log("Country", Athletics.Country);
        self.Photo = ko.observable(Athletics.Photo);
        Athletics.Sports = data.Sports;
        console.log("Sports", Athletics.Sports);
        Athletics.Sex = data.Sex
        self.Sex(data.Sex)
        Athletics.Function = data.Function;
    }

    async function fetchAllAthleticsDetails() {
        for (const Athletics of self.Athletics()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchAthleticsDetails(Athletics); //Chama a outra assincrona
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
                url: 'http://192.168.160.58/Paris2024/API/Athletics/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Athletics/Search?q=' + ui.item.label,
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
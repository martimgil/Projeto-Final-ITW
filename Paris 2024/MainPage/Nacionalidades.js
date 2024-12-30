// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/NOCs');
    self.displayName = 'Nacionalidades';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.NOCs = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.pagesize2 = ko.observable(2000);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.NOCDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.NOCs2 = ko.observableArray([]);
    self.Sports = ko.observableArray([]);
    self.Name = ko.observableArray([]);
    self.selectedItem = ko.observable();

    self.Dict = ko.observableArray([]);


    self.search = async function () {
        showLoading()
        console.log('searching');
        var search = $("#searchbar").val();
        const formattedSearch = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();
        if (search === "") {
            var pg = getUrlParameter('page');
            if (pg == undefined)
                self.activate(1);
            else {
                self.activate(pg);
            }
        } else {
            var searchUrl = self.baseUri() + '?page=' + self.currentPage() + '&pagesize=' + 224;
            ajaxHelper(searchUrl, 'GET').done(async function (data) {
                console.log(data);
                if (data.length == 0) {
                    alert("Não foram encontrados resultados");
                    return;
                }

                const filtered = data.NOCs.filter(NOC => NOC.Sport === formattedSearch);

                self.NOCs2(filtered);

                self.totalRecords(filtered.length);
                console.log("totalRecords updated to:", self.totalRecords());
                self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
                console.log("totalPages recalculated to:", self.totalPages());

                self.currentPage(1);
                hideLoading();
            });


        }
    };

    self.Erase = function (){
        self.selectedItem(null);
        $("#searchbar").val('');
        self.activate(1);
    }

    self.Select = async function () {
        const selected = self.selectedItem();

        if (!selected) {

            self.activate(1);
        }
        else{
            const filtered = self.Dict().filter(NOC => NOC.Sport === selected);
            self.NOCs2(filtered);

            self.totalRecords(filtered.length);
            console.log("totalRecords updated to:", self.totalRecords());
            self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
            console.log("totalPages recalculated to:", self.totalPages());

            self.currentPage(1);
            checkFavourite();
        }

    };
    self.favoriteNOC = function (Id, Name, event) {
        let favNOCs = JSON.parse(window.localStorage.getItem('favNOCs')) || [];
        let NOC = { Id: Id, name: Name };
        let button = event.target.closest('button');

        if (!favNOCs.some(comp => comp.Id === Id && comp.name === Name)) {
            favNOCs.push(NOC);
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            button.classList.add('active');
            console.log(`A competição ${Name} foi adicionada aos favoritos!`);
        } else {
            favNOCs = favNOCs.filter(comp => comp.Id !== Id || comp.name !== Name);
            button.classList.remove('active');
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            console.log(`A competição ${Name} já está na lista de favoritos.`);
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
    function checkFavourite() {
        let favNOCs = JSON.parse(window.localStorage.getItem('favNOCs')) || [];
        console.log("checkFavourite called");
        console.log("Favorite NOCs:", favNOCs);
        let buttons = document.getElementsByClassName('fav-btn');
        for (let button of buttons) {
            let Id = button.getAttribute("data-id");
            let name = button.getAttribute("data-name");
            console.log(`Checking button with Id=${Id}, Name=${name}`);
            if (Id === null || name === null) {
                console.warn(`Button has null Id or Name: Id=${Id}, Name=${name}`);
                continue;
            }
            if (favNOCs.some(comp => comp.Id === Id && comp.name === name)) {
                console.log(`NOC found in favorites: Id=${Id}, Name=${name}`);
                button.classList.add('active');
            } else {
                console.log(`NOC not found in favorites: Id=${Id}, Name=${name}`);
                button.classList.remove('active');
            }
        }
    }





    self.activate = function (id) {
        showLoading()
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
            self.totalRecords(data.TotalNOCs);
            console.log("totalRecords=", self.totalRecords());

            var composedUri = 'http://192.168.160.58/Paris2024/api/Sports';
            ajaxHelper(composedUri, 'GET').done(function (data) {
                self.Sports(data);
                for (const Name of self.Sports()){
                    self.Name.push(Name.Name)
                }
            });
            
            hideLoading();
            self.NOCs2(self.NOCs());
            console.log("NOCs2", self.NOCs2());
            checkFavourite();
        });

    };


    //--- Internal functions
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
});
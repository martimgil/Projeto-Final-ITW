// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Medals');
    self.displayName = 'Medalhas';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Medals = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.pagesize2 = ko.observable(2000);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.MedalDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Medals2 = ko.observableArray([]);
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
            var searchUrl = self.baseUri() + '?page=' + self.currentPage() + '&pagesize=' + 1044;
            ajaxHelper(searchUrl, 'GET').done(async function (data) {
                console.log(data);
                if (data.length == 0) {
                    alert("Não foram encontrados resultados");
                    return;
                }

                const filtered = data.Medals.filter(Medal => Medal.Sport === formattedSearch);

                self.Medals2(filtered);

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
            const filtered = self.Dict().filter(Medal => Medal.Sport === selected);
            self.Medals2(filtered);

            self.totalRecords(filtered.length);
            console.log("totalRecords updated to:", self.totalRecords());
            self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
            console.log("totalPages recalculated to:", self.totalPages());

            self.currentPage(1);
            checkFavourite();
        }

    };
    self.favoriteMedal = function (Id, Name, event) {
        let favMedals = JSON.parse(window.localStorage.getItem('favMedals')) || [];
        let Medal = { Id: Id, name: Name };
        let button = event.target.closest('button');

        if (!favMedals.some(comp => comp.Id === Id && comp.name === Name)) {
            favMedals.push(Medal);
            window.localStorage.setItem('favMedals', JSON.stringify(favMedals));
            button.classList.add('active');
            console.log(`A competição ${Name} foi adicionada aos favoritos!`);
        } else {
            favMedals = favMedals.filter(comp => comp.Id !== Id || comp.name !== Name);
            button.classList.remove('active');
            window.localStorage.setItem('favMedals', JSON.stringify(favMedals));
            console.log(`A competição ${Name} já está na lista de favoritos.`);
        }
        console.log(JSON.parse(window.localStorage.getItem('favMedals')));
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
        let favMedals = JSON.parse(window.localStorage.getItem('favMedals')) || [];
        console.log("checkFavourite called");
        console.log("Favorite Medals:", favMedals);
        let buttons = document.getElementsByClassName('fav-btn');
        for (let button of buttons) {
            let Id = button.getAttribute("data-id");
            let name = button.getAttribute("data-name");
            console.log(`Checking button with Id=${Id}, Name=${name}`);
            if (Id === null || name === null) {
                console.warn(`Button has null Id or Name: Id=${Id}, Name=${name}`);
                continue;
            }
            if (favMedals.some(comp => comp.Id === Id && comp.name === name)) {
                console.log(`Medal found in favorites: Id=${Id}, Name=${name}`);
                button.classList.add('active');
            } else {
                console.log(`Medal not found in favorites: Id=${Id}, Name=${name}`);
                button.classList.remove('active');
            }
        }
    }





    self.activate = function (id) {
        showLoading()
        console.log('CALL: getMedals...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.Medals(data.Medals);
            console.log("Medals=", self.Medals());
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
            self.totalRecords(data.TotalMedals);
            console.log("totalRecords=", self.totalRecords());

            var composedUri = 'http://192.168.160.58/Paris2024/api/Sports';
            ajaxHelper(composedUri, 'GET').done(function (data) {
                self.Sports(data);
                for (const Name of self.Sports()){
                    self.Name.push(Name.Name)
                }
            });


            await fetchAllAthleteDetails(); //For some reason, without this hideLoading doesn't happen when the page loads
            hideLoading();
            self.Medals2(self.Medals());
            console.log("Medals2", self.Medals2());
            checkFavourite();
        });

    };

    function getPhotoUrl(id) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/api/NOCs/' + id;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            return data; // Resolve with data if successful
        });
    }

    async function fetchAthleteDetails(Athlete) {
        try {
            const data = await getPhotoUrl(Athlete.CountryCode);
            Athlete.Country = data.Name;
        } catch (error) {
            Athlete.Country = "";
        }
    }

    async function fetchAllAthleteDetails() {
        for (const Athlete of self.Medals()) {
            await fetchAthleteDetails(Athlete);
            await delay(10);
        }

    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
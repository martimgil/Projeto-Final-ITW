// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Teams');
    self.displayName = 'Equipas';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Teams = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.pagesize2 = ko.observable(2000);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.CompetitionDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Teams2 = ko.observableArray([]);
    self.Sports = ko.observableArray([]);
    self.Name = ko.observableArray([]);
    self.selectedItem = ko.observable();

    self.Dict = ko.observableArray([]);


    self.search = async function () {
        showLoading()
        console.log('searching');
        var search = $("#searchbar").val();
        if (search === "") {
            var pg = getUrlParameter('page');
            if (pg == undefined)
                self.activate(1);
            else {
                self.activate(pg);
            }
        } else {
            var searchUrl = 'http://192.168.160.58/Paris2024/api/Teams/Search?q=' + search;
            var Sport = self.selectedItem();
            console.log(Sport);
            if(Sport !== undefined){
                ajaxHelper(searchUrl, 'GET').done(async function (data) {
                    console.log(data);
                    if (data.length == 0) {
                        alert("Não foram encontrados resultados");
                        return;
                    }
                    // Update Teams with search results
                    for (const Athlete of data) {
                        await fetchAthleteDetails(Athlete); // Fetch athlete-related details
                        await fetchCompDetails(Athlete); // Fetch competition-related details
                        await delay(1); // Optional delay between requests
                    }

                    const filtered = data.filter(Competition => Competition.Sport === Sport);

                    self.Teams2(filtered);

                    self.totalRecords(filtered.length);
                    console.log("totalRecords updated to:", self.totalRecords());
                    self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
                    console.log("totalPages recalculated to:", self.totalPages());

                    self.currentPage(1);
                    hideLoading();
                });
            }
            else{
                ajaxHelper(searchUrl, 'GET').done(async function (data) {
                    console.log(data);
                    if (data.length == 0) {
                        alert("Não foram encontrados resultados");
                        return;
                    }
                    // Update Teams with search results
                    for (const Athlete of data) {
                        await fetchCompDetails(Athlete); // Fetch competition-related details
                        await fetchAthleteDetails(Athlete); // Fetch athlete-related details
                        await delay(1); // Optional delay between requests
                    }

                    self.Teams2(data);

                    self.totalRecords(data.length);
                    console.log("totalRecords updated to:", self.totalRecords());
                    self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
                    console.log("totalPages recalculated to:", self.totalPages());

                    self.currentPage(1);
                    hideLoading();
                });
            }

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
            const filtered = self.Dict().filter(Competition => Competition.Sport === selected);
            self.Teams2(filtered);

            self.totalRecords(filtered.length);
            console.log("totalRecords updated to:", self.totalRecords());
            self.totalPages(Math.ceil(self.totalRecords() / self.pagesize()));
            console.log("totalPages recalculated to:", self.totalPages());

            self.currentPage(1);
        }

    };
    self.favoriteCompetition = function (Sport_Codes, Name, event) {
        let favTeams = JSON.parse(window.localStorage.getItem('favTeams')) || [];
        let competition = { Sport_Codes: Sport_Codes, name: Name };

        if (!favTeams.some(comp => comp.Sport_Codes === Sport_Codes && comp.name === Name)) {
            favTeams.push(competition);
            window.localStorage.setItem('favTeams', JSON.stringify(favTeams));
            console.log(`A competição ${Name} foi adicionada aos favoritos!`);
        } else {
            console.log(`A competição ${Name} já está na lista de favoritos.`);
        }
        console.log(JSON.parse(window.localStorage.getItem('favTeams')));
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
        showLoading()
        console.log('CALL: getTeams...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.Teams(data.Teams);
            console.log("Teams=", self.Teams());
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
            self.totalRecords(data.TotalTeams);
            console.log("totalRecords=", self.totalRecords());

            var composedUri = 'http://192.168.160.58/Paris2024/api/Sports';
            ajaxHelper(composedUri, 'GET').done(function (data) {
                self.Sports(data);
                for (const Name of self.Sports()){
                    self.Name.push(Name.Name)
                }
            });


            await fetchAllAthleteDetails();
            hideLoading();
            Dictionary(); //If Dictionary function starts before the page finishes loading may result in error 500
            self.Teams2(self.Teams());
            console.log("Teams2", self.Teams2());
        });

        async function Dictionary() {
            if (self.Dict().length === 0){
                var backUri = self.baseUri() + "?page=" + 1 + "&pageSize=" + self.pagesize2();
                await ajaxHelper(backUri, 'GET').done(async function (data) {
                    for (const Athlete of data.Teams) {
                        console.log('Processing Athlete:', Athlete);
                        // Fetch athlete and competition details in parallel
                        await Promise.all([
                            fetchAthleteDetails(Athlete),
                            fetchCompDetails(Athlete),
                            delay(100)
                        ]);

                        if(Athlete.AthleteNumber !== ""){
                            self.Dict.push(Athlete);

                        }
                    }

                    self.Dict(data.Teams);
                    console.log("Dictionary", self.Dict());
                });
            }
        }
    };

    function getPhotoUrl(id) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/api/Sports/' + id;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            return data; // Resolve with data if successful
        });
    }

    function getCompUrl(id) {
        var detailUri = 'http://192.168.160.58/Paris2024/api/Teams/' + encodeURIComponent(id);
        return ajaxHelper(detailUri, 'GET').then(function (data) {
            return data; // Resolve with data if successful
        });
    }

    async function fetchAthleteDetails(Athlete) {
        try {
            const data = await getPhotoUrl(Athlete.Sport_Codes);
            Athlete.Sport = data.Name;
        } catch (error) {
            Athlete.Sport = "";
        }
    }

    async function fetchCompDetails(Athlete) {
        try {
            const data = await getCompUrl(Athlete.Id);
            Athlete.AthleteNumber = data.Athletes.length;
            Athlete.Sex = data.Sex;
            Athlete.Country = data.NOC.Name;
            Athlete.Sport_Codes = data.Sport.Id;
        } catch (error) {
            Athlete.AthleteNumber = "";
        }
    }

    async function fetchAllAthleteDetails() {
        for (const Athlete of self.Teams()) {
            await fetchAthleteDetails(Athlete);
            await fetchCompDetails(Athlete);
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
                url: 'http://192.168.160.58/Paris2024/api/Teams/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/api/Teams/Search?q=' + ui.item.label,
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
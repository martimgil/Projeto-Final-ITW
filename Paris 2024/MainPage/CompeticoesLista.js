// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Competitions');
    self.displayName = 'Competições';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Competitions = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(2000);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.CompetitionDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Competitions2 = ko.observableArray([]);
    self.filteredCompetitions = ko.observableArray([]);
    self.filteredCompetitions2 = ko.observableArray([]);

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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Competitions/Search?q=' + $("#searchbar").val();
            self.Competitionslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Competitions(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.Competitionslist.push(data[i]);
                }
                await fetchAllCompetitionsDetails();
                self.Competitions2(self.Competitions());
                console.log("Competitions2", self.Competitions2());
                hideLoading();

            });
        };
    };
    self.Erase = function (){
        //showLoading();
        $("#searchbar").val("");
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Sports(data);
        });
    };


    self.favoriteCompetition = function (SportId, Name, event) {
        let favCompetitions = JSON.parse(window.localStorage.getItem('favCompetitions')) || [];
        let competition = { SportId: SportId, name: Name };

        if (!favCompetitions.some(comp => comp.SportId === SportId && comp.name === Name)) {
            favCompetitions.push(competition);
            window.localStorage.setItem('favCompetitions', JSON.stringify(favCompetitions));
            console.log(`A competição ${Name} foi adicionada aos favoritos!`);
        } else {
            console.log(`A competição ${Name} já está na lista de favoritos.`);
        }
        console.log(JSON.parse(window.localStorage.getItem('favCompetitions')));
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
        console.log('CALL: getCompetitions...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);

            self.Competitions(data.Competitions);
            console.log("Competitions=", self.Competitions());
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
            self.totalRecords(data.TotalCompetitions);
            console.log("totalRecords=", self.totalRecords());

            await fetchAllCompetitionsDetails2();

        });
    };

    self.filterByDisciplineCode = async function (){
        console.log("funçao foi chamada")
        const selectedCode = $('#disciplines_code').val();
        console.log("Selected Code", selectedCode);
        const filtered = self.Competitions().filter(Competition => Competition.SportId === selectedCode);
        self.filteredCompetitions(filtered);
        console.log("Filtered Competitions", filtered);
        await fetchAllCompetitionsDetails2();
        self.filteredCompetitions2(self.filteredCompetitions());

    };


    function getDetailsCompetitions(SportId, name) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Competitions?SportId=' + SportId +'&name=' + name;
        return ajaxHelper(detailsUrl, 'GET').done(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchAllCompetitionsDetails(Competition) {
        console.log("id", Competition.SportId);
        const data = await getDetailsCompetitions(Competition.SportId, Competition.Name);
        console.log("detalhes", data);
        Competition.SportId = data.SportId;
        console.log("SportId", Competition.SportId);
        Competition.Name = data.Name;
        console.log("Name", Competition.Name);
        Competition.Tag = data.Tag;
        console.log("Tag", Competition.Tag);
        Competition.Photo = data.Photo;
        console.log("Photo", Competition.Photo);

    }

    async function fetchAllCompetitionsDetails2() {
        for (const Competition of self.filteredCompetitions()) {
            await fetchAllCompetitionsDetails(Competition);
            await delay(100);
        }
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
                url: 'http://192.168.160.58/Paris2024/API/Competitions/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Competitions/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'CompeticoesDetalhe.html?SportId=' + data[0].SportId;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});
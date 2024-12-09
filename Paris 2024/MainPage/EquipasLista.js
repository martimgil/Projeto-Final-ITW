// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Teams');
    self.displayName = 'Equipas';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Teams = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(2000);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.TeamDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Teams2 = ko.observableArray([]);
    self.filteredTeams = ko.observableArray([]);

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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Teams/Search?q=' + $("#searchbar").val();
            self.Teamslist = [];
            ajaxHelper(chandeUrl, 'GET').done(function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Teams(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.Teamslist.push(data[i]);
                }
            });
        };
    };
    self.favoriteTeam = function (id, event) {
        let favTeams = JSON.parse(window.localStorage.getItem('favTeams')) || [];
        if (!favTeams.includes(id)) {
            favTeams.push(id);
            window.localStorage.setItem('favTeams', JSON.stringify(favTeams));
            console.log('O equipas foi adicionado aos favoritos!');
        } else {
            console.log('O equipas já está na lista de favoritos.');
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

            await fetchAllTeamsDetails2();

        });
    };

    self.filterByDisciplineCode = function (){
        console.log("funçao foi chamada")
        const selectedCode = $('#disciplines_code').val();
        console.log("Selected Code", selectedCode);
        const filtered = self.Teams().filter(team => team.Sport_Codes === selectedCode);
        self.filteredTeams(filtered);
        console.log("Filtered Teams", filtered);
    };


    function getDetailsTeams(id) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Teams/' + id;
        return ajaxHelper(detailsUrl, 'GET').done(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchAllTeamsDetails(Team) {
        console.log("id", Team.Id);
        const data = await getDetailsTeams(Team.Id);
        console.log("detalhes", data);
        Team.Num_athletes = data.Num_athletes;
        console.log("Num_athletes", Team.Num_athletes);
        Team.Num_coaches = data.Num_coaches;
        console.log("Num_coaches", Team.Num_coaches);
        Team.Sport = data.Sport.Name;
        console.log("Sport.Name", Team.Sport.Name);

    }

    async function fetchAllTeamsDetails2() {
        for (const team of self.Teams()) {
            await fetchAllTeamsDetails(team);
            await delay(500);
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
                url: 'http://192.168.160.58/Paris2024/API/Teams/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Teams/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'equipasDetalhe.html?id=' + data[0].Id;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});
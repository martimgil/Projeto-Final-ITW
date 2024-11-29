// ViewModel Knockout
var vm = function () {
    var self = this; // Definir `self` adequadamente
    console.log("ViewModel initiated...");

    //--- Variáveis locais
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/athletes/');
    self.displayName = 'Athlete Details';
    self.Photo = ko.observable('');
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.NameShort = ko.observable('');
    self.NameTV = ko.observable('');
    self.Sex = ko.observable('');
    self.BirthDate = ko.observable('');
    self.BirthPlace = ko.observable('');
    self.BirthCountry = ko.observable('');
    self.Nickname = ko.observable('');
    self.Residence_country = ko.observable('');
    self.Residence_place = ko.observable('');
    self.Occupation = ko.observable('');
    self.Lang = ko.observable('');
    self.Nationality_code = ko.observable('');
    self.RepresentsCountry = ko.observable('');
    self.Height = ko.observable('');
    self.Weight = ko.observable('');
    self.Coach = ko.observable('');
    self.Motivation = ko.observable('');
    self.Philosophy = ko.observable('');
    self.Hobbies = ko.observable('');
    self.Education = ko.observable('');
    self.Family = ko.observable('');
    self.Reason = ko.observable('');
    self.Hero = ko.observable('');
    self.Influence = ko.observable('');
    self.SportingRelatives = ko.observable('');
    self.Ritual = ko.observable('');
    self.OtherSports = ko.observable('');
    self.URL = ko.observable('');
    self.Sports = ko.observable('');
    self.Competitions = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Medals = ko.observableArray([]);
    self.Medal_Type = ko.observable('');
    self.Sport_name = ko.observable('');
    self.Competition_name = ko.observable('');
    self.Team_name= ko.observable('');
    self.Sports = ko.observable('');
    self.Competitions = ko.observable('');


    self.activate = function (id) {
        console.log('CALL: getAthlete...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Photo(data.Photo);
            console.log(data.Photo);
            self.Id(data.Id);
            self.Name(data.Name);
            self.NameShort(data.NameShort);
            self.NameTV(data.NameTV);
            self.Sex(data.Sex);
            self.BirthDate(new Date(data.BirthDate).toLocaleDateString());
            self.BirthPlace(data.BirthPlace);
            self.BirthCountry(data.BirthCountry);
            self.Nickname(data.Nickname);
            self.Residence_country(data.Residence_country);
            self.Residence_place(data.Residence_place);
            self.Occupation(data.Occupation);
            self.Lang(data.Lang);
            self.Nationality_code(data.Nationality_code);
            self.RepresentsCountry(data.RepresentsCountry);
            self.Height(data.Height);
            self.Weight(data.Weight);
            self.Coach(data.Coach);
            self.Motivation(data.Motivation);
            self.Philosophy(data.Philosophy);
            self.Hobbies(data.Hobbies);
            self.Education(data.Education);
            self.Family(data.Family);
            self.Reason(data.Reason);
            self.Hero(data.Hero);
            self.Influence(data.Influence);
            self.SportingRelatives(data.SportingRelatives);
            self.Ritual(data.Ritual);
            self.OtherSports(data.OtherSports);
            self.URL(data.URL);
            self.Sports(data.Sports);
            self.Photo(data.Photo);
            self.Medals(data.Medals);
            self.Sports(data.Sports);
            self.Competitions(data.Competitions);
        });
    };

    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call [" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function showLoading() {
        $('#myModal').modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').modal('hide');
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName;

        for (var i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }
    function Competitions () {


    }
    // --- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg === undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});
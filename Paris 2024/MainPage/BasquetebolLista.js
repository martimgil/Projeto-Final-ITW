// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Basketballs');
    self.displayName = 'Basquetebol';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Basketballs = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.BasketballsDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Basketballs2 = ko.observableArray([]);
    self.Sex = ko.observable('');
    self.Basketballs3 = ko.observableArray([]);
    self.Basketballs4 = ko.observableArray([]);
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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Basketballs/Search?q=' + $("#searchbar").val();
            self.Basketballslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Basketballs(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.Basketballslist.push(data[i]);
                }
                await fetchAllBasketballsDetails();
                self.Basketballs2(self.Basketballs());
                console.log("Basketballs2", self.Basketballs2());
            });
        };
    };
    self.favoriteBasketballs = function (id, event) {
        let favBasketballs = JSON.parse(window.localStorage.getItem('favBasketballs')) || [];
        if (!favBasketballs.includes(id)) {
            favBasketballs.push(id);
            window.localStorage.setItem('favBasketballs', JSON.stringify(favBasketballs));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            console.log('O treinador já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favBasketballs')));
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
        console.log('CALL: getBasketballs...');
        var composedUri = self.baseUri() + "/Events";
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log("data", data);
            var flattenedData = flattenBasketballsData(data);
            self.Basketballs(flattenedData);
            self.Basketballs2(flattenedData.slice());
            console.log("Basketballs=", self.Basketballs());
            console.log("Basketballs2", self.Basketballs2());
            populateEventSelect();
            populateStageSelect();
            await fetchAllBasketballsDetails();
            self.Basketballs3(self.Basketballs());
            console.log("Basketballs3", self.Basketballs3());
        });
    };

    function flattenBasketballsData(data) {
        var flattenedData = [];
        data.forEach(function (Basketballs) {
            Basketballs.Stages.forEach(function (stage) {
                var entry = {
                    EventId: Basketballs.EventId,
                    EventName: Basketballs.EventName,
                    StageId: stage.StageId,
                    StageName: stage.StageName
                };
                flattenedData.push(entry);
            });
        });
        return flattenedData;
    }

    function populateEventSelect() {
        var selectBox = document.getElementById('eventSelect');
        var eventIds = new Set();
        self.Basketballs().forEach(function (Basketballs) {
            if (!eventIds.has(Basketballs.EventId)) {
                eventIds.add(Basketballs.EventId);
                var option = document.createElement('option');
                option.value = Basketballs.EventId;
                option.text = Basketballs.EventName;
                selectBox.appendChild(option);
            }
        });
    }

    function populateStageSelect() {
        var selectBox = document.getElementById('stageSelect');
        var stageIds = new Set();
        self.Basketballs().forEach(function (Basketballs) {
            if (!stageIds.has(Basketballs.StageId)) {
                stageIds.add(Basketballs.StageId);
                var option = document.createElement('option');
                option.value = Basketballs.StageId;
                option.text = Basketballs.StageName;
                selectBox.appendChild(option);
            }
        });
    }

    function filterTableByEvent() {
        var selectedEventId = document.getElementById('eventSelect').value;
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>';

        if(selectedEventId == 0){
            self.Basketballs(self.Basketballs2());
        } else{
            var filteredBasketballs = self.Basketballs2().filter(function (Basketballs) {
                return Basketballs.EventId == selectedEventId;
            });
        }

        filteredBasketballs.forEach(function (Basketballs) {
            var option = document.createElement('option');
            option.value = Basketballs.StageId;
            option.text = Basketballs.StageName;
            selectBox.appendChild(option);
        });
        self.Basketballs(filteredBasketballs);
        console.log("Filtered Basketballs:", filteredBasketballs);
    }

    function filterTableByStage(){
        var selectedStageId = document.getElementById('stageSelect').value;
        var filteredBasketballs = self.Basketballs2().filter(function (Basketballs){
            return Basketballs.StageId == selectedStageId;
        });
        self.Basketballs(filteredBasketballs);
        console.log("Filtered Basketballs:", filteredBasketballs);
    }

    document.getElementById('eventSelect').addEventListener('change', function (){
        filterStagesByEvent();
        filterTableByEvent();
    });
    document.getElementById('stageSelect').addEventListener('change', filterTableByStage);



    function filterStagesByEvent() {
        var selectedEventId = document.getElementById('eventSelect').value;
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box

        var filteredStages = self.Basketballs2().filter(function (Basketballs) {
            return Basketballs.EventId == selectedEventId;
        });

        filteredStages.forEach(function (Basketballs) {
            var option = document.createElement('option');
            option.value = Basketballs.StageId;
            option.text = Basketballs.StageName;
            selectBox.appendChild(option);
        });
    }

    function getStages(EventId, StageId) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Basketballs?' + 'EventId=' + EventId + '&StageId=' + StageId;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function fetchBasketballsDetails(Basketballs) {
        const data = await getStages(Basketballs.EventId, Basketballs.StageId);
        data.forEach(participant => {
            console.log("esta a adicionar os detalhes para o gajo", participant);
            self.BasketballsDetails.push({
                EventId: Basketballs.EventId,
                EventName: Basketballs.EventName,
                StageId: Basketballs.StageId,
                StageName: Basketballs.StageName,
                ParticipantId: participant.Id,
                ParticipantName: participant.ParticipantName,
                CountryName: participant.CountryName,
                Sex: participant.Sex,
                ParticipantType: participant.ParticipantType,
        
            });
        });
    }

    
    async function fetchAllBasketballsDetails() {
        console.log("Fetching all basketballs details...");
        for (const Basketballs of self.Basketballs()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchBasketballsDetails(Basketballs); //Chama a outra assincrona
            await delay(0); 
        }
        console.log("a obter os detalhes do basketball...")
        self.Basketballs(self.BasketballsDetails());
        console.log("Finished fetching all basketballs details.");
        fetchAllParticipantsDetails(); // Chama a função para buscar detalhes dos participantes
    }
    
    async function fetchDetailsForParticipant(ParticipantId) {
        if (!ParticipantId) {
            console.error("Participant Id is undefined or null");
            return;
        }
        console.log(`Fetching details for participant with Id: ${ParticipantId}`);
        const detailsUrl = 'http://192.168.160.58/Paris2024/API/Basketballs/' + ParticipantId;
        const details = await ajaxHelper(detailsUrl, 'GET');
        console.log(`Details for participant ${ParticipantId}:`, details);
        updateTableWithDetails(ParticipantId, details);

    }
    
    function updateTableWithDetails(Id, details) {
        console.log(`Updating table with details for participant ${Id}`);
        var participant = self.BasketballsDetails().find(p => p.ParticipantId === Id);
        if (participant) {
            participant.ParticipantName = details.ParticipantName;
            participant.CountryName = details.CountryName;
            participant.Sex = details.Sex;
            participant.ParticipantType = details.ParticipantType;
            participant.NOCFlag = details.NOCFlag;
            participant.CountryFlag = details.CountryFlag;
            participant.Rank = details.Rank;
            participant.Result = details.Result;
            participant.ResultType = details.ResultType;
            participant.ResultIRM = details.ResultIRM;
            participant.ResultDiff = details.ResultDiff;
            participant.ResultWLT = details.ResultWLT;
            participant.QualificationMark = details.QualificationMark;
            participant.StartOrder = details.StartOrder;
            participant.Bib = details.Bib;
            // Adicione mais campos conforme necessário
            console.log(`Participant details updated:`, participant);
        } else {
            console.warn(`Participant with Id ${Id} not found`);
        }
    }

    async function fetchAllParticipantsDetails() {
        console.log("Fetching details for all participants...");
        const participants = self.BasketballsDetails();
        console.log("Participants details:", participants);
        for (const participant of participants) {
            if (!participant.ParticipantId) {
                console.error("Participant Id is undefined or null for participant:", participant);
                continue;
            }
            console.log(`Participant:`, participant);
            console.log(`Participant Id: ${participant.ParticipantId}`);
            await fetchDetailsForParticipant(participant.ParticipantId);
            await delay(0); 
        }
        self.Basketballs4(self.Basketballs3());
        console.log("Basketballs4", self.Basketballs4());
        console.log("Basketballs3", self.Basketballs3());
        console.log("Finished fetching details for all participants.");
        hideLoading();

    
    }
    
    
    async function fetchAllData() {
        showLoading();
        await fetchAllBasketballsDetails();
        await fetchAllParticipantsDetails();
    
    }
    
    fetchAllData();

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
                url: 'http://192.168.160.58/Paris2024/API/Basketballs/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Basketballs/Search?q=' + ui.item.label,
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
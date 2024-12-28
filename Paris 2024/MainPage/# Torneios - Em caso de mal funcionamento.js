// Ctrl+f, Escreve TORNEIO e substitui pelo nome do API

//Adicionar isto ao html depois do 1º <tbody>
/*
    <tbody data-bind="if: Canoe_Sprints4.length === 0" data-aos="fade-up">
    <tr>
      <td colspan="12" class="text-center">
        <h4>Escolhe um evento</h4>
      </td>
    </tr>
    </tbody>
*/

// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/TORNEIOs');
    self.displayName = 'TORNEIO';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.TORNEIOs = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.TORNEIOsDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.TORNEIOs2 = ko.observableArray([]);
    self.Sex = ko.observable('');
    self.TORNEIOs3 = ko.observableArray([]);
    self.TORNEIOs4 = ko.observableArray([]);
    self.EmptyArray = ko.observableArray([]);
    var initialTORNEIOs = [];

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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/TORNEIOs/Search?q=' + $("#searchbar").val();
            self.TORNEIOslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.TORNEIOs(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.TORNEIOslist.push(data[i]);
                }
                await fetchAllTORNEIOsDetails();
                self.TORNEIOs2(self.TORNEIOs());
                console.log("TORNEIOs2", self.TORNEIOs2());
            });
        };
    };
    self.favoriteTORNEIOs = function (id, event) {
        let favTORNEIOs = JSON.parse(window.localStorage.getItem('favTORNEIOs')) || [];
        if (!favTORNEIOs.includes(id)) {
            favTORNEIOs.push(id);
            window.localStorage.setItem('favTORNEIOs', JSON.stringify(favTORNEIOs));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            console.log('O treinador já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favTORNEIOs')));
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
        console.log('CALL: getTORNEIOs...');
        var composedUri = self.baseUri() + "/Events";
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log("data", data);
            var flattenedData = flattenTORNEIOsData(data);
            self.TORNEIOs(flattenedData);
            self.TORNEIOs2(flattenedData.slice());
            console.log("TORNEIOs=", self.TORNEIOs());
            console.log("TORNEIOs2", self.TORNEIOs2());
            populateEventSelect();
            populateStageSelect();
            await fetchAllTORNEIOsDetails();
            self.TORNEIOs3(self.TORNEIOs());
            console.log("TORNEIOs3", self.TORNEIOs3());


        });
    };




    function loadInitialTORNEIOs(){
        initialTORNEIOs = self.TORNEIOs3().slice();
        console.log("isso é o que ta ate ao momento", self.TORNEIOs3());
    }


    function flattenTORNEIOsData(data) {
        var flattenedData = [];
        data.forEach(function (TORNEIOs) {
            TORNEIOs.Stages.forEach(function (stage) {
                var entry = {
                    EventId: TORNEIOs.EventId,
                    EventName: TORNEIOs.EventName,
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
        var eventNames = new Set();
        self.TORNEIOs().forEach(function (TORNEIOs) {
            if (!eventNames.has(TORNEIOs.EventName)) {
                eventNames.add(TORNEIOs.EventName);
                var option = document.createElement('option');
                option.value = TORNEIOs.EventName;
                option.text = TORNEIOs.EventName;
                selectBox.appendChild(option);
            }
        });
        console.log("eventNames: ", eventNames)
    }
    function filterStagesByEvent() {
        console.log("a executar filterStagesBYEvent")
        var selectedEventName = document.getElementById('eventSelect').value;
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box

        var filteredStages = initialTORNEIOs.filter(function (TORNEIOs) {
            return TORNEIOs.EventName == selectedEventName;
        });

        var stageNames = new Set();
        filteredStages.forEach(function (TORNEIOs) {
            stageNames.add(TORNEIOs.StageName);
        });
        console.log("isso foi adicionado", stageNames)


        stageNames.forEach(function (stageName) {
            var option = document.createElement('option');
            console.log("esta a ser colocado esse: ", stageName)
            option.value = stageName;
            option.text = stageName;
            selectBox.appendChild(option);
        });

        filterTableByEventAndStage();
    }

    function filterTableByEventAndStage() {
        console.log("a executar filterTableByEventAndStage");
        var selectedEventName = document.getElementById('eventSelect').value;
        var selectedStageName = document.getElementById('stageSelect').value;
        console.log("o evento é esse", selectedEventName);
        console.log("o stage é esse: ", selectedStageName);
        console.log("eu tenho isso", initialTORNEIOs);

        var filteredTORNEIOs = initialTORNEIOs.filter(function (TORNEIOs) {
            var eventMatch = selectedEventName === "0" || TORNEIOs.EventName == selectedEventName;
            var stageMatch = selectedStageName === "0" || TORNEIOs.StageName == selectedStageName || selectedStageName === "0";
            return eventMatch && stageMatch;
        });

        console.log("Filtered TORNEIOs:", filteredTORNEIOs);
        if (filteredTORNEIOs.length === self.TORNEIOs3().length) {
            self.TORNEIOs4(self.EmptyArray());
        }
        else{
            self.TORNEIOs4(filteredTORNEIOs);
        }
    }

    document.getElementById('eventSelect').addEventListener('change', function () {
        filterStagesByEvent();
    });

    document.getElementById('stageSelect').addEventListener('change', function () {
        filterTableByEventAndStage();
    });
    function populateStageSelect() {
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = ''; // Clear existing options
        var stageNames = new Set();
        self.TORNEIOs().forEach(function (TORNEIOs) {
            if (!stageNames.has(TORNEIOs.StageName)) {
                stageNames.add(TORNEIOs.StageName);
                var option = document.createElement('option');
                option.value = TORNEIOs.StageName;
                option.text = TORNEIOs.StageName;
                selectBox.appendChild(option);
            }
        });
        console.log("stageNames", stageNames)
    }

    function filterTableByEvent() {
        console.log("a executar filterTableBYEvent");

        var selectedEventName = document.getElementById('eventSelect').value;
        var filteredTORNEIOs;

        if (selectedEventName == "0") {
            filteredTORNEIOs = initialTORNEIOs.slice(); // Restaurar a lista completa
        } else {
            filteredTORNEIOs = initialTORNEIOs.filter(function (TORNEIOs) {
                return TORNEIOs.EventName == selectedEventName;
            });
        }
        console.log("Filtered TORNEIOs:", filteredTORNEIOs);

        if (filteredTORNEIOs.length === self.TORNEIOs3().length) {
            self.TORNEIOs4(self.EmptyArray());
        }
        else{
            self.TORNEIOs4(filteredTORNEIOs);
        }

        // Atualizar o select de stage
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box

        var stageNames = new Set();
        filteredTORNEIOs.forEach(function (TORNEIOs) {
            stageNames.add(TORNEIOs.StageName);
        });

        stageNames.forEach(function (stageName) {
            var option = document.createElement('option');
            option.value = stageName;
            option.text = stageName;
            selectBox.appendChild(option);
        });

        console.log("stageNames atualizados:", stageNames);
    }

    function filterTableByStage(){
        var selectedStageName = document.getElementById('stageSelect').value;
        var filteredTORNEIOs = self.TORNEIOs4().filter(function (TORNEIOs){
            return TORNEIOs.StageName == selectedStageName;
        });
        self.TORNEIOs4(filteredTORNEIOs);
        console.log("Filtered TORNEIOs:", filteredTORNEIOs);
    }

    document.getElementById('eventSelect').addEventListener('change', function (){
        filterStagesByEvent();
        filterTableByEvent();
    });
    document.getElementById('stageSelect').addEventListener('change', filterTableByStage);

    function filterStagesByEvent() {
        var selectedEventName = document.getElementById('eventSelect').value;
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box

        var filteredStages = self.TORNEIOs4().filter(function (TORNEIOs) {
            return TORNEIOs.EventName == selectedEventName;
        });

        filteredStages.forEach(function (TORNEIOs) {
            var option = document.createElement('option');
            option.value = TORNEIOs.StageName;
            option.text = TORNEIOs.StageName;
            selectBox.appendChild(option);
        });
    }

    function getStages(EventId, StageId) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/TORNEIOs?' + 'EventId=' + EventId + '&StageId=' + StageId;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function fetchTORNEIOsDetails(TORNEIOs) {
        const data = await getStages(TORNEIOs.EventId, TORNEIOs.StageId);
        data.forEach(participant => {
            console.log("esta a adicionar os detalhes para o gajo", participant);
            self.TORNEIOsDetails.push({
                EventId: TORNEIOs.EventId,
                EventName: TORNEIOs.EventName,
                StageId: TORNEIOs.StageId,
                StageName: TORNEIOs.StageName,
                ParticipantId: participant.Id,
                ParticipantName: participant.ParticipantName,
                CountryName: participant.CountryName,
                Sex: participant.Sex,
                ParticipantType: participant.ParticipantType,

            });
        });
    }


    async function fetchAllTORNEIOsDetails() {
        console.log("Fetching all TORNEIOs details...");
        for (const TORNEIOs of self.TORNEIOs()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchTORNEIOsDetails(TORNEIOs); //Chama a outra assincrona
            await delay(0);
        }
        console.log("a obter os detalhes do TORNEIO...")
        self.TORNEIOs(self.TORNEIOsDetails());
        console.log("Finished fetching all TORNEIOs details.");
        fetchAllParticipantsDetails(); // Chama a função para buscar detalhes dos participantes
    }

    async function fetchDetailsForParticipant(ParticipantId) {
        if (!ParticipantId) {
            console.error("Participant Id is undefined or null");
            return;
        }
        console.log(`Fetching details for participant with Id: ${ParticipantId}`);
        const detailsUrl = 'http://192.168.160.58/Paris2024/API/TORNEIOs/' + ParticipantId;
        const details = await ajaxHelper(detailsUrl, 'GET');
        console.log(`Details for participant ${ParticipantId}:`, details);
        updateTableWithDetails(ParticipantId, details);

    }

    function updateTableWithDetails(Id, details) {
        console.log(`Updating table with details for participant ${Id}`);
        var participant = self.TORNEIOsDetails().find(p => p.ParticipantId === Id);
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
        const participants = self.TORNEIOsDetails();
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
        console.log("TORNEIOs4", self.TORNEIOs4());
        console.log("TORNEIOs3", self.TORNEIOs3());
        console.log("Finished fetching details for all participants.");
        loadInitialTORNEIOs();
        hideLoading();


    }


    async function fetchAllData() {
        showLoading();
        await fetchAllTORNEIOsDetails();
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
                url: 'http://192.168.160.58/Paris2024/API/TORNEIOs/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/TORNEIOs/Search?q=' + ui.item.label,
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
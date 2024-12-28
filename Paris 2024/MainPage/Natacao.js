// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Swimmings');
    self.displayName = 'Natação';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Swimmings = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.SwimmingsDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Swimmings2 = ko.observableArray([]);
    self.Sex = ko.observable('');
    self.Swimmings3 = ko.observableArray([]);
    self.Swimmings4 = ko.observableArray([]);
    var initialSwimmings = [];

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
            var chandeUrl = 'http://192.168.160.58/Paris2024/API/Swimmings/Search?q=' + $("#searchbar").val();
            self.Swimmingslist = [];
            ajaxHelper(chandeUrl, 'GET').done(async function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                self.totalPages(1)
                console.log(data);
                showLoading();
                self.Swimmings(data);
                self.totalRecords(data.length);
                for(var i in data){
                    self.Swimmingslist.push(data[i]);
                }
                await fetchAllSwimmingsDetails();
                self.Swimmings2(self.Swimmings());
                console.log("Swimmings2", self.Swimmings2());
            });
        };
    };
    self.favoriteSwimmings = function (id, event) {
        let favSwimmings = JSON.parse(window.localStorage.getItem('favSwimmings')) || [];
        if (!favSwimmings.includes(id)) {
            favSwimmings.push(id);
            window.localStorage.setItem('favSwimmings', JSON.stringify(favSwimmings));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            console.log('O treinador já está na lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favSwimmings')));
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
        console.log('CALL: getSwimmings...');
        var composedUri = self.baseUri() + "/Events";
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log("data", data);
            var flattenedData = flattenSwimmingsData(data);
            self.Swimmings(flattenedData);
            self.Swimmings2(flattenedData.slice());
            console.log("Swimmings=", self.Swimmings());
            console.log("Swimmings2", self.Swimmings2());
            populateEventSelect();
            populateStageSelect();
            await fetchAllSwimmingsDetails();
            self.Swimmings3(self.Swimmings());
            console.log("Swimmings3", self.Swimmings3());


        });
    };




    function loadInitialSwimmings(){
        initialSwimmings = self.Swimmings4().slice();
        console.log("isso é o que ta ate ao momento", self.Swimmings4());
    }


    function flattenSwimmingsData(data) {
        var flattenedData = [];
        data.forEach(function (Swimmings) {
            Swimmings.Stages.forEach(function (stage) {
                var entry = {
                    EventId: Swimmings.EventId,
                    EventName: Swimmings.EventName,
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
        self.Swimmings().forEach(function (Swimmings) {
            if (!eventNames.has(Swimmings.EventName)) {
                eventNames.add(Swimmings.EventName);
                var option = document.createElement('option');
                option.value = Swimmings.EventName;
                option.text = Swimmings.EventName;
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

        var filteredStages = initialSwimmings.filter(function (Swimmings) {
            return Swimmings.EventName == selectedEventName;
        });

        var stageNames = new Set();
        filteredStages.forEach(function (Swimmings) {
            stageNames.add(Swimmings.StageName);
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
        console.log("eu tenho isso", initialSwimmings);

        var filteredSwimmings = initialSwimmings.filter(function (Swimmings) {
            var eventMatch = selectedEventName === "0" || Swimmings.EventName == selectedEventName;
            var stageMatch = selectedStageName === "0" || Swimmings.StageName == selectedStageName || selectedStageName === "0";
            return eventMatch && stageMatch;
        });

        console.log("Filtered Swimmings:", filteredSwimmings);
        self.Swimmings4(filteredSwimmings);
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
        self.Swimmings().forEach(function (Swimmings) {
            if (!stageNames.has(Swimmings.StageName)) {
                stageNames.add(Swimmings.StageName);
                var option = document.createElement('option');
                option.value = Swimmings.StageName;
                option.text = Swimmings.StageName;
                selectBox.appendChild(option);
            }
        });
        console.log("stageNames", stageNames)
    }

    function filterTableByEvent() {
        console.log("a executar filterTableBYEvent");

        var selectedEventName = document.getElementById('eventSelect').value;
        var filteredSwimmings;

        if (selectedEventName == "0") {
            filteredSwimmings = initialSwimmings.slice(); // Restaurar a lista completa
        } else {
            filteredSwimmings = initialSwimmings.filter(function (Swimmings) {
                return Swimmings.EventName == selectedEventName;
            });
        }
        console.log("Filtered Swimmings:", filteredSwimmings);

        self.Swimmings4(filteredSwimmings);

        // Atualizar o select de stage
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box

        var stageNames = new Set();
        filteredSwimmings.forEach(function (Swimmings) {
            stageNames.add(Swimmings.StageName);
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
        var filteredSwimmings = self.Swimmings4().filter(function (Swimmings){
            return Swimmings.StageName == selectedStageName;
        });
        self.Swimmings4(filteredSwimmings);
        console.log("Filtered Swimmings:", filteredSwimmings);
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

        var filteredStages = self.Swimmings4().filter(function (Swimmings) {
            return Swimmings.EventName == selectedEventName;
        });

        filteredStages.forEach(function (Swimmings) {
            var option = document.createElement('option');
            option.value = Swimmings.StageName;
            option.text = Swimmings.StageName;
            selectBox.appendChild(option);
        });
    }

    function getStages(EventId, StageId) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Swimmings?' + 'EventId=' + EventId + '&StageId=' + StageId;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function fetchSwimmingsDetails(Swimmings) {
        const data = await getStages(Swimmings.EventId, Swimmings.StageId);
        data.forEach(participant => {
            console.log("esta a adicionar os detalhes para o gajo", participant);
            self.SwimmingsDetails.push({
                EventId: Swimmings.EventId,
                EventName: Swimmings.EventName,
                StageId: Swimmings.StageId,
                StageName: Swimmings.StageName,
                ParticipantId: participant.Id,
                ParticipantName: participant.ParticipantName,
                CountryName: participant.CountryName,
                Sex: participant.Sex,
                ParticipantType: participant.ParticipantType,

            });
        });
    }


    async function fetchAllSwimmingsDetails() {
        console.log("Fetching all Swimmings details...");
        for (const Swimmings of self.Swimmings()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchSwimmingsDetails(Swimmings); //Chama a outra assincrona
            await delay(0);
        }
        console.log("a obter os detalhes do Swimming...")
        self.Swimmings(self.SwimmingsDetails());
        console.log("Finished fetching all Swimmings details.");
        fetchAllParticipantsDetails(); // Chama a função para buscar detalhes dos participantes
    }

    async function fetchDetailsForParticipant(ParticipantId) {
        if (!ParticipantId) {
            console.error("Participant Id is undefined or null");
            return;
        }
        console.log(`Fetching details for participant with Id: ${ParticipantId}`);
        const detailsUrl = 'http://192.168.160.58/Paris2024/API/Swimmings/' + ParticipantId;
        const details = await ajaxHelper(detailsUrl, 'GET');
        console.log(`Details for participant ${ParticipantId}:`, details);
        updateTableWithDetails(ParticipantId, details);

    }

    function updateTableWithDetails(Id, details) {
        console.log(`Updating table with details for participant ${Id}`);
        var participant = self.SwimmingsDetails().find(p => p.ParticipantId === Id);
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
        const participants = self.SwimmingsDetails();
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
        self.Swimmings4(self.Swimmings3());
        console.log("Swimmings4", self.Swimmings4());
        console.log("Swimmings3", self.Swimmings3());
        console.log("Finished fetching details for all participants.");
        loadInitialSwimmings();
        hideLoading();


    }


    async function fetchAllData() {
        showLoading();
        await fetchAllSwimmingsDetails();
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
                url: 'http://192.168.160.58/Paris2024/API/Swimmings/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Swimmings/Search?q=' + ui.item.label,
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
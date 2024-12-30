// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Cycling_Tracks');
    self.displayName = 'Ciclismo';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Cycling_Tracks = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.Cycling_TracksDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Cycling_Tracks2 = ko.observableArray([]);
    self.Sex = ko.observable('');
    self.Cycling_Tracks3 = ko.observableArray([]);
    self.Cycling_Tracks4 = ko.observableArray([]);
    var initialCycling_Tracks = [];

    self.favoriteCycling_Tracks = function (id, event) {
        let favCycling_Tracks = JSON.parse(window.localStorage.getItem('favCycling_Tracks')) || [];
        let button = event.target.closest('button');
        if (!favCycling_Tracks.includes(id)) {
            favCycling_Tracks.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favCycling_Tracks', JSON.stringify(favCycling_Tracks));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favCycling_Tracks = favCycling_Tracks.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favCycling_Tracks', JSON.stringify(favCycling_Tracks));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favCycling_Tracks')));
    };

     // Função para calcular o número total de páginas
    self.totalPages = ko.computed(function () {
        return Math.ceil(self.Cycling_Tracks4().length / self.pagesize());
    });
    
    // Função para ir para uma página específica
    self.goToPage = function (page) {
        if (page >= 1 && page <= self.totalPages()) {
            self.currentPage(page);
        }
    };
    self.Cycling_Tracks4.subscribe(function (newValue) {
        self.totalRecords(newValue.length);
    });
    
    // Função para calcular a página anterior
    self.previousPage = ko.computed(function () {
        return self.currentPage() > 1 ? self.currentPage() - 1 : 1;
    });
    
    // Função para calcular a próxima página
    self.nextPage = ko.computed(function () {
        return self.currentPage() < self.totalPages() ? self.currentPage() + 1 : self.totalPages();
    });

    self.totalPages = ko.computed(function () {
        return Math.ceil(self.totalRecords() / self.pagesize());
    });
    

    
    // Função para calcular o array de páginas para exibição
    self.pageArray = ko.computed(function () {
        var pages = [];
        var totalPages = self.totalPages();
        var currentPage = self.currentPage();
        var startPage = Math.max(1, currentPage - 4);
        var endPage = Math.min(totalPages, currentPage + 4);
    
        // Ajuste para garantir que sempre mostre 9 páginas se possível
        if (endPage - startPage < 9) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 8);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, endPage - 8);
            }
        }
    
        for (var i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    });
    
    // Função para calcular os itens a serem exibidos com base na página atual
    self.paginatedCycling_Tracks = ko.computed(function () {
        var startIndex = (self.currentPage() - 1) * self.pagesize();
        var endIndex = startIndex + self.pagesize();
        return self.Cycling_Tracks4().slice(startIndex, endIndex);
    });
    // Função para calcular os registros exibidos
    self.fromRecord = ko.computed(function () {
        return (self.currentPage() - 1) * self.pagesize() + 1;
    });
    
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.Cycling_Tracks4().length);
    });

    self.onEnter = function (d, e){
        e.keyCode === 13 && self.search();
        return true;
    };
    

    //--- Page Events

    function checkFavourite() {
        let favCycling_Tracks = JSON.parse(window.localStorage.getItem('favCycling_Tracks')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favCycling_Tracks);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let Cycling_TracksId = parseInt(button.getAttribute("data-Cycling_Tracks-id"));
            if (favCycling_Tracks.includes(Cycling_TracksId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }


    self.activate = function (id) {
        console.log('CALL: getCycling_Tracks...');
        var composedUri = self.baseUri() + "/Events";
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log("data", data);
            var flattenedData = flattenCycling_TracksData(data);
            self.Cycling_Tracks(flattenedData);
            self.Cycling_Tracks2(flattenedData.slice());
            console.log("Cycling_Tracks=", self.Cycling_Tracks());
            console.log("Cycling_Tracks2", self.Cycling_Tracks2());
            populateEventSelect();
            populateStageSelect();
            await fetchAllCycling_TracksDetails();
            self.Cycling_Tracks3(self.Cycling_Tracks());
            console.log("Cycling_Tracks3", self.Cycling_Tracks3());
            checkFavourite();
            

        });
    };




    function loadInitialCycling_Tracks(){
        initialCycling_Tracks = self.Cycling_Tracks4().slice();
        console.log("isso é o que ta ate ao momento", self.Cycling_Tracks4());
        checkFavourite();
    }


    function flattenCycling_TracksData(data) {
        var flattenedData = [];
        data.forEach(function (Cycling_Tracks) {
            Cycling_Tracks.Stages.forEach(function (stage) {
                var entry = {
                    EventId: Cycling_Tracks.EventId,
                    EventName: Cycling_Tracks.EventName,
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
        self.Cycling_Tracks().forEach(function (Cycling_Tracks) {
            if (!eventNames.has(Cycling_Tracks.EventName)) {
                eventNames.add(Cycling_Tracks.EventName);
                var option = document.createElement('option');
                option.value = Cycling_Tracks.EventName;
                option.text = Cycling_Tracks.EventName;
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
    
        var filteredStages = initialCycling_Tracks.filter(function (Cycling_Tracks) {
            return Cycling_Tracks.EventName == selectedEventName;
        });
    
        var stageNames = new Set();
        filteredStages.forEach(function (Cycling_Tracks) {
            stageNames.add(Cycling_Tracks.StageName);
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
        checkFavourite();
    }
    
    function filterTableByEventAndStage() {
        console.log("a executar filterTableByEventAndStage");
    
        // Obtém os valores dos filtros
        var selectedEventName = document.getElementById('eventSelect').value;
        var selectedStageName = document.getElementById('stageSelect').value;
    
        console.log("Evento selecionado:", selectedEventName);
        console.log("Fase selecionada:", selectedStageName);
        console.log("Lista inicial de Ciclismo:", initialCycling_Tracks);
    
        // Atualiza a lista com base nos filtros
        var filteredCycling_Tracks = initialCycling_Tracks.filter(function (Cycling_Tracks) {
            var eventMatch = selectedEventName === "0" || Cycling_Tracks.EventName === selectedEventName;
            var stageMatch = selectedStageName === "0" || Cycling_Tracks.StageName === selectedStageName;
            return eventMatch && stageMatch;
        });
    
        console.log("Ciclismo filtrado:", filteredCycling_Tracks);
    
        // Atualiza a tabela observável (Knockout.js)
        self.Cycling_Tracks4(filteredCycling_Tracks);
        checkFavourite();
    }
    document.getElementById('eventSelect').addEventListener('change', function () {
        filterStagesByEvent();
    });
    
    document.getElementById('stageSelect').addEventListener('change', function () {
        filterTableByEventAndStage();
    });
    function populateStageSelect() {
        var selectBox = document.getElementById('stageSelect');
        var stageNames = new Set();
        self.Cycling_Tracks().forEach(function (Cycling_Tracks) {
            if (!stageNames.has(Cycling_Tracks.StageName)) {
                stageNames.add(Cycling_Tracks.StageName);
                var option = document.createElement('option');
                option.value = Cycling_Tracks.StageName;
                option.text = Cycling_Tracks.StageName;
                selectBox.appendChild(option);
            }
        });
        console.log("stageNames", stageNames)
    }

    function filterTableByEvent() {
        console.log("a executar filterTableBYEvent");
    
        var selectedEventName = document.getElementById('eventSelect').value;
        var filteredCycling_Tracks;
    
        if (selectedEventName == "0") {
            filteredCycling_Tracks = initialCycling_Tracks.slice(); // Restaurar a lista completa
        } else {
            filteredCycling_Tracks = initialCycling_Tracks.filter(function (Cycling_Tracks) {
                return Cycling_Tracks.EventName == selectedEventName;
            });
        }
        console.log("Filtered Cycling_Tracks:", filteredCycling_Tracks);
    
        self.Cycling_Tracks4(filteredCycling_Tracks);
    
        // Atualizar o select de stage
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box
    
        var stageNames = new Set();
        filteredCycling_Tracks.forEach(function (Cycling_Tracks) {
            stageNames.add(Cycling_Tracks.StageName);
        });
    
        stageNames.forEach(function (stageName) {
            var option = document.createElement('option');
            option.value = stageName;
            option.text = stageName;
            selectBox.appendChild(option);
        });
    
        console.log("stageNames atualizados:", stageNames);
        checkFavourite();
    }

    function filterTableByStage(){
        var selectedStageName = document.getElementById('stageSelect').value;
        var filteredCycling_Tracks = self.Cycling_Tracks4().filter(function (Cycling_Tracks){
            return Cycling_Tracks.StageName == selectedStageName;
        });
        self.Cycling_Tracks4(filteredCycling_Tracks);
        console.log("Filtered Cycling_Tracks:", filteredCycling_Tracks);
        checkFavourite();
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

        var filteredStages = self.Cycling_Tracks4().filter(function (Cycling_Tracks) {
            return Cycling_Tracks.EventName == selectedEventName;
        });

        filteredStages.forEach(function (Cycling_Tracks) {
            var option = document.createElement('option');
            option.value = Cycling_Tracks.StageName;
            option.text = Cycling_Tracks.StageName;
            selectBox.appendChild(option);
            
        });
        checkFavourite();
    }

    function getStages(EventId, StageId) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Cycling_Tracks?' + 'EventId=' + EventId + '&StageId=' + StageId;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function fetchCycling_TracksDetails(Cycling_Tracks) {
        const data = await getStages(Cycling_Tracks.EventId, Cycling_Tracks.StageId);
        data.forEach(participant => {
            console.log("esta a adicionar os detalhes para o gajo", participant);
            self.Cycling_TracksDetails.push({
                EventId: Cycling_Tracks.EventId,
                EventName: Cycling_Tracks.EventName,
                StageId: Cycling_Tracks.StageId,
                StageName: Cycling_Tracks.StageName,
                ParticipantId: participant.Id,
                ParticipantName: participant.ParticipantName,
                CountryName: participant.CountryName,
                Sex: participant.Sex,
                ParticipantType: participant.ParticipantType,
                Id : participant.Id
        
            });
        });
    }

    
    async function fetchAllCycling_TracksDetails() {
        console.log("Fetching all Cycling_Tracks details...");
        for (const Cycling_Tracks of self.Cycling_Tracks()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchCycling_TracksDetails(Cycling_Tracks); //Chama a outra assincrona
            await delay(0); 
        }
        console.log("a obter os detalhes do basketball...")
        self.Cycling_Tracks(self.Cycling_TracksDetails());
        console.log("Finished fetching all Cycling_Tracks details.");
        fetchAllParticipantsDetails(); // Chama a função para buscar detalhes dos participantes
    }
    
    async function fetchDetailsForParticipant(ParticipantId) {
        if (!ParticipantId) {
            console.error("Participant Id is undefined or null");
            return;
        }
        console.log(`Fetching details for participant with Id: ${ParticipantId}`);
        const detailsUrl = 'http://192.168.160.58/Paris2024/API/Cycling_Tracks/' + ParticipantId;
        const details = await ajaxHelper(detailsUrl, 'GET');
        console.log(`Details for participant ${ParticipantId}:`, details);
        updateTableWithDetails(ParticipantId, details);

    }
    
    function updateTableWithDetails(Id, details) {
        console.log(`Updating table with details for participant ${Id}`);
        var participant = self.Cycling_TracksDetails().find(p => p.ParticipantId === Id);
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
            participant.Date = details.Date;
            participant.Venue = details.Venue;
            // Adicione mais campos conforme necessário
            console.log(`Participant details updated:`, participant);
        } else {
            console.warn(`Participant with Id ${Id} not found`);
        }
    }

    async function fetchAllParticipantsDetails() {
        console.log("Fetching details for all participants...");
        const participants = self.Cycling_TracksDetails();
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
        self.Cycling_Tracks4(self.Cycling_Tracks3());
        console.log("Cycling_Tracks4", self.Cycling_Tracks4());
        console.log("Cycling_Tracks3", self.Cycling_Tracks3());
        console.log("Finished fetching details for all participants.");
        loadInitialCycling_Tracks();
        hideLoading();
        checkFavourite();

    
    }
    
    
    async function fetchAllData() {
        showLoading();
        await fetchAllCycling_TracksDetails();
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
                url: 'http://192.168.160.58/Paris2024/API/Cycling_Tracks/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Cycling_Tracks/Search?q=' + ui.item.label,
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
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Athletics');
    self.displayName = 'Atletismo';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Athletics = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.AthleticsDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Athletics2 = ko.observableArray([]);
    self.Sex = ko.observable('');
    self.Athletics3 = ko.observableArray([]);
    self.Athletics4 = ko.observableArray([]);
    var initialAthletics = [];

    self.favoriteAthletics = function (id, event) {
        let favAthletics = JSON.parse(window.localStorage.getItem('favAthletics')) || [];
        let button = event.target.closest('button');
        if (!favAthletics.includes(id)) {
            favAthletics.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favAthletics', JSON.stringify(favAthletics));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favAthletics = favAthletics.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favAthletics', JSON.stringify(favAthletics));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favAthletics')));
    };

     // Função para calcular o número total de páginas
    self.totalPages = ko.computed(function () {
        return Math.ceil(self.Athletics4().length / self.pagesize());
    });
    
    // Função para ir para uma página específica
    self.goToPage = function (page) {
        if (page >= 1 && page <= self.totalPages()) {
            self.currentPage(page);
        }
    };
    self.Athletics4.subscribe(function (newValue) {
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
    self.paginatedAthletics = ko.computed(function () {
        var startIndex = (self.currentPage() - 1) * self.pagesize();
        var endIndex = startIndex + self.pagesize();
        return self.Athletics4().slice(startIndex, endIndex);
    });
    // Função para calcular os registros exibidos
    self.fromRecord = ko.computed(function () {
        return (self.currentPage() - 1) * self.pagesize() + 1;
    });
    
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.Athletics4().length);
    });

    self.onEnter = function (d, e){
        e.keyCode === 13 && self.search();
        return true;
    };
    

    //--- Page Events

    function checkFavourite() {
        let favAthletics = JSON.parse(window.localStorage.getItem('favAthletics')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favAthletics);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let AthleticsId = parseInt(button.getAttribute("data-Athletics-id"));
            if (favAthletics.includes(AthleticsId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }


    self.activate = function (id) {
        console.log('CALL: getAthletics...');
        var composedUri = self.baseUri() + "/Events";
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log("data", data);
            var flattenedData = flattenAthleticsData(data);
            self.Athletics(flattenedData);
            self.Athletics2(flattenedData.slice());
            console.log("Athletics=", self.Athletics());
            console.log("Athletics2", self.Athletics2());
            populateEventSelect();
            populateStageSelect();
            await fetchAllAthleticsDetails();
            self.Athletics3(self.Athletics());
            console.log("Athletics3", self.Athletics3());
            checkFavourite();
            

        });
    };




    function loadInitialAthletics(){
        initialAthletics = self.Athletics4().slice();
        console.log("isso é o que ta ate ao momento", self.Athletics4());
        checkFavourite();
    }


    function flattenAthleticsData(data) {
        var flattenedData = [];
        data.forEach(function (Athletics) {
            Athletics.Stages.forEach(function (stage) {
                var entry = {
                    EventId: Athletics.EventId,
                    EventName: Athletics.EventName,
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
        self.Athletics().forEach(function (Athletics) {
            if (!eventNames.has(Athletics.EventName)) {
                eventNames.add(Athletics.EventName);
                var option = document.createElement('option');
                option.value = Athletics.EventName;
                option.text = Athletics.EventName;
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
    
        var filteredStages = initialAthletics.filter(function (Athletics) {
            return Athletics.EventName == selectedEventName;
        });
    
        var stageNames = new Set();
        filteredStages.forEach(function (Athletics) {
            stageNames.add(Athletics.StageName);
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
        console.log("Lista inicial de Atletismo:", initialAthletics);
    
        // Atualiza a lista com base nos filtros
        var filteredAthletics = initialAthletics.filter(function (Athletics) {
            var eventMatch = selectedEventName === "0" || Athletics.EventName === selectedEventName;
            var stageMatch = selectedStageName === "0" || Athletics.StageName === selectedStageName;
            return eventMatch && stageMatch;
        });
    
        console.log("Atletismo filtrado:", filteredAthletics);
    
        // Atualiza a tabela observável (Knockout.js)
        self.Athletics4(filteredAthletics);
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
        self.Athletics().forEach(function (Athletics) {
            if (!stageNames.has(Athletics.StageName)) {
                stageNames.add(Athletics.StageName);
                var option = document.createElement('option');
                option.value = Athletics.StageName;
                option.text = Athletics.StageName;
                selectBox.appendChild(option);
            }
        });
        console.log("stageNames", stageNames)
    }

    function filterTableByEvent() {
        console.log("a executar filterTableBYEvent");
    
        var selectedEventName = document.getElementById('eventSelect').value;
        var filteredAthletics;
    
        if (selectedEventName == "0") {
            filteredAthletics = initialAthletics.slice(); // Restaurar a lista completa
        } else {
            filteredAthletics = initialAthletics.filter(function (Athletics) {
                return Athletics.EventName == selectedEventName;
            });
        }
        console.log("Filtered Athletics:", filteredAthletics);
    
        self.Athletics4(filteredAthletics);
    
        // Atualizar o select de stage
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box
    
        var stageNames = new Set();
        filteredAthletics.forEach(function (Athletics) {
            stageNames.add(Athletics.StageName);
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
        var filteredAthletics = self.Athletics4().filter(function (Athletics){
            return Athletics.StageName == selectedStageName;
        });
        self.Athletics4(filteredAthletics);
        console.log("Filtered Athletics:", filteredAthletics);
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

        var filteredStages = self.Athletics4().filter(function (Athletics) {
            return Athletics.EventName == selectedEventName;
        });

        filteredStages.forEach(function (Athletics) {
            var option = document.createElement('option');
            option.value = Athletics.StageName;
            option.text = Athletics.StageName;
            selectBox.appendChild(option);
            
        });
        checkFavourite();
    }

    function getStages(EventId, StageId) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Athletics?' + 'EventId=' + EventId + '&StageId=' + StageId;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function fetchAthleticsDetails(Athletics) {
        const data = await getStages(Athletics.EventId, Athletics.StageId);
        data.forEach(participant => {
            console.log("esta a adicionar os detalhes para o gajo", participant);
            self.AthleticsDetails.push({
                EventId: Athletics.EventId,
                EventName: Athletics.EventName,
                StageId: Athletics.StageId,
                StageName: Athletics.StageName,
                ParticipantId: participant.Id,
                ParticipantName: participant.ParticipantName,
                CountryName: participant.CountryName,
                Sex: participant.Sex,
                ParticipantType: participant.ParticipantType,
                Id : participant.Id
        
            });
        });
    }

    
    async function fetchAllAthleticsDetails() {
        console.log("Fetching all Athletics details...");
        for (const Athletics of self.Athletics()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchAthleticsDetails(Athletics); //Chama a outra assincrona
            await delay(0); 
        }
        console.log("a obter os detalhes do basketball...")
        self.Athletics(self.AthleticsDetails());
        console.log("Finished fetching all Athletics details.");
        fetchAllParticipantsDetails(); // Chama a função para buscar detalhes dos participantes
    }
    
    async function fetchDetailsForParticipant(ParticipantId) {
        if (!ParticipantId) {
            console.error("Participant Id is undefined or null");
            return;
        }
        console.log(`Fetching details for participant with Id: ${ParticipantId}`);
        const detailsUrl = 'http://192.168.160.58/Paris2024/API/Athletics/' + ParticipantId;
        const details = await ajaxHelper(detailsUrl, 'GET');
        console.log(`Details for participant ${ParticipantId}:`, details);
        updateTableWithDetails(ParticipantId, details);

    }
    
    function updateTableWithDetails(Id, details) {
        console.log(`Updating table with details for participant ${Id}`);
        var participant = self.AthleticsDetails().find(p => p.ParticipantId === Id);
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
        const participants = self.AthleticsDetails();
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
        self.Athletics4(self.Athletics3());
        console.log("Athletics4", self.Athletics4());
        console.log("Athletics3", self.Athletics3());
        console.log("Finished fetching details for all participants.");
        loadInitialAthletics();
        hideLoading();
        checkFavourite();

    
    }
    
    
    async function fetchAllData() {
        showLoading();
        await fetchAllAthleticsDetails();
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
                url: 'http://192.168.160.58/Paris2024/API/Athletics/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Athletics/Search?q=' + ui.item.label,
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
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/API/Footballs');
    self.displayName = 'Futebol';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.Footballs = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(0);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.FootballsDetails = ko.observableArray([]);
    self.Photo = ko.observable('');
    self.Footballs2 = ko.observableArray([]);
    self.Sex = ko.observable('');
    self.Footballs3 = ko.observableArray([]);
    self.Footballs4 = ko.observableArray([]);
    var initialFootballs = [];

    self.favoriteFootballs = function (id, event) {
        let favFootballs = JSON.parse(window.localStorage.getItem('favFootballs')) || [];
        let button = event.target.closest('button');
        if (!favFootballs.includes(id)) {
            favFootballs.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favFootballs', JSON.stringify(favFootballs));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favFootballs = favFootballs.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favFootballs', JSON.stringify(favFootballs));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favFootballs')));
    };

    // Função para calcular o número total de páginas
    self.totalPages = ko.computed(function () {
        return Math.ceil(self.Footballs4().length / self.pagesize());
    });

    // Função para ir para uma página específica
    self.goToPage = function (page) {
        if (page >= 1 && page <= self.totalPages()) {
            self.currentPage(page);
        }
    };
    self.Footballs4.subscribe(function (newValue) {
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
        return self.Footballs4() ? Math.ceil(self.Footballs4().length / self.pagesize()) : 0;
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
    self.paginatedFootballs = ko.computed(function () {
        var startIndex = (self.currentPage() - 1) * self.pagesize();
        var endIndex = startIndex + self.pagesize();
        return self.Footballs4().slice(startIndex, endIndex);
    });
    // Função para calcular os registros exibidos
    self.fromRecord = ko.computed(function () {
        return (self.currentPage() - 1) * self.pagesize() + 1;
    });

    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.Footballs4().length);
    });

    self.onEnter = function (d, e){
        e.keyCode === 13 && self.search();
        return true;
    };


    //--- Page Events

    function checkFavourite() {
        let favFootballs = JSON.parse(window.localStorage.getItem('favFootballs')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favFootballs);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let FootballsId = parseInt(button.getAttribute("data-Footballs-id"));
            if (favFootballs.includes(FootballsId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }


    self.activate = function (id) {
        console.log('CALL: getFootballs...');
        var composedUri = self.baseUri() + "/Events";
        ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log("data", data);
            var flattenedData = flattenFootballsData(data);
            self.Footballs(flattenedData);
            self.Footballs2(flattenedData.slice());
            console.log("Footballs=", self.Footballs());
            console.log("Footballs2", self.Footballs2());
            populateEventSelect();
            populateStageSelect();
            await fetchAllFootballsDetails();
            self.Footballs3(self.Footballs());
            console.log("Footballs3", self.Footballs3());
            checkFavourite();


        });
    };




    function loadInitialFootballs(){
        initialFootballs = self.Footballs4().slice();
        console.log("isso é o que ta ate ao momento", self.Footballs4());
        checkFavourite();
    }


    function flattenFootballsData(data) {
        var flattenedData = [];
        data.forEach(function (Footballs) {
            Footballs.Stages.forEach(function (stage) {
                var entry = {
                    EventId: Footballs.EventId,
                    EventName: Footballs.EventName,
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
        self.Footballs().forEach(function (Footballs) {
            if (!eventNames.has(Footballs.EventName)) {
                eventNames.add(Footballs.EventName);
                var option = document.createElement('option');
                option.value = Footballs.EventName;
                option.text = Footballs.EventName;
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

        var filteredStages = initialFootballs.filter(function (Footballs) {
            return Footballs.EventName == selectedEventName;
        });

        var stageNames = new Set();
        filteredStages.forEach(function (Footballs) {
            stageNames.add(Footballs.StageName);
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

        var selectedEventName = document.getElementById('eventSelect').value;
        var selectedStageName = document.getElementById('stageSelect').value;

        console.log("Evento selecionado:", selectedEventName);
        console.log("Fase selecionada:", selectedStageName);
        console.log("Lista inicial de Futebol:", initialFootballs);

        if (selectedStageName == "0") {
            filterTableByEvent();
        } else if (selectedEventName == "0") {
            var filteredFootballs = initialFootballs.filter(function (Footballs) {
                return Footballs.StageName === selectedStageName;
            });
        } else {
            var filteredFootballs = initialFootballs.filter(function (Footballs) {
                var eventMatch = selectedEventName === "0" || Footballs.EventName === selectedEventName;
                var stageMatch = selectedStageName === "0" || Footballs.StageName === selectedStageName;
                return eventMatch && stageMatch;
            });
        }
        console.log("Futebol filtrado:", filteredFootballs);

        if (self.Footballs4) {
            self.Footballs4(filteredFootballs);
        }
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
        self.Footballs().forEach(function (Footballs) {
            if (!stageNames.has(Footballs.StageName)) {
                stageNames.add(Footballs.StageName);
                var option = document.createElement('option');
                option.value = Footballs.StageName;
                option.text = Footballs.StageName;
                selectBox.appendChild(option);
            }
        });
        console.log("stageNames", stageNames)
    }

    function filterTableByEvent() {
        console.log("a executar filterTableBYEvent");

        var selectedEventName = document.getElementById('eventSelect').value;
        var filteredFootballs = [];

        if (selectedEventName == "0") {
            filteredFootballs = initialFootballs.slice(); // Restaurar a lista completa
        } else {
            filteredFootballs = initialFootballs.filter(function (Footballs) {
                return Footballs.EventName == selectedEventName;
            });
        }
        console.log("Filtered Footballs:", filteredFootballs);

        self.Footballs4(filteredFootballs);

        // Atualizar o select de stage
        var selectBox = document.getElementById('stageSelect');
        selectBox.innerHTML = '<option value="0">Todas as fases</option>'; // Reset stage select box

        var stageNames = new Set();
        filteredFootballs.forEach(function (Footballs) {
            stageNames.add(Footballs.StageName);
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

    function filterTableByStage() {
        console.log("a executar filterTableByStage");
        var selectedStageName = document.getElementById('stageSelect').value;
        if (selectedStageName == "0") {
            console.log("Selected stage is 0. Restoring initial list...");
        } else {
            var filteredFootballs = self.Footballs4().filter(function (Footballs) {
                return Footballs.StageName == selectedStageName;
            });
            self.Footballs4(filteredFootballs);
            console.log("Filtered Footballs:", filteredFootballs);
            checkFavourite();
        }
    }

    document.getElementById('eventSelect').addEventListener('change', function (){
        filterStagesByEvent();
        filterTableByEvent();
    });
    document.getElementById('stageSelect').addEventListener('change', filterTableByStage);



    function getStages(EventId, StageId) {
        var detailsUrl = 'http://192.168.160.58/Paris2024/API/Footballs?' + 'EventId=' + EventId + '&StageId=' + StageId;
        return ajaxHelper(detailsUrl, 'GET').then(function (data) {
            console.log(detailsUrl);
            return data;
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function fetchFootballsDetails(Footballs) {
        const data = await getStages(Footballs.EventId, Footballs.StageId);
        data.forEach(participant => {
            console.log("esta a adicionar os detalhes para o gajo", participant);
            self.FootballsDetails.push({
                EventId: Footballs.EventId,
                EventName: Footballs.EventName,
                StageId: Footballs.StageId,
                StageName: Footballs.StageName,
                ParticipantId: participant.Id,
                ParticipantName: participant.ParticipantName,
                CountryName: participant.CountryName,
                Sex: participant.Sex,
                ParticipantType: participant.ParticipantType,
                Id : participant.Id

            });
        });
    }


    async function fetchAllFootballsDetails() {
        console.log("Fetching all Footballs details...");
        for (const Footballs of self.Footballs()) { //Percorre cada treinador que vem da 1.ºAPI
            await fetchFootballsDetails(Footballs); //Chama a outra assincrona
            await delay(0);
        }
        console.log("a obter os detalhes do basketball...")
        self.Footballs(self.FootballsDetails());
        console.log("Finished fetching all Footballs details.");
        fetchAllParticipantsDetails(); // Chama a função para buscar detalhes dos participantes
    }

    async function fetchDetailsForParticipant(ParticipantId) {
        if (!ParticipantId) {
            console.error("Participant Id is undefined or null");
            return;
        }
        console.log(`Fetching details for participant with Id: ${ParticipantId}`);
        const detailsUrl = 'http://192.168.160.58/Paris2024/API/Footballs/' + ParticipantId;
        const details = await ajaxHelper(detailsUrl, 'GET');
        console.log(`Details for participant ${ParticipantId}:`, details);
        updateTableWithDetails(ParticipantId, details);

    }

    function updateTableWithDetails(Id, details) {
        console.log(`Updating table with details for participant ${Id}`);
        var participant = self.FootballsDetails().find(p => p.ParticipantId === Id);
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
            participant.Date = new Date(details.Date).toLocaleString('pt-PT', { timeZone: 'UTC' });
            participant.Venue = details.Venue;
            console.log(`Participant details updated:`, participant);
        } else {
            console.warn(`Participant with Id ${Id} not found`);
        }
    }

    async function fetchAllParticipantsDetails() {
        console.log("Fetching details for all participants...");
        const participants = self.FootballsDetails();
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
        self.Footballs4(self.Footballs3());
        console.log("Footballs4", self.Footballs4());
        console.log("Footballs3", self.Footballs3());
        console.log("Finished fetching details for all participants.");
        loadInitialFootballs();
        hideLoading();
        checkFavourite();


    }


    async function fetchAllData() {
        showLoading();
        await fetchAllFootballsDetails();
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
                url: 'http://192.168.160.58/Paris2024/API/Footballs/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/API/Footballs/Search?q=' + ui.item.label,
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
var TableViewModel = function () {
    console.log('TableViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/CountryMedals');
    self.records = ko.observableArray([]);
    self.error = ko.observable('');
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalPages = ko.observable(0);
    self.result = ko.observableArray([]);
    self.totalRecords = ko.observable(0);
    self.fromRecord = ko.computed(function () {
        return (self.currentPage() - 1) * self.pagesize() + 1;
    });
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    });

    self.pageArray = ko.computed(function () {
        var pages = [];
        var start = Math.max(1, self.currentPage() - 4);
        var end = Math.min(self.totalPages(), self.currentPage() + 4);
        for (var i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    });

    self.activate = function (id) {
        console.log('CALL: getCountryMedals...');
        var order = document.getElementById('orderSelect').value;
        var composedUri = self.baseUri() + "?page=" + id + "&pagesize=" + self.pagesize() + "&Order=" + order;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.records(data.CountryMedals);
            self.totalPages(data.TotalPages); // Ensure this is set correctly
            self.totalRecords(data.TotalRecords); // Ensure this is set correctly
            console.log("info da tabela", data);
            checkFavourite();
            self.result(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            self.error("AJAX Call[" + composedUri + "] Fail...");
        });
    };

    self.favoriteNOCs = function (id, event) {
        console.log("o favoriteNOCs foi chamado");
        let favNOCs = JSON.parse(window.localStorage.getItem('favNOCs')) || [];
        let button = event.target.closest('button');
        if (!favNOCs.includes(id)) {
            favNOCs.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            console.log('O treinador foi adicionado aos favoritos!');
        } else {
            favNOCs = favNOCs.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favNOCs', JSON.stringify(favNOCs));
            console.log('O treinador foi removido dos favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favNOCs')));
    };

    self.updateOrder = function () {
        self.activate(self.currentPage());
    };

    self.changePage = function (page) {
        if (page > 0 && page <= self.totalPages()) {
            self.currentPage(page);
            self.activate(page);
        }
    };

    function checkFavourite() {
        let favNOCs = JSON.parse(window.localStorage.getItem('favNOCs')) || [];
        console.log("o checkFavourite foi chamado");
        console.log("esses sao os favoritos: ", favNOCs);
        let buttons = document.getElementsByClassName("fav-btn");
        for (let button of buttons) {
            let NOCId = (button.getAttribute("data-noc-id"));
            if (favNOCs.includes(NOCId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        self.activate(self.currentPage());
    });
};

ko.applyBindings({ chartVm: new ChartViewModel(), tableVm: new TableViewModel() });
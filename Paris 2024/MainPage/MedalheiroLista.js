var TableViewModel = function () {
    console.log('TableViewModel initiated...');
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/CountryMedals');
    self.records = ko.observableArray([]);
    self.error = ko.observable('');
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalPages = ko.observable(0);

    self.activate = function (id) {
        console.log('CALL: getCountryMedals...');
        var order = document.getElementById('orderSelect').value;
        var composedUri = self.baseUri() + "?page=" + id + "&pagesize=" + self.pagesize() + "&Order=" + order;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.records(data.CountryMedals);
            self.totalPages(data.TotalPages);
            console.log("info da tabela", data)
            checkFavourite();
        }).fail(function (jqXHR, textStatus, errorThrown) {
            self.error("AJAX Call[" + composedUri + "] Fail...");
        });
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

    self.paginationPages = ko.computed(function () {
        var pages = [];
        var start = Math.max(1, self.currentPage() - 4);
        var end = Math.min(self.totalPages(), self.currentPage() + 4);
        for (var i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    });

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

function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX Call[" + uri + "] Fail...");
        }
    });
}

$(document).ready(function () {
    console.log("ready!");
    if (!ko.dataFor(document.body)) {
        ko.applyBindings(new TableViewModel(), document.querySelector('.container[data-bind="with: tableVm"]'));
    }
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});
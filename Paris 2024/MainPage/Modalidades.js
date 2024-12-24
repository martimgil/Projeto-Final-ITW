
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Paris2024/api/Sports');
    self.displayName = 'Modalidades';
    self.Sports = ko.observableArray([]);

    //--- Page Events
    function checkFavourite() {
        let favSports = JSON.parse(window.localStorage.getItem('favSports')) || [];
        console.log("o checkfavourite foi chamado")
        console.log("esses sao os fav", favSports)
        let buttons = document.getElementsByClassName('fav-btn');

        for (let button of buttons) {
            let sportId = (button.getAttribute('data-sport-id'));
            console.log("o sportId é", sportId)
            if (favSports.includes(sportId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }




    self.activate = function (id) {
        showLoading()
        console.log('CALL: getRoutes...');
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Sports(data);
            hideLoading();
            checkFavourite();
        });
        checkFavourite();
    };

    self.onEnter = function (d, e){
        e.keyCode === 13 && self.search();
        return true;
    };

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
            var chandeUrl = 'http://192.168.160.58/Paris2024/api/Sports/Search?q=' + $("#searchbar").val();
            self.Athleteslist = [];
            ajaxHelper(chandeUrl, 'GET').done(function(data){
                console.log(data);
                if (data.length ==0){
                    return alert(("Não foram encontrados resultados"))
                }
                console.log(data);
                const filteredData = self.Sports().filter(item => data.some(filter => filter.Id === item.Id && filter.Name === item.Name));

                self.Sports(filteredData);
                for(var i in data){
                    self.Athleteslist.push(data[i]);
                }
                checkFavourite();
            });
        }
    };

    self.Erase = function (){
        //showLoading();
        $("#searchbar").val("");
        var composedUri = self.baseUri();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Sports(data);
        });
    }
    
    self.favoriteSports = function (id, event) {
        let favSports = JSON.parse(window.localStorage.getItem('favSports')) || [];
        let button = event.target.closest('button');
        if (!favSports.includes(id)) {
            favSports.push(id);
            button.classList.add('active');
            window.localStorage.setItem('favSports', JSON.stringify(favSports));
            console.log('A modalidade foi adicionado aos favoritos!');
        } else {
            favSports = favSports.filter(favId => favId !== id);
            button.classList.remove('active');
            window.localStorage.setItem('favSports', JSON.stringify(favSports));
            console.log('A modalidade foi removido da lista de favoritos.');
        }
        console.log(JSON.parse(window.localStorage.getItem('favSports')));
    };

    //--- start ....
    //showLoading()
    self.activate(1);
    console.log("VM initialized!");
    checkFavourite();
}


//--- Internal functions
function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX Call[" + uri + "] Fail...");
            hideLoading();
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

$('document').ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});
$(document).ajaxComplete(function () {
    $("#myModal").modal('hide');
});

$(document).ready(function () {
    console.log("ready!");
    $("#searchbar").autocomplete({
        minLength: 3,
        autoFill: true,
        source: function (request, response){
            $.ajax({
                type: 'GET',
                url: 'http://192.168.160.58/Paris2024/api/Sports/Search?q=' + $("#searchbar").val(),
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
                url: 'http://192.168.160.58/Paris2024/api/Sports/Search?q=' + ui.item.label,
                success: function(data){
                    window.location = 'ModalidadesDetalhes.html?id=' + data[0].Id;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    })
});

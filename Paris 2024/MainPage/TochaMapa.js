// Configuração da chave da API do OpenCage
const OPENCAGE_API_KEY = '6320ddc3579b4ae288ed9bcf75570d8b';

// Função para obter coordenadas de uma cidade usando OpenCage Geocoder
function getCoordinates(cityName, callback) {
    var url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${OPENCAGE_API_KEY}`;

    $.ajax({
        url: url,
        type: 'GET',
        success: function (response) {
            if (response.results && response.results.length > 0) {
                const coords = {
                    lat: response.results[0].geometry.lat,
                    lon: response.results[0].geometry.lng
                };
                callback(coords);
            } else {
                console.log(`Cidade não encontrada: ${cityName}`);
                callback(null);
            }
        },
        error: function (xhr, status, error) {
            console.error(`Erro ao buscar coordenadas para: ${cityName} - ${error}`);
            callback(null);
        }
    });
}

// ViewModel Knockout para gerenciar os dados
var TorchRouteViewModel = function () {
    var self = this;

    self.records = ko.observableArray([]); // Dados das cidades
    self.map = null; // Referência ao mapa
    self.route = []; // Coordenadas da rota
    self.bounds = []; // Limites do mapa

    // Inicializar o mapa
    self.initMap = function () {
        self.map = L.map('map').setView([48.8566, 2.3522], 6); // Inicializa em Paris

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(self.map);
    };

    // Carregar dados da API da rota
    self.loadData = function () {
        $.ajax({
            type: 'GET',
            url: 'http://192.168.160.58/Paris2024/api/Torch_route',
            dataType: 'json',
            success: function (data) {
                self.records(data); // Armazena os dados
                self.plotRoute();  // Plota os dados no mapa
            },
            error: function () {
                alert('Erro ao carregar os dados da API!');
            }
        });
    };

    // Plotar os marcadores e a rota no mapa
    self.plotRoute = function () {
        var promises = [];
        var delay = 1000; // Adiciona atraso entre requisições para evitar bloqueios

        // Processar cada cidade
        self.records().forEach(function (location, index) {
            var cityName = location.City;

            // Criar uma promessa para cada cidade
            var promise = new Promise(function (resolve) {
                setTimeout(() => {
                    getCoordinates(cityName, function (coords) {
                        if (coords) {
                            // Adiciona marcador ao mapa
                            L.marker([coords.lat, coords.lon])
                                .addTo(self.map)
                                .bindPopup(`<b>${cityName}</b>`);

                            self.bounds.push([coords.lat, coords.lon]);
                            self.route.push([coords.lat, coords.lon]);
                        }
                        resolve(); // Promessa resolvida
                    });
                }, index * delay); // Atraso escalonado
            });

            promises.push(promise);
        });

        // Quando todas as promessas forem resolvidas
        Promise.all(promises).then(function () {
            if (self.bounds.length > 0) self.map.fitBounds(self.bounds); // Ajustar o mapa aos limites
            if (self.route.length > 1) {
                // Traça a linha conectando os pontos
                L.polyline(self.route, { color: 'blue' }).addTo(self.map);
            }
        });
    };

    // Inicializar o ViewModel
    self.init = function () {
        self.initMap();
        self.loadData();
    };

    self.init();
};

// Inicializar Knockout.js no DOM
$(document).ready(function () {
    ko.applyBindings(new TorchRouteViewModel());
});

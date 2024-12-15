function CartViewModel() {
    var self = this;
    self.cart = ko.observableArray([]);

    self.loadCart = function() {
        var cartData = JSON.parse(window.localStorage.getItem('Cart')) || [];
        cartData.forEach(function(item) {
            item.total = (item.price * item.quantity).toFixed(2);
        });
        self.cart(cartData);
    };

    self.loadCart();

    if (self.cart().length){
     document.getElementById("form").classList.remove("d-none");
    } else{
        document.getElementById("vazio").classList.remove("d-none");

    };

}

document.addEventListener('DOMContentLoaded', function() {
    ko.applyBindings(new CartViewModel());
});
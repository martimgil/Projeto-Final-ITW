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



    self.cartTotal = ko.computed(function(){
       var total = 0;
       ko.utils.arrayForEach(self.cart(), function(item){
           total += parseFloat(item.total);
       });
         return total.toFixed(2);
    });

}

document.addEventListener('DOMContentLoaded', function() {
    ko.applyBindings(new CartViewModel());
});


function clean() {
    localStorage.removeItem('Cart');
}
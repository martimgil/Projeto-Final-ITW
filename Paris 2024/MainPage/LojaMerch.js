function addProduct(number) {
    let quantidadeProdutoSelecionado = document.getElementById("qty" + number);
    quantidadeProdutoSelecionado.value++;
    calculate();

    let Cart = JSON.parse(window.localStorage.getItem('Cart')) || [];
    let productElement = document.getElementById(`qty${number}`);
    let productNameElement = productElement.parentElement.querySelector('h5');
    let productPriceElement = document.getElementById(`price${number}`);
    let product = {
        name: productNameElement.innerText,
        quantity: parseInt(productElement.value),
        price: parseFloat(productPriceElement.value),
        number: parseFloat(number)

    };

    let existingProductIndex = Cart.findIndex(item => item.name === product.name);

    if (existingProductIndex !== -1) {
        Cart[existingProductIndex].quantity = product.quantity;
    } else {
        Cart.push(product);
    }
    window.localStorage.setItem('Cart', JSON.stringify(Cart));
    console.log(Cart);

}

function calculate() {
    let precAtual, qtdAtual;
    let precoTotal = 0;
    let qtdTotal = 0;

    for (let i = 1; i <= 15; i++) {
        precAtual = parseFloat(document.getElementById('price' + i).value);
        qtdAtual = parseFloat(document.getElementById('qty' + i).value);
        precoTotal += precAtual * qtdAtual;
        qtdTotal += qtdAtual;
    }

    if (precoTotal > 100) {
        precoTotal = precoTotal * 0.95;
    }

    if (qtdTotal >= 5) {
        precoTotal = precoTotal * 0.95;
    }

    let inputQtdTotal = document.getElementById('quantidades');
    let inputPrecoTotal = document.getElementById('total');

    inputQtdTotal.innerText = qtdTotal;
    inputPrecoTotal.innerText = precoTotal.toFixed(2);
}

function valid() {
    if (precoTotal <= 0 && qtdTotal <= 0) {
        alert("Erro o carrinho está vazio");
        return false;
    } else {
        return true;
    }
}

function clean() {
    localStorage.removeItem('Cart');


    document.getElementById('quantidades').innerText = '0';
    document.getElementById('total').innerText = '0.00';

    for (let i = 1; i <= 15; i++) {
        document.getElementById(`qty${i}`).value = '0';
    }
}
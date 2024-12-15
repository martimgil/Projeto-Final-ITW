function validate(){
    var retVal = true;
    retVal1 = validateNome();
    retVal2 = validateEmail();
    retVal3 = validateTelefone();
    retVal4 = validateNIF();
    retVal5 = validatePostal();
    retVal6 = validateLocalidade();
    retVal7 = validateMorada();
    retVal8 = validatePais();

    return retVal1 && retVal2 && retVal3 && retVal4 && retVal5 && retVal6 && retVal7 && retVal8;
}
function validateNome() {
    nome = document.getElementById("Nome").value;
    if (nome.length < 3) {
        document.getElementById("NomeError").classList.remove("d-none");
        return false;
    } else {
        if (!document.getElementById("NomeError").classList.contains("d-none")) {
            document.getElementById("NomeError").classList.add("d-none");
        }
        return true
    }
}


function validateMorada() {
    morada = document.getElementById("Morada").value.trim().split(" ");
    if (morada.length < 3) {
        document.getElementById("MoradaError").classList.remove("d-none");
        return false;
    } else {
        if (!document.getElementById("MoradaError").classList.contains("d-none")) {
            document.getElementById("MoradaError").classList.add("d-none");
        }
        return true
    }
}

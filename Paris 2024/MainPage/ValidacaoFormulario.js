$(document).ready(function() {
    $('#form').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            name: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira o seu nome completo.'
                    },
                    stringLength: {
                        min: 3,
                        message: 'Nome deve ter no mínimo 3 caracteres.'
                    },
                    regexp: {
                        regexp: /^[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+)+$/,
                        message: 'Nome deve ter no mínimo duas palavras.'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira um e-mail válido.'
                    },
                    emailAddress: {
                        message: 'Por favor, insira um e-mail válido.'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Por favor, insira um e-mail válido.'
                    }
                }
            },
            phone: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira o seu telefone.'
                    },
                    regexp: {
                        regexp: /^\+?[1-9]\d{1,14}$/,
                        message: 'Por favor, insira um número de telefone válido com até 15 dígitos, opcionalmente precedido por um sinal de mais.'
                    }
                }
            },
            nif: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira o seu NIF.'
                    },
                    regexp: {
                        regexp: /^\d{9}$/,
                        message: 'NIF deve conter exatamente 9 dígitos.'
                    },
                    callback: {
                        message: 'NIF inválido.',
                        callback: function (value, validator, $field) {
                            const nif = value.replace(/\D/g, '');
                            if (nif.length !== 9) {
                                return false;
                            }
                            const checkDigit = parseInt(nif.charAt(8), 10);
                            const sum = nif
                                .substr(0, 8)
                                .split('')
                                .reduce((acc, digit, index) => acc + parseInt(digit, 10) * (9 - index), 0);
                            const calculatedCheckDigit = 11 - (sum % 11);
                            return calculatedCheckDigit === checkDigit || (calculatedCheckDigit === 10 && checkDigit === 0);
                        }
                    }
                }
            },
            postal: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira o seu código postal.'
                    },
                    regexp: {
                        regexp: /^\d{4}-\d{3}$/,
                        message: 'Código postal deve estar no formato 1234-567.'
                    }
                }
            },
            city: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira a sua localidade.'
                    },
                    stringLength: {
                        min: 3,
                        message: 'Localidade deve ter no mínimo 3 caracteres.'
                    }
                }
            },
            street: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira sua rua.'
                    },
                    stringLength: {
                        min: 3,
                        message: 'Rua deve ter no mínimo 3 caracteres.'
                    }
                }
            },
            country: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira seu país.'
                    },
                    stringLength: {
                        min: 3,
                        message: 'País deve ter no mínimo 3 caracteres.'
                    }
                }
            },
            card: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira o número do cartão.'
                    },
                    regexp: {
                        regexp: /^\d{16}$/,
                        message: 'Número do cartão deve conter exatamente 16 dígitos.'
                    }
                }
            },
            date: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira a data de validade.'
                    },
                    regexp: {
                        regexp: /^\d{2}\/\d{2}$/,
                        message: 'Data de validade deve estar no formato MM/AA.'
                    }
                }
            },
            cvc: {
                validators: {
                    notEmpty: {
                        message: 'Por favor, insira o CVC.'
                    },
                    regexp: {
                        regexp: /^\d{3}$/,
                        message: 'CVC deve conter exatamente 3 dígitos.'
                    }
                }
            }
        }
    }).on('error.field.bv', function (e, data) {
        data.element.closest('.form-group').removeClass('has-success').addClass('has-error');
    }).on('success.field.bv', function (e, data) {
        const hasError = data.element.closest('.form-group').find('.help-block:visible').length > 0;
        if (hasError) {
            data.element.closest('.form-group').removeClass('has-success').addClass('has-error');
        } else {
            data.element.closest('.form-group').removeClass('has-error').addClass('has-success');
        }
    }).on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        // Show success alert
        alert('Sucesso! Obrigado pela sua compra!');
    });
});
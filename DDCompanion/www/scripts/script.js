function ViewModel() {
    var self = this;
    self.pagina = ko.observable('login');
    self.loaderPage = ko.observable(false);
    self.btnLoginDesabilitado = ko.observable(false);
   // self.manterConectado = ko.observable(true);
    self.btnDesconectarDesabilitado = ko.observable(false);
    self.btnDesconectar = ko.observable(false);
    self.abrindoPorta = ko.observable(false);
    self.usuario = ko.observable('');
    self.password = ko.observable('');
    self.userName = ko.observable("visitante");
    self.token = ko.observable('');
    self.status = ko.observable('');
    self.formulario = ko.observable(false);
    self.textoUser = ko.observable('Digite seu usuário');
    self.textoPassword = ko.observable('Digite sua senha');
    var mensagem = {
        portaAberta: 'Porta desenergizada',
        portaFechada: 'Porta não foi desenergizada',
        semAcesso: 'E-mail não possui acesso',
        erro: 'Erro de acesso',
        campoVazio: 'Preencha todos os campos'
    }

    $(document).ready(function () {
        var sideslider = $('[data-toggle=collapse-side]');
        var sel = sideslider.attr('data-target');
        var sel2 = sideslider.attr('data-target-2');
        sideslider.click(function (event) {
            $(sel).toggleClass('in');
            $(sel2).toggleClass('out');
        });
    });

   setTimeout(function () {
       var GooglePlus = window.plugins.googleplus;
       var appp = plugins.appPreferences;
       appp.fetch(function (value) {
           checarCampos(value);
       }, function (err) {
           console.log("Erro " + err);
       }, "usuario"
       );

       appp.fetch(function (valueToken) {
           self.token(valueToken);
       }, function (err) {
           console.log("Erro " + err);
       }, "token"
       );

       sideslider.click(function (event) {
           $(sel).toggleClass('in');
           $(sel2).toggleClass('out');
       });

   }, 500);
    function checarCampos(value) {
        if (value != null) {
            self.pagina('home');
            self.loaderPage(false);
            self.userName(value);
            self.btnDesconectar(true);
            self.btnLoginDesabilitado(true);
        }
        else {
            self.loaderPage(false);
            self.pagina('login');
        }
    }

    self.disconnect = function () {
        self.btnDesconectarDesabilitado(true);
        self.btnLoginDesabilitado(false);
        var GooglePlus = window.plugins.googleplus;
        trySilentLogin();
        window.plugins.googleplus.disconnect(
        function (result) {
            removerDados();
        }, function (msg) {
            logout();
        });
    }

    function logout() {
        window.plugins.googleplus.logout(
            function (msg) {
                removerDados();
            },
            function (error) {
                removerDados();
            }
        );
    }

    function trySilentLogin() {
        var GooglePlus = window.plugins.googleplus;
        window.plugins.googleplus.trySilentLogin(
            {
                'scopes': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                'webClientId': "489399558653-rde58r2h6o8tnaddho7lathv2o135l7m.apps.googleusercontent.com",
                'offline': true,
            },
            function (obj) {
            });
    }
    function removerDados() {
        var appp = plugins.appPreferences;
        appp.remove(function (value) {
            self.pagina('login');
            self.limparCampos();
        }, function (err) {
        }, "usuario");

        appp.remove(function (valueToken) {
        }, function (err) {
        }, "token");
    }

    self.login = function () {
        console.log("AQpetgg");
        self.btnDesconectarDesabilitado(false);
        self.btnLoginDesabilitado(true);
        var GooglePlus = window.plugins.googleplus;
        window.plugins.googleplus.login(
            {
                'scopes': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                'webClientId': "489399558653-rde58r2h6o8tnaddho7lathv2o135l7m.apps.googleusercontent.com",
                'offline': true,
            },
            function (result) {
                var url = 'http://porta.digitaldesk.com.br/autenticar/google?token=' + result.serverAuthCode;
                console.log(result.serverAuthCode);
                validarEmail(url, result);
            },
            function (msg) {
                self.btnLoginDesabilitado(false);
            }
        );
    }

    function validarEmail(url, result) {
       self.loaderPage(true);
        $.post(url, function (response) {
            self.status(response.status);
            if (self.status() == true) {
                if (response.token != null) {
                    if (self.pagina() == 'login') {
                        self.token(response.token);
                        acessoPermitido(result);
                    }
                    else if (self.pagina() == 'modal') {
                        self.token(response.token);
                        var dadosUsuario = { displayName: self.usuario() };
                        acessoPermitido(dadosUsuario);
                    }
                }
               else if (response.token == null) { mensagemPortaAberta(mensagem.portaAberta); }
            }
            else if (self.status() == false) {
                if (self.pagina() == 'login' || self.pagina() == 'modal') {
                    acessoNegado(mensagem.semAcesso);
                }
                else if (self.pagina() == 'home') {
                    removerDesativado(mensagem.portaFechada);
                }
            }
        })
        .fail(function () {
            removerDesativado(mensagem.erro);
        });
    }

    function mensagemPortaAberta(textoPorta) {
        self.loaderPage(false);
        alert(textoPorta);
        setTimeout(function () {
            self.abrindoPorta(false);
        }, 3000);
        self.pagina('home');
    }

    function removerDesativado(textoPorta) {
        self.loaderPage(false);
        self.abrindoPorta(false);
        alert(textoPorta);
        self.btnLoginDesabilitado(false);
        self.disconnect();
    }

    function acessoNegado(texto) {
        self.loaderPage(false);
        self.pagina('login');
        alert(texto);
        self.disconnect();
        self.btnLoginDesabilitado(false);
    }
    function acessoPermitido(result) {
        console.log(result);
        $('#myModal').modal("hide");
        self.loaderPage(false);
        self.pagina('home');
        self.btnDesconectar(true);
        self.btnDesconectarDesabilitado(false);
        salvarUsuario(result);
        self.userName(result.displayName);
    }

    function salvarUsuario(result) {
        var appp = plugins.appPreferences;
        appp.store(function (value) {
            console.log("Dados salvos:  " + value);
        }, function (err) {
            console.log("Erro " + err);
        }, "usuario", result.displayName);

        appp.store(function (valueToken) {
            console.log("Token salvo: " + valueToken);
        }, function (err) {
            console.log("Erro " + err);
        }, "token", self.token());
    }

    self.abrirPorta = function () {
        var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        validarEmail(url);
        self.abrindoPorta(true);
    }

    self.chamaPagina = function () {
        self.formulario(true);
        self.pagina('modal');
        $('#myModal').modal("show");
    }

    self.logarUsuario = function () {
        if (self.usuario() == "" || self.password() == "") {
            alert(mensagem.campoVazio);
        }
        else if (self.usuario() == "" && self.password() == "") {
            alert(mensagem.campoVazio);
        }
        if (self.usuario() != "" && self.password() != "") {
            var url = 'http://porta.digitaldesk.com.br/autenticar/usuario?key=' + self.password() + '&user=' + self.usuario();
            validarEmail(url);
        }
    }

    self.limparCampos = function () {
        self.usuario('');
        self.password('');
    }

}
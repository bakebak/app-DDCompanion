function ViewModel() {
    var self = this;
    self.pagina = ko.observable('loader');
    self.loaderPage = ko.observable(true);
    self.btnLoginDesabilitado = ko.observable(false);
    self.manterConectado = ko.observable(true);
    self.btnDesconectarDesabilitado = ko.observable(false);
    self.btnDesconectar = ko.observable(false);
    self.userName = ko.observable("visitante");
    self.usuario = ko.observable('');
    self.token = ko.observable('');
    self.status = ko.observable('');
    self.abrindoPorta = ko.observable(false);
    var mensagem = {
        portaAberta: 'Porta desenergizada',
        portaFechada: 'Porta não foi desenergizada',
        semAcesso: 'E-mail não possui acesso',
        erro: 'Erro de acesso'
    }

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
        });
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
        }, function (err) {
        }, "usuario");

        appp.remove(function (valueToken) {
        }, function (err) {
        }, "token");
    }


    self.login = function () {
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
                var url = 'http://porta.digitaldesk.com.br/autenticar?token=' + result.serverAuthCode;
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
                    self.token(response.token);
                    acessoPermitido(result);
                }
                else if (response.token == null) {
                    mensagemPorta(mensagem.portaAberta);
                }
            }
            else if (self.status() == false) {
                if (self.pagina() == 'login') {
                    acessoNegado(mensagem.semAcesso);
                }
                else if (self.pagina() == 'home') {
                    mensagemPorta(mensagem.portaFechada);
                }
            }
        })
        .fail(function () {
            self.loaderPage(false);
            setTimeout(function () {
                self.abrindoPorta(false);
            }, 3000);
            alert(mensagem.erro);
        });
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
    function acessoNegado(texto) {
        self.pagina('login');
        self.loaderPage(false);
        alert(texto);
        self.disconnect();
        self.btnLoginDesabilitado(false);
    }
    function acessoPermitido(result) {
        self.pagina('home');
        self.loaderPage(false);
        if (self.manterConectado() == true) { salvarUsuario(result); }
        else { self.disconnect(); }
        self.userName(result.displayName);
        self.btnDesconectar(true);
    }
    function mensagemPorta(textoPorta) {
        self.loaderPage(false);
        alert(textoPorta);
        setTimeout(function () {
            self.abrindoPorta(false);
        }, 3000);
        self.pagina('home');
    }
    self.abrirPorta = function () {
        var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        validarEmail(url);
        self.abrindoPorta(true);
    }
}
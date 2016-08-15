function ViewModel() {
    var self = this;
    self.pagina = ko.observable('login');
    self.btnDesconectarDesabilitado = ko.observable(false);
    self.btnDesconectar = ko.observable(false);
    self.userName = ko.observable("visitante");
    self.usuario = ko.observable('');
    self.token = ko.observable('..');
    self.status = ko.observable('');
    self.btnLoginDesabilitado = ko.observable(false);
    self.abrindoPorta = ko.observable(false);
    self.loaderPage = ko.observable(false);
    self.manterConectado = ko.observable(true);
    var mensagem = {
        portaAberta: 'Porta aberta',
        portaFechada: 'Porta não foi aberta',
        semAcesso: 'E-mail não possui acesso',
        erro: 'Erro de acesso'
    }

   setTimeout(function () {
       var GooglePlus = window.plugins.googleplus;
       var appp = plugins.appPreferences;
       appp.fetch(function (value) { //verifica se já tem alguém conectado
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
        if (value != null) { //já conectado
            self.pagina('home');
            self.userName(value);
            self.btnDesconectar(true);
            self.btnLoginDesabilitado(true);
        }
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
                //acessoPermitido(result);
            },
            function (msg) {
                self.btnLoginDesabilitado(false);
            }
        );
    }

    function validarEmail(url, result) {
        self.pagina('loader');
        self.loaderPage(true);
        $.post(url, function (response) {
            self.token(response.token);
            self.status(response.status);
            if (self.status() == true) {
                //console.log("true");
                if (self.token() != null) { acessoPermitido(result); }
                else if (self.token() == null) {
                    mensagemPorta(mensagem.portaAberta);
                    self.pagina('home');
                    self.loaderPage(false);
                }
            }
            else if (self.status() == false) {
                acessoNegado(mensagem.semAcesso);
                /*if (self.pagina == 'login') {
                    acessoNegado(mensagem.semAcesso);
                }
                else if (self.pagina == 'home') {
                    mensagemPorta(mensagem.portaFechada);
                }*/
            }

        })
         .fail(function () {
             console.log("Nao deu");
             acessoNegado(mensagem.erro);
         });
        /*$.post(url,  function () {
            console.log(response);
        }, 'json');*/
        //console.log(self.token());
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
        self.abrindoPorta(false);
        alert(textoPorta);
    }

    self.abrirPorta = function () {
        /*console.log("Apertado");
        self.abrindoPorta(true);
        setTimeout(function () {
            self.abrindoPorta(false);
        }, 3500);*/

        var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        console.log(url);
        validarEmail(url);
    }
}
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
            alert("Disc " + msg);
        });
    }

    function removerDados() {
        var appp = plugins.appPreferences;
        appp.remove(function (value) {
            self.pagina('login');
        }, function (err) {
            //alert("Erro" + err);
        }, "usuario");

        appp.remove(function (valueToken) {
        }, function (err) {
            //alert("Erro" + err);
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
                if (self.token() != null) { acessoPermitido(result); console.log("Permitido");}
                else if (self.token() == null) { portaAberta(); console.log("Não Permitido"); }
            }
            else if (self.status() == false) {
                if (self.pagina == 'login') { acessoNegado(); }
                else if (self.pagina == 'home') { portaFechada(); }
            }

        })
         .fail(function () {
             alert("Error");
             self.loaderPage(false);
             self.pagina('login');
             self.disconnect();
             self.btnLoginDesabilitado(false);
         });
        /*$.post(url,  function () {
            console.log(response);
        }, 'json');*/
        //console.log(self.token());
    }

    function acessoNegado() {
        self.loaderPage(false);
        self.pagina('login');
        alert("E-mail não possui acesso");
        self.disconnect();
        self.btnLoginDesabilitado(false);
    }

    function acessoPermitido(result) {
        //console.log("Ola");
        self.pagina('home');
        self.loaderPage(false);
        salvarUsuario(result);
        self.userName(result.displayName);
        //window.location = "index.html";
        self.btnDesconectar(true);
    }

    function portaAberta() {
        self.loaderPage(false);
        self.abrindoPorta(false);
        alert("Porta aberta");
    }

    function portaFechada() {
        self.loaderPage(false);
        self.abrindoPorta(false);
        alert("Porta não foi aberta");
    }

    self.abrirPorta = function () {
        console.log("Apertado");
        self.abrindoPorta(true);
        setTimeout(function () {
            self.abrindoPorta(false);
        }, 3500);

        /*var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        validarEmail(url);*/
    }
}
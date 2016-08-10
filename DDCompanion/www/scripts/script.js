function ViewModel() {
    var self = this;
    self.pagina = ko.observable('login');
    self.userName = ko.observable("visitante");
    self.usuario = ko.observable('');
    self.botaoDesconectar = ko.observable(false);
    self.token = ko.observable('..');
    self.status = ko.observable('');

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
            self.botaoDesconectar(true);
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
                console.log("Logou");
            });
    }

    self.disconnect = function () {
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
            alert("Erro" + err);
        }, "usuario");

        appp.remove(function (valueToken) {
        }, function (err) {
            alert("Erro" + err);
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
            }
        );
    }

    function validarEmail(url, result) {
        $.post(url, function (response) {
            self.status(response.status);
            if (self.status() == true) {
                self.token(response.token);
                console.log("Token email " + response.token);
                console.log("True");
                emailValido(result);
            }
            else if (self.status() == false) {
                alert("E-mail não possui acesso");
                self.disconnect();
            }
        })
         .fail(function () {
             alert("Error");
         });
        /*$.post(url,  function () {
            console.log(response);
        }, 'json');*/
        //console.log(self.token());
    }

    function emailValido(result) {
        salvarUsuario(result);
        self.userName(result.displayName);
        //window.location = "index.html";
        self.pagina('home');
        self.botaoDesconectar(true);
    }

    self.abrirPorta = function () {
        var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        console.log("Token abrir " + url);
        //alert(self.token());
        validarEmail(url, 0);
    }
}
function ViewModel() {
    var self = this;
    self.showLogar = ko.observable(true);
    self.showDeslogar = ko.observable(false);
    self.showDeslogarApp = ko.observable(false);
    self.userName = ko.observable("visitante");
    self.usuario = ko.observable('');

    setTimeout(function () {
        var GooglePlus = window.plugins.googleplus;
        var appp = plugins.appPreferences;
        var appp = plugins.appPreferences;
        appp.fetch(function (value) {
            checarCampos(value);
        }, function (err) {
            alert("Erro " + err);
        }, "usuario"
        );
    }, 1000);

    function checarCampos(value) {
        if (value != null) {
            self.showDeslogarApp(true);
            self.showDeslogar(false);
            self.showLogar(false);
            self.userName(value);
        }
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
                self.showDeslogar(true);
                self.showLogar(false);
                self.userName(result.displayName);
                salvarDados(result);
            },
            function (msg) {
                alert("error msg");
            }
        );
    }

    self.disconnect = function () {
        var GooglePlus = window.plugins.googleplus;
        window.plugins.googleplus.disconnect(
        function (result) {
            desconectar();
        }, function (msg) {
            alert("error desc");
        });
    }

    self.desconectarApp = function () {
        var appp = plugins.appPreferences;
        self.showDeslogar(false);
        self.showDeslogarApp(false);
        self.showLogar(true);
        self.userName("visitante");

        appp.remove(function (value) {
            alert("Apagado" + value);
        }, function (err) {
            alert("Erro" + err);
        }, "usuario");
    }

    function salvarDados(result) {
        var appp = plugins.appPreferences;
        appp.store(function (value) {
            console.log("OK  " + value);
        }, function (err) {
            console.log("Erro " + err);
        }, "usuario", result.displayName);
    }
}
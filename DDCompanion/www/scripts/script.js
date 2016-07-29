function ViewModel() {
    var self = this;
    self.usuario = ko.observable('');
    self.password = ko.observable('');
    self.showDeslogar = ko.observable(true);
    self.showLimpar = ko.observable(true);
    self.showEntrar = ko.observable(true);
    self.showLogar = ko.observable(false);

    var retornoEmail;

    setTimeout(function () {
        var appp = plugins.appPreferences;
        alert("Iniciado");
        appp.fetch(function (value) {
            self.usuario(value);
            var campoUsuario = value;
            testeValidacao(campoUsuario);
        }, function (err) {
            console.log("Erro " + err);
        }, "usuario"
        );

        appp.fetch(function (valueP) {
            self.password(valueP);
        }, function (err) {
            console.log("Erro " + err);
        }, "password"
        );
    }, 1000);

    self.login = function () {
        var appp = plugins.appPreferences;
        if (self.usuario() == "" ) {
            alert("Preencha o campo de e-mail");
        }
        if (self.password() == "") {
            alert("Preencha o campo de senha");
        }
        else if (self.usuario() != "" && self.password() != ""){ //salvando dados igual
            appp.store(function (value) {
                console.log("OK  " + value);
                var campoUsuario = self.usuario();
                var btnlogin = true;
                testeValidacao(campoUsuario, btnlogin);
            }, function (err) {
                console.log("Erro " + err);
            }, "usuario", self.usuario());
        
            appp.store(function (value) {
                console.log("OK  " + value);
            }, function (err) {
                console.log("Erro " + err);
            }, "password", self.password());
        }
    }

    self.deslogar = function () {
        var appp = plugins.appPreferences;
        self.showDeslogar(true);
        self.showLogar(false);
        self.usuario('');
        self.password('');
        self.showEntrar(true);
        appp.remove(function (value) {
            console.log("Ok" + value);
        }, function (err) {
            console.log("Erro" + err);
        }, "usuario");

        appp.remove(function (value) {
            console.log("Ok" + value);
        }, function (err) {
            console.log("Erro" + err);
        }, "password");
    }

    self.limparCampos = function () {
        self.usuario('');
        self.password('');
    }

    self.entrar = function () {
        //var queryString = "http://192.168.2.2:3000/authentication/mobile?key=" + self.password();
        var queryString = "http://192.168.2.2:3000/unlock?key=DD2016TRNEE&device=web";
        //var queryString = "http://star-api.herokuapp.com/api/v1/stars/Sun";
        $.getJSON(queryString, function (results) {
            console.log(results);
        });
    }

    testeValidacao = function (campoUsuario, btnlogin) {
        if (campoUsuario == '' || campoUsuario == null) {
            console.log("Vazio");
            self.showLimpar(true);
        }
        else {
            retornoEmail = testeCampos(campoUsuario);
            console.log(retornoEmail);
            if (retornoEmail == 1) {
                self.showDeslogar(false);
                self.showLogar(true);
                self.showLimpar(true);
                self.showEntrar(false);
            }
            else {
                if (btnlogin == true) {
                    alert("Este e-mail não tem acesso ao site!");
                    self.showLimpar(false);
                }
            }
        }
    }

    testeCampos = function (campoUsuario){
        var tamanhoTotal = campoUsuario.length;
        var dominio = campoUsuario.indexOf("@");
        var email = campoUsuario.substring(0, dominio);
        var posicao = campoUsuario.substring(dominio + 1, tamanhoTotal);

        if (posicao == "digitaldesk.com.br") {
            retornoEmail = 1;
            return retornoEmail;
        }
    }
}
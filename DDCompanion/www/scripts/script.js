function ViewModel() {
    var self = this;
    self.showLogar = ko.observable(true);
    self.showDeslogar = ko.observable(false);
    self.userName = ko.observable("visitante");

    setTimeout(function () {
        var GooglePlus = window.plugins.googleplus;
        alert("Iniciado");
    }, 1000);

    /*self.isAvailable = function () {
        console.log("availb");
        window.plugins.googleplus.isAvailable(function (avail) {
            alert(avail);
            console.log("Ativo");
        });
    }*/

    self.login = function () {
        var GooglePlus = window.plugins.googleplus;
        console.log("login");
        window.plugins.googleplus.login(
            {
                //'scopes': 'profile email',
                'scopes': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                'webClientId': "489399558653-rde58r2h6o8tnaddho7lathv2o135l7m.apps.googleusercontent.com",
                'offline': true,
            },
            function (result) {
                self.showDeslogar(true);
                self.showLogar(false);
                console.log("obj");
                console.log("Imagem" + result.imageUrl);
                console.log("Nome" + result.displayName);
                console.log("Email" + result.email);
                console.log("idToken " + result.idToken);
                console.log("serverAuthCode " + result.serverAuthCode);
                console.log("oauthToken " + result.oauthToken);
                console.log("accessToken " + result.accessToken);
                console.log("refreshToken " + result.refreshToken);
                self.userName (result.displayName);
                //document.querySelector("#image").src = obj.imageUrl;
                //document.querySelector("#image").style.visibility = 'visible';
                // document.querySelector("#feedback").innerHTML = "Hi, " + obj.displayName + ", " + obj.email;
            },
            function (msg) {
                console.log("error msg");
                //document.querySelector("#feedback").innerHTML = "error: " + msg;
            }
        );
    }

    /*self.logout = function () {
        var GooglePlus = window.plugins.googleplus;
        console.log("logout");
        window.plugins.googleplus.logout(
        );
    }*/


    self.disconnect = function () {
        var GooglePlus = window.plugins.googleplus;
        window.plugins.googleplus.disconnect(
        function (result) {
            self.showDeslogar(false);
            self.showLogar(true);
            self.userName("visitante");
        }, function (msg) {
            console.log("error desc");
        }

        );
    }

    /*function trySilentLogin() {
        window.plugins.googleplus.trySilentLogin(
            {},
            function (obj) {
                alert("Ja logado");
            },
            function (msg) {
                alert("error ja logado");
            }
        );
    }*/
}
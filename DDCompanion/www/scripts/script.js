function ViewModel() {
    var self = this;

    setTimeout(function () {
        var GooglePlus = window.plugins.googleplus;
        alert("Iniciado");

        function GooglePlus() {
        }
    }, 1000);

    self.isAvailable = function () {
        console.log("availb");
        window.plugins.googleplus.isAvailable(function (avail) {
            alert(avail);
            console.log("Ativo");
        });
    }

    self.login = function () {
        var GooglePlus = window.plugins.googleplus;
        console.log("login");
        window.plugins.googleplus.login(
            {
                'scopes': 'profile email',
                'webClientId': "489399558653-rde58r2h6o8tnaddho7lathv2o135l7m.apps.googleusercontent.com",
                'offline': true,
            },
            function (obj) {
                console.log("obj");
                console.log("Imagem" + obj.imageUrl);
                console.log("Nome" + obj.displayName);
                console.log("Email" + obj.email);
                console.log("idToken " + obj.idToken);
                console.log("serverAuthCode " + obj.serverAuthCode);
                console.log("oauthToken " + obj.oauthToken);
                console.log("accessToken " + obj.accessToken);
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

    self.logout = function () {
        var GooglePlus = window.plugins.googleplus;
        console.log("logout");
        window.plugins.googleplus.logout(
        );
    }


    self.disconnect = function () {
        var GooglePlus = window.plugins.googleplus;
        console.log("Desconectado");
        window.plugins.googleplus.disconnect(
        );
    }
}
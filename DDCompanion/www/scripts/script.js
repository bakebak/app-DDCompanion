function ViewModel() {
    var self = this;
    self.pagina = ko.observable('login');
    self.userName = ko.observable("visitante");
    self.usuario = ko.observable('');
    self.botaoDesconectar = ko.observable(false);
    self.botaoRemoverDados = ko.observable(false);

    setTimeout(function () {
        var GooglePlus = window.plugins.googleplus;
        var appp = plugins.appPreferences;

        appp.fetch(function (value) { //verifica se já tem alguém conectado
           checarCampos(value);
        }, function (err) {
           console.log("Erro " + err);
        }, "usuario"
        );
    }, 500);

    function checarCampos(value) {
        if (value != null) { //já conectado
            self.pagina('home');
            self.userName(value);
            self.botaoRemoverDados(true);
            self.botaoDesconectar(false);
        }
    }
    self.disconnect = function () {
        var GooglePlus = window.plugins.googleplus;
        window.plugins.googleplus.logout(
        function (result) {
            self.removerDados();
        }, function (msg) {
            self.removerDados();
        });
    }
   self.removerDados = function (){
        var appp = plugins.appPreferences;
        appp.remove(function (value) {
            self.pagina('login');
        }, function (err) {
            console.log("Erro" + err);
        }, "usuario");
    }
    function salvarDados(result) {
        var appp = plugins.appPreferences;
        appp.store(function (value) {
            console.log("Dados salvos:  " + value);
        }, function (err) {
            console.log("Erro " + err);
        }, "usuario", result.displayName);
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
                //var url = "porta.digitaldesk.com.br/autenticar";
                //var data = result.serverAuthCode;
                //var retornoEmail = validarEmail(data, url);
                //if (retornoEmail == true) {
               emailValido(result);
                //}
            },
            function (msg) {
                alert("Erro de conexão");
            }
        );
    }
    function validarEmail(data, url) {
        $.post(url, data, function (returnedData) {
            if (returnedData == true) {
                return true;
            }
            else if (returnedData == false) {
                alert("E-mail não cadastrado");
                return false;
            }
        });
    }
    function emailValido(result) {
        salvarDados(result);
        self.userName(result.displayName);
        console.log(result.serverAuthCode);
        //window.location = "index.html";
        self.pagina('home');
        self.botaoRemoverDados(false);
        self.botaoDesconectar(true);
    }
    self.abrirPorta = function () {
        alert("Você solicitou abrir a porta");
        //var dataToken = "";
        //var url = "porta.digitaldesk.com.br/abrirporta";
        //var retornoEmail = validarEmail(data, url);
    }
}
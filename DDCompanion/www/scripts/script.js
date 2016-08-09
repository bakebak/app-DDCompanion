function ViewModel() {
    var self = this;
        self.pagina = ko.observable('login');
        self.userName = ko.observable("visitante");
        self.usuario = ko.observable('');
        self.botaoDesconectar = ko.observable(false);
        self.botaoRemoverDados = ko.observable(false);
        var token;

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
        trySilentLogin();
        window.plugins.googleplus.disconnect(
        function (result) {
            removerDados();
        }, function (msg) {
            alert(msg);
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
                console.log(obj);
            });
    }
   function removerDados (){
        var appp = plugins.appPreferences;
        appp.remove(function (value) {
            self.pagina('login');
        }, function (err) {
            alert("Erro" + err);
        }, "usuario");
   }

   function salvarUsuario(result) {
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
                var url = 'http://porta.digitaldesk.com.br/autenticar?token=' + result.serverAuthCode;
                token = validarEmail(url);
                emailValido(result);
                //if (retornoEmail == true) {
                //emailValido(result);
                //}
            },
            function (msg) {
                alert("Erro de conexão");
            }
        );
    }

    function validarEmail(url) {
        $.post(url, function () {
            alert("success");
            return 1;
        })
         .fail(function () {
             alert("error");
             return 2;
         });
        return 3;
        /*$.post(url,  function () {
            console.log(response);
        }, 'json');*/
    }

    function emailValido(result) {
        salvarUsuario(result);
        self.userName(result.displayName);
        console.log(result.serverAuthCode);
        //window.location = "index.html";
        self.pagina('home');
        self.botaoRemoverDados(false);
        self.botaoDesconectar(true);
    }
    self.abrirPorta = function () {
        alert("Você solicitou abrir a porta");
        //var url = "http://porta.digitaldesk.com.br/abrirporta?token="+token;
        //var retornoEmail = validarEmail(url);
    }           
}
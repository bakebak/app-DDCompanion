function ViewModel() {
    var self = this;
    self.pagina = ko.observable('loader');
    self.loaderPage = ko.observable(true);
    self.btnLoginDesabilitado = ko.observable(false);
   // self.manterConectado = ko.observable(true);
    self.btnDesconectarDesabilitado = ko.observable(false);
    self.btnDesconectar = ko.observable(false);
    self.abrindoPorta = ko.observable(false);
    self.btnAbrirDesabilitado = ko.observable(false);
    self.usuario = ko.observable('');
    self.password = ko.observable('');
    self.userName = ko.observable("visitante");
    self.token = ko.observable('');
    self.status = ko.observable('');
    self.formulario = ko.observable(false);
    self.textoUser = ko.observable('Digite seu usuário');
    self.textoPassword = ko.observable('Digite sua senha');
    self.name = ko.observable('');
    self.email = ko.observable('');
    self.photoUrl = ko.observable('css/img/user-anonimo.jpg');
    var dadosUsuario = [];
    var x = 0;
    var mensagem = {
        portaAberta: 'Porta desenergizada',
        portaFechada: 'Porta não foi desenergizada',
        semAcesso: 'E-mail não possui acesso',
        erro: 'Erro de acesso',
        campoVazio: 'Preencha todos os campos'
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

       appp.fetch(function (dadosUsuario) {
           self.name(dadosUsuario[0]);
           self.email(dadosUsuario[1]);
           if (dadosUsuario[2] == null) { self.photoUrl('css/img/user-anonimo.jpg'); }
           else { self.photoUrl(dadosUsuario[2]); }
       }, function (err) {
           console.log("Erro " + err);
       }, "dadosUsuario"
       );

       appp.fetch(function (valueToken) {
           self.token(valueToken);
       }, function (err) {
           console.log("Erro " + err);
       }, "token"
       );
   }, 1500);


   function checarCampos(value) {
       if (value != null) {
            self.loaderPage(false);
            self.pagina('home');
            $('.button-collapse').sideNav('show');
            self.btnDesconectar(true);
            self.btnLoginDesabilitado(true);
        }
       else {
           self.loaderPage(false);
           self.pagina('login');
        }
    }

    self.disconnect = function () {
        console.log("desc");
        self.btnDesconectarDesabilitado(true);
        self.btnLoginDesabilitado(false);
        //self.loaderPage(true);
        var GooglePlus = window.plugins.googleplus;
        trySilentLogin();
        window.plugins.googleplus.disconnect(
        function (result) {
            removerDados();
        }, function (msg) {
            logout();
        });
    }

    function logout() {
        window.plugins.googleplus.logout(
            function (msg) {
                removerDados();
            },
            function (error) {
                removerDados();
            }
        );
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
            $('.button-collapse').sideNav('hide');
            self.limparCampos();
        }, function (err) {
        }, "usuario");

        appp.remove(function (valueToken) {
            self.loaderPage(false);
        }, function (err) {
            console.log("Aolhaeoie");
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
                var url = 'http://porta.digitaldesk.com.br/autenticar/google?token=' + result.serverAuthCode;
                self.loaderPage(true);
                validarEmail(url, result);
            },
            function (msg) {
                self.btnLoginDesabilitado(false);
            }
        );
    }


    function validarEmail(url, result) {
        $.post(url, function (response) {
            self.status(response.status);
            if (self.status() == true) {
                if (response.token != null) {
                    if (self.pagina() == 'login') {
                        self.token(response.token);
                        acessoPermitido(result);
                    }
                    else if (self.pagina() == 'loginUsuario') {
                        self.token(response.token);
                        var dadosUsuario = { displayName: self.usuario() };
                        acessoPermitido(dadosUsuario);
                    }
                }
               else if (response.token == null) { mensagemPortaAberta(mensagem.portaAberta); }
            }
            else if (self.status() == false) {
                if (self.pagina() == 'login' || self.pagina() == 'loginUsuario') {
                    var pagina = self.pagina();
                    acessoNegado(mensagem.semAcesso, pagina);
                }
                else if (self.pagina() == 'home') {
                    removerDesativado(mensagem.portaFechada);
                }
            }
        })
        .fail(function () {
            removerDesativado(mensagem.erro);
        });
    }

    function mensagemPortaAberta(textoPorta) {
        self.loaderPage(false);
        alert(textoPorta);
        self.abrindoPorta(false);
        setTimeout(function () {
            self.btnAbrirDesabilitado(false);
        }, 3000);
        self.pagina('home');
        //self.configurarSidenav();
        //$('.button-collapse').sideNav('show');
        //$('.button-collapse').sideNav();
    }

    function removerDesativado(textoPorta) {
        self.loaderPage(false);
        self.abrindoPorta(false);
        alert(textoPorta);
        self.btnLoginDesabilitado(false);
        self.disconnect();
    }

    function acessoNegado(texto, pagina) {
        self.loaderPage(false);
        if (self.pagina() == 'login') { self.pagina('login'); }
        else { self.pagina('loginUsuario'); }
        alert(texto);
        self.disconnect();
        self.btnLoginDesabilitado(false);
    }
    function acessoPermitido(result) {
        //$('#myModal').modal("hide");
        self.loaderPage(false);
        self.pagina('home');
        $('.button-collapse').sideNav('show');
        self.btnDesconectar(true);
        self.btnDesconectarDesabilitado(false);
        //self.userName(result.displayName);
        dadosUsuario = [result.displayName, result.email, result.imageUrl];
        salvarUsuario(result);
        self.name(dadosUsuario[0]);
        self.email(dadosUsuario[1]);
        if (dadosUsuario[2] == null) { self.photoUrl('css/img/user-anonimo.jpg'); }
        else { self.photoUrl(dadosUsuario[2]); }
    }

    function salvarUsuario(result) {
        var appp = plugins.appPreferences;
        appp.store(function (value) {
            console.log("Dados salvos:  " + value);
        }, function (err) {
            console.log("Erro " + err);
        }, "usuario", result.displayName);

        appp.store(function (dadosUsuario) {
            console.log("Dados salvos:  " + dadosUsuario);
        }, function (err) {
            console.log("Erro " + err);
        }, "dadosUsuario", dadosUsuario);


        appp.store(function (valueToken) {
            console.log("Token salvo: " + valueToken);
        }, function (err) {
            console.log("Erro " + err);
        }, "token", self.token());
    }

    self.abrirPorta = function () {
        if (self.btnAbrirDesabilitado()) return;

        self.abrindoPorta(true);
        self.btnAbrirDesabilitado(true);
        var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        //validarEmail(url);

        window.setTimeout(function () {
            self.btnAbrirDesabilitado(false);
        }, 3000);
    }

    self.chamaPagina = function () {
        self.formulario(true);
        self.pagina('loginUsuario');
    }

    self.logarUsuario = function () {
        if (self.usuario() == "" || self.password() == "") {
            alert(mensagem.campoVazio);
        }
        else if (self.usuario() == "" && self.password() == "") {
            alert(mensagem.campoVazio);
        }
        if (self.usuario() != "" && self.password() != "") {
            var url = 'http://porta.digitaldesk.com.br/autenticar/usuario?key=' + self.password() + '&user=' + self.usuario();
            validarEmail(url);
        }
    }

    self.limparCampos = function () {
        self.usuario('');
        self.password('');
    }

    self.limparSenha = function () {
        self.password('');
    }

    self.limparUsuario = function () {
        self.usuario('');
    }

    self.backHome = function () {
        self.pagina('login');
        self.limparCampos();
    }

    self.configurarSidenav = function () {
        console.log("apertado");
        if (x == 0) {
            $('.button-collapse').sideNav({
                menuWidth: 245 // Default is 240
            });
            x++;
        }
    }
}
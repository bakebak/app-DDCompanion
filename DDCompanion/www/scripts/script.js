function ViewModel() {
    $.ajaxSetup({ timeout: 10000 });

    var self = this;
    self.pagina = ko.observable('loader');
    self.loader = ko.observable(true);

    /*LOGIN*/
    // self.manterConectado = ko.observable(true);
    self.btnLoginDesabilitado = ko.observable(false);


    /*LOGIN COM USUÁRIO*/
    self.usuario = ko.observable('');
    self.senha = ko.observable('');

    /*LOGIN COM GOOGLE*/
    self.token = ko.observable('');
    self.status = ko.observable('');
    self.nome = ko.observable('');
    self.email = ko.observable('');
    self.fotoUrl = ko.observable('css/img/user-anonimo.jpg');

    /*HOME*/
    self.abrindoPorta = ko.observable(false);
    self.btnAbrirDesabilitado = ko.observable(false);
    self.btnDesconectarDesabilitado = ko.observable(true);

    var dadosUsuario = [];
    var x = 0;
    var y = 0;
    var z;
    var paginaValue;
    var mensagem = {
        portaAberta: 'Porta aberta',
        portaFechada: 'Opss.. ocorreu um erro!',
        semAcesso: 'Usuário não possui acesso',
        erro: 'Erro de acesso',
        campoVazio: 'Preencha todos os campos',
        erroGoogle: 'Não foi possível conectar-se com o Google'
    }

    setTimeout(function () {
       StatusBar.backgroundColorByHexString("#378613");
       var GooglePlus = window.plugins.googleplus;
       var appp = plugins.appPreferences;
       appp.fetch(function (value) {
           checarCampos(value);
       }, function (err) {
           console.log("Erro " + err);
       }, "usuario"
       );

       appp.fetch(function (dadosUsuario) {
           if (dadosUsuario != null) {
                self.nome(dadosUsuario[0]);
                self.email(dadosUsuario[1]);
                self.fotoUrl(dadosUsuario[2]);
          }
       }, function (err) {
           console.log("Erro " + err);
       }, "dadosUsuario"
       );

       appp.fetch(function (valueToken) {
           self.token(valueToken);
           console.log("ValueToken " + valueToken);
       }, function (err) {
           console.log("Erro " + err);
       }, "token"
       );
   }, 1500);


   function checarCampos(value) {
       self.loader(false);
       if (value != null) {
           self.pagina('home');
           StatusBar.backgroundColorByHexString("#378613");
           $('.button-collapse').sideNav('show');
           self.btnLoginDesabilitado(true);
       }
       else { y = 1; z = 0; self.desconectar(); }
       // 
   }

   self.logarGoogle = function () {
       var GooglePlus = window.plugins.googleplus;
       self.btnLoginDesabilitado(true);
       setTimeout(function () {
           window.plugins.googleplus.login(
               {
                   'scopes': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                   'webClientId': "489399558653-rde58r2h6o8tnaddho7lathv2o135l7m.apps.googleusercontent.com",
                   'offline': true,
               },
               function (result) {
                   var url = 'http://porta.digitaldesk.com.br/autenticar/google?token=' + result.serverAuthCode;
                   paginaValue = self.pagina();
                   self.loader(true);
                   self.pagina('loader');
                   validarUsuario(url, result, paginaValue);
               },
               function (msg) {
                   console.log(msg);
                   self.btnLoginDesabilitado(false);
                   alert(mensagem.erroGoogle);
               }
           );
       }, 100);
   }

   self.chamarLoginUsuario = function () {
       self.pagina('loginUsuario');
       StatusBar.backgroundColorByHexString("#378613");
   }

   self.voltarTelaLogin = function () {
       self.pagina('login');
       StatusBar.backgroundColorByHexString("#378613");
       self.limparUsuario();
       self.limparSenha();
   }

   self.logarUsuario = function () {
       if (self.usuario() == "" || self.senha() == "") { alert(mensagem.campoVazio); }
       else if (self.usuario() == "" && self.senha() == "") { alert(mensagem.campoVazio); }
       if (self.usuario() != "" && self.senha() != "") {
           var url = 'http://porta.digitaldesk.com.br/autenticar/usuario?key=' + self.senha() + '&user=' + self.usuario();
           paginaValue = self.pagina();
           self.loader(true);
           self.pagina('loader');
           validarUsuario(url, 0, paginaValue);
       }
   }

   function validarUsuario(url, result, paginaValue) {
        $.post(url, function (response) {
            self.status(response.status);
            if (self.status() == true) {
                if (response.token != null) {
                    self.token(response.token);
                    if (paginaValue == 'login') {
                        acessoPermitido(result);
                    }
                    else if (paginaValue == 'loginUsuario') {
                        var dadosUsuario = {
                            displayName: self.usuario(),
                            imageUrl: 'css/img/user-anonimo.jpg'

                        }
                        acessoPermitido(dadosUsuario);
                    }
                }
            }

            else { acessoNegado(mensagem.semAcesso, paginaValue); }
        })
       .fail(function () {
           removerDesativado(mensagem.erro);
       });
   }

   function acessoNegado(texto, pagina) {
       self.loader(false);
       if (pagina == 'login') {  self.pagina('login'); }
       else { self.limparSenha(); self.limparUsuario(); self.pagina('loginUsuario');}
       alert(texto);
       y = 1;
       self.desconectar();
       self.btnLoginDesabilitado(false);
   }

   function acessoPermitido(result) {
       self.loader(false);
       self.pagina('home');
       self.limparUsuario();
       self.limparSenha();
       StatusBar.backgroundColorByHexString("#378613");
       $('.button-collapse').sideNav('show');
       self.btnDesconectarDesabilitado(true);
       dadosUsuario = [result.displayName, result.email, result.imageUrl];
       salvarUsuario(result);
       self.nome(dadosUsuario[0]);
       self.email(dadosUsuario[1]);
       self.fotoUrl(dadosUsuario[2]);
       y = 0;
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

   self.desconectar = function () {
       var GooglePlus = window.plugins.googleplus;
       if (y == 0) { self.loader(true); self.pagina('loader'); }
       self.btnDesconectarDesabilitado(false);
       self.btnLoginDesabilitado(false);
       window.setTimeout(function () {
           trySilentLogin();
           window.plugins.googleplus.disconnect(
                function (result) {
                    removerDados();
                }, function (msg) {
                    deslogar();
                });
       }, 100);       
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

    function deslogar() {
        window.plugins.googleplus.logout(
            function (msg) {
                removerDados();
            },
            function (error) {
                removerDados();
            }
        );
    }

    function removerDados() {
        var appp = plugins.appPreferences;
        x = 0;
        if (z == 0) { self.pagina('login'); }
        appp.remove(function (value) {
            self.pagina('login');
            StatusBar.backgroundColorByHexString("#378613");
            self.loader(false);
            $('.button-collapse').sideNav('hide');
        }, function (err) {
        }, "usuario");

        appp.remove(function (valueToken) {
            self.loader(false);
        }, function (err) {
        }, "token");
    }

    self.abrirPorta = function () {
        if (self.btnAbrirDesabilitado()) return;
        self.abrindoPorta(true);
        self.btnAbrirDesabilitado(true);
        var url = "http://porta.digitaldesk.com.br/abrirporta?token=" + self.token();
        validarToken(url);

        window.setTimeout(function () {
            self.btnAbrirDesabilitado(false);
        }, 3000);
    }
   
    function validarToken(url){
        $.post(url, function (response) {
            self.status(response.status);
            if (self.status() == true) {
                if (response.token == null) {
                    mensagemPortaAberta(mensagem.portaAberta);
                }
            }
            else if (self.status() == false) {
                removerDesativado(mensagem.portaFechada);
            }
        })
        .fail(function () {
            removerDesativado(mensagem.erro);
        });
    }

    function mensagemPortaAberta(textoPorta) {
        self.loader(false);
        alert(textoPorta);
        self.abrindoPorta(false);
        self.pagina('home');
        StatusBar.backgroundColorByHexString("#378613");
    }

    function removerDesativado(textoPorta) {
        self.loader(false);
        self.limparSenha();
        self.limparUsuario();
        self.pagina('login');
        self.abrindoPorta(false);
        alert(textoPorta);
        self.btnLoginDesabilitado(false);
        y = 1;
        self.desconectar();
    }

    self.configurarSidenav = function () {
        if (x == 0) {
            $('.button-collapse').sideNav({
                menuWidth: 260 // Default is 240
            });
            x++;
        }
    }

    self.limparUsuario = function () {
        self.usuario('');
    }
    self.limparSenha = function () {
        self.senha('');
    }

    /*self.testeBeacons = function () {
        self.pagina('testeBeacons');
        self.caixaGoogle(false);
        evothings.eddystone.startScan(foundBeacon, scanError);
    }

    function foundBeacon(beacon) {
        // Note that beacon.url will be null until the URL
        // has been received. Also note that not all Eddystone
        // beacons broadcast URLs, they may send UIDs only.
        console.log('Found beacon: ' + beacon.url)
    }

    function scanError(error) {
        console.log('Eddystone scan error: ' + error)
    }*/
}
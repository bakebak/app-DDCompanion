function ViewModel() {
    var self = this;
    self.pagina = ko.observable('loader');
    self.loaderPage = ko.observable(true);

    /*LOGIN*/
    // self.manterConectado = ko.observable(true);
    self.btnLoginDesabilitado = ko.observable(false);


    /*LOGIN COM USUÁRIO*/
    self.usuario = ko.observable('');
    self.senha = ko.observable('');

    /*LOGIN COM GOOGLE*/
    self.caixaGoogle = ko.observable(false);
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
       }, function (err) {
           console.log("Erro " + err);
       }, "token"
       );
   }, 3000);


   function checarCampos(value) {
       if (StatusBar.isVisible) {
           console.log("Aloooooooo");
       }

       self.loaderPage(false);
       if (value != null) {
           self.pagina('home');
           StatusBar.backgroundColorByHexString("#333333");
           $('.button-collapse').sideNav('show');
           self.btnLoginDesabilitado(true);
        }
       else { self.pagina('login'); self.caixaGoogle(true); }
   }

   self.logarGoogle = function () {
       self.btnDesconectarDesabilitado(true);
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
               validarUsuario(url, result);
           },
           function (msg) {
               self.btnLoginDesabilitado(false);
           }
       );
   }

   self.chamarLoginUsuario = function () { self.pagina('loginUsuario'); self.caixaGoogle(false);}

   self.voltarTelaLogin = function () {
       self.pagina('login');
       self.caixaGoogle(true);
       self.limparUsuario();
       self.limparSenha();
   }

   self.logarUsuario = function () {
       if (self.usuario() == "" || self.senha() == "") { alert(mensagem.campoVazio); }
       else if (self.usuario() == "" && self.senha() == "") { alert(mensagem.campoVazio); }
       if (self.usuario() != "" && self.senha() != "") {
           var url = 'http://porta.digitaldesk.com.br/autenticar/usuario?key=' + self.senha() + '&user=' + self.usuario();
           self.loaderPage(true);
           validarUsuario(url);
       }
   }

   function validarUsuario(url, result) {
        $.post(url, function (response) {
            self.status(response.status);
                if (self.status() == true) {
                    if (response.token != null) {
                        self.token(response.token);
                        if (self.pagina() == 'login') {
                            acessoPermitido(result);
                        }
                        else if (self.pagina() == 'loginUsuario') {
                            var dadosUsuario = { 
                                displayName: self.usuario(), 
                                imageUrl: 'css/img/user-anonimo.jpg'
                            }
                            acessoPermitido(dadosUsuario);
                        }
                    }       
                }
                else if (self.status() == false) {
                        var pagina = self.pagina();
                        acessoNegado(mensagem.semAcesso, pagina);
                }
        })
       .fail(function () {
           removerDesativado(mensagem.erro);
       });
   }

   function acessoNegado(texto, pagina) {
       self.loaderPage(false);
       if (self.pagina() == 'login') { self.pagina('login'); self.caixaGoogle(true);}
       else { self.pagina('loginUsuario'); self.caixaGoogle(false); }
       alert(texto);
       y = 1;
       self.desconectar();
       self.btnLoginDesabilitado(false);
   }

   function acessoPermitido(result) {
       self.loaderPage(false);
       self.pagina('home');
       self.caixaGoogle(false);
       $('.button-collapse').sideNav('show');
       self.btnDesconectarDesabilitado(true);
       dadosUsuario = [result.displayName, result.email, result.imageUrl];
       salvarUsuario(result);
       self.nome(dadosUsuario[0]);
       self.email(dadosUsuario[1]);
       self.fotoUrl(dadosUsuario[2]);
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
        if (y == 0) { self.loaderPage(true); }
        self.btnDesconectarDesabilitado(false);
        self.btnLoginDesabilitado(false);
        console.log("Apertado");
        var GooglePlus = window.plugins.googleplus;
        trySilentLogin();
        window.plugins.googleplus.disconnect(
            function (result) {
            removerDados();
            }, function (msg) {
            deslogar();
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
        appp.remove(function (value) {
            self.pagina('login');
            self.loaderPage(false);
            self.caixaGoogle(true);
            $('.button-collapse').sideNav('hide');
            x = 0;
            y = 0;
            self.limparUsuario();
            self.limparSenha();
        }, function (err) {
        }, "usuario");

        appp.remove(function (valueToken) {
            self.loaderPage(false);
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
        self.loaderPage(false);
        alert(textoPorta);
        self.abrindoPorta(false);
        self.pagina('home');
        self.caixaGoogle(false);
    }

    function removerDesativado(textoPorta) {
        self.loaderPage(false);
        self.abrindoPorta(false);
        alert(textoPorta);
        self.btnLoginDesabilitado(false);
        y = 1;
        self.desconectar();
    }

    self.configurarSidenav = function () {
        if (x == 0) {
            $('.button-collapse').sideNav({
                menuWidth: 245 // Default is 240
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
}
function ViewModel() {
    $.ajaxSetup({ timeout: 22000 });

    var self = this;

    var app = {};
    /*var beacons = {};
    var updateTimer = null;
    var regions = [{ uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0' },
                   { uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D' }, ];
    // Background detection.
    var notificationID = 1;
    self.inBackground = false;
    document.addEventListener('pause', function () { self.inBackground = true });
    document.addEventListener('resume', function () { self.inBackground = false });*/

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
    self.teste = ko.observable(false);
    var dadosUsuario = [];
    var x = 0;
    var y = 0;
    var z;
    var limite = 0;
    var logado = false;
    var permissao = false;
    var beacons = {};
    var paginaValue;
    var mensagem = {
        portaAberta: 'Porta aberta',
        portaFechada: 'Opss.. ocorreu um erro!',
        semAcesso: 'Usuário não possui acesso',
        erro: 'Erro de acesso',
        campoVazio: 'Preencha todos os campos',
        erroGoogle: 'Não foi possível conectar-se com o Google',
        abrirPorta: 'Você tem certeza?',
        semInternet: 'Verifique sua conexão com a internet!'
    }

    setTimeout(function () {
        StatusBar.backgroundColorByHexString("#378613");
        var GooglePlus = window.plugins.googleplus;
        var appp = plugins.appPreferences;
        //app.initialize();
        if (window.MobileAccessibility) {
            window.MobileAccessibility.usePreferredTextZoom(false);
        }
        appp.fetch(function (value) {
            checarCampos(value);
        }, function (err) {
            //  console.log("Erro " + err);
        }, "usuario"
        );

        appp.fetch(function (dadosUsuario) {
            if (dadosUsuario != null) {
                self.nome(dadosUsuario[0]);
                self.email(dadosUsuario[1]);
                self.fotoUrl(dadosUsuario[2]);
            }
        }, function (err) {
            // console.log("Erro " + err);
        }, "dadosUsuario"
        );

        appp.fetch(function (valueToken) {
            self.token(valueToken);
        }, function (err) {
            //  console.log("Erro " + err);
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
            logado = true;
        }
        else { y = 1; z = 0; self.desconectar();}
    }

    self.logarGoogle = function () {
        var GooglePlus = window.plugins.googleplus;
        self.btnLoginDesabilitado(true);
        window.plugins.googleplus.login(
            {
                'scopes': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                'webClientId': "489399558653-rde58r2h6o8tnaddho7lathv2o135l7m.apps.googleusercontent.com",
                'offline': true,
            },
            function (result) {
                if (result.accessToken == undefined) {
                    //var url = 'http://porta.digitaldesk.com.br/autenticar/google/android?token=' + result.serverAuthCode;
                    var url = 'http://porta.digitaldesk.com.br/autenticar/google?token=' + result.serverAuthCode;
                }
                else {
                    var url = 'http://porta.digitaldesk.com.br/autenticar/google/ios?token=' + result.accessToken;
                    self.teste(true);
                }
                paginaValue = self.pagina();
                self.loader(true);
                self.pagina('loader');
                validarUsuario(url, result, paginaValue);
            },
            function (msg) {
                //console.log(msg);
                self.btnLoginDesabilitado(false);
                chamarAlert(mensagem.erroGoogle);
            }
        );
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
        if (self.usuario() == "" || self.senha() == "") { chamarAlert(mensagem.campoVazio); }

        else if (self.usuario() == "" && self.senha() == "") { chamarAlert(mensagem.campoVazio); }
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
        if (pagina == 'login') { self.pagina('login'); }
        else { self.limparSenha(); self.limparUsuario(); self.pagina('loginUsuario'); }
        chamarAlert(texto);
        y = 1;
        z = 1;
        self.desconectar();
        self.btnLoginDesabilitado(false);
    }

    function acessoPermitido(result) {
        self.loader(false);
        self.pagina('home');
        self.limparUsuario();
        self.limparSenha();
        logado = true;
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
            //console.log("Dados salvos:  " + value);
        }, function (err) {
            // console.log("Erro " + err);
        }, "usuario", result.displayName);

        appp.store(function (dadosUsuario) {
            //   console.log("Dados salvos:  " + dadosUsuario);
        }, function (err) {
            //   console.log("Erro " + err);
        }, "dadosUsuario", dadosUsuario);


        appp.store(function (valueToken) {
            //   console.log("Token salvo: " + valueToken);
        }, function (err) {
            //  console.log("Erro " + err);
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
        logado = false;
        cordova.plugins.notification.local.clearAll({});
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
        //var url = "http://porta.digitaldesk.com.br/abrirporta?token=null";
        validarToken(url);

        window.setTimeout(function () {
            self.btnAbrirDesabilitado(false);
        }, 3000);
    }

    function validarToken(url) {
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
            chamarAlert(mensagem.semInternet);
        });
    }

    function mensagemPortaAberta(textoPorta) {
        self.loader(false);
        chamarAlert(textoPorta);
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
        chamarAlert(textoPorta);
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

    function chamarAlert(mensagemAlert) {
        navigator.notification.alert(
             mensagemAlert,
             null,
             'Alerta',
             'Fechar'
         );
    }

    /*function chamarConfirm(mensagemConfirm) {
        navigator.notification.confirm(
            mensagemConfirm, // message
            onConfirm,            // callback to invoke with index of button pressed
            'Atenção',           // title
            ['Confirmar', 'Cancelar']     // buttonLabels
        );
    }

    function onConfirm() {
        self.abrirPorta();
        self.pagina('home');
    }*/

    /********************************************************************************************************/

    //eddystone
    /*app.initialize = function () {
        document.addEventListener(
            'deviceready',
            function () { evothings.scriptsLoaded(onDeviceReady) },
            false);
    };

    function onDeviceReady() {
        window.locationManager = cordova.plugins.locationManager;
        startScan();
        updateTimer = setInterval(displayBeaconList, 500);
        // Handle the Cordova pause and resume events
        
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
        app.initialize();
    };

    function onResume() {
        app.initialize();
        // TODO: This application has been reactivated. Restore application state here.
    };

    function startScan() {
        // Called continuously when ranging beacons.
        console.log('startScan');
        evothings.eddystone.startScan(
			function (beacon) {
			    // Insert/update beacon table entry.
			    beacon.timeStamp = Date.now();
			    beacons[beacon.address] = beacon;
			},
			function (error) {
			    console.log('Eddystone Scan error: ' + JSON.stringify(error));
			});
    } 

    //Map the RSSI value to a value between 1 and 100.
	 
    function mapBeaconRSSI(rssi) {
        if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
        if (rssi < -100) return 0; // Max RSSI
        return 100 + rssi;
    }

    function getSortedBeaconList(beacons) {
        var beaconList = [];
        for (var key in beacons) {
            beaconList.push(beacons[key]);
        }
        beaconList.sort(function (beacon1, beacon2) {
            return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
        });
        return beaconList;
    }

    function displayBeaconList() {
        // Update beacon display list.
        var timeNow = Date.now();
        $.each(getSortedBeaconList(beacons), function (index, beacon) {
            console.log(JSON.stringify(beacon));
            // Only show beacons that are updated during the last 60 seconds.
            if (beacon.timeStamp + 60000 > timeNow) {
                //if (beacon.nid == '00010203040506070809' && beacon.bid == '000000000100') {
                if (beacon.name == 'Raspberry Porta') {
                    console.log('achou');
                    if (logado == true) {
                        cordova.plugins.notification.local.schedule({
                            id: notificationID,
                            title: 'Você está perto da porta',
                            text: 'Clique aqui para abrir a porta.'
                        });
                    }
                }
                else {
                    cordova.plugins.notification.local.clearAll({});
                    console.log("Nao achou ");
                }
                cordova.plugins.notification.local.on("click", function (notification, state) {
                    console.log("Apertou " + limite);
                    if (limite == 0) {
                        self.pagina('loader');
                        chamarConfirm(mensagem.abrirPorta);
                        limite = 1;
                    }
                }, this)
            }
        });
    }*/


    //iBeacon
    /*app.initialize = function () {
        document.addEventListener(
                'deviceready',
                function () { evothings.scriptsLoaded(onDeviceReady) },
                false);
    }

    function onDeviceReady() {
        window.locationManager = cordova.plugins.locationManager;
        //startScan();
        //updateTimer = setInterval(displayBeaconList, 500);
        // Handle the Cordova pause and resume events
        if (window.MobileAccessibility) {
           window.MobileAccessibility.usePreferredTextZoom(false);
        }
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
        app.initialize();
    };

    function onResume() {
        app.initialize();
        // TODO: This application has been reactivated. Restore application state here.
    };

    function startScan() {
        // The delegate object holds the iBeacon callback functions
        // specified below.
        var delegate = new locationManager.Delegate();
        // Called continuously when ranging beacons.
        delegate.didRangeBeaconsInRegion = function (pluginResult) {
            //console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
            for (var i in pluginResult.beacons) {
                // Insert beacon into table of found beacons.
                var beacon = pluginResult.beacons[i];
                beacon.timeStamp = Date.now();
                var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
                beacons[key] = beacon;
            }
        };

        // Called when starting to monitor a region.
        // (Not used in this example, included as a reference.)
        delegate.didStartMonitoringForRegion = function (pluginResult) {
            //console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
        };

        // Called when monitoring and the state of a region changes.
        // If we are in the background, a notification is shown.
        delegate.didDetermineStateForRegion = function (pluginResult) {
            console.log(pluginResult.state);
            if (true) {
                console.log('entro');
                // Show notification if a beacon is inside the region.
                // TODO: Add check for specific beacon(s) in your app.
                if (pluginResult.region.typeName == 'BeaconRegion' &&
                    pluginResult.state == 'CLRegionStateInside') {
                    limite = 0;
                    console.log(logado);
                    if (logado == true) {
                        cordova.plugins.notification.local.schedule(
                            {
                                id: notificationID,
                                title: 'Você está perto da porta',
                                text: 'Clique aqui para abrir a porta.'
                            });
                    }
                }
                else {
                    cordova.plugins.notification.local.clearAll({});
                    console.log("Nao achou ");
                }

                cordova.plugins.notification.local.on("click", function (notification, state) {
                    console.log("Apertou " + limite);
                    if (limite == 0) {
                        self.pagina('loader');
                        chamarConfirm(mensagem.abrirPorta);
                        limite = 1;
                    }
                }, this)
            }
        };

        // Set the delegate object to use.
        locationManager.setDelegate(delegate);

        // Request permission from user to access location info.
        // This is needed on iOS 8.
        locationManager.requestAlwaysAuthorization();

        // Start monitoring and ranging beacons.
        for (var i in regions) {
            var beaconRegion = new locationManager.BeaconRegion(
                i + 1,
                regions[i].uuid);

            // Start ranging.
            locationManager.startRangingBeaconsInRegion(beaconRegion)
                .fail(console.error)
                .done();

            // Start monitoring.
            // (Not used in this example, included as a reference.)
            locationManager.startMonitoringForRegion(beaconRegion)
                .fail(console.error)
                .done();
        }
    }

    function displayBeaconList() {
        var timeNow = Date.now();

        // Update beacon list.
        $.each(beacons, function (key, beacon) {
            var rssi = beacon.rssi;
            var txPower = beacon.tx;
            calcularDistancia(rssi, txPower);
            // Only show beacons that are updated during the last 60 seconds.
            if (beacon.timeStamp + 60000 > timeNow) {
                // Map the RSSI value to a width in percent for the indicator.
                var rssiWidth = 1; // Used when RSSI is zero or greater.
                if (beacon.rssi < -100) { rssiWidth = 100; }
                else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }
            }
        });
    }

    function calcularDistancia(rssi, txPower) {
        var ratio = (rssi * 1 / txPower);
        if (ratio < 1.0) {
            var resultado = Math.pow(ratio, 10);
            self.distancia(resultado);
        } else {
            var resultado = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
        }
        permitirScan(resultado);
    }

    function permitirScan(resultado) {
        permissao = true;
        //if (resultado < 10) { permissao = true; }
        //else { permissao = false; }
    }*/
}
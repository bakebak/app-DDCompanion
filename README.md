# app-DDCompanion

1) Criar iOs config file;
	- install plugin substituindo "myreversedclient" pelo REVERSED_CLIENT_ID gerado no arquivo.

2) Rodar "cordova build android -release"

3) Criar keystore: keytool -genkey -v -keystore D:/Novo_app/app-DDCompanion/DDCompanion/platforms/android/DDCompanion.keystore -alias DDCompanionApp -keyalg RSA -keysize 2048 -validity 100000

4) Vincular o certificado ao APK: jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore D:/Novo_app/app-DDCompanion/DDCompanion/platforms/android/DDCompanion.keystore D:/Novo_app/app-DDCompanion/DDCompanion/platforms/android/build/outputs/apk/android-release-unsigned.apk DDCompanionApp 

Fonte: http://www.lucianotamanaha.com/design/mobile/passos-para-criar-um-keystore-e-publicar-um-apk-no-google-play-cordova-cli/

5) Rodar para obter "SHA-1: keytool -list -v -keystore C:\Users\User_name\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

6) Preencher arquivo "build.json"

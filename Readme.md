## Instalacja lokalna i uruchomienie projektu

1. Upewnij się, że poprawnie pobrałeś, skonfigurowałeś i uruchomiłeś FitApp API: https://github.com/Smarkerus/fitapp_api (jeżeli chcesz udostępnić api w swojej sieci domowej, np. WiFi prawdopodobnie musisz odblokować połączenia przychodzące i wychodzące w swojej zaporze systemowej/firewall'u)
2. Upewnij się, że masz w systemie zainstalowany pakiet Node.js wraz z Node Package Managerem (npm) oraz Node Package Execute (npx)
3. Sklonuj repozytorium projektu:

   ```bash
   git clone <adres_repozytorium>
   cd <nazwa_projektu>
   ```

4. Zainstaluj zależności przy pomocy npm

   ```bash
   npm install
   ```

5. Stwórz aplikację FCM (Firebase Cloud Messaging) na platformie Firebase. Pobierz informację o tej usłudze w postaci pliku:

   ```bash
   google-services.json
   ```

   i umieść ją w głównym folderze repozytorium

6. W pliku app.config.js wypełnij pole:

   ```bash
   expo.android.package
   ```

   nazwą pakietu jaki nadałeś podczas tworzenia aplikacji w punkcie 5

7. Na platformie GCP (Google Cloud Platfrom) stwórz projekt/aplikację z kluczem API Map Google, skopiuj go do nowego pliku:

   ```bash
   .env:
       GOOGLE_MAPS_API_KEY=KLUCZ_GOOGLE_MAPS
   ```

8. W pliku context/AuthContext.jsx sprawdź wartość stałej BACKEND_URL. Na potrzeby lokalnego debugowania dostosuj ją w taki sposób, aby urządzenie lub emulator Androida było w stanie skomunikować się z API w ramach tej samej sieci.
9. Upewnij się, że masz zainstalowane Android Studio, a także zainstalowałeś i uruchomiłeś emulator urządzenia z co najmniej jednym 'działającym Androidem'
10. Uruchomienie projektu możliwe jest poprzez wykonanie polecenia:

    ```bash
    npx expo run:android
    ```

    Jeżeli masz podłączone więcej niż jedno urządzenie -> wybierz je
    Jeżeli wszystko się udało, powinieneś móc cieszyć się działającą aplikacją. Możesz to sprawdzić poprzez rejestrację nowego użytkownika na stronie głównej lub zalogowanie się!

11. Opcjonalnie: zainstaluj JDK, Android SDK, upewnij się iż zmienne środowiskowe ANDROID_HOME i JAVA_HOME istnieją i wskazują na poprawne foldery, w których zainstalowane zostały te programy.
    Aplikację na Androida możesz zbudować i jednocześnie włączyć w wersji debug wykonując polecenia:
    ```bash
    npx expo prebuild --clean
    npx expo run:android --device --variant debug
    ```

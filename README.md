# P9-Stephen_Thomas

backend
----------------------------------------------------------------------------------
Comment lancer l'API en local:
- Cloner le projet:
git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git

- Acceder au repertoire du projet :
cd Billed-app-FR-Back

- Installer les dépendances du projet :
npm install

- Lancer l'API :
npm run run:dev

- Accéder à l'API :
L'api est accessible sur le port 5678 en local, c'est à dire http://localhost:5678
----------------------------------------------------------------------------------
 Utilisateurs par défaut:
 
- administrateur :
- utilisateur : admin@test.tld 
- mot de passe : admin

- employé :
- utilisateur : employee@test.tld
- mot de passe : employee

----------------------------------------------------------------------------------
Comment lancer l'application en local ?
- étape 1 - Lancer le backend : Suivez les indications dans le README du projet backend.
- étape 2 - Lancer le frontend : Allez au repo cloné : $ cd Billed-app-FR-Front
-Installez les packages npm (décrits dans package.json) : $ npm install
- Installez live-server pour lancer un serveur local : $ npm install -g live-server
- Lancez l'application : $ live-server
- Puis allez à l'adresse : http://127.0.0.1:8080/
----------------------------------------------------------------------------------
Comment lancer tous les tests en local avec Jest ?
- $ npm run test
- 
Comment lancer un seul test ? 
- Installez jest-cli : $npm i -g jest-cli
- $jest src/__tests__/your_test_file.js
----------------------------------------------------------------------------------
Comment voir la couverture de test ?

- http://127.0.0.1:8080/coverage/lcov-report/

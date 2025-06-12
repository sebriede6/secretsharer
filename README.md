# Ephemeral Secret Sharer

Ephemeral Secret Sharer ist eine Webanwendung zum sicheren Teilen von einmalig abrufbaren Text-Secrets. Die Secrets werden serverseitig verschlüsselt und nach dem ersten Abruf oder optional nach einer definierten Ablaufzeit automatisch gelöscht. Ich habe es auf Azure in einem Cluster deployt, erreichbar unter der IP: http://9.163.157.41/

## Features

*   Erstellen von Text-Secrets.
*   Generierung eines einzigartigen, teilbaren Links.
*   Secrets können nur einmal abgerufen werden.
*   Optionale Ablaufzeit für Secrets.
*   Serverseitige Verschlüsselung der Secrets (AES-256-GCM).
*   Moderne Full-Stack-Architektur mit React, Node.js, PostgreSQL.
*   Containerisiert mit Docker und orchestriert mit Docker Compose für lokale Entwicklung.
*   Deployment-fähig auf Kubernetes mit Helm.
*   CI-Pipeline mit GitHub Actions für Linting und Tests.
*   Pre-commit Hooks für Code-Qualität.

## Technologie-Stack

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router DOM
*   **Backend:** Node.js, Express.js, pg (PostgreSQL Client), crypto (für Verschlüsselung)
*   **Datenbank:** PostgreSQL
*   **Containerisierung:** Docker, Docker Compose
*   **Deployment (AKS):** Kubernetes, Helm
*   **CI/CD:** GitHub Actions
*   **Linting/Formatting:** ESLint, Prettier
*   **Code-Qualität:** Husky, lint-staged

## Ordnerstruktur

```
ephemeral-secret-sharer/
├── .github/
│   └── workflows/
│       └── ci-pipeline.yml
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── logger.js
│   ├── routes/
│   ├── utils/
│   │   └── cryptoUtils.js
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateSecretForm.tsx
│   │   │   └── ViewSecret.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── eslint.config.js
│   ├── .prettierrc.json
│   ├── .prettierignore
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── helm-chart/
│   └── secret-sharer-app/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── templates/
│       │   ├── backend-deployment.yaml
│       │   ├── backend-service.yaml
│       │   ├── frontend-deployment.yaml
│       │   ├── frontend-service.yaml
│       │   ├── _helpers.tpl
│       │   └── ...
│       └── charts/
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

## Lokales Setup mit Docker Compose

Stelle sicher, dass Docker und Docker Compose installiert sind.

1.  **Klone das Repository:**
    ```bash
    git clone <repository-url>
    cd ephemeral-secret-sharer
    ```

2.  **Erstelle die `.env`-Dateien:**
    *   Kopiere `backend/.env.example` zu `backend/.env` und fülle die Werte aus.
        **Wichtig für Docker Compose:** Setze `DATABASE_URL=postgresql://user:password@postgres_db:5432/secret_sharer_db` in `backend/.env`.
        Setze `FRONTEND_URL=http://localhost` (oder den Port, den du für das Frontend in `docker-compose.yml` verwendest, z.B. 80).
    *   Kopiere `frontend/.env.example` zu `frontend/.env` und fülle die Werte aus:
        `VITE_API_BASE_URL=http://localhost:3001/api` (da das Backend auf Port 3001 des Hosts gemappt ist).

3.  **Starte die Anwendung mit Docker Compose:**
    ```bash
    docker-compose up --build -d
    ```

4.  **Zugriff:**
    *   Frontend: `http://localhost` (oder der in `docker-compose.yml` für das Frontend definierte Host-Port, z.B. 80).
    *   Backend API (direkt, optional): `http://localhost:3001`

5.  **Stoppen:**
    ```bash
    docker-compose down
    ```

## Lokale Entwicklung (ohne Docker Compose für Frontend/Backend)

1.  **Datenbank starten:**
    ```bash
    docker-compose up -d postgres_db
    ```
2.  **Backend starten:**
    *   Navigiere zu `backend/`.
    *   Passe `.env` an: `DATABASE_URL=postgresql://user:password@localhost:5432/secret_sharer_db`
    *   `npm install`
    *   `npm run dev`
3.  **Frontend starten:**
    *   Navigiere zu `frontend/`.
    *   Passe `.env` an: `VITE_API_BASE_URL=http://localhost:3001/api`
    *   `npm install`
    *   `npm run dev` (Frontend üblicherweise auf `http://localhost:5173`)

## Pre-commit Hooks

Husky und lint-staged sind im Hauptprojekt konfiguriert, um ESLint und Prettier vor jedem Commit für die jeweiligen Unterprojekte (Frontend, Backend) auszuführen.

## CI-Pipeline (GitHub Actions)

Dieses Projekt verwendet eine GitHub Actions CI-Pipeline, um die Code-Qualität sicherzustellen und den Build- sowie Veröffentlichungsprozess der Frontend- und Backend-Anwendungen zu automatisieren.
Workflow-Trigger

Der CI-Workflow wird automatisch bei folgenden Ereignissen ausgelöst:

Push auf den main-Branch.

Erstellung oder Aktualisierung eines Pull Requests, der auf den main-Branch zielt.

Hauptaufgaben der erweiterten CI-Pipeline

Die Pipeline führt eine Reihe von Schritten für das Backend und das Frontend aus:

Code-Checkout:

Der aktuelle Code des entsprechenden Branches oder Pull Requests wird in die virtuelle Umgebung des GitHub Actions Runners geladen.

Umgebung einrichten:

Node.js wird in der spezifizierten Version 22 eingerichtet.

Abhängigkeiten werden über npm ci für Backend und Frontend separat installiert, wobei der npm-Cache für schnellere Builds genutzt wird.

Für die Backend-Tests wird ein PostgreSQL Service-Container gestartet und eine Test-Datenbankumgebung (.env.test) mit den notwendigen Secrets (wie SECRET_KEY_CRYPTO und TEST_JWT_SECRET aus den GitHub Repository Secrets) und Datenbank-Zugangsdaten konfiguriert.
 Ein PostgreSQL-Client wird installiert, um die Bereitschaft der Datenbank zu überprüfen (pg_isready).

Code-Qualität und Tests:

Backend:

Linting: Der Code wird mit ESLint auf Stil- und Syntaxfehler geprüft (npm run lint).

Tests: Unit- und Integrationstests werden mit Jest ausgeführt (npm test), inklusive der Generierung eines Coverage-Reports.

 Die Tests laufen gegen die im Service-Container bereitgestellte PostgreSQL-Datenbank.

Frontend:
Linting: Der Code wird mit ESLint auf Stil- und Syntaxfehler geprüft (npm run lint).

Type Checking: Die TypeScript-Typintegrität wird mit tsc --noEmit überprüft (npm run typecheck).

Build: Die React-Anwendung wird mit npm run build (via tsc -b && vite build) für die Produktion gebaut.

Docker Image Packaging (Bau):
Dieser Schritt wird nur ausgeführt, wenn der Workflow durch einen Push auf den main-Branch getriggert wurde.

Mit docker/setup-buildx-action wird Docker Buildx für optimierte Builds eingerichtet.

Für das Backend und das Frontend werden separate Docker-Images gebaut:
Kontext: Der jeweilige Unterordner (./backend bzw. ./frontend).

Dockerfile: Das entsprechende Dockerfile im jeweiligen Unterordner wird verwendet (beide nutzen Multi-Stage Builds für optimierte und sichere Images).

Tagging: Die gebauten Images werden mit zwei Tags versehen:
:latest: Repräsentiert immer den neuesten Build vom main-Branch.
:${{ github.sha }}: Ein eindeutiger Tag, der den Git Commit SHA des Builds verwendet. Dies ermöglicht eine präzise Nachverfolgbarkeit und erleichtert Rollbacks.

Artefakt-Speicherung (Push zur Docker Registry):

Dieser Schritt wird ebenfalls nur bei einem Push auf den main-Branch ausgeführt und folgt direkt auf den Image-Bau.

Login: Die Pipeline meldet sich sicher bei Docker Hub an, indem sie die in den GitHub Repository Secrets gespeicherten Zugangsdaten (DOCKERHUB_USERNAME und DOCKERHUB_TOKEN) verwendet (docker/login-action).

Push: Die zuvor gebauten und getaggten Docker-Images für Backend und Frontend werden in die entsprechende Docker Hub Registry (unter DEIN_DOCKERHUB_USERNAME/ephemeral-secret-backend und DEIN_DOCKERHUB_USERNAME/ephemeral-secret-frontend) hochgeladen.

Funktionsweise und Vorteile
Diese erweiterte CI-Pipeline automatisiert den Prozess von der Code-Überprüfung bis zur Erstellung und Veröffentlichung der lauffähigen Anwendungsartefakte (Docker-Images).

Bau (Build): Die npm run build-Schritte kompilieren den Code und erstellen produktionsreife Assets. Der docker build-Prozess verpackt diese dann in containerisierte Umgebungen.

Packaging: Durch die Multi-Stage Dockerfiles werden schlanke und sichere Images erzeugt, die nur die notwendigen Laufzeitkomponenten enthalten.

Push (Store): Die versionierten Docker-Images werden sicher in Docker Hub gespeichert und stehen für manuelle oder automatisierte Deployments (z.B. auf AKS mit Helm) zur Verfügung.

Durch die Automatisierung dieser Schritte wird die Konsistenz erhöht, Fehler werden frühzeitig erkannt, und der Prozess zur Bereitstellung neuer Versionen wird deutlich beschleunigt und zuverlässiger.

Die Verwendung von eindeutigen Image-Tags (Commit SHA) ist dabei eine Schlüsselpraxis für eine gute Software-Lieferkette.


## AKS Deployment mit Helm

Die Anwendung kann mit dem Helm Chart im Verzeichnis `helm-chart/secret-sharer-app/` auf Azure Kubernetes Service (AKS) deployt werden.

1.  **Voraussetzungen:**
    *   Azure CLI, `kubectl`, `helm` installiert und konfiguriert.
    *   Verbindung zum AKS-Cluster.
    *   Docker-Images für Frontend und Backend in einer Container Registry (z.B. Docker Hub) gepusht.

2.  **Kubernetes Secrets erstellen:**
    *   `postgresql-secret`: Enthält das Datenbankpasswort (Keys: `postgres-password` und `postgresql-password`).
    *   `backend-secrets`: Enthält `secret-key-crypto` und `jwt-secret`.
    Beispielbefehle (Passwörter und Keys ersetzen):
    ```bash
    kubectl create secret generic postgresql-secret \
      --from-literal=postgres-password='YOUR_DB_PASSWORD' \
      --from-literal=postgresql-password='YOUR_DB_PASSWORD'
    kubectl create secret generic backend-secrets \
      --from-literal=secret-key-crypto='YOUR_64_CHAR_HEX_AES_KEY' \
      --from-literal=jwt-secret='YOUR_STRONG_JWT_SECRET'
    ```

3.  **Helm Chart anpassen:**
    *   Passe `helm-chart/secret-sharer-app/values.yaml` an, insbesondere die Image-Repositories und Tags.
    *   Passe `frontend/nginx.conf` den `proxy_pass`-Host für das Backend an den Kubernetes Service-Namen an (z.B. `DEINRELEASE-secret-sharer-app-backend:3001`). Baue das Frontend-Image danach neu.

4.  **Helm Abhängigkeiten aktualisieren (für PostgreSQL Subchart):**
    ```bash
    cd helm-chart/secret-sharer-app
    helm dependency update
    cd ../..
    ```

5.  **Helm Chart installieren/upgraden:**
    Ersetze Platzhalter und verwende die ermittelte externe IP des Frontend LoadBalancers.
    ```bash
    helm upgrade --install DEIN_RELEASE_NAME ./helm-chart/secret-sharer-app/ \
      --set frontend.image.repository=DEIN_DOCKERHUB_USER/ephemeral-secret-frontend \
      --set frontend.image.tag=DEIN_FRONTEND_TAG \
      --set backend.image.repository=DEIN_DOCKERHUB_USER/ephemeral-secret-backend \
      --set backend.image.tag=DEIN_BACKEND_TAG \
      --set backend.frontendUrlPlaceholder="http://DEINE_EXTERNE_FRONTEND_IP" \
      --set frontend.service.targetPort=8080 \
      --namespace DEIN_NAMESPACE \
      --create-namespace
    ```

6.  **Zugriff:** Ermittle die externe IP des Frontend LoadBalancer Services.

## Screenshots
Hier findest du die benötigten Assets: [Screenshots](./assets/)
---

# Ephemeral Secret Sharer

Ephemeral Secret Sharer ist eine Webanwendung zum sicheren Teilen von einmalig abrufbaren Text-Secrets. Die Secrets werden serverseitig verschlüsselt und nach dem ersten Abruf oder optional nach einer definierten Ablaufzeit automatisch gelöscht. Ich habe es auf Azure in einem Cluster deployt, erreichbar unter der IP: http://132.220.50.21/

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
---
ephemeral-secret-sharer/
├── .github/
│ └── workflows/
│ └── ci-pipeline.yml # GitHub Actions CI Workflow
├── backend/ # Node.js/Express Backend
│ ├── config/
│ │ ├── db.js # Datenbankverbindung und Initialisierung
│ │ └── logger.js # Winston Logger Konfiguration
│ ├── routes/ # (Optional, falls Routen ausgelagert werden)
│ ├── utils/
│ │ └── cryptoUtils.js # Ver- und Entschlüsselungslogik
│ ├── .env.example # Beispiel Umgebungsvariablen
│ ├── .eslintrc.json # ESLint Konfiguration
│ ├── .prettierrc.json # Prettier Konfiguration
│ ├── Dockerfile # Dockerfile für das Backend
│ ├── package.json
│ ├── package-lock.json
│ └── server.js # Haupt-Serverdatei
├── frontend/ # React/Vite Frontend
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── CreateSecretForm.tsx
│ │ │ └── ViewSecret.tsx
│ │ ├── App.tsx # Haupt-App-Komponente mit Routing
│ │ ├── index.css # Globale Styles (Tailwind-Importe)
│ │ └── main.tsx # Haupteinstiegspunkt (React DOM Render)
│ ├── .env.example # Beispiel Umgebungsvariablen für Vite
│ ├── eslint.config.js # ESLint Flat Config
│ ├── .prettierrc.json
│ ├── .prettierignore
│ ├── Dockerfile # Dockerfile für das Frontend
│ ├── nginx.conf # Nginx Konfiguration für den Frontend Container
│ ├── package.json
│ ├── package-lock.json
│ ├── tsconfig.json
│ └── vite.config.ts
├── helm-chart/
│ └── secret-sharer-app/ # Helm Chart für die Anwendung
│ ├── Chart.yaml
│ ├── values.yaml
│ ├── templates/
│ │ ├── backend-deployment.yaml
│ │ ├── backend-service.yaml
│ │ ├── frontend-deployment.yaml
│ │ ├── frontend-service.yaml
│ │ ├── _helpers.tpl
│ │ └── ... (weitere Helm Templates)
│ └── charts/ # Für Subcharts (z.B. PostgreSQL)
├── .gitignore
├── docker-compose.yml # Docker Compose für lokale Entwicklung
├── package.json # Haupt-package.json für Husky/lint-staged Root-Konfig
├── package-lock.json
└── README.md # Diese Datei
---
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

Ein Workflow in `.github/workflows/ci-pipeline.yml` führt bei jedem Push und Pull Request zum `main`-Branch automatisch Linting und Tests für Backend und Frontend aus.

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

---
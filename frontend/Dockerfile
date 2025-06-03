# Stage 1: Build the React application
FROM node:23.5.0-alpine AS builder

WORKDIR /app

# Kopiere package.json und package-lock.json (oder npm-shrinkwrap.json)
COPY package*.json ./

# Installiere Abhängigkeiten
# Verwende npm ci für konsistente Builds basierend auf package-lock.json
RUN npm ci

# Kopiere den gesamten Quellcode
COPY . .

# Baue die Anwendung für die Produktion
# Das Build-Skript sollte 'tsc && vite build' oder ähnlich sein
RUN npm run build
# Das Ergebnis des Builds liegt normalerweise in einem 'dist'-Ordner

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS production

# Definiere eine Standard-Nginx-Konfiguration
# Wir erstellen sie hier oder kopieren eine vorbereitete Datei
# Für eine SPA ist es wichtig, dass alle Anfragen, die keine Dateien sind,
# auf index.html umgeleitet werden, damit client-seitiges Routing funktioniert.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiere die gebauten statischen Dateien aus der Builder-Stage
# Der Vite-Build-Output ist normalerweise im 'dist'-Ordner
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponiere den Port, auf dem Nginx lauscht (Standard ist 80)
EXPOSE 80

# Standardbefehl zum Starten von Nginx
CMD ["nginx", "-g", "daemon off;"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1
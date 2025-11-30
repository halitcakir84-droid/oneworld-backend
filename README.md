# 🌍 One World Backend API

Vollständiges Backend für die One World humanitäre Spenden-App.

## 📋 Inhaltsverzeichnis

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Datenbank Setup](#datenbank-setup)
- [Konfiguration](#konfiguration)
- [Server starten](#server-starten)
- [API Dokumentation](#api-dokumentation)
- [Deployment](#deployment)
- [Abstimmungen verwalten](#abstimmungen-verwalten)

---

## ✨ Features

✅ **Benutzer-Authentifizierung**
- JWT-basiert
- Social Login (Google, Facebook)
- Password Reset

✅ **Abstimmungs-System** ⭐️
- Admin erstellt Abstimmungen
- User stimmen ab (1 Stimme pro Abstimmung)
- Live-Ergebnisse
- Automatische Status-Updates

✅ **Projekt-Management**
- Projekte erstellen/bearbeiten
- Spendenziele tracken
- Status-Updates

✅ **Spenden-System**
- PayPal, Stripe, Klarna Integration
- Projekt-spezifische Spenden
- Anonyme Spenden möglich

✅ **Werbung-Tracking**
- AdMob View-Counter
- Einnahmen-Berechnung
- User-Rankings

✅ **Partner-Verwaltung**
- Logo-Upload
- Partner-Übersicht

✅ **Galerie**
- Abgeschlossene Projekte
- Bild-Upload
- Projekt-Historie

---

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Datenbank:** PostgreSQL 14+
- **Authentication:** JWT + bcrypt
- **Validation:** Joi
- **Logging:** Winston
- **Security:** Helmet, CORS, Rate Limiting

---

## 📦 Installation

### 1. Voraussetzungen

Installiere:
- Node.js (v18 oder höher): https://nodejs.org/
- PostgreSQL (v14 oder höher): https://www.postgresql.org/
- npm (kommt mit Node.js)

### 2. Repository klonen

```bash
# Falls du Git verwendest
git clone <your-repo>
cd OneWorld-Backend

# ODER einfach die Dateien kopieren
```

### 3. Dependencies installieren

```bash
npm install
```

---

## 🗄 Datenbank Setup

### 1. PostgreSQL starten

**Windows:**
```bash
# PostgreSQL über Services starten
# ODER pgAdmin öffnen
```

**Mac:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### 2. Datenbank erstellen

```bash
# PostgreSQL Console öffnen
psql -U postgres

# Datenbank erstellen
CREATE DATABASE oneworld;

# User erstellen (optional)
CREATE USER oneworld_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE oneworld TO oneworld_user;

# Beenden
\q
```

### 3. Tabellen erstellen (Migration)

```bash
npm run migrate
```

Das erstellt automatisch alle Tabellen:
- users
- news
- projects
- donations
- ad_views
- votings ⭐️
- voting_options ⭐️
- user_votes ⭐️
- partners
- gallery
- gallery_images
- videos
- notifications
- push_tokens

---

## ⚙️ Konfiguration

### 1. Environment Variables

```bash
# Kopiere .env.example zu .env
cp .env.example .env

# Bearbeite .env mit deinen Werten
nano .env
```

### 2. Wichtigste Einstellungen

```env
# Datenbank
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneworld
DB_USER=postgres
DB_PASSWORD=dein_passwort

# JWT Secret (generiere einen zufälligen String!)
JWT_SECRET=dein_super_geheimer_schlüssel_hier

# Server
PORT=3000
NODE_ENV=development
```

### 3. JWT Secret generieren

```bash
# Generiere einen sicheren Key
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Kopiere den Output in .env als JWT_SECRET
```

---

## 🚀 Server starten

### Development Mode (mit Auto-Reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server läuft dann auf: **http://localhost:3000**

### Test ob es funktioniert

```bash
# In einem neuen Terminal
curl http://localhost:3000/health

# Sollte zurückgeben:
# {"status":"OK","timestamp":"...","environment":"development"}
```

---

## 📚 API Dokumentation

### Base URL

```
http://localhost:3000/api/v1
```

---

## 🗳️ ABSTIMMUNGEN VERWALTEN (Wichtigste Funktionen!)

### **1. Abstimmung erstellen (ADMIN)**

```http
POST /api/v1/votings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Welches Projekt soll als nächstes starten?",
  "description": "Stimme für dein Lieblingsprojekt",
  "start_date": "2025-02-01T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "project_ids": [
    "uuid-projekt-1",
    "uuid-projekt-2",
    "uuid-projekt-3"
  ]
}
```

**Response:**
```json
{
  "message": "Voting created successfully",
  "voting": {
    "id": "...",
    "title": "...",
    "status": "upcoming"
  }
}
```

---

### **2. Aktive Abstimmung abrufen (PUBLIC)**

```http
GET /api/v1/votings/active
```

**Response (wenn Abstimmung läuft):**
```json
{
  "voting": {
    "id": "...",
    "title": "Welches Projekt soll als nächstes starten?",
    "status": "active",
    "start_date": "2025-02-01T00:00:00Z",
    "end_date": "2025-02-28T23:59:59Z",
    "total_votes": 1247,
    "options": [
      {
        "id": "option-1",
        "project": {
          "id": "...",
          "title": "Schulbau Uganda",
          "description": "..."
        },
        "votes_count": 437,
        "percentage": 35
      },
      {
        "id": "option-2",
        "project": {
          "title": "Wasserfilter Indien"
        },
        "votes_count": 561,
        "percentage": 45
      }
    ]
  }
}
```

**Response (wenn KEINE Abstimmung läuft):**
```json
{
  "voting": null,
  "message": "No active voting at the moment"
}
```

---

### **3. Abstimmen (USER)**

```http
POST /api/v1/votings/:votingId/vote
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "option_id": "uuid-der-voting-option"
}
```

**Response:**
```json
{
  "message": "Vote recorded successfully",
  "voted_at": "2025-02-15T14:30:00Z"
}
```

**Fehler wenn schon abgestimmt:**
```json
{
  "error": "You have already voted in this voting"
}
```

---

### **4. Ergebnisse anzeigen**

```http
GET /api/v1/votings/:votingId/results
```

**Response:**
```json
{
  "voting": {
    "id": "...",
    "title": "...",
    "total_votes": 1247,
    "winner": {
      "project": {
        "title": "Wasserfilter Indien"
      },
      "votes_count": 561,
      "percentage": 45
    },
    "options": [...]
  }
}
```

---

### **5. Alle Abstimmungen (ADMIN)**

```http
GET /api/v1/votings
Authorization: Bearer <admin_token>
```

---

### **6. Abstimmung beenden (ADMIN)**

```http
POST /api/v1/votings/:votingId/close
Authorization: Bearer <admin_token>
```

Setzt Status auf "closed" und end_date auf jetzt.

---

### **7. Abstimmung löschen (ADMIN)**

```http
DELETE /api/v1/votings/:votingId
Authorization: Bearer <admin_token>
```

---

## 🔐 Authentication

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "user"
  }
}
```

### Token verwenden

```http
GET /api/v1/...
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📊 Weitere Endpoints

### Projekte

```http
GET    /api/v1/projects          # Alle Projekte
GET    /api/v1/projects/:id      # Einzelnes Projekt
POST   /api/v1/projects          # Neues Projekt (Admin)
PUT    /api/v1/projects/:id      # Projekt bearbeiten (Admin)
DELETE /api/v1/projects/:id      # Projekt löschen (Admin)
```

### Spenden

```http
GET    /api/v1/donations         # Alle Spenden (Admin)
POST   /api/v1/donations         # Neue Spende
GET    /api/v1/donations/user    # Meine Spenden
```

### Nachrichten

```http
GET    /api/v1/news              # Alle News
POST   /api/v1/news              # News hinzufügen (Admin)
PUT    /api/v1/news/:id          # News bearbeiten (Admin)
DELETE /api/v1/news/:id          # News löschen (Admin)
```

### Partner

```http
GET    /api/v1/partners          # Alle Partner
POST   /api/v1/partners          # Partner hinzufügen (Admin)
DELETE /api/v1/partners/:id      # Partner löschen (Admin)
```

### Werbung

```http
POST   /api/v1/ads/view          # Werbung gesehen
GET    /api/v1/ads/stats         # Statistiken (Admin)
GET    /api/v1/ads/leaderboard   # Top User
```

---

## 🚀 Deployment

### Option 1: Heroku

```bash
# Heroku CLI installieren
npm install -g heroku

# Login
heroku login

# App erstellen
heroku create oneworld-backend

# PostgreSQL Addon
heroku addons:create heroku-postgresql:mini

# Environment Variables setzen
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deployen
git push heroku main

# Migration ausführen
heroku run npm run migrate
```

### Option 2: DigitalOcean / AWS / Google Cloud

1. Server erstellen (Ubuntu 22.04)
2. Node.js installieren
3. PostgreSQL installieren
4. Repository klonen
5. `.env` konfigurieren
6. `npm install`
7. `npm run migrate`
8. PM2 für Prozess-Management:

```bash
npm install -g pm2
pm2 start src/server.js --name oneworld-api
pm2 save
pm2 startup
```

### Option 3: Docker

```dockerfile
# Dockerfile erstellen
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t oneworld-backend .
docker run -p 3000:3000 --env-file .env oneworld-backend
```

---

## 📖 Vollständiges Workflow-Beispiel: Abstimmung

### Als Admin:

**1. Erstelle Projekte:**
```http
POST /api/v1/projects
{
  "title": "Schulbau Uganda",
  "description": "...",
  "goal_amount": 10000
}
```
→ Erhalte `project_id`

**2. Erstelle Abstimmung:**
```http
POST /api/v1/votings
{
  "title": "Februar Abstimmung",
  "start_date": "2025-02-01",
  "end_date": "2025-02-28",
  "project_ids": ["id1", "id2", "id3"]
}
```

**3. Abstimmung ist jetzt live!**

---

### Als User:

**1. Hole aktive Abstimmung:**
```http
GET /api/v1/votings/active
```

**2. Stimme ab:**
```http
POST /api/v1/votings/:id/vote
{
  "option_id": "uuid"
}
```

**3. Fertig! ✅**

---

### In der App:

**Startseite:**
```javascript
// React Native Code
const response = await fetch('http://your-api.com/api/v1/votings/active');
const data = await response.json();

if (data.voting) {
  // Zeige Abstimmung
  showVoting(data.voting);
} else {
  // Zeige "Keine aktive Abstimmung"
  showEmptyState();
}
```

---

## 🔒 Sicherheit

✅ Helmet für HTTP Headers
✅ CORS konfiguriert
✅ Rate Limiting (100 Requests/15min)
✅ JWT Token Expiration
✅ Passwörter mit bcrypt gehashed
✅ SQL Injection Prevention (Prepared Statements)
✅ Input Validation mit Joi

---

## 📝 Logging

Logs werden gespeichert in:
- `logs/all.log` - Alle Logs
- `logs/error.log` - Nur Fehler
- Console Output im Development Mode

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Prüfe ob PostgreSQL läuft
psql -U postgres -c "SELECT version();"

# Prüfe .env Credentials
cat .env | grep DB_
```

### "Port 3000 already in use"
```bash
# Port ändern in .env
PORT=4000

# ODER anderen Prozess beenden
lsof -ti:3000 | xargs kill
```

### "JWT_SECRET not found"
```bash
# Stelle sicher dass .env existiert
ls -la .env

# Prüfe Inhalt
cat .env
```

---

## 📞 Support

Bei Fragen:
- E-Mail: support@oneworld.org
- Issues auf GitHub erstellen

---

## 📄 Lizenz

MIT License

---

## 🎉 Fertig!

Dein Backend läuft jetzt und du kannst:

✅ Abstimmungen im Admin-Panel erstellen
✅ User können abstimmen
✅ Live-Ergebnisse werden angezeigt
✅ Alles wird in PostgreSQL gespeichert

**Nächster Schritt:** Verbinde deine React Native App mit diesem Backend! 🚀

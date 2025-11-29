# 🚀 One World Backend - Deployment Anleitung

## 📦 Was ist in diesem Paket?

**Komplettes Backend für die One World App:**
- ✅ Node.js/Express Server
- ✅ PostgreSQL Datenbank Schema
- ✅ Admin-Panel (Web Interface)
- ✅ Settings-System (Feature Flags, Texte, Theme)
- ✅ Voting-System
- ✅ User-Management
- ✅ API Endpoints für Mobile App

---

## 🎯 SCHNELLSTART - In 10 Minuten deployed!

### **Schritt 1: Code zu GitHub hochladen**

1. **Gehe zu:** https://github.com/new
2. **Repository name:** `oneworld-backend`
3. **Public** wählen
4. **NICHT** "Add README" anhaken
5. **Create repository**

6. **Code hochladen:**
   - Klick: "uploading an existing file"
   - Entpacke `OneWorld-Backend-Complete.zip`
   - Ziehe ALLE Dateien ins GitHub-Fenster
   - Commit changes

---

### **Schritt 2: Render.com Account**

1. **Gehe zu:** https://render.com
2. **Sign up with GitHub**
3. Autorisiere Render

---

### **Schritt 3: PostgreSQL Datenbank erstellen**

1. **Render Dashboard → New + → PostgreSQL**

2. **Konfiguration:**
   ```
   Name: oneworld-db
   Database: oneworld
   User: oneworld
   Region: Frankfurt (oder näher)
   Plan: Free
   ```

3. **Create Database**

4. **Warte bis Status: Available** ✅

5. **Kopiere "Internal Database URL"** (brauchst du gleich!)
   ```
   postgresql://oneworld:xxxxx@...render.com/oneworld
   ```

---

### **Schritt 4: Backend Web Service erstellen**

1. **Dashboard → New + → Web Service**

2. **Repository verbinden:**
   - Wähle: `oneworld-backend`
   - Connect

3. **Konfiguration:**
   ```
   Name: oneworld-backend
   Region: Frankfurt (gleiche wie DB!)
   Branch: main
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Environment Variables:**
   
   Klick "Add Environment Variable" und füge ein:
   
   ```
   NODE_ENV = production
   PORT = 3000
   DATABASE_URL = [Paste Internal Database URL von Schritt 3!]
   JWT_SECRET = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ADMIN_SESSION_SECRET = x9y8z7a6b5c4d3e2f1g0h9i8j7k6l5m4
   API_VERSION = v1
   CORS_ORIGIN = *
   ```
   
   **WICHTIG:** Ändere JWT_SECRET und ADMIN_SESSION_SECRET zu echten zufälligen Strings!
   
   Generator: https://www.random.org/strings/

5. **Create Web Service**

6. **Warte 3-5 Min** bis Status: Live ✅

---

### **Schritt 5: Datenbank Setup**

**Wenn Backend Status = Live:**

1. **Klick auf "Shell" Tab** (oben)

2. **Führe diese Befehle aus:**

```bash
# 1. Haupt-Datenbank erstellen
node src/database/migrate.js

# 2. Settings-Tabellen erstellen
node src/database/migrate-settings.js

# 3. Settings mit Beispieldaten füllen
node src/database/seed-settings.js

# 4. Admin-User erstellen
node src/database/seed-admin.js
```

**Nach jedem Befehl:** Warte bis ✅ Success!

---

### **Schritt 6: Testen!**

**Deine Backend URL:**
```
https://oneworld-backend.onrender.com
```

**Tests:**

1. **Health Check:**
   ```
   https://oneworld-backend.onrender.com/health
   ```
   Sollte zeigen: `{"status":"ok",...}`

2. **Settings API:**
   ```
   https://oneworld-backend.onrender.com/api/v1/settings
   ```
   Sollte JSON mit Features, Texte, Theme zeigen

3. **Admin-Panel:**
   ```
   https://oneworld-backend.onrender.com/admin
   ```
   Login:
   - Email: admin@oneworld.com
   - Passwort: admin123

---

## 🎉 FERTIG! Backend läuft!

---

## 📱 Mobile App verbinden

**In deiner React Native App:**

**Datei:** `src/config/env.ts`

**Ändere:**
```typescript
export const ENV = {
  API_BASE_URL: 'https://oneworld-backend.onrender.com',
  // Rest bleibt gleich
};
```

**Dann:**
```bash
# App neu bauen
npm start
```

**App verbindet sich jetzt mit deinem Backend!** ✅

---

## 🔧 Backend verwalten

### **Admin-Panel:**
```
https://oneworld-backend.onrender.com/admin
```

**Hier kannst du:**
- ✅ Features ein/ausschalten
- ✅ Texte ändern
- ✅ Theme-Farben anpassen
- ✅ Abstimmungen verwalten
- ✅ Projekte verwalten
- ✅ User verwalten

**OHNE App-Update!** Änderungen sind sofort live!

---

### **Logs ansehen:**

**Render Dashboard:**
1. Gehe zu deinem Web Service
2. Klick "Logs" Tab
3. Siehst alle Requests, Errors, etc.

---

### **Datenbank verwalten:**

**Render Dashboard:**
1. Gehe zu deiner PostgreSQL Datenbank
2. Klick "Connect"
3. Nutze: psql, TablePlus, oder pgAdmin

---

## 📊 API Endpoints

**Alle Endpoints:**

### **Public (Kein Auth nötig):**
```
GET  /health
GET  /api/v1/settings
GET  /api/v1/settings/features
GET  /api/v1/settings/texts?lang=de
GET  /api/v1/settings/theme
GET  /api/v1/settings/navigation
GET  /api/v1/votings/current
GET  /api/v1/projects
```

### **User Auth (JWT Token nötig):**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/votings/vote
GET  /api/v1/users/me
```

### **Admin Only:**
```
POST /admin/api/login
GET  /admin/dashboard
PUT  /api/v1/settings/features/:key
PUT  /api/v1/settings/texts/:key
PUT  /api/v1/settings/theme/:id
POST /api/v1/votings
```

**Vollständige API Docs:** Siehe `API_DOKUMENTATION.md`

---

## 💾 Datenbank Schema

**Tabellen:**

### **Core:**
- `users` - User Accounts
- `votings` - Abstimmungen
- `voting_projects` - Projekte in Abstimmung
- `votes` - User Votes
- `projects` - Alle Projekte
- `donations` - Spenden

### **Settings:**
- `feature_flags` - Features ein/aus
- `app_texts` - Texte (mehrsprachig)
- `theme_settings` - Theme/Farben
- `navigation_tabs` - Navigation
- `app_config` - Konfiguration

### **Content:**
- `news` - News/Nachrichten
- `partners` - Partner-Logos
- `gallery` - Bilder-Galerie
- `videos` - "Die Idee" Videos

---

## 🔐 Sicherheit

### **Ändern nach Deployment:**

1. **Admin-Passwort ändern:**
   ```bash
   # In Shell:
   node src/scripts/change-admin-password.js
   ```

2. **JWT Secrets ändern:**
   - Render Dashboard → Environment Variables
   - JWT_SECRET: Neuer random string
   - ADMIN_SESSION_SECRET: Neuer random string
   - Restart Service

3. **CORS anpassen (Production):**
   ```
   CORS_ORIGIN = https://deine-domain.com,https://deine-app.com
   ```

---

## 🐛 Troubleshooting

### **Backend startet nicht:**
```
1. Check Logs in Render Dashboard
2. Prüfe Environment Variables
3. Prüfe DATABASE_URL ist korrekt
4. Prüfe Build Command: npm install
5. Prüfe Start Command: npm start
```

### **Datenbank Connection Error:**
```
1. Prüfe DATABASE_URL
2. Nutze INTERNAL Database URL (nicht External!)
3. DB und Backend in gleicher Region?
```

### **Migration Fehler:**
```
1. Lösche alle Tabellen in DB
2. Führe Migrations nochmal aus
3. Check Logs für spezifische Fehler
```

### **Admin Login funktioniert nicht:**
```
1. Wurde seed-admin.js ausgeführt?
2. Check in Shell: node src/database/seed-admin.js
3. Email: admin@oneworld.com
4. Passwort: admin123
```

---

## 📞 Support

**Bei Problemen:**

1. Check Logs in Render Dashboard
2. Prüfe Environment Variables
3. Teste API Endpoints einzeln
4. Check DATABASE_URL

**Häufige Fehler:**
- `ECONNREFUSED`: DATABASE_URL falsch
- `JWT Error`: JWT_SECRET fehlt
- `500 Error`: Check Server Logs
- `404 Error`: Route existiert nicht

---

## ✅ Checkliste

- [ ] Code auf GitHub
- [ ] Render Account erstellt
- [ ] PostgreSQL Datenbank erstellt
- [ ] Internal Database URL kopiert
- [ ] Web Service erstellt
- [ ] Environment Variables gesetzt
- [ ] Service deployed (Status: Live)
- [ ] migrate.js ausgeführt
- [ ] migrate-settings.js ausgeführt
- [ ] seed-settings.js ausgeführt
- [ ] seed-admin.js ausgeführt
- [ ] /health funktioniert
- [ ] /api/v1/settings funktioniert
- [ ] /admin Login funktioniert
- [ ] Mobile App ENV angepasst
- [ ] App mit Backend verbunden
- [ ] ALLES FUNKTIONIERT! 🎉

---

## 🚀 Nächste Schritte

1. **Admin-Passwort ändern** (Sicherheit!)
2. **Echte Projekte anlegen** (im Admin-Panel)
3. **Erste Abstimmung erstellen**
4. **Mobile App testen** mit echten Daten
5. **Settings anpassen** (Farben, Texte)
6. **Domain verbinden** (optional, später)

---

## 💰 Kosten

**Render.com Free Tier:**
```
✅ PostgreSQL: 1GB Storage (kostenlos)
✅ Web Service: 750 Stunden/Monat (kostenlos)
⚠️  Service schläft nach 15 Min Inaktivität
⚠️  Wacht in ~30 Sek auf bei Request
```

**Upgrade später (optional):**
```
Starter Plan: $7/Monat
- Kein Schlafen
- Mehr Performance
- Custom Domains
```

---

## 📚 Weitere Dokumentation

- `API_DOKUMENTATION.md` - Alle API Endpoints
- `SETTINGS_SYSTEM_DOKUMENTATION.md` - Settings-System
- `ADMIN_PANEL_QUICK_START.md` - Admin-Panel Guide
- `QUICK_START_SETTINGS.md` - Settings Quick Start

---

## 🎉 Viel Erfolg!

Dein Backend ist jetzt live und bereit für deine App! 🚀

Bei Fragen: Check die Logs und die Dokumentation!

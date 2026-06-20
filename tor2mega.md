# TOR2MEGA - MASTER PROJECT SPECIFICATION

## Mission

Construire une plateforme permettant à un utilisateur de transférer une vidéo publique directement vers Mega sans téléchargement manuel.

Workflow cible :

VIDEO URL
→ TOR EXTENSION / WEB APP / ANDROID APP
→ BACKEND
→ DOWNLOAD ENGINE
→ MEGA FILE REQUEST
→ COMPLETED

L'utilisateur ne doit jamais avoir à télécharger puis réuploader lui-même le fichier.

---

# OBJECTIFS

## V1

Créer :

* Extension Tor Browser
* Dashboard Web
* Backend API
* Upload automatique vers Mega File Request
* Historique complet
* Gestion de multiples destinations Mega

## V2

Créer :

* Progressive Web App (PWA)
* Android

## V3

Créer :

* SaaS multi-utilisateurs
* Équipe
* Facturation
* API publique

---

# ARCHITECTURE

Frontend Clients

* Tor Browser Extension
* Chrome Extension
* Web Dashboard
* PWA
* Android App

Backend

* API REST
* Authentication
* Download Engine
* Upload Engine
* Queue System
* Logging System

Infrastructure

* PostgreSQL
* Redis
* BullMQ

Media Processing

* yt-dlp
* ffmpeg

---

# USER FLOW

## Extension

Utilisateur visite une page contenant une vidéo publique.

Clic droit :

Send to Mega

ou

Send to Mega → Destination X

Le système :

1. récupère l'URL vidéo
2. envoie la tâche au backend
3. ajoute la tâche à la queue
4. télécharge la vidéo
5. upload vers Mega
6. affiche progression
7. conserve historique

---

# TOR EXTENSION

## Menu Contextuel

Ajouter :

* Send to Mega
* Send to Mega Destination #1
* Send to Mega Destination #2
* Copy Video URL

## Popup

Afficher :

* Queue Active
* Downloads
* Uploads
* Completed
* Failed

---

# DASHBOARD WEB

## Login

* Email
* Password

Prévoir :

* TOTP
* Passkeys

---

# HOME

Afficher :

* Total Downloads
* Total Uploads
* Files Today
* Success Rate
* Active Queue

---

# DOWNLOADS

Colonnes :

* ID
* File Name
* Source URL
* Size
* Status
* Progress
* Created
* Completed
* Destination

Status :

* Queued
* Downloading
* Uploading
* Completed
* Failed
* Cancelled

---

# DESTINATIONS

Gestion des Mega File Requests.

Fonctions :

* Create
* Edit
* Delete
* Enable
* Disable

Chaque destination contient :

* Name
* Mega File Request URL
* Status
* Created Date

---

# SETTINGS

Configuration :

* Max Concurrent Downloads
* Max Concurrent Uploads
* Retry Count
* Max File Size
* Cleanup Delay

---

# LOGS

Afficher :

* Success
* Failure
* Retry
* Queue Events
* Upload Events

---

# BACKEND

Stack :

* Node.js
* TypeScript
* Express

Architecture :

backend/

* api
* auth
* queue
* downloader
* uploader
* workers
* database
* logs

---

# DATABASE

Users

* id
* email
* password_hash
* created_at

Destinations

* id
* user_id
* name
* mega_url
* enabled
* created_at

Downloads

* id
* user_id
* destination_id
* source_url
* title
* filename
* size
* status
* progress
* created_at
* completed_at

Logs

* id
* download_id
* level
* message
* created_at

---

# DOWNLOAD ENGINE

Utiliser :

* yt-dlp
* ffmpeg

Fonctions :

* Detect Video
* Download
* Resume
* Metadata Extraction
* Progress Tracking

Formats :

* mp4
* webm
* mov
* mkv
* m3u8

---

# UPLOAD ENGINE

Fonctions :

* Upload vers Mega File Request
* Retry automatique
* Multi Destination
* Progress Tracking

---

# API

POST /api/downloads

Payload :

{
"url":"VIDEO_URL",
"destinationId":"ID"
}

GET /api/downloads

GET /api/destinations

POST /api/destinations

PUT /api/destinations

DELETE /api/destinations

---

# QUEUE SYSTEM

BullMQ

Queues :

* download_queue
* upload_queue
* cleanup_queue

---

# FILE STORAGE

Dossier temporaire :

/tmp/downloads

Suppression :

* Upload Success
* Retry Exhausted
* 24h Inactive

---

# SECURITY

Ne jamais stocker :

* Browser History
* External Cookies
* Tor Circuit Data

Stocker seulement :

* Download Metadata
* Queue State
* Upload State

---

# PWA (V2)

Transformer le dashboard en Progressive Web App.

Objectif :

* Android
* iPhone
* Windows
* Linux
* Mac

avec une seule base de code.

Fonctions :

* Historique
* Gestion destinations
* Ajout URL manuel
* Notifications

---

# ANDROID (V2)

Application Android utilisant la même API.

Fonctions :

* Ajouter URL
* Voir Progression
* Historique
* Destinations Mega
* Notifications Push

Architecture :

Android
↓
Same REST API
↓
Same Backend

Aucune logique métier dupliquée.

Toute la logique doit rester côté serveur.

---

# FUTURE FEATURES

Batch Mode

* Download 10 Videos
* Download 100 Videos
* Download Entire Page

Rules Engine

* If > 5GB → Destination B
* If mp4 → Destination A
* If mkv → Destination C

Notifications

* Telegram
* Discord
* Email
* Webhooks

---

# SUCCESS CRITERIA

L'utilisateur doit pouvoir :

1. Voir une vidéo publique.
2. Faire clic droit.
3. Choisir Send to Mega.
4. Fermer le navigateur.
5. Retrouver la vidéo dans Mega une fois le traitement terminé.

Aucun téléchargement manuel local ne doit être requis.

Le backend doit être conçu dès le départ pour supporter :

* Extension Tor
* Chrome
* Dashboard Web
* PWA
* Android

sans modification majeure de l'architecture.

# V1.5 - PERSONAL VIDEO CLOUD

## Évolution du produit

Le produit ne doit plus être conçu comme un simple téléchargeur de vidéos.

Le produit doit être conçu comme un cloud vidéo personnel.

Mega devient uniquement une couche de stockage invisible pour l'utilisateur.

L'utilisateur interagit exclusivement avec TOR2MEGA.

---

# Positionnement

TOR2MEGA =

* Video Capture
* Video Library
* Video Streaming
* Cloud Storage
* Browser Integration

L'utilisateur ne doit jamais avoir besoin d'ouvrir Mega.

---

# VIDEO LIBRARY

Créer un système de bibliothèque vidéo.

Toutes les vidéos envoyées doivent être indexées.

Chaque vidéo contient :

* ID
* Title
* Thumbnail
* Duration
* Size
* Source URL
* Upload Date
* Storage Location
* Status

---

# EXTENSION VIDEO LIBRARY

Lorsque l'utilisateur clique sur l'icône de l'extension :

Afficher :

* My Videos
* Downloads
* Upload Queue
* Search

Chaque vidéo doit afficher :

* Thumbnail
* Title
* Duration
* Size

Actions :

* Watch
* Download
* Delete
* Copy Link
* Rename

---

# VIDEO PLAYER

Créer un lecteur vidéo intégré.

Support :

* mp4
* webm
* mkv
* mov

Fonctions :

* Play
* Pause
* Seek
* Fullscreen
* Playback Speed
* Resume Playback

---

# CLEARWEB DASHBOARD

Créer :

https://app.tor2mega.com

Interface principale :

Sidebar :

* Dashboard
* Videos
* Downloads
* Browser
* Destinations
* Settings

---

# VIDEOS PAGE

Affichage type galerie.

Chaque vidéo affiche :

* Thumbnail
* Title
* Duration
* Size
* Upload Date

Actions :

* Watch
* Download
* Delete
* Rename
* Move

---

# SEARCH ENGINE

Permettre :

* Search by Title
* Search by URL
* Filter by Date
* Filter by Size
* Filter by Status

---

# BUILT-IN BROWSER

Créer un navigateur intégré dans le dashboard.

Objectif :

Dashboard
→ Browser
→ Detect Video
→ Send To Library

Fonctions :

* Address Bar
* Navigation
* Video Detection
* One Click Import

Lorsqu'une vidéo publique est détectée :

Afficher :

Add To Library

---

# VIDEO DATABASE

Ajouter la table :

videos

* id
* user_id
* title
* thumbnail
* duration
* size
* source_url
* mega_url
* status
* created_at

---

# STORAGE ABSTRACTION

L'utilisateur ne doit jamais voir :

* Mega URLs
* Mega File Requests
* Mega Internal Structure

Le système doit agir comme un cloud propriétaire.

Mega doit être utilisé uniquement comme moteur de stockage backend.

---

# PWA

Le dashboard doit être transformable en Progressive Web App.

Objectif :

* Android
* iPhone
* Windows
* Linux
* Mac

Une seule base de code.

Fonctions :

* Video Library
* Video Player
* Search
* Downloads
* Notifications

---

# ANDROID APP

Application Android connectée à la même API.

Fonctions :

* Browse Library
* Watch Videos
* Download Videos
* Delete Videos
* Search
* Notifications

Aucune logique métier ne doit être dupliquée.

Toute la logique reste dans le backend.

---

# FUTURE FEATURES

Collections

* Create Collection
* Move Videos
* Share Collection

Favorites

* Add Favorite
* Remove Favorite

Tags

* Assign Tags
* Filter By Tags

Playlists

* Create Playlist
* Add Video
* Remove Video

---

# FINAL PRODUCT VISION

TOR2MEGA doit être conçu comme :

Un cloud vidéo personnel multi-plateforme.

L'utilisateur peut :

1. Trouver une vidéo publique.
2. L'envoyer vers sa bibliothèque.
3. La retrouver sur Web, Extension ou Android.
4. La visionner en streaming.
5. La télécharger ou la supprimer.

Le stockage réel doit rester totalement transparent pour l'utilisateur.

# DISTRIBUTION & ECOSYSTEM

## Multi-Platform Ecosystem

TOR2MEGA doit être disponible depuis une interface unique.

Plateformes supportées :

* Web
* Tor Browser Extension
* Chrome Extension
* Android
* PWA

Toutes les plateformes utilisent la même API backend.

---

# OFFICIAL WEBSITE

Créer :

```text
https://tor2mega.com
```

ou

```text
https://app.tor2mega.com
```

Le site devient le point central du produit.

---

# LANDING PAGE

Sections :

* Hero
* Features
* Video Library
* Browser Integration
* Downloads
* Platforms
* FAQ
* Pricing

CTA :

* Start Free
* Open Dashboard
* Download Extension
* Download Android App

---

# DOWNLOAD CENTER

Créer une page :

```text
/downloads
```

Contenant :

## Tor Browser Extension

* Current Version
* Changelog
* Install Button

## Chrome Extension

* Current Version
* Changelog
* Install Button

## Android App

* APK Download
* Release Notes
* Version History

## PWA

* Install PWA

---

# USER DASHBOARD

Une fois connecté :

Sidebar :

* Dashboard
* Videos
* Browser
* Downloads
* Destinations
* Settings

---

# EXTENSION INTEGRATION

Lorsque l'utilisateur clique sur l'extension :

Options :

* Open Library
* Open Dashboard
* Open Browser
* Open Downloads

Ces boutons ouvrent directement le site TOR2MEGA.

Exemple :

```text
https://app.tor2mega.com/videos
```

L'extension agit comme une porte d'entrée vers l'écosystème.

---

# VIDEO SYNCHRONIZATION

Toutes les plateformes doivent partager :

* Same Account
* Same Library
* Same Downloads
* Same History
* Same Settings

Toute modification est synchronisée automatiquement.

---

# ANDROID INTEGRATION

Depuis le site :

Bouton :

```text
Download Android App
```

Fonctions Android :

* Browse Library
* Watch Videos
* Download Videos
* Search
* Notifications

Connexion au même compte.

---

# PWA INTEGRATION

Le site doit être installable.

Bouton :

```text
Install App
```

Support :

* Android
* iOS
* Windows
* Linux
* Mac

---

# ACCOUNT SYSTEM

Un compte unique permet :

* Web Access
* Tor Extension Access
* Chrome Extension Access
* Android Access
* PWA Access

Aucun compte séparé.

---

# PRODUCT VISION

TOR2MEGA ne doit pas être conçu comme une extension.

TOR2MEGA doit être conçu comme une plateforme cloud vidéo complète.

Les extensions et applications sont simplement différentes portes d'entrée vers la même bibliothèque vidéo personnelle.

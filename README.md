# 🔍 Lost & Found - Obiecte și Animale Pierdute

 <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758395029/Copy_of_Untitled_1_s0pji1.png" alt="Banner" width="100%">

**Lost & Found** este o platformă online care ajută oamenii să își regăsească obiectele și animalele pierdute. Utilizatorii pot posta anunțuri cu geolocalizare, pot căuta după nume, locație sau perioadă, se pot contacta pentru a se ajuta reciproc și de asemenea pot printa afișe cu anunțurile publicate.

## 📸 Preview

<div align="center">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-1.webp&w=3840&q=90" alt="Post Page" width="49%">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-2.webp&w=3840&q=90" alt="Create Post" width="49%">
</div>

<div align="center">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-3.webp&w=3840&q=90" alt="Dashboard" width="49%">
  <img src="https://rotis-web.vercel.app/_next/image?url=%2Fimages%2Fprojects%2FLostFound%2Flostfound-5.webp&w=3840&q=90" alt="Homepage" width="49%">
</div>

## ✨ Funcționalități

### 📍 Geolocalizare

- **Postare anunțuri cu localizare** precisă folosind Leaflet.js
- **Hartă interactivă** pentru vizualizarea tuturor anunțurilor
- **Căutare pe rază** în jurul unei locații specifice
- **Marcare automată** a zonei unde s-a pierdut obiectul/animalul

### 🔍 Căutare Avansată

- **Căutare după nume** - găsește rapid anunțuri specifice
- **Filtrare după locație** - limitează căutarea la anumite zone
- **Filtrare după perioadă** - anunțuri din ultimele zile/săptămâni
- **Categorii organizate** - obiecte personale, electronice, animale, etc.

### 🖨️ Generator Afișe

- **Afișe printabile personalizate** pentru fiecare anunț
- **Template-uri profesionale** cu toate detaliile importante
- **Format optimizat** pentru tipărire A4
- **QR code integrat** pentru acces rapid la anunțul online

### 👥 Sistem Social

- **Contact direct** între utilizatori prin platformă
- **Profil personal** cu istoricul anunțurilor
- **Dashboard intuitiv** pentru gestionarea anunțurilor proprii

### 🔒 Securitate

- **Autentificare securizată** cu validare email
- **Moderare anunțuri** pentru prevenirea abuzurilor
- **Backup automat** al datelor importante

## 🛠️ Stack Tehnologic

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

## 🎯 Provocări Tehnice

### 🗺️ Geolocalizare

- ✅ Implementarea geolocalizării precise și intuitive
- ✅ Optimizarea hărților pentru performanță
- ✅ Calculul distanțelor și căutarea pe rază

### 🔍 Sistem de Matching

- ✅ Crearea unui algoritm de matching eficient între pierderi și găsiri
- ✅ Indexare MongoDB pentru căutări rapide
- ✅ Implementarea Redis caching pentru performanță

### 📸 Gestionare Media

- ✅ Optimizarea uploadului și afișării imaginilor
- ✅ Compresie automată prin Cloudinary
- ✅ Lazy loading pentru încărcare rapidă

### 🔐 Securitate & Privacy

- ✅ Securizarea datelor de contact ale utilizatorilor
- ✅ Validare și sanitizare input-uri
- ✅ Rate limiting pentru API endpoints

## 📱 Mobile View

<div align="center">
  <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758396413/localhost_3000__iPhone_XR_zmjobt.png" alt="Mobile Homepage" width="32%">
  <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758396413/localhost_3000__iPhone_XR_2_n2645d.png" alt="Mobile Post" width="32%">
  <img src="https://res.cloudinary.com/dqyq1oiwi/image/upload/v1758396634/localhost_3000__iPhone_XR_3_cxnbtp.png" alt="Mobile Map" width="32%">
</div>

## 🚀 Instalare și Rulare

```bash
# Clonează repository-ul
git clone https://github.com/alecs007/lostfound.git

# Navighează în directorul proiectului
cd client

# Instalează dependențele pentru frontend
npm install

# Navighează în directorul backend
cd server && npm install

# Pornește serverele de dezvoltare
npm run dev:all
```

## 🔧 Configurare

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)

```bash
PORT=8000
NODE_ENV=development
MONGO_URI=your_mongo_uri
REDIS_URL=your_redis_url
APP_ORIGIN=http://localhost:8000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🎨 Design System

### Paleta de Culori

- **Galben Deschis**: `#ffd700` - Inspiră energie și optimism
- **Albastru Închis**: `#2c3e60` - Inspiră încredere și speranță
- **Portocaliu Secund**: `#f57a4e` - Pentru accenturi și butoane importante
- **Verde Success**: `#51e188` - Pentru mesaje de succes și confirmare
- **Roșu Alert**: `#ff4444` - Pentru alertele importante și erori
- **Gri Neutru**: `#9ca3af` - Pentru text secundar și borduri

### Tipografie

- **Titluri**: Geist, sans-serif - Clar și modern
- **Text**: Geist, sans-serif - Lizibilitate optimă pe toate dispozitivele

---

<div align="center">
  <p>🔍 Dezvoltat cu ❤️ pentru a reuni oamenii cu lucrurile dragi</p>
  
  ![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)
  ![Community Driven](https://img.shields.io/badge/🤝%20Community-Driven-blue?style=for-the-badge)
  ![Open Source](https://img.shields.io/badge/📖%20Open-Source-green?style=for-the-badge)
</div>

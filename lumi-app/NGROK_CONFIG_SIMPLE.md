# 🚀 SOLUTION SIMPLE - ngrok avec 2 tunnels (compte gratuit)

## ❌ Problème

Avec ngrok gratuit, vous ne pouvez avoir qu'**1 seul tunnel à la fois**.

L'erreur :
```
ERROR: Your account is limited to 1 simultaneous ngrok agent sessions.
```

## ✅ Solution : Fichier de configuration ngrok

Avec un fichier de configuration, vous pouvez démarrer **2 tunnels depuis le même agent** !

---

## 📝 Étapes à suivre

### 1️⃣ Ouvrir l'éditeur de configuration ngrok

```bash
ngrok config edit
```

Cela ouvrira un fichier dans votre éditeur par défaut (Notepad).

### 2️⃣ Ajouter la configuration des tunnels

Ajoutez ces lignes à la fin du fichier :

```yaml
tunnels:
  laravel:
    addr: 8000
    proto: http
    
  reverb:
    addr: 8080
    proto: http
```

**Sauvegardez** et fermez l'éditeur.

### 3️⃣ Démarrer les 2 tunnels en même temps

```bash
ngrok start --all
```

Vous verrez maintenant **2 URLs** :
```
laravel   https://xxxx-xxxx.ngrok-free.app -> http://localhost:8000
reverb    https://yyyy-yyyy.ngrok-free.app -> http://localhost:8080
```

### 4️⃣ Copier les URLs et mettre à jour `.env`

```env
# URL Laravel (première URL)
APP_URL=https://xxxx-xxxx.ngrok-free.app

# URL Reverb (deuxième URL, sans https://)
REVERB_HOST="yyyy-yyyy.ngrok-free.app"
REVERB_PORT=443
REVERB_SCHEME=https
```

### 5️⃣ Vider les caches et rebuild

```bash
php artisan config:clear
php artisan cache:clear
npm run build
```

### 6️⃣ Redémarrer Reverb

Dans le terminal Reverb :
- `Ctrl+C`
- Puis : `php artisan reverb:start`

### 7️⃣ Tester

Ouvrez l'app via l'URL Laravel et vérifiez dans la console :
```javascript
console.log(window.Echo);
```

---

## 🎯 Commandes complètes

```bash
# 1. Éditer la config ngrok
ngrok config edit

# 2. Ajouter les tunnels (voir ci-dessus)

# 3. Démarrer les 2 tunnels
ngrok start --all

# 4. Dans un autre terminal, après avoir mis à jour .env
php artisan config:clear
php artisan cache:clear
npm run build

# 5. Redémarrer Reverb
# Ctrl+C puis
php artisan reverb:start
```

---

## 📋 Exemple de fichier de configuration complet

Votre fichier `ngrok.yml` devrait ressembler à ça :

```yaml
version: "2"
authtoken: votre_token_ngrok_ici

tunnels:
  laravel:
    addr: 8000
    proto: http
    inspect: true
    
  reverb:
    addr: 8080
    proto: http
    inspect: true
```

---

## 🐛 Si `ngrok config edit` ne fonctionne pas

### Option A : Éditer manuellement

Le fichier se trouve ici :
```
C:\Users\Vianney\.ngrok2\ngrok.yml
```

Ouvrez-le avec Notepad et ajoutez les tunnels.

### Option B : Utiliser le fichier du projet

1. Copiez le fichier `ngrok.yml` du projet vers `C:\Users\Vianney\.ngrok2\`
2. Ou utilisez : `ngrok start --all --config=ngrok.yml`

---

## ✅ Checklist

- [ ] `ngrok config edit` exécuté
- [ ] Configuration des tunnels ajoutée
- [ ] `ngrok start --all` exécuté
- [ ] 2 URLs ngrok obtenues
- [ ] `.env` mis à jour avec les 2 URLs
- [ ] `php artisan config:clear && npm run build`
- [ ] Reverb redémarré
- [ ] Test dans le navigateur

---

## 💡 Astuce

Pour éviter de mettre à jour `.env` à chaque fois, vous pouvez utiliser des **domaines réservés** avec ngrok Pro. Mais avec le compte gratuit, les URLs changeront à chaque redémarrage de ngrok.

---

## 🎯 Résultat attendu

```
Session Status                online
Account                       Votre compte (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx.ngrok-free.app -> http://localhost:8000
Forwarding                    https://yyyy.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

Les 2 tunnels sont actifs ! ✅

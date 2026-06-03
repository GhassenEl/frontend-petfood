# VPN PetfoodTN (WireGuard)

Tunnel VPN optionnel pour :

- Accéder à l’API / au frontend **à distance** sans exposer les ports publiquement
- Faire passer les requêtes **ESP32 → distributeur IoT** uniquement par le réseau privé (option `FEEDER_REQUIRE_VPN`)

## Démarrage rapide (Docker)

```powershell
cd "frontend Lido"
copy .env.docker.example .env.docker
# Ajuster VPN_* si besoin dans .env.docker

npm run docker:vpn:up
```

Les fichiers client (QR code / `.conf`) sont créés dans :

`vpn/config/peer1/peer1.conf`, `peer2/`, etc.

Installez **WireGuard** sur le PC ou le téléphone, importez `peer1.conf`, connectez-vous.

## URLs via VPN

Une fois connecté au tunnel (sous-réseau par défaut `10.13.13.0/24`) :

| Service | URL (hôte Docker) |
|---------|-------------------|
| Frontend | `http://<IP-hôte>:8080` |
| API | `http://<IP-hôte>:5002` |
| Health | `http://<IP-hôte>:5002/health` |

Remplacez `<IP-hôte>` par l’adresse LAN du serveur (ex. `192.168.1.10`), pas par l’IP VPN du conteneur.

## Sécuriser les endpoints ESP32 (optionnel)

Dans `backend/.env` ou variables Docker du service `backend` :

```env
FEEDER_REQUIRE_VPN=true
VPN_ALLOWED_CIDRS=10.13.13.0/24
```

Les routes `/api/feeder/device/*` refuseront toute IP hors de ces plages (sauf `127.0.0.1` en local).

L’ESP32 doit alors envoyer ses heartbeats **depuis** un appareil sur le VPN (passerelle Raspberry Pi avec WireGuard, ou PC relais).

## Variables utiles (`.env.docker`)

| Variable | Défaut | Description |
|----------|--------|-------------|
| `VPN_SERVER_PORT` | `51820` | Port UDP WireGuard |
| `VPN_PEERS` | `3` | Nombre de configs client |
| `VPN_INTERNAL_SUBNET` | `10.13.13.0` | Réseau interne du tunnel |
| `VPN_SERVER_URL` | `auto` | IP/domaine public pour les clients |

## Sans Docker (Windows / Linux)

1. Installez [WireGuard](https://www.wireguard.com/install/).
2. Utilisez le conteneur uniquement pour générer les configs, ou créez un serveur WireGuard sur la machine hôte.
3. Gardez `FEEDER_REQUIRE_VPN=false` en développement local.

## Alternative : Tailscale

Pour une mise en place sans ouvrir de port UDP, [Tailscale](https://tailscale.com/) peut remplacer WireGuard : installez Tailscale sur le serveur et sur l’ESP32/passerelle, utilisez l’IP Tailscale dans `VPN_ALLOWED_CIDRS` (ex. `100.64.0.0/10`).

## Dépannage

- **Pas de handshake** : ouvrez le port UDP `51820` sur la box / cloud.
- **403 sur ESP32** : désactivez `FEEDER_REQUIRE_VPN` ou connectez l’appareil au VPN.
- **Dossier `vpn/config`** : ne pas committer (clés privées) — déjà dans `.gitignore`.

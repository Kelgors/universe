# Universe

Ce projet est un jeu spatial **4X décentralisé**, où chaque joueur peut héberger son propre serveur pour gérer une partie de l'univers. L'architecture repose sur **deux types de serveurs** pour équilibrer centralisation légère et décentralisation.

## **Galaxy (Registry)**

**Rôle** : Gestion de la galaxy

**Responsabilités** :

- **Gestion des profils joueurs** : Création, modification & suppression.
- **Gestion des serveurs** : Association d’un serveur à une *System*.
- **Annuaire des serveurs** : Liste publique des *Systems* actifs.
- **Authentification** : Vérification des joueurs et des serveurs.
- **Carte de la galaxie** : Visualisation globale de la galaxie et des secteurs.

## **System (Serveur de jeu)**

**Rôle** : Représente un système planétaire hébergé, permettant aux joueurs d’interagir dans un univers décentralisé.

**Responsabilités** :

- **Hébergement** : Stocke les données des joueurs présents et du système (stations,...)
- **Logique du jeu en temps réel** :
  - Gère les sockets des joueurs présents
  - Gestion des positions, combats, minage, ...
- **Gère les sauts hyperspatiaux** : Gère la transaction des données joueurs avec l'autre serveur (signature & vérification)
- **Liste de confiance** : Permet le saut hyperspatial complet avec une liste de confiance réduite de serveurs.
- **Autonomie** : Chaque noeud est isolé, par défaut les données sont et restent locales.

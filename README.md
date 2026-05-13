# Universe

Ce projet est un jeu spatial **4X décentralisé**, où chaque joueur peut héberger son propre serveur pour gérer une partie de l'univers. L'architecture repose sur **trois types de serveurs** pour équilibrer centralisation légère et décentralisation.


## **Galaxy (Registry)**

**Rôle** : Interface web centrale pour gérer la galaxie.

**Responsabilités** :

- **Gestion des profils joueurs** : Création et modification.
- **Gestion des serveurs** :
  - Création de serveurs *Sector*.
  - Association d’un serveur à une *Sector*.
  - Génération des **clés privées** pour les serveurs (utilisées pour signer les événements).
- **Annuaire des serveurs** : Liste publique des *Sectors* actives.
- **Authentification** : Vérification des joueurs et des serveurs via leurs clés.
- **Carte de la galaxie** : Visualisation globale de l’univers et des secteurs.

## **Judge**

**Rôle** : Autorité de surveillance et de modération pour les *Sectors*.

**Responsabilités** :

- **Rejeu asynchrone des événements** : Vérifie la cohérence des actions en les rejouant.
- **Gestion de la réputation** :
  - Note les serveurs en fonction de leur comportement.
  - Détecte les incohérences ou triches.
- **Sanctions** :
  - Révoque les **clés privées** des serveurs malveillants.
  - Exclut les serveurs des *Sectors*.
  - Bannit les IPs
- **Corrections** : Applique des ajustements pour rétablir un état valide

## **Sector**

**Rôle** : Cluster de serveurs **décentralisés** représentant un **secteur spatial**.

**Responsabilités** :

- **Logique du jeu en temps réel** :
  - Gestion des positions, combats, minage, etc.
  - Synchronisation des états entre les nœuds du cluster.
- **Signature des événements** :
  - Chaque nœud signe les actions locales avec sa **clé privée** (générée par *Galaxy*).
  - Les événements signés sont partagés avec les autres nœuds et *Judge*.
- **Autonomie locale** :
  - Fonctionne indépendamment pour les interactions dans son secteur.
  - Communique avec *Judge* pour les données globales (ex: inventaire).

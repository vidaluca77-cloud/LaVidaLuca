# Intégration Netlify CMS - La Vida Luca

Ce document explique l'intégration de Netlify CMS pour permettre la génération et gestion de contenu sur le site La Vida Luca.

## 📁 Structure ajoutée

### Dossier admin
- `admin/index.html` - Interface d'administration Netlify CMS
- `admin/config.yml` - Configuration des collections et champs

### Dossiers de contenu
- `_pages/` - Pages statiques (À propos, etc.)
- `_projets/` - Projets de La Vida Luca
- `_posts/` - Actualités et blog
- `_formations/` - Formations proposées
- `_data/` - Configuration du site (coordonnées, réseaux sociaux)
- `assets/images/` - Images uploadées via le CMS

### Configuration
- `netlify.toml` - Configuration Netlify (redirections, headers)

## 🚀 Fonctionnalités

### Collections configurées
1. **Pages** - Gestion des pages statiques
2. **Projets** - Gestion des projets agricoles
3. **Actualités** - Articles de blog et actualités
4. **Formations** - Gestion des formations proposées
5. **Configuration** - Paramètres du site (coordonnées, réseaux sociaux)

### Champs disponibles
- Titre, description, contenu markdown
- Images avec upload automatique
- Dates et horaires
- Statuts et catégories
- Informations de contact

## 🔧 Configuration requise

### 1. Authentification GitHub
Le CMS utilise GitHub OAuth pour l'authentification. Configuration dans `admin/config.yml` :

```yaml
backend:
  name: github
  repo: vidaluca77-cloud/LaVidaLuca
  branch: main
```

### 2. Déploiement Netlify
1. Connecter le repository à Netlify
2. Configurer l'authentification GitHub OAuth dans Netlify
3. Activer Netlify Identity (optionnel pour plus de sécurité)

### 3. Variables d'environnement
Si nécessaire, configurer dans Netlify :
- `GITHUB_TOKEN` pour l'accès API
- Autres variables spécifiques

## 📝 Utilisation

### Accès à l'admin
- URL : `https://votre-site.netlify.app/admin/`
- Lien discret ajouté dans le footer du site

### Workflow de publication
1. Se connecter à l'interface admin
2. Créer/modifier du contenu via l'éditeur visuel
3. Sauvegarder (commit automatique sur GitHub)
4. Publication automatique via Netlify

### Types de contenu

#### Projets
- Titre, description, statut
- Localisation et dates
- Contenu détaillé en markdown
- Images associées

#### Actualités
- Articles de blog
- Images de couverture
- Extraits pour les aperçus
- Publication programmée

#### Formations
- Informations détaillées (durée, prix, lieu)
- Nombre maximum de participants
- Description et programme
- Gestion des inscriptions

## 🔒 Sécurité

### Authentification
- GitHub OAuth pour les administrateurs
- Accès restreint aux collaborateurs du repository

### Validation
- Validation automatique du contenu
- Prévisualisation avant publication
- Historique des modifications via Git

## 🛠️ Maintenance

### Sauvegarde
- Contenu automatiquement sauvegardé dans Git
- Historique complet des modifications
- Possibilité de rollback

### Mises à jour
- Netlify CMS se met à jour automatiquement
- Configuration versionnée avec le site

## 📖 Documentation

### Netlify CMS
- [Documentation officielle](https://www.netlifycms.org/docs/)
- [Guide de configuration](https://www.netlifycms.org/docs/configuration-options/)

### Déploiement
- [Netlify + GitHub](https://docs.netlify.com/configure-builds/repo-permissions-linking/)
- [GitHub OAuth](https://docs.netlify.com/visitor-access/oauth-provider-tokens/)

## 🎯 Prochaines étapes

1. **Test de l'interface** - Vérifier l'accès admin
2. **Configuration OAuth** - Paramétrer l'authentification
3. **Formation** - Former les administrateurs à l'utilisation
4. **Migration contenu** - Migrer le contenu existant si nécessaire
5. **Optimisation** - Ajuster les collections selon les besoins

## 📞 Support

Pour toute question concernant l'intégration :
- Documentation Netlify CMS
- Issues GitHub du repository
- Contact : vidaluca77@gmail.com
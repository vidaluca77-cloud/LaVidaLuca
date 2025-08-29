# Mollie Payment Integration - La Vida Luca

Ce projet intègre les paiements Mollie pour les dons de l'association La Vida Luca.

## Configuration

1. **Clé API Mollie**
   - Obtenez votre clé API depuis le dashboard Mollie
   - Copiez `config.template.php` vers `config.php`
   - Mettez à jour la clé API dans le fichier de configuration

2. **Variables d'environnement**
   ```
   MOLLIE_API_KEY=your_mollie_api_key_here
   ```

3. **URLs de retour**
   - Mettez à jour les URLs dans `config.php` avec votre domaine
   - Configurez le webhook dans votre dashboard Mollie

## Fichiers

### Frontend
- `dons.html` - Page principale de don
- `lavidaluca_dons_html.html` - Page alternative de don
- `donation-success.html` - Page de confirmation après paiement
- `script.js` - Logique JavaScript pour l'intégration

### Backend
- `process_payment.php` - Création des paiements Mollie
- `webhook.php` - Traitement des notifications de statut
- `config.template.php` - Template de configuration

### Test
- `test_mollie.html` - Page de test pour vérifier l'intégration

## Fonctionnalités

✅ **Intégration Mollie complète**
- Création de paiements via l'API Mollie
- Gestion des webhooks pour les mises à jour de statut
- Support des paiements ponctuels et récurrents

✅ **Interface utilisateur**
- Sélection de montants prédéfinis
- Formulaire de coordonnées complet
- Redirection sécurisée vers Mollie

✅ **Gestion des données**
- Logging des dons et transactions
- Génération automatique de reçus fiscaux
- Gestion de la conformité RGPD

✅ **Sécurité**
- Validation côté client et serveur
- Gestion d'erreurs robuste
- Protection contre les attaques communes

## Test de l'intégration

1. Ouvrez `test_mollie.html` dans votre navigateur
2. Remplissez le formulaire de test
3. Cliquez sur "Test Paiement Mollie"
4. Vérifiez que la redirection vers Mollie fonctionne

## Production

Avant la mise en production :

1. **Remplacez la clé de test** par votre clé API live Mollie
2. **Configurez le webhook** dans votre dashboard Mollie
3. **Mettez à jour les URLs** dans la configuration
4. **Supprimez** `test_mollie.html`
5. **Configurez HTTPS** pour sécuriser les transactions

## Support

Pour toute question concernant l'intégration Mollie :
- Documentation Mollie : https://docs.mollie.com/
- Support Mollie : https://help.mollie.com/

## Logs

Les fichiers de log sont créés automatiquement :
- `donations.log` - Dons réussis
- `webhook_errors.log` - Erreurs du webhook
- `receipts.log` - Reçus fiscaux générés

Ces fichiers sont exclus du contrôle de version via `.gitignore`.
# Intégration Zapier pour Les Dons - La Vida Luca

## Vue d'ensemble

Ce système de dons supporte maintenant deux méthodes d'intégration :
1. **Zapier** (méthode principale) - Pour automatiser les workflows
2. **Mollie direct** (méthode de secours) - Intégration directe avec l'API Mollie

## Configuration

### 1. Configuration Zapier

Mettez à jour le fichier `config.php` avec votre URL webhook Zapier :

```php
'zapier' => [
    'enabled' => true,
    'webhook_url' => 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_URL/',
    'fallback_to_mollie' => true, // Utilise Mollie si Zapier échoue
],
```

### 2. Variables d'environnement

Vous pouvez également utiliser des variables d'environnement :

```bash
export ZAPIER_WEBHOOK_URL="https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_URL/"
export MOLLIE_API_KEY="your_mollie_api_key"
```

## Fonctionnement

### Flux de soumission

1. **Formulaire de don soumis** → `donation_handler.php`
2. **Si Zapier activé** :
   - Tentative d'envoi vers Zapier webhook
   - Si succès → Redirection vers page de succès ou URL Zapier
   - Si échec ET fallback activé → Utilisation de Mollie
3. **Si Zapier désactivé OU fallback** :
   - Création directe du paiement Mollie
   - Redirection vers la page de paiement Mollie

### Données envoyées à Zapier

```json
{
    "amount": 50.00,
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "0612345678",
    "address": "123 Rue Example",
    "postal": "14000",
    "city": "Caen",
    "donation_type": "ponctuel",
    "message": "Message du donateur",
    "fiscal_receipt": true,
    "anonymous": false,
    "newsletter": true,
    "timestamp": "2025-01-11 10:30:00"
}
```

## Configuration Zapier

### Étapes recommandées dans Zapier :

1. **Trigger** : Webhook (Catch Hook)
2. **Action 1** : Mollie - Create Payment
3. **Action 2** (optionnel) : Email - Send notification
4. **Action 3** (optionnel) : Google Sheets - Add row
5. **Response** : Retourner l'URL de paiement Mollie

### Format de réponse Zapier attendu :

```json
{
    "status": "success",
    "redirect_url": "https://www.mollie.com/payscreen/select-method/..."
}
```

## Fichiers modifiés

- `config.php` - Configuration Zapier ajoutée
- `donation_handler.php` - **NOUVEAU** - Gestionnaire unifié pour Zapier et Mollie
- `script.js` - Mise à jour pour utiliser le nouveau gestionnaire
- `dons.html` - Ajout de champs pour Zapier et amélioration des noms de champs
- `test_zapier_integration.html` - **NOUVEAU** - Page de test

## Tests

### Test manuel
1. Ouvrir `test_zapier_integration.html`
2. Remplir le formulaire de test
3. Vérifier la réponse (Zapier ou Mollie)

### Test en ligne de commande
```bash
curl -X POST http://localhost/donation_handler.php \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25,
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com",
    "donation_type": "ponctuel",
    "fiscal_receipt": true
  }'
```

## Migration depuis l'ancienne version

### Avant (ancien système)
- Formulaire → `process_payment.php` → Mollie uniquement

### Après (nouveau système)
- Formulaire → `donation_handler.php` → Zapier (avec fallback Mollie)

### Rétrocompatibilité
L'ancien système continue de fonctionner. Pour migrer :
1. Mettez à jour `config.php` avec les paramètres Zapier
2. Le système utilisera automatiquement Zapier si configuré

## Dépannage

### Zapier ne fonctionne pas
- Vérifiez l'URL webhook dans `config.php`
- Consultez les logs d'erreur PHP
- Si `fallback_to_mollie` est activé, Mollie prendra le relais

### Problèmes de configuration
```bash
# Vérifier la configuration
php -r "var_dump(require 'config.php');"

# Test de connectivité Zapier
curl -X POST YOUR_ZAPIER_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'
```

### Logs
- Erreurs PHP : logs du serveur web
- Erreurs Zapier : `error_log()` dans donation_handler.php

## Avantages de l'intégration Zapier

1. **Automatisation** : Workflows complexes sans développement
2. **Intégrations** : Connexion avec 5000+ applications
3. **Notifications** : Alertes automatiques par email/Slack
4. **Reporting** : Synchronisation avec Google Sheets, CRM, etc.
5. **Flexibilité** : Modification des workflows sans code

## Support

Pour toute question :
- Documentation Zapier : https://zapier.com/help
- Documentation Mollie : https://docs.mollie.com/
- Code source : Voir les commentaires dans `donation_handler.php`
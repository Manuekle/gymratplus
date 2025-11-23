# Configuración de PayPal Subscription

## Variables de Entorno Requeridas

Solo necesitas estas **3 variables obligatorias**:

```env
PAYPAL_CLIENT_ID=tu_client_id_de_paypal
PAYPAL_CLIENT_SECRET=tu_client_secret_de_paypal
PAYPAL_ENVIRONMENT=sandbox  # o 'live' para producción
```

## Variables Opcionales

Estas variables son **opcionales** y el sistema las creará automáticamente si no las tienes:

- `PAYPAL_PRODUCT_ID` - Si no existe, el sistema intentará crear un Product automáticamente
- `PAYPAL_PLAN_ID_MONTHLY` - Si no existe, se creará un plan mensual automáticamente
- `PAYPAL_PLAN_ID_ANNUAL` - Si no existe, se creará un plan anual automáticamente

## Cómo Obtener las Credenciales

1. Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Inicia sesión con tu cuenta de PayPal
3. Crea una nueva aplicación o usa una existente
4. Copia el **Client ID** y **Client Secret**
5. Configura estas variables en tu archivo `.env.local`

## Configuración del Webhook

1. En el PayPal Developer Dashboard, ve a tu aplicación
2. Configura el webhook URL: `https://tu-dominio.com/api/payment/paypal/webhook`
3. Selecciona estos eventos:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `PAYMENT.SALE.COMPLETED`

## Notas Importantes

- El sistema creará automáticamente el Product y los Plans si no existen
- Los planes se crean con precios: $5.99/mes (mensual) y $50/año (anual)
- Todos los planes incluyen 14 días de prueba gratis
- En modo sandbox, puedes usar las credenciales de prueba de PayPal


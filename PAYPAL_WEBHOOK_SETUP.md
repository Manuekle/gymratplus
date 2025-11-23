# Configuración de Webhook de PayPal

## URL del Webhook

### Para Desarrollo (Sandbox)
Si estás usando un túnel como ngrok o similar:
```
https://tu-tunel-ngrok.ngrok.io/api/payment/paypal/webhook
```

### Para Producción
```
https://tu-dominio.com/api/payment/paypal/webhook
```

**Nota:** PayPal requiere HTTPS para los webhooks. No funcionará con `http://localhost:3000` directamente.

## Pasos para Configurar el Webhook en PayPal

1. **Ve al PayPal Developer Dashboard**
   - https://developer.paypal.com/dashboard
   - Inicia sesión con tu cuenta

2. **Selecciona tu aplicación Sandbox**
   - Asegúrate de estar en el entorno correcto (Sandbox o Live)

3. **Ve a la sección "Webhooks"**
   - En el menú lateral, busca "Webhooks" o "Notificaciones"

4. **Haz clic en "Add Webhook"**

5. **Configura el Webhook:**
   - **Webhook URL:** Ingresa la URL completa del webhook (ver arriba)
   - **Event types:** Selecciona los siguientes eventos:

## Eventos a Suscribir

Selecciona estos eventos específicos:

- ✅ `BILLING.SUBSCRIPTION.CREATED` - Cuando se crea una suscripción
- ✅ `BILLING.SUBSCRIPTION.ACTIVATED` - Cuando se activa una suscripción
- ✅ `BILLING.SUBSCRIPTION.CANCELLED` - Cuando se cancela una suscripción
- ✅ `BILLING.SUBSCRIPTION.SUSPENDED` - Cuando se suspende (pago fallido)
- ✅ `BILLING.SUBSCRIPTION.UPDATED` - Cuando se actualiza una suscripción
- ✅ `PAYMENT.SALE.COMPLETED` - Cuando se completa un pago

**Alternativa:** Puedes seleccionar "Subscribe to all events" si prefieres recibir todos los eventos.

6. **Guarda el Webhook**

7. **Copia el Webhook ID**
   - PayPal te dará un Webhook ID
   - Guárdalo por si necesitas verificarlo más tarde

## Verificación del Webhook

PayPal enviará un evento de verificación inmediatamente después de crear el webhook. Nuestro endpoint debería responder con `{ received: true }`.

## Testing del Webhook

Puedes probar el webhook usando:

1. **PayPal Webhook Simulator** (en el dashboard)
   - Ve a tu webhook
   - Haz clic en "Test webhook"
   - Selecciona un evento para simular

2. **Revisar los logs**
   - En tu aplicación, revisa los logs del servidor
   - Deberías ver: `PayPal Webhook recibido: [EVENT_TYPE]`

## Troubleshooting

### El webhook no recibe eventos
- Verifica que la URL sea accesible públicamente (HTTPS)
- Revisa que el endpoint responda correctamente
- Verifica los logs de PayPal en el dashboard

### Errores 500 en el webhook
- Revisa los logs del servidor para ver el error específico
- Verifica que las credenciales de PayPal estén correctas
- Asegúrate de que la base de datos esté accesible

## Seguridad (Producción)

En producción, deberías verificar la firma del webhook para asegurarte de que viene de PayPal. Actualmente el código procesa todos los webhooks, pero en producción deberías:

1. Obtener el Webhook ID de PayPal
2. Verificar la firma del webhook usando el SDK de PayPal
3. Solo procesar webhooks verificados


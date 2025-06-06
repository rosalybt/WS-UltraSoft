# WhatsApp Multi-Session Bot

Este bot permite enviar mensajes y archivos PDF por WhatsApp a través de múltiples sesiones para distintas empresas.

## Endpoints

- `/qr/:sessionId`: Genera y muestra el QR para autenticar una sesión de empresa
- `/send-pdf`: Envía un PDF al número WhatsApp usando el `sessionId` autenticado

## Cómo desplegar en Railway

1. Entra a [https://railway.app](https://railway.app)
2. Crea un nuevo proyecto > "Deploy from template" > Sube este ZIP
3. Railway instalará automáticamente las dependencias y levantará el servidor


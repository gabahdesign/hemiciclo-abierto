# Fase 2 · Worker, D1 y autenticación

La web publicada en GitHub Pages es estática y no puede escribir en D1. La participación real debe servirse desde el Worker de Cloudflare/Vinext, manteniendo Pages como vista pública si se desea.

## Configuración en Cloudflare

1. En el proyecto de Cloudflare, crea una base D1 llamada `hemiciclo-abierto`.
2. Vincula esa base al binding `DB` del proyecto (el nombre debe coincidir con `.openai/hosting.json`).
3. Aplica las migraciones de `drizzle/` en orden, incluida `0001_privacy_consent.sql`.
4. Configura variables no secretas del Worker:
   - `POLL_ENABLED=false` durante las pruebas.
   - `POLL_CONTROLLER=Marc Garccia Gabarró`.
   - `POLL_CONTACT=admin@descobreix.com`.
5. Mantén `POLL_ENABLED=false` hasta terminar la revisión jurídica, las pruebas de autenticación y la protección contra abuso.

La autenticación utiliza los encabezados de identidad de Sign in with ChatGPT que inyecta Sites. La aplicación conserva únicamente un hash del identificador estable de cuenta; no usa el correo como clave de voto.

## Comprobación de fase 2

- `GET /api/participacion` debe responder con `enabled:false` mientras la participación esté cerrada.
- Una persona no autenticada no puede crear ni modificar respuestas.
- Las respuestas se guardan con versión de consentimiento, fecha de consentimiento y fecha de actualización.
- GitHub Pages no debe mostrar la encuesta como activa: solo el Worker puede habilitarla.

No actives `POLL_ENABLED` todavía. La fase 3 añadirá y probará las operaciones de crear, modificar y retirar contra D1 con control de concurrencia y límites de abuso.

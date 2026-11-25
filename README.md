# Recova MVP

Recova conecta a generadores de materiales secundarios con empresas que pueden aprovecharlos. El MVP usa datos de ejemplo de Santa Cruz, Bolivia.

## Vista interactiva

[Abrir Recova en el navegador](https://adhexxx.github.io/recova-mvp/). La edición de GitHub Pages usa las mismas pantallas y datos de ejemplo que la app local. Permite publicar, explorar coincidencias y agrupaciones, y gestionar operaciones dentro del navegador. El chat requiere el servidor de Recova.

## Ejecutar en local

Con Node.js y npm instalados, ejecutá:

```bash
npm ci
npm run dev
```

Abrí http://localhost:3000. Para probar desde un celular conectado al mismo Wi-Fi, escaneá el QR que se imprime en la terminal.

## Probar el MVP

Elegí **Generador** o **Comprador** en la pantalla de entrada. Podés cambiar de rol desde el encabezado, sin ingresar credenciales.

- **Inicio:** consultá el panel y publicá una oferta o una necesidad.
- **Materiales:** explorá el mercado y consultá tus publicaciones.
- **EVA:** revisá coincidencias, agrupaciones y recomendaciones, o abrí el chat.
- **Operaciones:** confirmá coincidencias y revisá los acuerdos y el historial.

Los cambios se guardan en el navegador. Para ver la misma operación desde ambos roles, alterná entre ellos en el mismo navegador.

El chat de EVA está integrado con OpenAI y requiere una instancia configurada. Las coincidencias y las propuestas de agrupación funcionan localmente con las reglas de Recova.

## Verificar la compilación

```bash
npm run build
```

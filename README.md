# Santi Villa Abrille - Culinary Creator Dashboard

Dashboard estático para organizar proyectos gastronómicos, compras, tareas, recetas y contenido para redes.

## Cómo usarlo

1. Abrí `index.html` en el navegador.
2. Editá `data/projects.json` para agregar o modificar proyectos.
3. Subilo a GitHub Pages para verlo online.

## Estructura

```txt
data/
  config.json
  projects.json
assets/
  images/
index.html
styles.css
script.js
```

## Agregar un proyecto

Podés usar el botón **Generar proyecto** dentro del dashboard. Eso genera un bloque JSON para copiar y pegar dentro del array de `data/projects.json`.

Ejemplo de proyecto:

```json
{
  "id": "cheesecake-frutos-rojos",
  "title": "Cheesecake clásica con frutos rojos",
  "status": "idea",
  "category": "tartas",
  "priority": "media",
  "goal": "Crear cheesecake estable para fotos, receta repetible y posible reel.",
  "contentPending": true,
  "dateTarget": "",
  "coverImage": "",
  "links": {
    "youtube": "",
    "instagram": "",
    "tiktok": "",
    "photos": ""
  },
  "tasks": [
    { "text": "Comprar queso crema", "done": false, "type": "compra" }
  ],
  "notes": [],
  "recipe": {
    "ingredients": [],
    "steps": [],
    "result": "Sin probar"
  }
}
```

## Valores recomendados

### status

- `idea`
- `investigacion`
- `en-prueba`
- `produccion`
- `aprobado`
- `abandonado`

### category

- `bombones`
- `tartas`
- `mousses`
- `chocolateria`
- `general`

### priority

- `alta`
- `media`
- `baja`

### task.type

- `compra`
- `produccion`
- `contenido`

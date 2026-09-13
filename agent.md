# Marcador Gamer - Agente de Desarrollo

## 1. Visión General del Proyecto
**Marcador Gamer** es una aplicación web estática (Single Page Application sin dependencias externas obligatorias) diseñada para registrar, visualizar y gestionar puntuaciones escolares con una temática y estética de videojuegos retro (pixel art / 8-bit / arcade inspirado en títulos como Super Mario Bros y Minecraft).

---

## 2. Alcance y Estructura de Datos
- **Grados escolares contemplados:** Estrictamente 3 grados de nivel primaria:
  - 1° de Primaria
  - 2° de Primaria
  - 3° de Primaria
- **Equipos por grado:** Exactamente 4 equipos por cada grado (total de 12 equipos gestionables).
- **Entidades mínimas por equipo:**
  - Identificador único (`id`).
  - Grado asignado (`grade`: "1", "2", "3").
  - Nombre del equipo (personalizable con temática gamer, ej. Champiñones, Creepers, Estrellas, Diamantes).
  - Puntuación actual (`score`: número entero).
  - Avatar / ícono retro representativo.

---

## 3. Arquitectura Técnica
- **Frontend puro:**
  - `HTML5` semántico.
  - `CSS3` modular con tipografías pixel art (ej. Google Fonts 'Press Start 2P', estética CRT/scanlines, paletas retro, botones estilo arcade).
  - `JavaScript Vanilla` (ES6+) estructurado en módulos o funciones limpias, sin frameworks pesados ni dependencias externas obligatorias.
- **Persistencia de Datos:**
  - **100% en el navegador** utilizando `localStorage`.
  - Sin backend, sin servidores de bases de datos externas.
  - Clave de almacenamiento recomendada: `marcador_gamer_data_v1`.
- **Copia de Seguridad y Portabilidad:**
  - Función de **Exportar:** descarga directa de un archivo `.json` con el estado completo de los 3 grados y sus 4 equipos.
  - Función de **Importar:** carga y validación de archivo `.json` para restaurar o transferir los puntajes entre diferentes dispositivos o navegadores.

---

## 4. Estructura de Archivos del Proyecto
```text
marcador-gamer/
│
├── agent.md             # Directrices de arquitectura y contexto del agente
├── index.html           # Estructura principal de la interfaz
├── styles.css           # Estilos visuales gamer / pixel art
├── app.js               # Lógica del marcador, eventos y persistencia en localStorage
│
└── assets/
    ├── fonts/           # Fuentes locales (opcional / fallback)
    ├── images/          # Sprites, iconos y fondos pixel art
    └── sounds/          # Efectos de sonido 8-bit (monedas, power-up, game over, etc.)
```

---

## 5. Reglas de Desarrollo para el Agente
1. **Simplicidad y Robustez:** Mantener el código comprensible, modular y fácil de desplegar (puede abrirse con doble clic sobre `index.html` o vía GitHub Pages / Live Server).
2. **Experiencia de Usuario (Gamificación):**
   - Interfaz colorida, divertida y clara para niños y maestros de primaria.
   - Controles accesibles para sumar/restar puntos con feedback visual (animaciones tipo pop/bounce) y sonoro.
   - Prevención de pérdida accidental de datos (confirmación al reiniciar o sobreescribir datos importados).
3. **Resiliencia en LocalStorage:**
   - Inicializar con datos por defecto si `localStorage` está vacío.
   - Manejar excepciones en caso de que el JSON importado esté corrupto o incompleto.

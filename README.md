# ULTRANOVA · ERIS — Web oficial del torneo (versión inicial)

Sitio estático preparado para **GitHub Pages**, con modos UltraSol/UltraLuna, reglamento navegable, mapa esquemático y progreso local, ejemplos SoulLink, modificaciones de movimientos, Pokédex de cambios, guías de Showdown y editor de contenido.

No requiere Node.js, bases de datos, instalación de paquetes ni un servidor de aplicación en producción. Basta un servidor estático (GitHub Pages).

## 1. Ejecutar en un ordenador (Windows / Linux / macOS)

Desde la carpeta del proyecto, con Python instalado:

```bash
python -m http.server 8000
```

En Windows también puede utilizarse `py -m http.server 8000` o ejecutar `INICIAR_LOCAL.bat`.

Abrir `http://localhost:8000/` para ver el sitio y `http://localhost:8000/admin.html` para el editor.

**Importante:** no abrir `index.html` con doble clic desde `file://`; la aplicación carga `data/content.json` mediante `fetch`, que requiere ejecutarse desde HTTP o HTTPS.

## 2. Publicar en GitHub Pages

1. Crea un repositorio **público** en GitHub (por ejemplo, `ultranova-eris`). El nombre lo decides tú.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio; no subas una subcarpeta que contenga todo el proyecto.
3. Haz commit de los archivos y envíalos a `main` (o a la rama que hayas decidido).
4. En GitHub: `Settings` → `Pages` → `Build and deployment` → `Deploy from a branch`; elige `main` y `/ (root)` y guarda.
5. Cuando GitHub Pages publique, utiliza el enlace que muestre en esa misma pantalla, normalmente `https://TU-USUARIO.github.io/ultranova-eris/`.

La dirección exacta depende de la cuenta y del nombre del repositorio; no se proporciona un enlace ficticio.

Puedes utilizar otra rama; el editor debe configurarse con **la misma rama desde la que GitHub Pages despliega**.

### Sitio que usa un repositorio privado

Un sitio público de GitHub Pages puede requerir un repositorio público en determinadas cuentas/planes. Revisa los permisos y condiciones de GitHub Pages antes de elegir repositorio privado.

## 3. Editar los textos sin tocar código

Visita `https://URL-DE-TU-SITIO/admin.html` o la dirección local equivalente.

El editor permite:

- Seleccionar las colecciones (normas, movimientos, evoluciones, combates, guías, datos de portada, etc.).
- Cambiar campos de texto y valores estructurados.
- Añadir o eliminar entradas dentro de una colección.
- Guardar un borrador **local al navegador**.
- Previsualizarlo en una nueva pestaña (sin afectar a los visitantes).
- Importar y exportar el contenido completo en JSON.
- Publicar los cambios en `data/content.json` mediante la **API oficial de GitHub**.

La previsualización usa almacenamiento local **solo del navegador del editor**. No crea una URL de previsualización pública.

### Token de GitHub

El editor usa un **fine-grained personal access token** creado en GitHub. Recomendaciones:

1. Abre GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.
2. Limita el token **solo al repositorio de Ultranova**.
3. En Repository permissions, configura **Contents: Read and write**.
4. Establece una fecha de caducidad corta. Evita permisos adicionales innecesarios.
5. En el editor escribe el propietario, repositorio, rama y token.
6. Pulsa **Verificar acceso**, luego **Publicar en GitHub**.

**Seguridad:** el token no se escribe en archivos ni se guarda en localStorage, sessionStorage o cookies por este proyecto; solo se utiliza para llamar a `api.github.com` en la sesión de la página. El editor de URL es visible a todos, pero sin permisos válidos nadie puede publicar. No compartas el token ni lo copies en capturas de pantalla. Si un token se filtra, revócalo inmediatamente. La configuración `owner / repo / rama` (no secreta) sí puede conservarse localmente para facilitar su reutilización.

Se utiliza un token de GitHub en lugar de un inicio de sesión ficticio porque **GitHub Pages no proporciona un backend de autenticación ni permite guardar un secreto de OAuth en la web estática**. En una versión futura podemos sustituir este flujo por una GitHub App con servidor autorizado, si se desea login sin token manual.

### Conflictos de publicación

Al publicar, el editor consulta el SHA actual del archivo y envía un commit. Si alguien más publica exactamente al mismo tiempo, GitHub puede rechazar el cambio; actualiza el contenido y resuelve el conflicto para evitar sobreescribir modificaciones ajenas. La página **no verifica automáticamente** si el borrador antiguo diverge del contenido publicado desde que comenzó la edición; evita editar simultáneamente desde dos navegadores hasta incorporar un sistema completo de merges/revisiones.

## 4. Incluir los vídeos reales del romhack

En el editor:

1. Selecciona `Movimientos` y la ficha correspondiente.
2. Elige un clip de la ROM en formato **MP4 o WebM** (recomendados clips breves y comprimidos, hasta 10 MB para esta herramienta).
3. Introduce los datos de GitHub y utiliza **Subir clip al repositorio**.
4. Una vez completada la carga, el editor vincula el archivo al campo `video` de la ficha en tu borrador.
5. **Guarda y publica el contenido JSON** para que el botón de la ficha muestre el reproductor.

Los vídeos se guardan en `assets/media/movimientos/`. No se incluyen vídeos ficticios, ni se ha generado ningún vídeo simulando ser del juego. Mientras `video` esté vacío se muestra «Clip pendiente».

GitHub recomienda mantener el repositorio ligero. Para vídeos largos o numerosos, considera alojarlos fuera del repositorio y usar enlaces HTTPS directos a un archivo que permita reproducción; GitHub Pages no es un servicio especializado de streaming. Evita Git LFS si esperas servir esos archivos directamente desde Pages sin configuración adicional.

## 5. Estructura

```text
index.html                       Sitio público
admin.html                       Editor
css/site.css                     Dos temas + responsive
js/site.js                       Navegación y funciones interactivas
js/admin.js                      Borradores y publicación GitHub

data/content.json               Fuente editable de todos los textos
assets/guias/                   Capturas extraídas de los documentos
assets/documentos/              PDF originales para comprobación
assets/media/movimientos/       Clips reales por incorporar
INICIAR_LOCAL.bat                Ejecución sencilla en Windows
scripts/verify_content.py       Comprobaciones del contenido
```

## 6. Observaciones importantes sobre los documentos

Se han conservado expresamente algunas diferencias de redacción, **sin resolverlas por cuenta propia**:

- En búsqueda de shinies el texto indica máximo uno *por persona y por tramo*, pero en el ejemplo posterior dice *uno por equipo*.
- Para el canal de los equipos aparecen `#equipos_combates` y `#equipo_combates`.
- La condición del level cap incluye la frase sobre Pokémon a dos niveles por encima. En la web no se introduce una interpretación nueva.
- El PDF indica la fecha de inicio, pero no todas las fechas concretas de competición.

La pestaña **Reglamento**, en «Aspectos por confirmar», muestra las observaciones. El editor permite actualizar esos textos cuando la administración decida.

## 7. Imágenes y derechos

Se reutilizan capturas de las instrucciones entregadas por la organización. Los sprites de Pokémon se cargan desde el repositorio público de sprites de PokeAPI (`raw.githubusercontent.com/PokeAPI/sprites`). Requieren conexión a Internet; si no están accesibles, los textos y demás funciones siguen operativos. Pokémon y sus ilustraciones pertenecen a sus respectivos propietarios. Este proyecto es una herramienta de información para un torneo de fans, no un producto oficial de Nintendo / Game Freak / The Pokémon Company.

## 8. Cobertura de datos

El archivo `data/content.json` contiene, inicialmente:

- 18 hitos con level caps.
- 46 entradas de normas y excepciones.
- 2 fases del torneo.
- 24 reglas y especificaciones de los combates.
- 45 especificaciones de randomizado.
- 41 evoluciones modificadas.
- 45 movimientos o categorías de movimientos modificados.
- Cambios de estadísticas de Slaking (600 BST).
- 5 guías técnicas.
- 4 observaciones de documentos por confirmar.

Se adjuntan ambos PDF para consulta y comprobación de la fuente. Los contenidos del sitio son una **reestructuración explicativa**, no una reproducción página por página. La interfaz es una primera versión funcional y puede ampliarse sin reescribir los datos.

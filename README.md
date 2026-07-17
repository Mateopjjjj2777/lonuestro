# Para Andy

Experiencia web romántica y cinematográfica creada por Mateo para Andy. Contiene la carta completa, un reproductor de voz, el recorrido «Encuentra mi rosa», una revelación animada y un refugio secreto que recuerda el progreso en el dispositivo.

## Abrirla localmente

No abras `index.html` directamente. Desde la carpeta del proyecto inicia un servidor estático, por ejemplo:

```powershell
python -m http.server 8000
```

Después abre `http://localhost:8000/`. Para probarla en un teléfono conectado a la misma red, abre `http://IP-DE-TU-EQUIPO:8000/` y conserva la orientación vertical.

## Cambiar la carta o el audio

La copia de respaldo de la carta está en `assets/content/carta-original.txt`. El contenido visible de la carta está integrado semánticamente en `index.html`; si se reemplaza la carta, hay que actualizar ambos sin cambiar la estructura de los capítulos.

El audio está en `assets/audio/mensaje-mateo.mp3`. Para reemplazarlo, conserva ese nombre y utiliza MP3 compatible con navegadores móviles. No modifiques las rutas: todas son relativas para que la experiencia funcione dentro de un subdirectorio de GitHub Pages.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Copia todo el contenido de esta carpeta a la raíz del repositorio, incluido `.nojekyll`.
3. Haz commit y push a la rama principal, normalmente `main`.
4. Abre `Settings` en el repositorio.
5. Entra en `Pages`.
6. En `Build and deployment`, elige `Deploy from a branch`.
7. Selecciona la rama `main` y la carpeta `/ (root)`.
8. Guarda y abre la URL que GitHub genere.

GitHub Pages publica el sitio en Internet. La etiqueta `noindex` reduce la indexación accidental, pero no proporciona privacidad real: cualquier persona que conozca la URL podrá abrirla.

## Comprobación en teléfono

Prueba reproducción, pausa, progreso y silencio del audio tras un toque. Recorre todas las estrellas, abre la rosa, recarga para verificar el regreso al refugio secreto y confirma que los controles no queden bajo las barras del navegador.

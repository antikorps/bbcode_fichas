import { Hono } from "hono";
// import { Hono } from "npm:hono@3";
import { Document, DOMParser } from "jsr:@b-fuze/deno-dom";

// INICIO INDEX HTML
const INDEX=`<!DOCTYPE html><html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Crea fichas en BBCode</title><script src="https://unpkg.com/htmx.org@2.0.4" integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+" crossorigin="anonymous"></script><style> body { display: flex; flex-direction: column; min-height: 100vh; margin: 0; } main { flex: 1; } body { font-family: sans-serif; line-height: 1.6; padding: 0; } h1 { margin-bottom: 20px; } main, header { width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 5px; } #generar-ficha { padding: 20px; border: 1px solid #ccc; } input[type="url"] { width: -moz-available; width: -webkit-fill-available; padding: 10px; border: 1px solid #ccc; border-radius: 5px; } button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px auto 0 auto; display: block; } button:hover { background-color: #0056b3; } .htmx-indicator { display: none; } .htmx-request .htmx-indicator { display: inline-block; } #ficha { margin-top: 20px; } #ficha textarea { width: -moz-available; width: -webkit-fill-available; min-height: 200px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; } .centrar { text-align: center; } .cargando { stroke: #000; } .error { color: red; } footer { background-color: #f0f0f0; /* Un gris claro de fondo */ padding: 20px; text-align: center; font-size: 0.9em; color: #555; border-top: 1px solid #ddd; /* Una línea sutil en la parte superior */ } footer a { color: #007bff; /* Color azul para los enlaces */ text-decoration: none; /* Elimina el subrayado por defecto */ } footer a:hover { text-decoration: underline; /* Subrayado al pasar el ratón */ } /* Tema scuro */ @media (prefers-color-scheme: dark) { body { background-color: #121212; color: #e0e0e0; } main { border-color: #555; } input[type="text"], #ficha textarea { background-color: #333; color: #e0e0e0; border-color: #555; } .cargando { stroke: #fff; } } </style></head> <body> <header> <h1 class="centrar">Generador de Fichas BBCode</h1> <h2 class="centrar">˚｡⋆🎬🎧📚⋆｡˚</h2> <p>🛠️ Crea fichas informativas para tu música, libros, películas y series favoritas. ¡Pega el enlace y obtén el código BBCode listo para compartir!</p> <p>Plataformas admitidas (vendrán más, dame tu sugerencia 🙏):</p> <ul> <li>✅ GoodReads</li> <li>✅ FilmAffinity</li> <li>✅ Discogs</li> </ul> </header> <main> <form id="generar-ficha" hx-post="/generar" hx-trigger="submit" hx-target="#ficha" hx-swap="innerHTML" hx-disabled-elt="#generar"> <label> <input name="url" id="url" type="url" required placeholder="URL..."> </label> <button id="generar" type="submit">Generar</button> <p class="centrar"><svg class="htmx-indicator cargando" width="24" height="24" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <style> .spinner_V8m1 { transform-origin: center; animation: spinner_zKoa 2s linear infinite } .spinner_V8m1 circle { stroke-linecap: round; animation: spinner_YpZS 1.5s ease-in-out infinite } @keyframes spinner_zKoa { 100% { transform: rotate(360deg) } } @keyframes spinner_YpZS { 0% { stroke-dasharray: 0 150; stroke-dashoffset: 0 } 47.5% { stroke-dasharray: 42 150; stroke-dashoffset: -16 } 95%, 100% { stroke-dasharray: 42 150; stroke-dashoffset: -59 } } </style> <g class="spinner_V8m1"> <circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3"></circle> </g> </svg></p> </form> <div id="ficha"></div> </main> <footer> <p> ¡Aquí no hay cookies ni espías! Este sitio web respeta tu privacidad al 100%. No usamos analíticas ni métricas de ningún tipo. </p> <p> ¿Te interesa el código? ¡Échale un vistazo en GitHub! <a href="https://github.com/antikorps/bbcode_fichas" target="_blank">Ver código fuente</a> </p> </footer> <script> function copiarFichaPortapapeles() { const textarea = document.querySelector("#ficha textarea").select(); document.execCommand("copy"); alert("Ficha copiada al portapapeles"); } </script> </body> </html>`
// FIN INDEX HTML

const CABECERAS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
  "Accept-Language": "es-ES,en;q=0.5",
};

// TIPOS PROPIOS
type GetParseado = {
  doc: Document | null;
  error: string | null;
};

type GoodReadsLinkedData = {
  titulo: string | null;
  caratula: string | null;
  paginas: number | null;
  valoracion: number | null;
  votos: number | null;
};

enum PlataformasWeb {
  GoodReads,
  FilmAffinity,
  Discogs,
  SinImplementar,
}

function generarTextAreaFicha(bc: string): string {
  return `<h1>¡Ficha generada!</h1><textarea>${bc}</textarea>
        <button id="ficha-copiar" onclick="copiarFichaPortapapeles()">Copiar</button>`;
}

async function realizarGetParsearTexto(url: string): Promise<GetParseado> {
  try {
    const r = await fetch(url, {
      headers: CABECERAS,
    });
    if (r.status != 200) {
      throw Error(
        `la petición a ${url} ha devuelto un status code incorrecto: ${r.statusText}`,
      );
    }
    const t = await r.text();
    const doc = new DOMParser().parseFromString(t, "text/html");
    const resultado: GetParseado = {
      doc: doc,
      error: null,
    };
    return resultado;
  } catch (error) {
    const resultado: GetParseado = {
      doc: null,
      error: `${error}`,
    };
    return resultado;
  }
}

class GoodReads {
  doc: Document;
  url: string;

  constructor(doc: Document, url: string) {
    this.doc = doc;
    this.url = url;
  }
  private extraerColeccionTexto(selector: string) {
    const coleccion = [];
    const coincidencias = this.doc.querySelectorAll(selector);
    for (const c of coincidencias) {
      coleccion.push(c.textContent.trim());
    }
    return coleccion;
  }

  extraerLinkedData(): GoodReadsLinkedData {
    try {
      const scriptLdJson = this.doc.querySelector(
        `script[type="application/ld+json"]`,
      );
      if (!scriptLdJson) {
        throw Error(
          `selector no encontrado script[type="application/ld+json"]`,
        );
      }
      const jsonLinkedData = JSON.parse(scriptLdJson.textContent);
      const g: GoodReadsLinkedData = {
        titulo: jsonLinkedData.name as string | null,
        caratula: jsonLinkedData.image as string | null,
        paginas: jsonLinkedData.numberOfPages as number | null,
        valoracion: jsonLinkedData.aggregateRating.ratingValue as number | null,
        votos: jsonLinkedData.aggregateRating.ratingCount as number | null,
      };
      return g;
    } catch (error) {
      console.error(`ha fallado recuperarLinkedData ${error}`);
      const g: GoodReadsLinkedData = {
        titulo: null,
        caratula: null,
        paginas: null,
        valoracion: null,
        votos: null,
      };
      return g;
    }
  }
  extraerAutor(): string[] {
    return this.extraerColeccionTexto(
      "div.AuthorPreview span.ContributorLink__name",
    );
  }
  extraerGeneros(): string[] {
    return this.extraerColeccionTexto(
      "span.BookPageMetadataSection__genreButton",
    );
  }
  extraerSinopsis(): string | null {
    const parrafoSinopsis = this.doc.querySelector(
      "div.DetailsLayoutRightParagraph__widthConstrained",
    );
    if (parrafoSinopsis) {
      return parrafoSinopsis.innerHTML.replaceAll(/[\s]{2,}/gm, " ")
        .replaceAll("<br>", "\n").replaceAll(/<\/?[^>]+(>|$)/g, "").trim();
    }
    return null;
  }
  extraerPublicacion(): string | null {
    const primeraPublicacion = this.doc.querySelector(
      `p[data-testid="publicationInfo"]`,
    );
    if (primeraPublicacion) {
      const fecha = primeraPublicacion.textContent;
      const infoFecha = fecha.split(",");
      if (infoFecha.length != 2) {
        return fecha;
      }
      const año = parseInt(infoFecha[1].trim());
      if (!isNaN(año)) {
        return año.toString();
      }
      return fecha;
    }
    return null;
  }
  generarBBCode(): string {
    const linkedData = this.extraerLinkedData();
    const autor = this.extraerAutor();
    const generos = this.extraerGeneros();
    const sinopsis = this.extraerSinopsis();
    const publicacion = this.extraerPublicacion();

    let caratula = "";
    if (linkedData.caratula) {
      caratula = `[CENTER][IMG]${linkedData.caratula}[/IMG][/CENTER]\n`;
    }

    return `${caratula}📚 Título: ${linkedData.titulo ?? "Título desconocido"}
✏️ Autor: ${autor.join(", ")}
📅 Año: ${publicacion ?? "-"}
📜 Géneros: ${generos.join(", ")}
        
⭐ Valoración: ${linkedData.valoracion ?? "-"} / 5
🗳️ Número de votos: ${linkedData.votos ?? "-"}
📄 Número de páginas: ${linkedData.paginas ?? "-"}
        
📝 Sinopsis: [I]${sinopsis ?? "-"}[/I]
        
🔗 [URL=${this.url}]Ver ficha completa[/URL]`;
  }
}

class FilmAffinity {
  doc: Document;
  url: string;
  constructor(doc: Document, url: string) {
    this.doc = doc;
    this.url = url;
  }
  private extraerTextoSelector(selector: string): string | null {
    const elemento = this.doc.querySelector(selector);
    if (elemento == null) {
      return null;
    }
    return elemento.textContent.trim();
  }

  private extraerColeccionSelectorAll(selector: string): string[] {
    const coleccion: string[] = []
    const coincidencias = this.doc.querySelectorAll(selector)
    for (const c of coincidencias) {
      coleccion.push(c.textContent.trim())
    }
    return coleccion
  }

  private extraerAtributoSelector(
    selector: string,
    atributo: string,
  ): string | null {
    const elemento = this.doc.querySelector(selector);
    if (elemento == null) {
      return null;
    }
    const atr = elemento.getAttribute(atributo);
    if (atr == null) {
      return null;
    }
    return atr.trim();
  }

  private extraerTitulo(): string | null {
    return this.extraerTextoSelector(`h1#main-title span[itemprop="name"]`);
  }

  extraerTipo(): string | null {
    return this.extraerTextoSelector(`h1#main-title span.movie-type`);
  }

  extraerAño(): string | null {
    return this.extraerTextoSelector(
      `dl.movie-info dd[itemprop="datePublished"]`,
    );
  }

  extraerDireccion(): string[] {
    return this.extraerColeccionSelectorAll(
      `dl.movie-info .directors span[itemprop="name"]`,
    );
  }

  extraerReparto(): string[] {
    return this.extraerColeccionSelectorAll(`.cast-wrapper div.name`);
  }

  extraerGeneros(): string[] {
    return this.extraerColeccionSelectorAll(
      `dl.movie-info dd.card-genres span[itemprop="genre"] a`,
    );
  }

  extraerSinopsis(): string | null {
    return this.extraerTextoSelector(
      `dl.movie-info dd[itemprop="description"]`,
    );
  }

  extraerValoracion(): string | null {
    return this.extraerTextoSelector(`#movie-rat-avg`);
  }

  extraerVotos(): string | null {
    return this.extraerTextoSelector(
      `#movie-count-rat span[itemprop="ratingCount"]`,
    );
  }

  extraerPoster(): string | null {
    return this.extraerAtributoSelector(
      `#movie-main-image-container img[itemprop="image"]`,
      "src",
    );
  }

  generarBBCode() {
    let poster = "";
    const p = this.extraerPoster();
    if (p) {
      poster = `[CENTER][IMG]${p}[/IMG][/CENTER]\n`;
    }
    return `${poster}🎞 Título: ${this.extraerTitulo() ?? "Título desconocido"}
📅 Año: ${this.extraerAño() ?? "-"}
🏷️ Géneros: ${this.extraerGeneros().join(", ")}
⭐ Valoración: ${this.extraerValoracion() ?? "-"} / 10 (${this.extraerVotos()} votos)
🎬 Dirección: ${this.extraerDireccion() ?? "-"}
🎭 Reparto: ${this.extraerReparto().join(", ")}

📝 Sinopsis: ${this.extraerSinopsis() ?? "-"}


🔗 [URL=${this.url}]Ver ficha completa[/URL]`;
  }
}

class Discogs {
  doc: Document;
  url: string;
  constructor(doc: Document, url: string) {
    this.doc = doc;
    this.url = url;
  }
  private extraerColeccionSelectorAll(selector: string): string[] {
    const coleccion: string[] = []
    const coincidencias = this.doc.querySelectorAll(selector)
    for (const c of coincidencias) {
      coleccion.push(c.textContent.trim())
    }
    return coleccion
  }
  private extraerAtributoSelector(
    selector: string,
    atributo: string,
  ): string | null {
    const elemento = this.doc.querySelector(selector);
    if (elemento == null) {
      return null;
    }
    const atr = elemento.getAttribute(atributo);
    if (atr == null) {
      return null;
    }
    return atr.trim();
  }
  extraerArtista(): string[] {
    return this.extraerColeccionSelectorAll(`div[class^="body"] h1 a[class^="link"]`)
  }
  extraerTitulo(): string | null {
    const encabezado = this.doc.querySelector(`div[class^="body"] h1`)
    if (!encabezado) {
      return null
    }
    const texto = encabezado.innerHTML
    const expReg = /.*?<!-- -->/gm
    return texto.replaceAll(expReg, "")
  }
  
  extraerPublicacion(): string | null {
    const t = this.doc.querySelector("time[datetime]")
    if (!t) {
      return null
    }
    return t.textContent.trim()
  }
  
  extraerGeneros(): string[] {
    return this.extraerColeccionSelectorAll(`td a[href^="/genre"]`)
  }
  extraerEstilos(): string[] {
    return this.extraerColeccionSelectorAll(`td a[href^="/style"]`)
  }
  extraerPortada(): string | null {
    return this.extraerAtributoSelector(`div[class^="thumbnail"] img`, "src")
  }

  generarBBCode() {
    let portada = ""
    const p = this.extraerPortada()
    if (p) {
      portada = `[CENTER][IMG]${p}[/IMG][/CENTER]\n`
    }
    const generos = this.extraerGeneros()
    const estilos = this.extraerEstilos()
    const generosEstilos = generos.concat(estilos)

    return `${portada}🎤 ${this.extraerArtista().join(", ")}
💿 ${this.extraerTitulo() ?? "Sin título"}
📅 ${this.extraerPublicacion() ?? "-"}
🎧 ${generosEstilos.join(", ")}

🔗 [URL=${this.url}]Ver ficha completa[/URL]`
  }
}

function determinarPlataformaWeb(url: string): PlataformasWeb {
  try {
    const u = new URL(url);
    if (u.hostname.includes("goodreads")) {
      return PlataformasWeb.GoodReads;
    }
    if (u.hostname.includes("filmaffinity")) {
      return PlataformasWeb.FilmAffinity;
    }
    if (u.hostname.includes("discogs")) {
      return PlataformasWeb.Discogs
    }
    return PlataformasWeb.SinImplementar;
  } catch (_) {
    return PlataformasWeb.SinImplementar;
  }
}

const app = new Hono();
app.post("/generar", async (c) => {
  try {
    const solicitud = await c.req.parseBody();
    const url: string = solicitud["url"] as string;
    const d = await realizarGetParsearTexto(url);
    if (!d.doc) {
      return c.text(d.error as string);
    }
    let ficha;
    switch (determinarPlataformaWeb(url)) {
      case PlataformasWeb.GoodReads: {
        ficha = new GoodReads(d.doc, url)
        break
      }
      case PlataformasWeb.FilmAffinity: {
        ficha = new FilmAffinity(d.doc, url)
        break
      }
      case PlataformasWeb.Discogs: {
        ficha = new Discogs(d.doc, url)
        break
      }
      case PlataformasWeb.SinImplementar: 
        return c.text(
          `<p class="error">La URL no corresponde a una plataforma soportada</p>`,
          400,
        );
    }
    const bbcode = ficha.generarBBCode()
    return c.text(generarTextAreaFicha(bbcode))
  } catch (error) {
    return c.text(`<p class="error">${error}</p>`, 500);
  }
});

app.get("/", (c) => {
  return c.html(INDEX);
});

Deno.serve(app.fetch);

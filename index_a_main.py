from pathlib import Path
import htmlmin
import re

ruta_raiz = Path(__file__).parent
ruta_index_html = ruta_raiz / "index.html"
ruta_main_ts = ruta_raiz / "main.ts"

with open(ruta_index_html, "r") as manejador:
    index = manejador.read()
    index_min = htmlmin.minify(index, remove_optional_attribute_quotes=False)
    index_min = re.sub(r"\s{2,}", " ", index_min)

with open(ruta_main_ts) as manejador:
    main = manejador.read()

regex = r"// INICIO INDEX HTML.*?// FIN INDEX HTML"
nuevo_contenido = re.sub(regex, f"// INICIO INDEX HTML\nconst INDEX=`{index_min}`\n// FIN INDEX HTML", main, flags=re.DOTALL)

with open(ruta_main_ts, "w+") as manejador:
    manejador.write(nuevo_contenido)
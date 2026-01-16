import os
import json

# --- CONFIGURACIÓN ACTUALIZADA ---
carpeta_raiz = './work'
ruta_web_prefijo = 'work/'
archivo_salida = 'data.json'     
categoria_default = "ramdom"      
# ---------------------------------

def generar_json():
    items = []
    id_counter = 1
    nuevos_contador = 0
    rutas_existentes = set()

    # 1. Leemos JSON anterior (data.json)
    if os.path.exists(archivo_salida):
        try:
            with open(archivo_salida, 'r', encoding='utf-8') as f:
                datos_antiguos = json.load(f)
                for item in datos_antiguos:
                    rutas_existentes.add(item.get('thumbnail'))
        except:
            pass 

    extensiones_validas = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov")

    for root, dirs, files in os.walk(carpeta_raiz):
        files = [f for f in files if not f.startswith('.')]
        files.sort()

        ruta_relativa = os.path.relpath(root, carpeta_raiz)
        partes_carpetas = ruta_relativa.split(os.sep)

        # --- LÓGICA DE CARPETAS ---
        if ruta_relativa == '.':
            categoria = categoria_default
            cliente = ""
            ruta_para_web = ""
        elif len(partes_carpetas) == 1:
            cliente = partes_carpetas[0].strip()
            categoria = categoria_default 
            ruta_para_web = ruta_relativa
        elif len(partes_carpetas) >= 2:
            cliente = partes_carpetas[0].strip()
            categoria = partes_carpetas[1].strip()
            ruta_para_web = ruta_relativa
        else:
            continue

        for nombre_archivo in files:
            if nombre_archivo.lower().endswith(extensiones_validas):
                
                # --- LIMPIEZA INICIAL ---
                nombre_sin_ext = os.path.splitext(nombre_archivo)[0]
                nombre_normalizado = nombre_sin_ext.replace('_', '-')
                partes_archivo = nombre_normalizado.split('-')
                partes_limpias = [p.strip() for p in partes_archivo]

                # --- 1. BUSCAR Y EXTRAER EL "ORDEN" ---
                orden_manual = str(id_counter) # Por defecto
                
                # Buscamos número suelto < 4 cifras (para no confundir con año)
                for i, parte in enumerate(list(partes_limpias)):
                    if parte.isdigit() and len(parte) < 4:
                        orden_manual = parte
                        partes_limpias.pop(i) # Lo sacamos de la lista
                        break 

                # --- 2. ASIGNAR TÍTULO, FECHA Y TAG ---
                titulo = ""
                fecha = ""
                tag = ""

                if len(partes_limpias) >= 3:
                    titulo = partes_limpias[0]
                    fecha = partes_limpias[1]
                    tag = partes_limpias[2]
                elif len(partes_limpias) == 2:
                    titulo = partes_limpias[0]
                    segunda_parte = partes_limpias[1]
                    if segunda_parte.isdigit() and len(segunda_parte) == 4:
                        fecha = segunda_parte
                    else:
                        tag = segunda_parte
                elif len(partes_limpias) == 1:
                    titulo = partes_limpias[0]
                else:
                    titulo = nombre_sin_ext 

                if cliente == "":
                    cliente = titulo

                # --- RUTA ---
                if ruta_para_web:
                    ruta_final = os.path.join(ruta_web_prefijo, ruta_para_web, nombre_archivo).replace('\\', '/')
                else:
                    ruta_final = os.path.join(ruta_web_prefijo, nombre_archivo).replace('\\', '/')

                if ruta_final not in rutas_existentes:
                    nuevos_contador += 1

                item = {
                    "id": id_counter,
                    "titulo": titulo,
                    "cliente": cliente,
                    "categoria": categoria,
                    "thumbnail": ruta_final,
                    "fecha": fecha,
                    "tag": tag,
                    "orden": orden_manual
                }

                items.append(item)
                id_counter += 1

    with open(archivo_salida, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=4)
        
    print(f"---------------------------------------------")
    print(f"✅ DATA.JSON GENERADO")
    print(f"📂 Total items: {len(items)}")
    print(f"✨ Nuevos: {nuevos_contador}")
    print(f"---------------------------------------------")

if __name__ == "__main__":
    generar_json()
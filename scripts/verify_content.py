#!/usr/bin/env python3
"""Verificación local sin dependencias para contenido de Ultranova."""
import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parent.parent
D=json.loads((root/'data/content.json').read_text(encoding='utf-8'))
required={'stages':18,'rules':45,'battles':24,'randomizer':45,'evolutions':41,'moves':45,'pokemonChanges':1,'guides':5,'phases':2}
errors=[]
for key,n in required.items():
 actual=len(D[key]);print(f'{key:17s} {actual:3d} registros')
 if actual<n:errors.append(f'{key}: se esperaban al menos {n} registros, ahora hay {actual}')
for key in ['rules','stages','battles','randomizer','evolutions','moves','pokemonChanges','guides']:
 items=D[key];ids=[x['id'] for x in items];
 if len(ids)!=len(set(ids)):errors.append(f'IDs duplicados en {key}')
for i,s in enumerate(D['stages']):
 if not isinstance(s.get('level'),int) or s['level']<1:errors.append(f'Level inválido en {i}')
for g in D['guides']:
 if g.get('image') and not (root/g['image']).exists():errors.append(f'Imagen guía no encontrada: {g["image"]}')
for src in ['assets/documentos/normas-ultranova.pdf','assets/documentos/combates-ultranova.pdf']:
 if not (root/src).exists():errors.append(f'Falta fuente documental: {src}')
for key in ('discord','twitter','instagram'):
 if not D['meta']['socials'][key].startswith('https://'):errors.append(f'URL inválida: {key}')
if errors:
 print('\nERRORES:\n'+'\n'.join(errors));sys.exit(1)
print('\nVerificación correcta. Revisión de integridad terminada.')

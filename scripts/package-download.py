from pathlib import Path
import base64, zipfile
root=Path(__file__).resolve().parent.parent
html=(root/'index.html').read_text()
css=(root/'style.css').read_text()
for name in ['Sarabun-Regular.ttf','Sarabun-SemiBold.ttf']:
 font=base64.b64encode((root/'public/fonts'/name).read_bytes()).decode()
 css=css.replace('/fonts/'+name,'data:font/ttf;base64,'+font)
js=(root/'main.js').read_text().replace('crypto.randomUUID()',"(globalThis.crypto?.randomUUID?.() || 'item-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))")
html=html.replace('<link rel="stylesheet" href="/style.css">','<style>'+css+'</style>').replace('<script type="module" src="/main.js"></script>','<script>'+js+'</script>')
html=html.replace('</body>','<!-- Font license: '+(root/'public/fonts/OFL.txt').read_text()+' --></body>')
out=root/'download';out.mkdir(exist_ok=True)
(out/'medical-catalog.html').write_text(html)
with zipfile.ZipFile(out/'medical-catalog.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.write(out/'medical-catalog.html','medical-catalog.html')
 z.write(root/'public/fonts/OFL.txt','FONT-LICENSE.txt')
with zipfile.ZipFile(out/'catalog-vercel.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['README.md','index.html','style.css','main.js','package.json','package-lock.json','vercel.json','.vercelignore','.gitignore']:
  z.write(root/name,'catalog/'+name)
 for folder in ['public','scripts','docs','tests']:
  for p in sorted((root/folder).rglob('*')):
   if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc':z.write(p,'catalog/'+str(p.relative_to(root)))
print('Updated standalone HTML, offline ZIP, and Vercel source ZIP.')

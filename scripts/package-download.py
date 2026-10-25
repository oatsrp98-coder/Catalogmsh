from pathlib import Path
import base64, zipfile
root=Path(__file__).resolve().parent.parent
html=(root/'index.html').read_text()
font=base64.b64encode((root/'public/fonts/NotoSansThai.ttf').read_bytes()).decode()
css=(root/'style.css').read_text().replace('/fonts/NotoSansThai.ttf','data:font/ttf;base64,'+font)
js=(root/'main.js').read_text().replace('crypto.randomUUID()',"(globalThis.crypto?.randomUUID?.() || 'item-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))")
html=html.replace('<link rel="stylesheet" href="/style.css">','<style>'+css+'</style>').replace('<script type="module" src="/main.js"></script>','<script>'+js+'</script>')
html=html.replace('</body>','<!-- Font license: '+(root/'public/fonts/OFL.txt').read_text()+' --></body>')
out=root/'download';out.mkdir(exist_ok=True)
(out/'medical-catalog.html').write_text(html)
with zipfile.ZipFile(out/'medical-catalog.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.write(out/'medical-catalog.html','medical-catalog.html')
 z.write(root/'public/fonts/OFL.txt','FONT-LICENSE.txt')
print('Updated standalone HTML and ZIP with embedded font.')

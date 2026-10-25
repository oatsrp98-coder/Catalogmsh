const $=s=>document.querySelector(s);
const initial={brandName:'VERDANT MEDICAL',catalogTitle:'Precision in care.',description:'คัดสรรเครื่องมือแพทย์ เพื่อการดูแลที่ใส่ใจในทุกรายละเอียด',contact:'YOUR WEBSITE  /  YOUR CONTACT',accent:'#164e40',fontSize:'16',layout:'editorial',products:[{id:crypto.randomUUID(),name:'เครื่องวัดความดันโลหิต',category:'PATIENT MONITORING',model:'MODEL / BP-01',details:'พื้นที่สำหรับรายละเอียดสินค้า คุณสมบัติ และข้อมูลทางเทคนิคที่ผ่านการตรวจสอบแล้ว',price:'สอบถามรายละเอียด',image:''},{id:crypto.randomUUID(),name:'หูฟังแพทย์',category:'DIAGNOSTIC INSTRUMENTS',model:'MODEL / ST-02',details:'เพิ่มรูปสินค้าและรายละเอียด เพื่อสร้างแคตตาล็อกในแบบของคุณ',price:'สอบถามรายละเอียด',image:''}]};
let state=structuredClone(initial);try{const saved=JSON.parse(localStorage.getItem('verdant-catalog'));if(saved&&Array.isArray(saved.products))state={...initial,...saved}}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem('verdant-catalog',JSON.stringify(state));$('#status').textContent='✓ บันทึกแล้วบนเบราว์เซอร์นี้'}catch{$('#status').textContent='พื้นที่จัดเก็บเต็ม กรุณาลดจำนวนรูปก่อนปิดหน้านี้'}}
const medicalIcon=`<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="26" y="16" width="48" height="68" rx="9"/><path d="M40 16v-3h20v3M39 35h22M50 24v22M35 61h10l5-9 7 17 6-8h6M39 75h22" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function visual(p){
  return p.image&&/^data:image\/(jpeg|png|webp);base64,/.test(p.image)
    ?`<img src="${p.image}" alt="${esc(p.name)}">`
    :`<div class="placeholder">${medicalIcon}<small>พื้นที่รูปภาพสินค้า</small><span>YOUR PRODUCT, IN FOCUS</span></div>`;
}
function render(){
  document.documentElement.style.setProperty('--accent',state.accent);
  $('#catalog').style.fontSize=state.fontSize+'px';
  $('#catalog').className=state.layout;
  $('#count').textContent=state.products.length;
  $('#productList').innerHTML=state.products.map(p=>`<button class="product-row" data-id="${p.id}" aria-label="แก้ไข ${esc(p.name)}"><span class="thumb">${visual(p)}</span><span class="product-row-text"><strong>${esc(p.name)}</strong><small>${esc(p.model)}</small></span><span class="edit-arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>`).join('');
  $('#catalog').innerHTML=`
    <div class="page-top"><strong><span class="catalog-mark" aria-hidden="true">+</span>${esc(state.brandName)}</strong><span>MEDICAL COLLECTION<br><b>${new Date().getFullYear()}</b></span></div>
    <div class="catalog-heading">
      <div class="cover-copy"><div class="eyebrow"><i></i> PRECISION IN EVERY DETAIL</div><h2>${esc(state.catalogTitle)}</h2><p>${esc(state.description)}</p><span class="cover-rule"></span></div>
      <div class="cover-art" aria-hidden="true"><div class="cover-orbit"></div><span class="medical-cross"></span><svg viewBox="0 0 240 80" fill="none"><path d="M0 40h56l12-12 13 29 17-46 20 60 15-31h107" stroke="currentColor" stroke-width="1.4"/></svg></div>
    </div>
    <div class="collection-heading"><span>คัดสรรเพื่อการดูแล</span><small>PRODUCT SELECTION <b>/ ${String(state.products.length).padStart(2,'0')}</b></small></div>
    <div class="products">${state.products.map((p,i)=>`
      <section class="product-card"><div class="product-visual">${visual(p)}<span class="number">${String(i+1).padStart(2,'0')}</span></div><div class="product-copy"><div class="eyebrow">${esc(p.category)}</div><h3>${esc(p.name)}</h3><small class="model-tag">${esc(p.model)}</small><p>${esc(p.details)}</p><strong class="price">${esc(p.price)} <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke-linecap="round" stroke-linejoin="round"/></svg></span></strong></div></section>`).join('')||'<div class="empty">'+medicalIcon+'<h3>เริ่มต้นเรื่องราวของสินค้าคุณ</h3><p>เพิ่มรูปและรายละเอียดสินค้าจากแถบเครื่องมือ</p></div>'}</div>
    <footer><span>${esc(state.contact)}</span><span><i aria-hidden="true">+</i> ${esc(state.brandName)}</span></footer>`;
  document.querySelectorAll('[data-layout]').forEach(b=>{
    const active=b.dataset.layout===state.layout;
    b.classList.toggle('selected',active);
    b.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===state.accent)));
}
for(const key of ['brandName','catalogTitle','description','contact','accent','fontSize']){$('#'+key).value=state[key];$('#'+key).addEventListener('input',e=>{state[key]=e.target.value;render();save()})}
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{state.layout=b.dataset.layout;render();save()});
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.accent=b.dataset.color;$('#accent').value=state.accent;render();save()});
let editing=null,photo='',uploadToken=0;
function showPhoto(){$('#photoPreview').hidden=!photo;$('#photoPreview').src=photo||'';$('#removePhoto').hidden=!photo}
function open(id){uploadToken++;editing=id;const p=state.products.find(p=>p.id===id)||{};for(const key of ['category','model','details','price'])$('#'+key).value=p[key]||'';$('#productName').value=p.name||'';photo=p.image||'';$('#photo').value='';showPhoto();$('#delete').hidden=!id;$('#editor').showModal()}
$('#add').onclick=()=>open(null);$('#productList').onclick=e=>{const b=e.target.closest('[data-id]');if(b)open(b.dataset.id)};$('#close').onclick=()=>$('#editor').close();$('#removePhoto').onclick=()=>{uploadToken++;photo='';showPhoto()};
$('#photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;const token=++uploadToken;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){alert('เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 15 MB');return}try{const bitmap=await createImageBitmap(file);const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=bitmap.width*scale;canvas.height=bitmap.height*scale;canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();if(token!==uploadToken)return;photo=canvas.toDataURL('image/webp',.85);showPhoto()}catch{alert('ไม่สามารถอ่านรูปนี้ได้ กรุณาเลือกรูปใหม่')}};
$('#productForm').onsubmit=e=>{e.preventDefault();const name=$('#productName').value.trim();if(!name)return;const p={id:editing||crypto.randomUUID(),name,image:photo};for(const key of ['category','model','details','price'])p[key]=$('#'+key).value.trim();const idx=state.products.findIndex(x=>x.id===editing);if(idx>=0)state.products[idx]=p;else state.products.push(p);render();save();$('#editor').close()};$('#delete').onclick=()=>{if(confirm('ต้องการลบสินค้านี้หรือไม่?')){state.products=state.products.filter(p=>p.id!==editing);render();save();$('#editor').close()}};$('#print').onclick=async()=>{await document.fonts?.ready;await Promise.all([...document.querySelectorAll('#catalog img')].map(img=>img.decode?.().catch(()=>{})));window.print()};render();

const $=s=>document.querySelector(s);
const initial={brandName:'VERDANT MEDICAL',catalogTitle:'Precision in care.',description:'คัดสรรเครื่องมือแพทย์ เพื่อการดูแลที่ใส่ใจในทุกรายละเอียด',contact:'YOUR WEBSITE  /  YOUR CONTACT',accent:'#164e40',secondary:'#947024',surface:'#faf6ed',fontSize:'18',layout:'editorial',imageSide:'left',products:[{id:crypto.randomUUID(),name:'เครื่องวัดความดันโลหิต',category:'PATIENT MONITORING',model:'MODEL / BP-01',details:'พื้นที่สำหรับรายละเอียดสินค้า คุณสมบัติ และข้อมูลทางเทคนิคที่ผ่านการตรวจสอบแล้ว',price:'สอบถามรายละเอียด',image:''},{id:crypto.randomUUID(),name:'หูฟังแพทย์',category:'DIAGNOSTIC INSTRUMENTS',model:'MODEL / ST-02',details:'เพิ่มรูปสินค้าและรายละเอียด เพื่อสร้างแคตตาล็อกในแบบของคุณ',price:'สอบถามรายละเอียด',image:''}]};
let state=structuredClone(initial);try{const saved=JSON.parse(localStorage.getItem('verdant-catalog'));if(saved&&Array.isArray(saved.products))state={...initial,...saved}}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setStatus(message, error=false) {
  $('#status').textContent=message;
  $('#status').dataset.state=error?'error':'saved';
  $('#workspaceError').hidden=!error;
  $('#workspaceError').textContent=error?message:'';
}
function save(){
  try{localStorage.setItem('verdant-catalog',JSON.stringify(state));setStatus('บันทึกเรียบร้อยแล้ว');return true}
  catch{setStatus('ยังบันทึกไม่ได้: พื้นที่จัดเก็บเต็ม ลองลดรูปภาพและบันทึกอีกครั้งก่อนปิดหน้านี้',true);return false}
}
const themes = [
  {id:'gold',name:'เขียว × ทอง',note:'หรูหรา อบอุ่น',accent:'#164e40',secondary:'#947024',surface:'#faf6ed'},
  {id:'coral',name:'เขียว × คอรัล',note:'สดใส มีชีวิตชีวา',accent:'#21614d',secondary:'#b64c3f',surface:'#fff3ee'},
  {id:'navy',name:'เขียว × กรมท่า',note:'สุขุม เป็นมืออาชีพ',accent:'#26715e',secondary:'#294c72',surface:'#eef3f8'},
  {id:'plum',name:'เขียว × พลัม',note:'นุ่มนวล มีเอกลักษณ์',accent:'#456545',secondary:'#80516f',surface:'#f8f0f5'},
  {id:'terracotta',name:'เขียว × อิฐ',note:'อบอุ่น เป็นธรรมชาติ',accent:'#455c33',secondary:'#a35234',surface:'#faf1e9'},
  {id:'sky',name:'เขียว × ฟ้า',note:'สะอาด สบายตา',accent:'#175e55',secondary:'#337398',surface:'#edf7fa'},
];
const layouts=['editorial','grid','minimal','showcase','alternating','featured'];
if(!layouts.includes(state.layout))state.layout='editorial';
if(!['left','right'].includes(state.imageSide))state.imageSide='left';
for(const key of ['accent','secondary','surface'])if(!/^#[0-9a-f]{6}$/i.test(state[key]))state[key]=initial[key];
$('#themePalette').innerHTML=themes.map(t=>`<button type="button" data-theme="${t.id}" aria-pressed="false"><span class="theme-swatches" aria-hidden="true"><i style="background:${t.accent}"></i><i style="background:${t.secondary}"></i><i style="background:${t.surface}"></i></span><strong>${t.name}</strong><small>${t.note}</small></button>`).join('');
const moveIcon=direction=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="${direction==='up'?'M6 14 12 8l6 6':'m6 10 6 6 6-6'}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const medicalIcon=`<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="26" y="16" width="48" height="68" rx="9"/><path d="M40 16v-3h20v3M39 35h22M50 24v22M35 61h10l5-9 7 17 6-8h6M39 75h22" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function visual(p){
  return p.image&&/^data:image\/(jpeg|png|webp);base64,/.test(p.image)
    ?`<img src="${p.image}" alt="${esc(p.name)}">`
    :`<div class="placeholder">${medicalIcon}<small>พื้นที่รูปภาพสินค้า</small><span>YOUR PRODUCT, IN FOCUS</span></div>`;
}
function render(){
  for(const [key,css] of [['accent','--accent'],['secondary','--contrast'],['surface','--theme-surface']])document.documentElement.style.setProperty(css,state[key]);
  $('#catalog').style.fontSize=state.fontSize+'px';
  $('#catalog').className=state.layout;
  $('#catalog').dataset.imageSide=state.imageSide;
  $('#imageSide').disabled=['grid','showcase'].includes(state.layout);
  $('#layoutHelp').textContent=$('#imageSide').disabled?'แม่แบบนี้วางรูปด้านบนของข้อความเสมอ':'ปรับด้านของรูป · แบบสลับฝั่งจะสลับจากด้านที่เลือก';
  $('#count').textContent=state.products.length;
  $('#documentName').textContent=state.catalogTitle||'แคตตาล็อกไม่มีชื่อ';
  $('#productList').innerHTML=state.products.map((p,i)=>`<div class="product-list-item"><button class="product-row" data-id="${esc(p.id)}" aria-label="แก้ไข ${esc(p.name)}"><span class="thumb">${visual(p)}</span><span class="product-row-text"><strong>${esc(p.name)}</strong><small>${String(i+1).padStart(2,'0')} · ${esc(p.model)}</small></span></button><div class="reorder-controls"><button type="button" data-move="up" data-product="${esc(p.id)}" aria-label="ย้าย ${esc(p.name)} ขึ้น" ${i===0?'disabled':''}>${moveIcon('up')}</button><button type="button" data-move="down" data-product="${esc(p.id)}" aria-label="ย้าย ${esc(p.name)} ลง" ${i===state.products.length-1?'disabled':''}>${moveIcon('down')}</button></div></div>`).join('')||'<div class="product-list-empty"><span aria-hidden="true">+</span><h3>เริ่มจากสินค้าชิ้นแรก</h3><p>เพิ่มรูปและรายละเอียดสินค้า<br>แล้วดูแคตตาล็อกของคุณได้ทันที</p></div>';
  $('#catalog').innerHTML=`
    <div class="page-top"><strong><span class="catalog-mark" aria-hidden="true">+</span>${esc(state.brandName)}</strong><span>MEDICAL COLLECTION<br><b>${new Date().getFullYear()}</b></span></div>
    <div class="catalog-heading">
      <div class="cover-copy"><div class="eyebrow"><i></i> PRECISION IN EVERY DETAIL</div><h2>${esc(state.catalogTitle)}</h2><p>${esc(state.description)}</p><span class="cover-rule"></span></div>
      <div class="cover-art" aria-hidden="true"><div class="cover-orbit"></div><span class="medical-cross"></span><svg viewBox="0 0 240 80" fill="none"><path d="M0 40h56l12-12 13 29 17-46 20 60 15-31h107" stroke="currentColor" stroke-width="1.4"/></svg></div>
    </div>
    <div class="collection-heading"><span>คัดสรรเพื่อการดูแล</span><small>PRODUCT SELECTION <b>/ ${String(state.products.length).padStart(2,'0')}</b></small></div>
    <div class="products">${state.products.map((p,i)=>`
      <section class="product-card" data-product-id="${esc(p.id)}"><div class="product-visual">${visual(p)}<span class="number">${String(i+1).padStart(2,'0')}</span></div><div class="product-copy"><div class="eyebrow">${esc(p.category)}</div><h3>${esc(p.name)}</h3><small class="model-tag">${esc(p.model)}</small><p>${esc(p.details)}</p><strong class="price">${esc(p.price)} <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke-linecap="round" stroke-linejoin="round"/></svg></span></strong></div></section>`).join('')||'<div class="empty">'+medicalIcon+'<h3>เริ่มต้นเรื่องราวของสินค้าคุณ</h3><p>เพิ่มรูปและรายละเอียดสินค้าจากแถบเครื่องมือ</p></div>'}</div>
    <footer><span>${esc(state.contact)}</span><span><i aria-hidden="true">+</i> ${esc(state.brandName)}</span></footer>`;
  document.querySelectorAll('[data-layout]').forEach(b=>{
    const active=b.dataset.layout===state.layout;
    b.classList.toggle('selected',active);
    b.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-theme]').forEach(b=>{const t=themes.find(t=>t.id===b.dataset.theme);b.setAttribute('aria-pressed',String(t.accent===state.accent&&t.secondary===state.secondary&&t.surface===state.surface))});
}
for(const key of ['brandName','catalogTitle','description','contact','accent','secondary','fontSize','imageSide']){$('#'+key).value=state[key];$('#'+key).addEventListener('input',e=>{state[key]=e.target.value;render();save()})}
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{state.layout=b.dataset.layout;render();save()});
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{const t=themes.find(t=>t.id===b.dataset.theme);for(const key of ['accent','secondary','surface'])state[key]=t[key];$('#accent').value=state.accent;$('#secondary').value=state.secondary;render();save()});
let editing=null,photo='',uploadToken=0,deletedProduct=null;
function inlineError(id,message='') {$(id).textContent=message;$(id).hidden=!message;}
function uploadBusy(busy){$('#saveProduct').disabled=busy;$('#photoStatus').textContent=busy?'กำลังเตรียมรูปภาพ…':'';}
function showPhoto(){$('#photoPreview').hidden=!photo;if(photo)$('#photoPreview').src=photo;else $('#photoPreview').removeAttribute('src');$('#removePhoto').hidden=!photo;}
function open(id){
  uploadToken++;uploadBusy(false);editing=id;
  inlineError('#photoError');inlineError('#formError');
  const p=state.products.find(p=>p.id===id)||{};
  for(const key of ['category','model','details','price'])$('#'+key).value=p[key]||'';
  $('#productName').value=p.name||'';photo=p.image||'';$('#photo').value='';
  showPhoto();$('#delete').hidden=!id;$('#editor-title').textContent=id?'แก้ไขสินค้า':'เพิ่มสินค้าใหม่';$('#editor').showModal();
  $('#productName').focus();
}
$('#add').onclick=()=>open(null);
$('#productList').onclick=e=>{
  const move=e.target.closest('[data-move]');
  if(move){
    const i=state.products.findIndex(p=>p.id===move.dataset.product);
    const next=i+(move.dataset.move==='up'?-1:1);
    if(i<0||next<0||next>=state.products.length)return;
    const id=move.dataset.product;
    [state.products[i],state.products[next]]=[state.products[next],state.products[i]];
    render();const saved=save();
    const item=[...document.querySelectorAll('.product-row')].find(b=>b.dataset.id===id);
    item?.focus({preventScroll:true});if(saved)setStatus('จัดลำดับและบันทึกแล้ว');return;
  }
  const b=e.target.closest('[data-id]');if(b)open(b.dataset.id);
};
$('#close').onclick=()=>$('#editor').close();
$('#editor').addEventListener('close',()=>{uploadToken++;uploadBusy(false);});
$('#removePhoto').onclick=()=>{uploadToken++;uploadBusy(false);photo='';$('#photo').value='';inlineError('#photoError');showPhoto();};
$('#photo').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  const token=++uploadToken;uploadBusy(false);inlineError('#photoError');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){
    inlineError('#photoError','เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 15 MB');return;
  }
  uploadBusy(true);
  try{
    const bitmap=await createImageBitmap(file);
    if(token!==uploadToken){bitmap.close();return;}
    const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    photo=canvas.toDataURL('image/webp',.85);showPhoto();
  }catch{if(token===uploadToken)inlineError('#photoError','ไม่สามารถอ่านรูปนี้ได้ กรุณาเลือกรูปใหม่');}
  finally{if(token===uploadToken)uploadBusy(false);}
};
$('#productForm').onsubmit=e=>{
  e.preventDefault();if($('#saveProduct').disabled)return;
  const name=$('#productName').value.trim();
  if(!name){inlineError('#formError','กรุณาระบุชื่อสินค้า');$('#productName').focus();return;}
  inlineError('#formError');
  const p={id:editing||crypto.randomUUID(),name,image:photo};
  for(const key of ['category','model','details','price'])p[key]=$('#'+key).value.trim();
  const idx=state.products.findIndex(x=>x.id===editing);
  if(idx>=0)state.products[idx]=p;else state.products.push(p);
  editing=p.id;$('#delete').hidden=false;render();
  if(save())$('#editor').close();
  else inlineError('#formError','ยังบันทึกไม่ได้ ลองลบหรือลดขนาดรูปภาพ แล้วกดบันทึกอีกครั้ง ข้อมูลที่แก้ยังอยู่ในหน้านี้');
};
$('#delete').onclick=()=>{
  const index=state.products.findIndex(p=>p.id===editing);if(index<0)return;
  deletedProduct={product:state.products[index],index};state.products.splice(index,1);
  render();save();$('#editor').close();$('#undoText').textContent=`ลบ “${deletedProduct.product.name}” แล้ว`;
  $('#undoNotice').hidden=false;$('#undoDelete').focus();
};
$('#undoDelete').onclick=()=>{
  if(!deletedProduct)return;
  state.products.splice(Math.min(deletedProduct.index,state.products.length),0,deletedProduct.product);
  deletedProduct=null;$('#undoNotice').hidden=true;render();if(save())setStatus('คืนสินค้าและบันทึกแล้ว');$('#add').focus();
};

// Editor tabs use the ARIA tab pattern; product data is untouched by navigation.
function selectTab(name,focus=false){
  document.querySelectorAll('[data-tab]').forEach(button=>{
    const active=button.dataset.tab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
    $('#panel-'+button.dataset.tab).hidden=!active;if(active&&focus)button.focus();
  });
  $('.panel-scroll').scrollTop=0;
}
const tabButtons=[...document.querySelectorAll('[data-tab]')];
tabButtons.forEach((button,i)=>{
  button.onclick=()=>selectTab(button.dataset.tab);
  button.onkeydown=e=>{
    let next;if(e.key==='ArrowRight')next=(i+1)%tabButtons.length;else if(e.key==='ArrowLeft')next=(i+tabButtons.length-1)%tabButtons.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabButtons.length-1;
    if(next!==undefined){e.preventDefault();selectTab(tabButtons[next].dataset.tab,true);}
  };
});
function updatePreviewScale(){
  const stage=$('.paper-stage');if(stage.clientWidth===0)return;
  const style=getComputedStyle(stage);const width=stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  const zoom=$('#previewScale').value==='fit'?Math.max(.15,Math.min(1,width/794)):Number($('#previewScale').value);
  $('#catalog').style.zoom=zoom;
}
document.querySelectorAll('#mobileSwitcher [data-view]').forEach(button=>button.onclick=()=>{
  $('.workspace').dataset.mobileView=button.dataset.view;
  document.querySelectorAll('#mobileSwitcher [data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  requestAnimationFrame(updatePreviewScale);
});
$('#previewScale').onchange=updatePreviewScale;
new ResizeObserver(updatePreviewScale).observe($('.paper-stage'));
$('#print').onclick=async()=>{
  const button=$('#print');button.disabled=true;
  try{await document.fonts?.ready;await Promise.all([...document.querySelectorAll('#catalog img')].map(img=>img.decode?.().catch(()=>{})));window.print();}
  finally{button.disabled=false;}
};
render();requestAnimationFrame(updatePreviewScale);

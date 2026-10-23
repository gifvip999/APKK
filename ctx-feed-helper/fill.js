async function fillCtxFeed() {
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
 const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 const text=e=>e.tagName==='SELECT' ? e.selectedOptions[0]?.textContent||'' : e.textContent||e.value||'';
 const matches=(s,terms)=>terms.some(t=>norm(s)===norm(t));
 const all=(root,selector)=>Array.from(root.querySelectorAll(selector));
 const controls=root=>all(root,'select,[role="combobox"],button[aria-haspopup="listbox"],button[data-state],input[role="combobox"]').filter(visible);
 async function selectOption(control,terms){
  if(control.disabled||control.getAttribute('aria-disabled')==='true')throw Error('下拉框被禁用');
  if(control.tagName==='SELECT'){
   const option=Array.from(control.options).find(o=>!o.disabled&&(matches(o.value,terms)||matches(o.textContent,terms)));
   if(!option)throw Error('没有找到下拉选项：'+terms[0]);
   control.value=option.value;control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));await sleep(120);return;
  }
  // Menus can be portalled and their search field may have no ARIA role.
  const previousInputs=new Set(all(document,'input').filter(visible));
  control.click();await sleep(180);
  let search=null;
  for(let i=0;i<12;i++){
   const inputs=all(document,'input').filter(e=>visible(e)&&!e.disabled&&!e.readOnly&&e.type!=='hidden');
   search=inputs.find(e=>!previousInputs.has(e)&&/search|type a value|搜索/i.test(e.placeholder||''))
    ||inputs.find(e=>!previousInputs.has(e)&&(e.type==='search'||e.getAttribute('role')==='combobox'||/select2-search/.test(e.className)))
    ||inputs.find(e=>/search or type a value/i.test(e.placeholder||''));
   if(search)break;
   if(all(document,'[role="option"],.select2-results__option').some(visible))break;
   await sleep(80);
  }
  function find(){
   const semantic=all(document,'[role="option"],.select2-results__option,[role="menuitem"],.select__option,[cmdk-item]');
   let candidates=semantic;
   if(search){
    // CTX versions also render plain clickable divs without role=option.
    let root=search.parentElement;
    for(let i=0;root&&i<5;i++,root=root.parentElement){
     if(root===document.body||root===document.documentElement||root.contains(control))break;
     const exact=all(root,'button,li,div,span').filter(e=>visible(e)&&matches(text(e),terms)&&!e.contains(search)&&!all(e,'button,li,div,span').some(c=>matches(text(c),terms)));
     if(exact.length){candidates=[...semantic,...exact];break;}
    }
   }
   return candidates.filter(e=>visible(e)&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled).find(e=>matches(text(e),terms)||terms.some(t=>e.getAttribute('data-value')===t));
  }
  let option=null;
  // Search each known label separately; React may render filtered results later.
  for(const term of search?terms:[null]){
   if(search){search.focus();setInput(search,term);}
   for(let i=0;i<20;i++){await sleep(80);option=find();if(option)break;}
   if(option)break;
  }
  if(!option){
   (search||control).dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
   control.focus();
   throw Error('搜索后仍未找到选项：'+terms[0]+'（请展开对应值下拉框截图）');
  }
  option.click();await sleep(180);
  if(!matches(text(control),terms)){
   for(let i=0;i<10&&!matches(text(control),terms);i++)await sleep(80);
   if(!matches(text(control),terms))throw Error('已点击选项，但无法确认选中结果：'+terms[0]);
  }
 }
 function setInput(e,value){
  const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);
  e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
 }

 const targets=[
  ['brand','Manufacturer[brand]','Manufacturer [brand]'],
  ['gtin','GTIN[gtin]','GTIN [gtin]'],
  ['color','Color[color]','Color [color]'],
  ['size','Size of the item[size]','Size of the item [size]','Size[size]'],
  ['gender','Gender[gender]','Gender [gender]'],
  ['age_group','Age Group[age_group]','Age Group [age_group]']
 ];
 function channelRows(){
  const result=[];
  for(const c of controls(document)){
   if(!/\[[a-z_0-9]+\]/i.test(text(c)))continue;
   let row=c.parentElement;
   for(let depth=0;row&&depth<9;depth++,row=row.parentElement){
    const toggles=all(row,'button,label,a,[role="tab"],input[type="button"]').filter(visible);
    if(toggles.some(e=>matches(text(e),['Text']))&&toggles.some(e=>matches(text(e),['Attribute']))){
     const first=controls(row)[0];
     const channels=controls(row).filter(e=>/\[[a-z_0-9]+\]/i.test(text(e)));
     if(first===c&&channels.length<=1)result.push({row,control:c});
     break;
    }
   }
  }
  return result;
 }
 function locate(){
  const rows=channelRows();
  const anchors=rows.map((r,i)=>/\[mpn\]/i.test(text(r.control).replace(/\s/g,''))?i:-1).filter(i=>i>=0);
  if(anchors.length!==1)throw Error('需要唯一的 MPN[mpn] 行，当前找到 '+anchors.length+' 行');
  const index=anchors[0];
  if(rows.length-index-1<6)throw Error('MPN 下方不足六行，请先手动准备六个下拉框');
  return {rows,index};
 }
 const reports=[];
 try{locate();}catch(e){return '未修改：'+e.message;}
 for(let i=0;i<targets.length;i++){
  const [key,...labels]=targets[i];
  try{
   const {rows,index}=locate();
   const control=rows[index+1+i].control;
   if(!text(control).replace(/\s/g,'').toLowerCase().includes('['+key+']'))await selectOption(control,[...labels,key]);
   const after=locate();
   if(!text(after.rows[after.index+1+i].control).replace(/\s/g,'').toLowerCase().includes('['+key+']'))throw Error('无法确认选中结果');
   reports.push('✓ 第 '+(i+1)+' 行 → '+labels[0]);
  }catch(e){reports.push('✗ 第 '+(i+1)+' 行：'+e.message);reports.push('已停止，后续行未处理。');return reports.join('\n');}
 }
 const {rows,index}=locate();
 const duplicates=rows.filter((r,i)=>!(i>index&&i<=index+6)&&targets.some(([key])=>text(r.control).replace(/\s/g,'').toLowerCase().includes('['+key+']')));
 if(duplicates.length)reports.push('注意：其他位置还有 '+duplicates.length+' 个同名字段，已保留，请核对重复行。');
 return reports.join('\n')+'\n左侧六项已排列。右侧未操作，请核对后手动保存。';
}

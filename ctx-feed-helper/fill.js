async function fillCtxFeed(brand) {
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
 const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 const text=e=>e.tagName==='SELECT' ? e.selectedOptions[0]?.textContent||'' : e.textContent||e.value||'';
 const matches=(s,terms)=>terms.some(t=>norm(s)===norm(t));
 const all=(root,selector)=>Array.from(root.querySelectorAll(selector));
 const controls=root=>all(root,'select,[role="combobox"],button[aria-haspopup="listbox"],button[data-state],input[role="combobox"]').filter(visible);
 const msg=[];
 const rules=[
  {key:'brand',labels:['Manufacturer[brand]','Manufacturer [brand]','Brand','Manufacturer'],mode:'Text',value:brand},
  {key:'gtin',labels:['GTIN[gtin]','GTIN [gtin]','GTIN'],mode:'Attribute',value:'_global_unique_id',aliases:['_global_unique_id','Global Unique ID','Global Unique Id (GTIN, UPC, EAN or ISBN)','GTIN']},
  {key:'color',labels:['Color[color]','Color [color]','Color'],mode:'Attribute',value:'Color'},
  {key:'size',labels:['Size of the item[size]','Size of the item [size]','Size[size]','Size [size]','Size of the item'],mode:'Attribute',value:'Size'},
  {key:'gender',labels:['Gender[gender]','Gender [gender]','Gender'],mode:'Text',value:'unisex'},
  {key:'age_group',labels:['Age Group[age_group]','Age Group [age_group]','Age Group'],mode:'Text',value:'adult'}
 ];
 function isChannel(s,rule){return norm(s).replace(/\s/g,'').includes('['+rule.key+']')||matches(s,rule.labels);}
 function findRow(rule){
  const candidates=controls(document).filter(e=>isChannel(text(e),rule)||(e.tagName==='SELECT'&&norm(e.value)===rule.key));
  // Only the channel column is followed by both source mode controls.
  const rows=[];
  for(const c of candidates){
   let p=c.parentElement;
   for(let depth=0;p&&depth<9;depth++,p=p.parentElement){
    const toggles=all(p,'button,label,a,[role="tab"],input[type="radio"],input[type="button"]').filter(e=>visible(e)&&matches(text(e),['Text','Attribute']));
    if(toggles.some(e=>matches(text(e),['Text']))&&toggles.some(e=>matches(text(e),['Attribute']))){
     const channels=controls(p).filter(e=>/\[[a-z_]+\]/i.test(text(e)));
     if(channels.length<=1){rows.push(p);break;}
    }
   }
  }
  const unique=[...new Set(rows)];
  if(unique.length>1)throw Error('发现多个同名字段，请先删除重复行');
  return unique[0]||null;
 }
 async function selectOption(control,terms){
  if(control.disabled||control.getAttribute('aria-disabled')==='true')throw Error('下拉框被禁用');
  if(control.tagName==='SELECT'){
   const option=Array.from(control.options).find(o=>!o.disabled&&(matches(o.value,terms)||matches(o.textContent,terms)));
   if(!option)throw Error('没有找到下拉选项：'+terms[0]);
   control.value=option.value;control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));await sleep(120);return;
  }
  control.click();await sleep(180);
  const find=()=>all(document,'[role="option"],.select2-results__option,[role="menuitem"],.select__option').filter(visible).find(e=>matches(text(e),terms)||terms.some(t=>e.getAttribute('data-value')===t));
  let option=find();
  if(!option){
   const inputs=all(document,'input').filter(e=>visible(e)&&(e.getAttribute('role')==='combobox'||e.className.includes('select2-search')||e.closest('[role="listbox"],[cmdk-root],[data-radix-popper-content-wrapper]')));
   const search=inputs.find(e=>e===control)||inputs[inputs.length-1];
   if(search){setInput(search,terms[0]);await sleep(250);option=find();}
  }
  if(!option){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));throw Error('未找到下拉选项：'+terms[0]+'（请提供该下拉框截图）');}
  option.click();await sleep(180);
 }
 function setInput(e,value){
  const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);
  e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
 }
 async function addRow(rule){
  const add=all(document,'button,a').filter(visible).find(e=>/^\+?\s*add attribute$/i.test(text(e).trim()));
  if(!add)throw Error('当前列表没有此字段，且找不到 Add attribute');
  const previous=new Set(controls(document));add.click();await sleep(200);
  // Some versions open an attribute picker directly.
  const option=all(document,'[role="option"],.select2-results__option').filter(visible).find(e=>isChannel(text(e),rule));
  if(option){option.click();await sleep(200);return;}
  const fresh=controls(document).filter(e=>!previous.has(e));
  const channel=fresh.find(e=>e.tagName==='SELECT'&&Array.from(e.options).some(o=>isChannel(o.textContent,rule)||norm(o.value)===rule.key))||fresh[0];
  if(!channel)throw Error('新增行未能识别，请手动添加该字段后重试');
  await selectOption(channel,[...rule.labels,rule.key]);
 }
 // File name is the same prefix the user enters in the popup.
 const labels=all(document,'label').filter(e=>/^file name\s*\*?$/i.test(text(e).trim()));
 let filename=null;
 if(labels.length===1){const label=labels[0];filename=label.control||(label.htmlFor&&document.getElementById(label.htmlFor));if(!filename){let p=label.parentElement;for(let i=0;p&&i<3;i++,p=p.parentElement){const inputs=all(p,'input').filter(visible);if(inputs.length===1){filename=inputs[0];break;}}}}
 if(!filename)filename=all(document,'input').filter(visible).find(e=>/^(feed_?name|file_?name|filename)$/i.test(e.name||e.id));
 if(filename&&!filename.readOnly&&!filename.disabled){setInput(filename,brand);msg.push('✓ File name → '+brand);}else msg.push('✗ File name：无法识别输入框，请手动填写');
 for(const rule of rules){
  try{
   let row=findRow(rule);
   if(!row){await addRow(rule);row=findRow(rule);}
   if(!row)throw Error('无法识别字段行，请手动添加后重试');
   const toggle=all(row,'button,label,a,[role="tab"],input[type="button"]').filter(visible).find(e=>matches(text(e),[rule.mode]));
   if(!toggle)throw Error('找不到 '+rule.mode+' 切换按钮');
   toggle.click();await sleep(150);row=findRow(rule)||row;
   if(rule.mode==='Text'){
    const inputs=all(row,'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="button"]),textarea').filter(e=>visible(e)&&!e.disabled&&!e.readOnly&&e.getAttribute('role')!=='combobox'&&(toggle.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING));
    if(!inputs.length)throw Error('找不到值输入框');setInput(inputs[0],rule.value);await sleep(120);
   }else{
    const candidates=controls(row).slice(1).filter(e=>(toggle.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING));
    const value=candidates[0];if(!value)throw Error('找不到值下拉框');await selectOption(value,rule.aliases||[rule.value]);
   }
   row=findRow(rule)||row;
   const outputs=controls(row).slice(1);
   const output=outputs[outputs.length-1];
   // New CTX versions show output as a settings button rather than a select.
   const outputText=all(row,'button,input,select,[role="combobox"]').filter(visible).some(e=>matches(text(e),['Default']));
   if(outputText){/* already Default */}
   else if(output&&outputs.length>=(rule.mode==='Attribute'?2:1))await selectOption(output,['Default']);
   else throw Error('值已填写；无法确认输出类型，请手动选择 Default');
   msg.push('✓ '+rule.labels[0]+' → '+rule.value);
  }catch(e){msg.push('✗ '+rule.labels[0]+'：'+e.message);}
 }
 return msg.join('\n')+'\n请检查后手动保存；本插件不会提交或生成 Feed。';
}

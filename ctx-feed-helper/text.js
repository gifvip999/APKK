async function setCtxSixText(){
 const keys=['brand','gtin','color','size','gender','age_group'];
 const names=['Manufacturer','GTIN','Color','Size of the item','Gender','Age Group'];
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
 const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 const all=(r,s)=>Array.from(r.querySelectorAll(s));
 const text=e=>e.tagName==='SELECT'?e.selectedOptions[0]?.textContent||'':e.textContent||e.value||'';
 const controls=r=>all(r,'select,[role="combobox"],button[aria-haspopup="listbox"],button[data-state],input[role="combobox"]').filter(visible);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 function rows(){
  const result=[];
  for(const c of controls(document)){
   if(!/\[[a-z_0-9]+\]/i.test(text(c)))continue;
   let row=c.parentElement;
   for(let i=0;row&&i<9;i++,row=row.parentElement){
    const buttons=all(row,'button,label,a,[role="tab"],input[type="button"]').filter(visible);
    if(buttons.some(e=>norm(text(e))==='text')&&buttons.some(e=>norm(text(e))==='attribute')){
     if(controls(row)[0]===c&&controls(row).filter(e=>/\[[a-z_0-9]+\]/i.test(text(e))).length<=1)result.push({row,control:c});
     break;
    }
   }
  }
  return result;
 }
 function locate(){
  const list=rows();const anchors=list.map((r,i)=>/\[mpn\]/i.test(text(r.control).replace(/\s/g,''))?i:-1).filter(i=>i>=0);
  if(anchors.length!==1)throw Error('未找到唯一的 MPN 行');
  const six=list.slice(anchors[0]+1,anchors[0]+7);
  if(six.length!==6||six.some((r,i)=>!text(r.control).replace(/\s/g,'').toLowerCase().includes('['+keys[i]+']')))throw Error('MPN 下方六项顺序不匹配，请先完成左侧排列');
  return six;
 }
 function toggleFor(row){return all(row,'button,label,a,[role="tab"],input[type="button"]').filter(visible).find(e=>norm(text(e))==='text');}
 function isText(row,toggle){
  if(toggle.getAttribute('aria-pressed')==='true'||toggle.getAttribute('aria-selected')==='true'||toggle.getAttribute('data-state')==='active')return true;
  const following=e=>!!(toggle.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING);
  const input=all(row,'input,textarea').some(e=>visible(e)&&!e.disabled&&following(e)&&!['hidden','radio','checkbox','button'].includes(e.type)&&e.getAttribute('role')!=='combobox');
  const valueSelect=controls(row).some(e=>following(e)&&e.tagName==='SELECT');
  return input&&!valueSelect;
 }
 // Validate all six before clicking any of them.
 let six;
 try{six=locate();if(six.some(({row})=>!toggleFor(row)))throw Error('部分行缺少 Text 按钮');}catch(e){return '未修改：'+e.message;}
 const report=[];
 for(let i=0;i<6;i++){
  try{
   let {row}=locate()[i];const toggle=toggleFor(row);
   if(!isText(row,toggle))toggle.click();
   let ok=false;
   for(let n=0;n<20;n++){await sleep(80);row=locate()[i].row;const t=toggleFor(row);if(t&&isText(row,t)){ok=true;break;}}
   if(!ok)throw Error('无法确认 Text 已选中，请检查页面');
   report.push('✓ '+names[i]+' → Text');
  }catch(e){report.push('✗ '+names[i]+'：'+e.message+'；已停止后续操作');return report.join('\n');}
 }
 return report.join('\n')+'\n六项已切换 Text；未填写值、未自动保存。';
}

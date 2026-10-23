function fillCtxFeed(brand) {
 const rules=[['brand','Manufacturer', 'text',brand],['gtin','GTIN','attribute','_global_unique_id'],['color','Color','attribute','Color'],['size','Size of the item','attribute','Size'],['gender','Gender','text','unisex'],['age_group','Age Group','text','adult']];
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
 const visible=e=>e.getClientRects().length>0;
 const notify=e=>{e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
 const choose=(s,wanted)=>{
  const o=Array.from(s.options).find(o=>norm(o.value)===norm(wanted)||norm(o.textContent)===norm(wanted));
  if(!o) throw Error('下拉选项不存在：'+wanted);
  if(o.disabled||s.disabled)throw Error('下拉项不可用：'+wanted);
  s.value=o.value;notify(s);
 };
 const reports=[];
 for(const [key,label,mode,value] of rules){
  try{
   const selects=Array.from(document.querySelectorAll('select'));
   const fields=selects.filter(s=>{
    const o=s.selectedOptions[0];if(!o)return false;
    return norm(o.value)===key||norm(o.textContent).includes('['+key+']')||norm(o.textContent)===norm(label);
   });
   if(fields.length!==1)throw Error('无法唯一定位字段行');
   const field=fields[0];
   const row=field.closest('tr')||field.closest('.feed-field')||field.closest('.form-group');
   if(!row)throw Error('无法识别表单行结构');
   const toggles=Array.from(row.querySelectorAll('button,a,label,input[type=radio],input[type=button],span')).filter(e=>norm(e.textContent||e.value)=== (mode==='text'?'text':'attribute') && visible(e));
   const toggle=toggles.find(e=>['BUTTON','A','LABEL','INPUT'].includes(e.tagName))||toggles[0];
   if(!toggle)throw Error('找不到 '+mode+' 切换按钮');
   toggle.click();
   // Re-query controls after the mode switch; CTX Feed may reveal different inputs.
   const controls=Array.from(row.querySelectorAll('input,textarea,select')).filter(e=>e!==field&&visible(e)&&!e.disabled&&e.type!=='hidden'&&e.type!=='radio'&&e.type!=='button'&&e.type!=='checkbox');
   const select=controls.find(e=>e.tagName==='SELECT'&&Array.from(e.options).some(o=>norm(o.value)===norm(value)||norm(o.textContent)===norm(value)));
   if(mode==='attribute'){
    if(!select)throw Error('找不到含 '+value+' 的值下拉框');
    choose(select,value);
   }else{
    // The value column follows the Attribute/Text switch; prefix is before it.
    const inputs=controls.filter(e=>['INPUT','TEXTAREA'].includes(e.tagName)&&Boolean(toggle.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING));
    const input=inputs[0];if(!input||input.readOnly)throw Error('找不到可编辑的值输入框');
    const proto=input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto,'value').set.call(input,value);notify(input);
   }
   const output=Array.from(row.querySelectorAll('select')).find(s=>s!==field&&s!==select&&visible(s)&&Array.from(s.options).some(o=>norm(o.textContent)==='default'));
   if(!output)throw Error('找不到输出类型 Default');
   choose(output,'Default');
   reports.push('✓ '+label+' → '+value);
  }catch(e){reports.push('✗ '+label+'：'+e.message);}
 }
 return reports.join('\n')+'\n请核对页面后手动保存。';
}

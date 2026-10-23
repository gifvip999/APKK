const prefix = document.getElementById('prefix');
const button = document.getElementById('fill');
const status = document.getElementById('status');
chrome.storage.local.get(['prefix','brand']).then(v => {prefix.value=v.prefix||'';});
button.addEventListener('click',async()=>{
 button.disabled=true;status.textContent='正在检查表单…';
 try {
  const values={prefix:prefix.value.trim(),brand:prefix.value.trim()};
  if(!values.brand) throw new Error('请填写品牌。');
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  await chrome.storage.local.set(values);
  const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillCtxFeed,args:[values.brand]});
  status.textContent=results[0].result;
 }catch(e){status.textContent='未完成：'+e.message;}finally{button.disabled=false;}
});

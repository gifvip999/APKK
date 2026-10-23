const button=document.getElementById('fill');
const status=document.getElementById('status');
button.addEventListener('click',async()=>{
 button.disabled=true;document.getElementById('text').disabled=true;status.textContent='正在依次搜索并选择，请保持窗口打开…';
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillCtxFeed});
  status.textContent=results[0].result;
 }catch(e){status.textContent='未完成：'+e.message;}finally{button.disabled=false;document.getElementById('text').disabled=false;}
});

const textButton=document.getElementById('text');
textButton.addEventListener('click',async()=>{
 button.disabled=true;textButton.disabled=true;status.textContent='正在将六项切换为 Text…';
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:setCtxSixText});
  status.textContent=results[0].result;
 }catch(e){status.textContent='未完成：'+e.message;}finally{button.disabled=false;textButton.disabled=false;}
});

const valuesButton=document.getElementById('values');
valuesButton.addEventListener('click',async()=>{
 button.disabled=true;textButton.disabled=true;valuesButton.disabled=true;status.textContent='正在填写五项固定文本…';
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillCtxTextValues});
  status.textContent=results[0].result;
 }catch(e){status.textContent='未完成：'+e.message;}finally{button.disabled=false;textButton.disabled=false;valuesButton.disabled=false;}
});
// Lock all step buttons while any step is running.
new MutationObserver(()=>{valuesButton.disabled=button.disabled||textButton.disabled;}).observe(button,{attributes:true,attributeFilter:['disabled']});

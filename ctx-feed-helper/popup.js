const button=document.getElementById('fill');
const status=document.getElementById('status');
button.addEventListener('click',async()=>{
 button.disabled=true;status.textContent='正在依次搜索并选择，请保持窗口打开…';
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillCtxFeed});
  status.textContent=results[0].result;
 }catch(e){status.textContent='未完成：'+e.message;}finally{button.disabled=false;}
});

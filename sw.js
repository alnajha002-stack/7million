/* Service Worker — عمل بدون إنترنت (يُرفع مع index.html على نفس المجلد) */
const C='7m-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // صور الإنترنت: أرجع المخزّن أولاً وحدّث في الخلفية
  if(u.hostname.includes('wikimedia.org')||u.hostname.includes('upload.wikimedia.org')){
    e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request);const p=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||p}));
    return;
  }
  // ملفات الموقع: الشبكة أولاً ثم الذاكرة
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
});

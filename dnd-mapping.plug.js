function k(e){let o=atob(e),r=o.length,s=new Uint8Array(r);for(let i=0;i<r;i++)s[i]=o.charCodeAt(i);return s}function m(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let o="",r=e.byteLength;for(let s=0;s<r;s++)o+=String.fromCharCode(e[s]);return btoa(o)}var h=e=>{throw new Error("Not initialized yet")},w=typeof window>"u"&&typeof globalThis.WebSocketPair>"u";typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var x=new Map,b=0;w&&(globalThis.syscall=async(e,...o)=>await new Promise((r,s)=>{b++,x.set(b,{resolve:r,reject:s}),h({type:"sys",id:b,name:e,args:o})}));function M(e,o,r){w&&(h=r,self.addEventListener("message",s=>{(async()=>{let i=s.data;switch(i.type){case"inv":{let d=e[i.name];if(!d)throw new Error(`Function not loaded: ${i.name}`);try{let c=await Promise.resolve(d(...i.args||[]));h({type:"invr",id:i.id,result:c})}catch(c){console.error("An exception was thrown as a result of invoking function",i.name,"error:",c.message),h({type:"invr",id:i.id,error:c.message})}}break;case"sysr":{let d=i.id,c=x.get(d);if(!c)throw Error("Invalid request id");x.delete(d),i.error?c.reject(new Error(i.error)):c.resolve(i.result)}break}})().catch(console.error)}),h({type:"manifest",manifest:o}))}async function I(e,o){if(typeof e!="string"){let r=new Uint8Array(await e.arrayBuffer()),s=r.length>0?m(r):void 0;o={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:s},e=e.url}return syscall("sandboxFetch.fetch",e,o)}globalThis.nativeFetch=globalThis.fetch;function P(){globalThis.fetch=async function(e,o){let r=o&&o.body?m(new Uint8Array(await new Response(o.body).arrayBuffer())):void 0,s=await I(e,o&&{method:o.method,headers:o.headers,base64Body:r});return new Response(s.base64Body?k(s.base64Body):null,{status:s.status,headers:s.headers})}}w&&P();async function $(e){let o=e.trim().split(`
`).map(t=>t.trim()).filter(t=>t&&!t.startsWith("%%")),r=[],s=[];for(let t of o){if(t.startsWith("graph ")||t.startsWith("flowchart "))continue;let a=t.match(/(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*-->?\s*|\s*---?\s*)(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*:\s*(.+))?/);if(a){let[,n,u,,f,D,y,v,,C,,E]=a;if(!r.find(g=>g.id===n)){let g=u&&u.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||n;r.push({id:n,label:g,type:f})}if(!r.find(g=>g.id===y)){let g=v&&v.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||y;r.push({id:y,label:g,type:C})}s.push({from:n,to:y,label:E?.trim()})}}let i=400,d=300,c=150,p=new Map;r.forEach((t,a)=>{let n=a/r.length*2*Math.PI;p.set(t.id,{x:i+Math.cos(n)*c,y:d+Math.sin(n)*c})});let l='<svg viewBox="0 0 800 600" style="width: 100%; height: 400px; border: 1px solid #ccc;">';return s.forEach(t=>{let a=p.get(t.from),n=p.get(t.to);if(a&&n&&(l+=`<line x1="${a.x}" y1="${a.y}" x2="${n.x}" y2="${n.y}" stroke="#666" stroke-width="2"/>`,t.label)){let u=(a.x+n.x)/2,f=(a.y+n.y)/2;l+=`<rect x="${u-t.label.length*3}" y="${f-7}" width="${t.label.length*6}" height="14" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.2)" stroke-width="1" rx="2" style="pointer-events: none;"/>`,l+=`<text x="${u}" y="${f}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#333" font-weight="500">${t.label}</text>`}}),r.forEach((t,a)=>{let n=p.get(t.id);if(n){let u=R(t.type),f=`node-${a}`;l+=`<circle id="${f}" cx="${n.x}" cy="${n.y}" r="25" fill="${u}" stroke="#333" stroke-width="2" style="cursor: pointer;" data-location-id="${t.id}"/>`,l+=`<rect x="${n.x-t.label.length*4}" y="${n.y-8}" width="${t.label.length*8}" height="16" fill="rgba(255,255,255,0.8)" stroke="rgba(0,0,0,0.2)" stroke-width="1" rx="3" style="pointer-events: none;"/>`,l+=`<text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#333" font-weight="bold" style="pointer-events: none;">${t.label}</text>`}}),l+="</svg>",{html:`
      <div style="border: 1px solid var(--ui-border-color, #ccc); border-radius: 8px; padding: 15px; margin: 10px 0; background: var(--ui-background-color, #fff);">
        <h3 style="margin: 0 0 15px 0; color: var(--ui-text-color, #333);">\u{1F5FA}\uFE0F D&D Interactive Map</h3>
        ${l}
        <div id="location-info" style="margin-top: 15px; padding: 10px; background: var(--ui-background-secondary, #f5f5f5); border-radius: 4px; color: var(--ui-text-color, #333); font-family: var(--ui-font-family, system-ui), -apple-system, sans-serif; border: 1px solid var(--ui-border-color, #e1e5e9);">
          <strong style="color: var(--ui-text-color, #000);">Current Location:</strong> <span id="current-location" style="color: var(--ui-text-secondary, #666); font-weight: 500;">Click a location above</span>
        </div>
      </div>
    `,script:`
      (function() {
        let currentLocation = null;

        function setCurrentLocation(locationId) {
          currentLocation = locationId;
          const locationSpan = document.getElementById('current-location');
          if (locationSpan) {
            locationSpan.textContent = locationId;
            locationSpan.style.color = '#e74c3c';
            locationSpan.style.fontWeight = 'bold';
          }

          // Update visual highlighting
          const circles = document.querySelectorAll('circle[data-location-id]');
          circles.forEach(circle => {
            if (circle.getAttribute('data-location-id') === locationId) {
              circle.setAttribute('stroke', '#e74c3c');
              circle.setAttribute('stroke-width', '4');
            } else {
              circle.setAttribute('stroke', '#333');
              circle.setAttribute('stroke-width', '2');
            }
          });
        }

        // Make setCurrentLocation globally accessible
        window.setCurrentLocation = setCurrentLocation;

        // Add click event listeners to circles
        document.addEventListener('DOMContentLoaded', function() {
          const circles = document.querySelectorAll('circle[data-location-id]');
          circles.forEach(circle => {
            circle.addEventListener('click', function() {
              const locationId = this.getAttribute('data-location-id');
              setCurrentLocation(locationId);
            });
          });
        });

        // If DOM is already loaded, set up listeners immediately
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupListeners);
        } else {
          setupListeners();
        }

        function setupListeners() {
          const circles = document.querySelectorAll('circle[data-location-id]');
          circles.forEach(circle => {
            circle.addEventListener('click', function() {
              const locationId = this.getAttribute('data-location-id');
              setCurrentLocation(locationId);
            });
          });
        }

        // D&D Map widget initialized
      })();
    `}}function R(e){return{tavern:"#ffd700",dungeon:"#8b0000",city:"#4682b4",castle:"#9370db",forest:"#228b22",shop:"#ff8c00",important:"#e74c3c"}[e||""]||"#f8f9fa"}var L={dndMapWidget:$},A={name:"dnd-mapping",functions:{dndMapWidget:{path:"dnd-mapping.ts:widget",codeWidget:"dndmap"}},assets:{}},q={manifest:A,functionMapping:L};M(L,A,self.postMessage);export{q as plug};

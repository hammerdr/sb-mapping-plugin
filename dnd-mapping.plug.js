function k(e){let o=atob(e),r=o.length,s=new Uint8Array(r);for(let i=0;i<r;i++)s[i]=o.charCodeAt(i);return s}function b(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let o="",r=e.byteLength;for(let s=0;s<r;s++)o+=String.fromCharCode(e[s]);return btoa(o)}var u=e=>{throw new Error("Not initialized yet")},w=typeof window>"u"&&typeof globalThis.WebSocketPair>"u";typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var x=new Map,m=0;w&&(globalThis.syscall=async(e,...o)=>await new Promise((r,s)=>{m++,x.set(m,{resolve:r,reject:s}),u({type:"sys",id:m,name:e,args:o})}));function $(e,o,r){w&&(u=r,self.addEventListener("message",s=>{(async()=>{let i=s.data;switch(i.type){case"inv":{let d=e[i.name];if(!d)throw new Error(`Function not loaded: ${i.name}`);try{let c=await Promise.resolve(d(...i.args||[]));u({type:"invr",id:i.id,result:c})}catch(c){console.error("An exception was thrown as a result of invoking function",i.name,"error:",c.message),u({type:"invr",id:i.id,error:c.message})}}break;case"sysr":{let d=i.id,c=x.get(d);if(!c)throw Error("Invalid request id");x.delete(d),i.error?c.reject(new Error(i.error)):c.resolve(i.result)}break}})().catch(console.error)}),u({type:"manifest",manifest:o}))}async function P(e,o){if(typeof e!="string"){let r=new Uint8Array(await e.arrayBuffer()),s=r.length>0?b(r):void 0;o={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:s},e=e.url}return syscall("sandboxFetch.fetch",e,o)}globalThis.nativeFetch=globalThis.fetch;function D(){globalThis.fetch=async function(e,o){let r=o&&o.body?b(new Uint8Array(await new Response(o.body).arrayBuffer())):void 0,s=await P(e,o&&{method:o.method,headers:o.headers,base64Body:r});return new Response(s.base64Body?k(s.base64Body):null,{status:s.status,headers:s.headers})}}w&&D();async function M(e){let o=e.trim().split(`
`).map(t=>t.trim()).filter(t=>t&&!t.startsWith("%%")),r=[],s=[];for(let t of o){if(t.startsWith("graph ")||t.startsWith("flowchart "))continue;let a=t.match(/(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*-->?\s*|\s*---?\s*)(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*:\s*(.+))?/);if(a){let[,n,g,,h,I,p,v,,E,,L]=a;if(!r.find(f=>f.id===n)){let f=g&&g.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||n;r.push({id:n,label:f,type:h})}if(!r.find(f=>f.id===p)){let f=v&&v.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||p;r.push({id:p,label:f,type:E})}s.push({from:n,to:p,label:L?.trim()})}}let i=400,d=300,c=150,y=new Map;r.forEach((t,a)=>{let n=a/r.length*2*Math.PI;y.set(t.id,{x:i+Math.cos(n)*c,y:d+Math.sin(n)*c})});let l='<svg viewBox="0 0 800 600" style="width: 100%; height: 400px; border: 1px solid #444; background: #1a1a1a;">';return s.forEach(t=>{let a=y.get(t.from),n=y.get(t.to);if(a&&n&&(l+=`<line x1="${a.x}" y1="${a.y}" x2="${n.x}" y2="${n.y}" stroke="#888" stroke-width="2"/>`,t.label)){let g=(a.x+n.x)/2,h=(a.y+n.y)/2;l+=`<rect x="${g-t.label.length*3}" y="${h-7}" width="${t.label.length*6}" height="14" fill="rgba(26,26,26,0.9)" stroke="rgba(136,136,136,0.3)" stroke-width="1" rx="2" style="pointer-events: none;"/>`,l+=`<text x="${g}" y="${h}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#ccc" font-weight="500" style="pointer-events: none;">${t.label}</text>`}}),r.forEach((t,a)=>{let n=y.get(t.id);if(n){let g=R(t.type),h=`node-${a}`;l+=`<circle id="${h}" cx="${n.x}" cy="${n.y}" r="25" fill="${g}" stroke="#666" stroke-width="2" style="cursor: pointer;" data-location-id="${t.id}"/>`,l+=`<rect x="${n.x-t.label.length*4}" y="${n.y-8}" width="${t.label.length*8}" height="16" fill="rgba(26,26,26,0.8)" stroke="rgba(136,136,136,0.3)" stroke-width="1" rx="3" style="pointer-events: none;"/>`,l+=`<text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#eee" font-weight="bold" style="pointer-events: none;">${t.label}</text>`}}),l+="</svg>",{html:`
      <div style="border: 1px solid #444; border-radius: 8px; padding: 15px; margin: 10px 0; background: #2a2a2a;">
        <h3 style="margin: 0 0 15px 0; color: #eee;">\u{1F5FA}\uFE0F D&D Interactive Map</h3>
        ${l}
        <div id="location-info" style="margin-top: 15px; padding: 10px; background: #333; border-radius: 4px; color: #ccc; font-family: system-ui, -apple-system, sans-serif; border: 1px solid #555;">
          <strong style="color: #eee;">Current Location:</strong> <span id="current-location" style="color: #aaa; font-weight: 500;">Click a location above</span>
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
            locationSpan.style.color = '#ff6b6b';
            locationSpan.style.fontWeight = 'bold';
          }

          // Update visual highlighting
          const circles = document.querySelectorAll('circle[data-location-id]');
          circles.forEach(circle => {
            if (circle.getAttribute('data-location-id') === locationId) {
              circle.setAttribute('stroke', '#ff6b6b');
              circle.setAttribute('stroke-width', '4');
            } else {
              circle.setAttribute('stroke', '#666');
              circle.setAttribute('stroke-width', '2');
            }
          });
        }

        // Make setCurrentLocation globally accessible
        window.setCurrentLocation = setCurrentLocation;

        // Setup click handlers with a delay to ensure DOM is ready
        setTimeout(function() {
          const circles = document.querySelectorAll('circle[data-location-id]');
          console.log('Found circles:', circles.length); // Debug log
          circles.forEach(circle => {
            circle.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const locationId = this.getAttribute('data-location-id');
              console.log('Clicked location:', locationId); // Debug log
              setCurrentLocation(locationId);
            });
            // Add visual feedback for hover
            circle.addEventListener('mouseenter', function() {
              this.style.opacity = '0.8';
            });
            circle.addEventListener('mouseleave', function() {
              this.style.opacity = '1';
            });
          });
        }, 100);

        // D&D Map widget initialized
      })();
    `}}function R(e){return{tavern:"#ffeb3b",dungeon:"#d32f2f",city:"#2196f3",castle:"#9c27b0",forest:"#4caf50",shop:"#ff9800",important:"#f44336"}[e||""]||"#666"}var A={dndMapWidget:M},C={name:"dnd-mapping",functions:{dndMapWidget:{path:"dnd-mapping.ts:widget",codeWidget:"dndmap"}},assets:{}},q={manifest:C,functionMapping:A};$(A,C,self.postMessage);export{q as plug};

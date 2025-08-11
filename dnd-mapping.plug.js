function B(e){let r=atob(e),o=r.length,n=new Uint8Array(o);for(let s=0;s<o;s++)n[s]=r.charCodeAt(s);return n}function R(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",o=e.byteLength;for(let n=0;n<o;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var L=e=>{throw new Error("Not initialized yet")},W=typeof window>"u"&&typeof globalThis.WebSocketPair>"u";typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var I=new Map,P=0;W&&(globalThis.syscall=async(e,...r)=>await new Promise((o,n)=>{P++,I.set(P,{resolve:o,reject:n}),L({type:"sys",id:P,name:e,args:r})}));function U(e,r,o){W&&(L=o,self.addEventListener("message",n=>{(async()=>{let s=n.data;switch(s.type){case"inv":{let c=e[s.name];if(!c)throw new Error(`Function not loaded: ${s.name}`);try{let t=await Promise.resolve(c(...s.args||[]));L({type:"invr",id:s.id,result:t})}catch(t){console.error("An exception was thrown as a result of invoking function",s.name,"error:",t.message),L({type:"invr",id:s.id,error:t.message})}}break;case"sysr":{let c=s.id,t=I.get(c);if(!t)throw Error("Invalid request id");I.delete(c),s.error?t.reject(new Error(s.error)):t.resolve(s.result)}break}})().catch(console.error)}),L({type:"manifest",manifest:r}))}async function z(e,r){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?R(o):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function O(){globalThis.fetch=async function(e,r){let o=r&&r.body?R(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await z(e,r&&{method:r.method,headers:r.headers,base64Body:o});return new Response(n.base64Body?B(n.base64Body):null,{status:n.status,headers:n.headers})}}W&&O();async function q(e){let r=e.trim().split(`
`).map(t=>t.trim()).filter(t=>t&&!t.startsWith("%%")),o=[],n=[];for(let t of r){if(t.startsWith("graph ")||t.startsWith("flowchart "))continue;let d=t.match(/(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*-->?\s*|\s*---?\s*)(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*:\s*(.+))?/);if(d){let[,i,l,,g,w,y,b,,u,,h]=d;if(!o.find(a=>a.id===i)){let a=l&&l.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||i;o.push({id:i,label:a,type:g})}if(!o.find(a=>a.id===y)){let a=b&&b.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||y;o.push({id:y,label:a,type:u})}n.push({from:i,to:y,label:h?.trim()})}}let s=_(o,n),c='<svg viewBox="0 0 800 600" style="width: 100%; height: 400px; border: 1px solid #444; background: #1a1a1a;">';return n.forEach(t=>{let d=s.get(t.from),i=s.get(t.to);if(d&&i&&(c+=`<line x1="${d.x}" y1="${d.y}" x2="${i.x}" y2="${i.y}" stroke="#888" stroke-width="2"/>`,t.label)){let l=(d.x+i.x)/2,g=(d.y+i.y)/2;c+=`<rect x="${l-t.label.length*3}" y="${g-7}" width="${t.label.length*6}" height="14" fill="rgba(26,26,26,0.9)" stroke="rgba(136,136,136,0.3)" stroke-width="1" rx="2" style="pointer-events: none;"/>`,c+=`<text x="${l}" y="${g}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#ccc" font-weight="500" style="pointer-events: none;">${t.label}</text>`}}),o.forEach((t,d)=>{let i=s.get(t.id);if(i){let l=N(t.type),g=`node-${d}`;c+=`<circle id="${g}" cx="${i.x}" cy="${i.y}" r="25" fill="${l}" stroke="#666" stroke-width="2" style="cursor: pointer;" data-location-id="${t.id}"/>`,c+=`<rect x="${i.x-t.label.length*4}" y="${i.y-8}" width="${t.label.length*8}" height="16" fill="rgba(26,26,26,0.8)" stroke="rgba(136,136,136,0.3)" stroke-width="1" rx="3" style="pointer-events: none;"/>`,c+=`<text x="${i.x}" y="${i.y}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#eee" font-weight="bold" style="pointer-events: none;">${t.label}</text>`}}),c+="</svg>",{html:`
      <div style="border: 1px solid #444; border-radius: 8px; padding: 15px; margin: 10px 0; background: #2a2a2a;">
        <h3 style="margin: 0 0 15px 0; color: #eee;">\u{1F5FA}\uFE0F D&D Interactive Map</h3>
        ${c}
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
    `}}function _(e,r){let o=new Map,n=800,s=600,c=n*s,t=Math.sqrt(c/e.length)*.6,d=100,i=n*.6,l=s*.6,g=(n-i)/2,w=(s-l)/2;e.forEach(u=>{o.set(u.id,{x:g+Math.random()*i,y:w+Math.random()*l})});let y=t*2,b=.98;for(let u=0;u<d;u++){let h=new Map;e.forEach(a=>h.set(a.id,{x:0,y:0}));for(let a=0;a<e.length;a++)for(let f=a+1;f<e.length;f++){let p=e[a],m=e[f],x=o.get(p.id),M=o.get(m.id),A=x.x-M.x,v=x.y-M.y,k=Math.sqrt(A*A+v*v)||.01,D=Math.max(k,t*.1),$=t*t/D,E=A/k*$,C=v/k*$,F=h.get(p.id),S=h.get(m.id);F.x+=E,F.y+=C,S.x-=E,S.y-=C}r.forEach(a=>{let f=o.get(a.from),p=o.get(a.to),m=p.x-f.x,x=p.y-f.y,M=Math.sqrt(m*m+x*x)||.01,A=t*3,v=Math.min(M,A),k=v*v/t,D=m/M*k,$=x/M*k,E=h.get(a.from),C=h.get(a.to);E.x+=D,E.y+=$,C.x-=D,C.y-=$}),e.forEach(a=>{let f=o.get(a.id),p=h.get(a.id),m=Math.sqrt(p.x*p.x+p.y*p.y)||.01,x=Math.min(m,y);f.x+=p.x/m*x,f.y+=p.y/m*x,f.x=Math.max(50,Math.min(n-50,f.x)),f.y=Math.max(50,Math.min(s-50,f.y))}),y*=b}return H(o,e,t*.8),o}function H(e,r,o){let n=r.map(c=>c.id),s=10;for(let c=0;c<s;c++){let t=!1;for(let d=0;d<n.length;d++)for(let i=d+1;i<n.length;i++){let l=e.get(n[d]),g=e.get(n[i]),w=l.x-g.x,y=l.y-g.y,b=Math.sqrt(w*w+y*y);if(b<o){t=!0;let u=(o-b)/2+1,h=Math.atan2(y,w);l.x+=Math.cos(h)*u,l.y+=Math.sin(h)*u,g.x-=Math.cos(h)*u,g.y-=Math.sin(h)*u,l.x=Math.max(50,Math.min(750,l.x)),l.y=Math.max(50,Math.min(550,l.y)),g.x=Math.max(50,Math.min(750,g.x)),g.y=Math.max(50,Math.min(550,g.y))}}if(!t)break}}function N(e){return{tavern:"#ffeb3b",dungeon:"#d32f2f",city:"#2196f3",castle:"#9c27b0",forest:"#4caf50",shop:"#ff9800",important:"#f44336"}[e||""]||"#666"}var T={dndMapWidget:q},j={name:"dnd-mapping",functions:{dndMapWidget:{path:"dnd-mapping.ts:widget",codeWidget:"dndmap"}},assets:{}},V={manifest:j,functionMapping:T};U(T,j,self.postMessage);export{V as plug};

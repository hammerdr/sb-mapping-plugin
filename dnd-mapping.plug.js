var T=Object.defineProperty;var U=(e,r)=>{for(var o in r)T(e,o,{get:r[o],enumerable:!0})};function M(e){let r=atob(e),o=r.length,n=new Uint8Array(o);for(let a=0;a<o;a++)n[a]=r.charCodeAt(a);return n}function h(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",o=e.byteLength;for(let n=0;n<o;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var y=e=>{throw new Error("Not initialized yet")},w=typeof window>"u"&&typeof globalThis.WebSocketPair>"u";typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var v=new Map,b=0;w&&(globalThis.syscall=async(e,...r)=>await new Promise((o,n)=>{b++,v.set(b,{resolve:o,reject:n}),y({type:"sys",id:b,name:e,args:r})}));function k(e,r,o){w&&(y=o,self.addEventListener("message",n=>{(async()=>{let a=n.data;switch(a.type){case"inv":{let u=e[a.name];if(!u)throw new Error(`Function not loaded: ${a.name}`);try{let l=await Promise.resolve(u(...a.args||[]));y({type:"invr",id:a.id,result:l})}catch(l){console.error("An exception was thrown as a result of invoking function",a.name,"error:",l.message),y({type:"invr",id:a.id,error:l.message})}}break;case"sysr":{let u=a.id,l=v.get(u);if(!l)throw Error("Invalid request id");v.delete(u),a.error?l.reject(new Error(a.error)):l.resolve(a.result)}break}})().catch(console.error)}),y({type:"manifest",manifest:r}))}async function $(e,r){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?h(o):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function R(){globalThis.fetch=async function(e,r){let o=r&&r.body?h(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await $(e,r&&{method:r.method,headers:r.headers,base64Body:o});return new Response(n.base64Body?M(n.base64Body):null,{status:n.status,headers:n.headers})}}w&&R();var P={};U(P,{alert:()=>he,configureVimMode:()=>Re,confirm:()=>Pe,copyToClipboard:()=>Fe,deleteLine:()=>Ee,dispatch:()=>ye,downloadFile:()=>ne,filterBox:()=>ae,flashNotification:()=>se,fold:()=>we,foldAll:()=>ke,getCurrentEditor:()=>j,getCurrentPage:()=>O,getCurrentPageMeta:()=>q,getCurrentPath:()=>K,getCursor:()=>Q,getRecentlyOpenedPages:()=>I,getSelection:()=>V,getText:()=>B,getUiOption:()=>be,goHistory:()=>oe,hidePanel:()=>le,insertAtCursor:()=>ge,insertAtPos:()=>ue,invokeCommand:()=>N,moveCursor:()=>pe,moveCursorToLine:()=>fe,moveLineDown:()=>Ue,moveLineUp:()=>Te,navigate:()=>z,newWindow:()=>re,openCommandPalette:()=>G,openPageNavigator:()=>Y,openSearchPanel:()=>Se,openUrl:()=>te,prompt:()=>xe,rebuildEditorState:()=>Z,redo:()=>Le,reloadConfigAndCommands:()=>ee,reloadPage:()=>X,reloadUI:()=>J,replaceRange:()=>me,save:()=>H,sendMessage:()=>Oe,setSelection:()=>_,setText:()=>W,setUiOption:()=>ve,showPanel:()=>ce,showProgress:()=>de,toggleFold:()=>Me,undo:()=>De,unfold:()=>Ce,unfoldAll:()=>Ae,uploadFile:()=>ie,vimEx:()=>$e});typeof self>"u"&&(self={syscall:()=>{throw new Error("Not implemented here")}});function t(e,...r){return globalThis.syscall(e,...r)}function O(){return t("editor.getCurrentPage")}function q(){return t("editor.getCurrentPageMeta")}function K(e=!1){return t("editor.getCurrentPath",e)}function I(){return t("editor.getRecentlyOpenedPages")}function j(){return t("editor.getCurrentEditor")}function B(){return t("editor.getText")}function W(e,r=!1){return t("editor.setText",e,r)}function Q(){return t("editor.getCursor")}function V(){return t("editor.getSelection")}function _(e,r){return t("editor.setSelection",e,r)}function N(e,r){return t("editor.invokeCommand",e,r)}function H(){return t("editor.save")}function z(e,r=!1,o=!1){return t("editor.navigate",e,r,o)}function Y(e="page"){return t("editor.openPageNavigator",e)}function G(){return t("editor.openCommandPalette")}function X(){return t("editor.reloadPage")}function J(){return t("editor.reloadUI")}function Z(){return t("editor.rebuildEditorState")}function ee(){return t("editor.reloadConfigAndCommands")}function te(e,r=!1){return t("editor.openUrl",e,r)}function re(){return t("editor.newWindow")}function oe(e){return t("editor.goHistory",e)}function ne(e,r){return t("editor.downloadFile",e,r)}function ie(e,r){return t("editor.uploadFile",e,r)}function se(e,r="info"){return t("editor.flashNotification",e,r)}function ae(e,r,o="",n=""){return t("editor.filterBox",e,r,o,n)}function ce(e,r,o,n=""){return t("editor.showPanel",e,r,o,n)}function le(e){return t("editor.hidePanel",e)}function de(e,r){return t("editor.showProgress",e,r)}function ue(e,r){return t("editor.insertAtPos",e,r)}function me(e,r,o){return t("editor.replaceRange",e,r,o)}function pe(e,r=!1){return t("editor.moveCursor",e,r)}function fe(e,r=1,o=!1){return t("editor.moveCursorToLine",e,r,o)}function ge(e,r=!1,o=!1){return t("editor.insertAtCursor",e,r,o)}function ye(e){return t("editor.dispatch",e)}function xe(e,r=""){return t("editor.prompt",e,r)}function Pe(e){return t("editor.confirm",e)}function he(e){return t("editor.alert",e)}function be(e){return t("editor.getUiOption",e)}function ve(e,r){return t("editor.setUiOption",e,r)}function we(){return t("editor.fold")}function Ce(){return t("editor.unfold")}function Me(){return t("editor.toggleFold")}function ke(){return t("editor.foldAll")}function Ae(){return t("editor.unfoldAll")}function De(){return t("editor.undo")}function Le(){return t("editor.redo")}function Se(){return t("editor.openSearchPanel")}function Fe(e){return t("editor.copyToClipboard",e)}function Ee(){return t("editor.deleteLine")}function Te(){return t("editor.moveLineUp")}function Ue(){return t("editor.moveLineDown")}function $e(e){return t("editor.vimEx",e)}function Re(){return t("editor.configureVimMode")}function Oe(e,r){return t("editor.sendMessage",e,r)}async function A(){await P.flashNotification("D&D Mapping Plugin is working!")}async function D(e){console.log("D&D Map widget called!"),console.log("bodyText:",e);let r=e.trim().split(`
`).map(i=>i.trim()).filter(i=>i&&!i.startsWith("%%")),o=[],n=[];for(let i of r){if(i.startsWith("graph ")||i.startsWith("flowchart "))continue;let c=i.match(/(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*-->?\s*|\s*---?\s*)(\w+)(\[.*?\])?(\s*:::(\w+))?(\s*:\s*(.+))?/);if(c){let[,s,m,,f,et,g,C,,F,,E]=c;if(!o.find(p=>p.id===s)){let p=m&&m.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||s;o.push({id:s,label:p,type:f})}if(!o.find(p=>p.id===g)){let p=C&&C.match(/[\[\(\{](.*)[\]\)\}]/)?.[1]||g;o.push({id:g,label:p,type:F})}n.push({from:s,to:g,label:E?.trim()})}}let a=400,u=300,l=150,x=new Map;o.forEach((i,c)=>{let s=c/o.length*2*Math.PI;x.set(i.id,{x:a+Math.cos(s)*l,y:u+Math.sin(s)*l})});let d='<svg viewBox="0 0 800 600" style="width: 100%; height: 400px; border: 1px solid #ccc;">';return n.forEach(i=>{let c=x.get(i.from),s=x.get(i.to);if(c&&s&&(d+=`<line x1="${c.x}" y1="${c.y}" x2="${s.x}" y2="${s.y}" stroke="#666" stroke-width="2"/>`,i.label)){let m=(c.x+s.x)/2,f=(c.y+s.y)/2;d+=`<rect x="${m-i.label.length*3}" y="${f-7}" width="${i.label.length*6}" height="14" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.2)" stroke-width="1" rx="2" style="pointer-events: none;"/>`,d+=`<text x="${m}" y="${f}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#333" font-weight="500">${i.label}</text>`}}),o.forEach((i,c)=>{let s=x.get(i.id);if(s){let m=Ze(i.type),f=`node-${c}`;d+=`<circle id="${f}" cx="${s.x}" cy="${s.y}" r="25" fill="${m}" stroke="#333" stroke-width="2" style="cursor: pointer;" data-location-id="${i.id}"/>`,d+=`<rect x="${s.x-i.label.length*4}" y="${s.y-8}" width="${i.label.length*8}" height="16" fill="rgba(255,255,255,0.8)" stroke="rgba(0,0,0,0.2)" stroke-width="1" rx="3" style="pointer-events: none;"/>`,d+=`<text x="${s.x}" y="${s.y}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#333" font-weight="bold" style="pointer-events: none;">${i.label}</text>`}}),d+="</svg>",{html:`
      <div style="border: 1px solid var(--ui-border-color, #ccc); border-radius: 8px; padding: 15px; margin: 10px 0; background: var(--ui-background-color, #fff);">
        <h3 style="margin: 0 0 15px 0; color: var(--ui-text-color, #333);">\u{1F5FA}\uFE0F D&D Interactive Map</h3>
        ${d}
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

        console.log("D&D Map widget loaded successfully!");
      })();
    `}}function Ze(e){return{tavern:"#ffd700",dungeon:"#8b0000",city:"#4682b4",castle:"#9370db",forest:"#228b22",shop:"#ff8c00",important:"#e74c3c"}[e||""]||"#f8f9fa"}var L={testCommand:A,dndMapWidget:D},S={name:"dnd-mapping",functions:{testCommand:{path:"dnd-mapping.ts:testCommand",command:{name:"Test D&D Plugin"}},dndMapWidget:{path:"dnd-mapping.ts:widget",codeWidget:"dndmap"}},assets:{}},Ut={manifest:S,functionMapping:L};k(L,S,self.postMessage);export{Ut as plug};

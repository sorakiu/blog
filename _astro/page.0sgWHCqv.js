const w="modulepreload",E=function(t){return"/"+t},p={},A=function(o,r,e){let m=Promise.resolve();if(r&&r.length>0){let a=function(i){return Promise.all(i.map(c=>Promise.resolve(c).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),f=n?.nonce||n?.getAttribute("nonce");m=a(r.map(i=>{if(i=E(i),i in p)return;p[i]=!0;const c=i.endsWith(".css"),l=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${l}`))return;const d=document.createElement("link");if(d.rel=c?"stylesheet":w,c||(d.as="script"),d.crossOrigin="",d.href=i,f&&d.setAttribute("nonce",f),document.head.appendChild(d),c)return new Promise((k,v)=>{d.addEventListener("load",k),d.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${i}`)))})}))}function s(a){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=a,window.dispatchEvent(n),!n.defaultPrevented)throw a}return m.then(a=>{for(const n of a||[])n.status==="rejected"&&s(n.reason);return o().catch(s)})},b=()=>document.querySelectorAll("pre.mermaid").length>0;let u=null;async function P(){return u||(console.log("[astro-mermaid] Loading mermaid.js..."),u=A(()=>import("./mermaid.core.Qfbn00bC.js").then(t=>t.bE),[]).then(async({default:t})=>{const o=[];if(o&&o.length>0){console.log("[astro-mermaid] Registering",o.length,"icon packs");const r=o.map(e=>({name:e.name,loader:new Function("return "+e.loader)()}));await t.registerIconPacks(r)}return t}).catch(t=>{throw console.error("[astro-mermaid] Failed to load mermaid:",t),u=null,t}),u)}const g={startOnLoad:!1,theme:"default"},S={light:"default",dark:"dark"};async function h(){console.log("[astro-mermaid] Initializing mermaid diagrams...");const t=document.querySelectorAll("pre.mermaid");if(console.log("[astro-mermaid] Found",t.length,"mermaid diagrams"),t.length===0)return;const o=await P();let r=g.theme;{const e=document.documentElement.getAttribute("data-theme"),m=document.body.getAttribute("data-theme");r=S[e||m]||g.theme,console.log("[astro-mermaid] Using theme:",r,"from",e?"html":"body")}o.initialize({...g,theme:r,gitGraph:{mainBranchName:"main",showCommitLabel:!0,showBranches:!0,rotateCommitLabel:!0}});for(const e of t){if(e.hasAttribute("data-processed"))continue;e.hasAttribute("data-diagram")||e.setAttribute("data-diagram",e.textContent||"");const m=e.getAttribute("data-diagram")||"",s="mermaid-"+Math.random().toString(36).slice(2,11);console.log("[astro-mermaid] Rendering diagram:",s);try{const a=document.getElementById(s);a&&a.remove();const{svg:n}=await o.render(s,m);e.innerHTML=n,e.setAttribute("data-processed","true"),console.log("[astro-mermaid] Successfully rendered diagram:",s)}catch(a){console.error("[astro-mermaid] Mermaid rendering error for diagram:",s,a),e.innerHTML=`<div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;">
        <strong>Error rendering diagram:</strong><br/>
        ${a.message||"Unknown error"}
      </div>`,e.setAttribute("data-processed","true")}}}b()?(console.log("[astro-mermaid] Mermaid diagrams detected on initial load"),h()):console.log("[astro-mermaid] No mermaid diagrams found on initial load");{const t=new MutationObserver(o=>{for(const r of o)r.type==="attributes"&&r.attributeName==="data-theme"&&(document.querySelectorAll("pre.mermaid[data-processed]").forEach(e=>{e.removeAttribute("data-processed")}),h())});t.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),t.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]})}document.addEventListener("astro:after-swap",()=>{console.log("[astro-mermaid] View transition detected"),b()&&h()});const y=document.createElement("style");y.textContent=`
            /* Prevent layout shifts by setting minimum height */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
              min-height: 200px; /* Prevent layout shift */
              position: relative;
            }
            
            /* Loading state with skeleton loader */
            pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
            
            /* Dark mode skeleton loader */
            [data-theme="dark"] pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            /* Show processed diagrams with smooth transition */
            pre.mermaid[data-processed] {
              animation: none;
              background: transparent;
              min-height: auto; /* Allow natural height after render */
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid[data-processed] {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid[data-processed] {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            /* Respect user's color scheme preference */
            [data-theme="dark"] pre.mermaid[data-processed] {
              background-color: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
            }
            
            [data-theme="light"] pre.mermaid[data-processed] {
              background-color: rgba(0, 0, 0, 0.02);
              border-radius: 0.5rem;
            }
          `;document.head.appendChild(y);export{A as _};

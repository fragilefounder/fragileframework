(() => {
'use strict';
const search=document.getElementById('dictionary-search');
const status=document.getElementById('dictionary-status');
const cards=[...document.querySelectorAll('.dict-entry')];
const empty=document.getElementById('dictionary-empty');
let category='All terms'; let letter='ALL';
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
function update(){
  const q=normalize(search.value.trim());let count=0;
  for(const card of cards){const ok=(!q||normalize(card.dataset.search).includes(q))&&(category==='All terms'||card.dataset.category===category)&&(letter==='ALL'||card.dataset.letter===letter);card.hidden=!ok;if(ok)count++;}
  status.textContent=count===100?'Showing all 100 terms.':`Showing ${count} of 100 terms.`;
  empty.hidden=count!==0;
}
function select(group,btn,field){group.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===btn)));if(field==='category')category=btn.dataset.category;else letter=btn.dataset.letter;update();}
search.addEventListener('input',update);
const cats=document.querySelector('.dict-categories');const alphabet=document.querySelector('.dict-alphabet');
cats.addEventListener('click',e=>{const btn=e.target.closest('button[data-category]');if(btn)select(cats,btn,'category');});
alphabet.addEventListener('click',e=>{const btn=e.target.closest('button[data-letter]');if(btn&&!btn.disabled)select(alphabet,btn,'letter');});
document.getElementById('dictionary-reset').addEventListener('click',()=>{search.value='';select(cats,cats.querySelector('[data-category="All terms"]'),'category');select(alphabet,alphabet.querySelector('[data-letter="ALL"]'),'letter');search.focus();});
async function copy(text,btn){let success=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);success=true;}else{const node=document.createElement('textarea');node.value=text;node.style.position='fixed';node.style.opacity='0';document.body.append(node);node.select();success=document.execCommand('copy');node.remove();}}catch(e){success=false;}
 if(success){const before=btn.textContent;btn.textContent='Copied ✓';setTimeout(()=>{btn.textContent=before;},1900);}else{window.prompt('Copy manually:',text);}}
document.getElementById('dictionary-list').addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;if(btn.dataset.copy)copy(btn.dataset.copy,btn);if(btn.dataset.share)copy(`${location.origin}${location.pathname}#${btn.dataset.share}`,btn);});
// Direct hash links always reveal the requested entry even if filters were changed.
function revealHash(){const slug=decodeURIComponent(location.hash.slice(1));if(!slug)return;const match=document.getElementById(slug);if(match&&match.classList.contains('dict-entry')){search.value='';select(cats,cats.querySelector('[data-category="All terms"]'),'category');select(alphabet,alphabet.querySelector('[data-letter="ALL"]'),'letter');match.scrollIntoView({block:'start'});}}
window.addEventListener('hashchange',revealHash);if(location.hash)requestAnimationFrame(revealHash);
})();

(function(){
  'use strict';
  const data=window.AUTOBRO_VEHICLE_INDEX;
  const $=id=>document.getElementById(id);
  const els={
    query:$('query'),make:$('makeFilter'),year:$('yearFilter'),filters:$('modelFilters'),results:$('results'),count:$('resultCount'),title:$('resultTitle'),
    clear:$('clearFilters'),connection:$('connectionStatus'),range:$('rangeLabel'),pageLabel:$('pageLabel'),pageSize:$('pageSize'),
    prev:$('prevPage'),next:$('nextPage'),prevBottom:$('prevPageBottom'),nextBottom:$('nextPageBottom')
  };
  const state={tab:'models',page:1,pageSize:40,query:'',make:'',year:''};
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const normalize=value=>String(value??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9\u0590-\u05ff]+/g,' ').trim();
  const format=value=>new Intl.NumberFormat('he-IL').format(value||0);

  if(!data){
    els.results.innerHTML='<div class="empty">המאגר לא נטען. נסה לרענן את הדף.</div>';
    els.connection.classList.add('error');els.connection.querySelector('span').textContent='החיבור למאגר נכשל';return;
  }

  const catalog=data.catalogModels||[];
  const generated=new Date(data.generatedAt);
  const generatedText=Number.isNaN(generated.getTime())?'עכשיו':generated.toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'numeric'});
  els.connection.querySelector('span').textContent=`מחובר · עודכן ${generatedText}`;
  $('modelStat').textContent=format(catalog.length+(data.counts.israelModels||0));
  $('makeStat').textContent=format(data.counts.makes);$('canStat').textContent=format(data.counts.canDefinitions);$('israelLink').href=data.israel.homepage;
  els.make.insertAdjacentHTML('beforeend',data.makes.map(make=>`<option value="${escapeHtml(make.name)}">${escapeHtml(make.name)}</option>`).join(''));
  const years=[...new Set(data.models.map(model=>model.year))].sort((a,b)=>b-a);
  els.year.insertAdjacentHTML('beforeend',years.map(year=>`<option value="${year}">${year}</option>`).join(''));

  function matches(text){const words=normalize(state.query).split(' ').filter(Boolean),haystack=normalize(text);return words.every(word=>haystack.includes(word))}
  function modelResults(){
    const year=Number(state.year);
    return catalog.filter(model=>(!state.make||model.make===state.make)&&(!state.year||(model.firstYear<=year&&model.lastYear>=year))&&matches(`${model.make} ${model.model} ${model.firstYear} ${model.lastYear}`));
  }
  function israelResults(){return data.israel.models.filter(model=>matches(`${model.year} ${model.make} ${model.model} ${model.fuel}`))}
  function canResults(){return data.canDefinitions.filter(item=>matches(`${item.name} ${item.path}`))}
  function sourceResults(){return data.sources.filter(item=>matches(`${item.name} ${item.license} ${item.purpose||''}`))}
  function yearRange(model){return model.firstYear===model.lastYear?String(model.firstYear):`${model.firstYear}–${model.lastYear}`}
  function currentList(){if(state.tab==='models')return modelResults();if(state.tab==='israel')return israelResults();if(state.tab==='can')return canResults();return sourceResults()}
  function rowHtml(item){
    if(state.tab==='models')return `<article class="result-row"><span class="year">${escapeHtml(yearRange(item))}</span><strong>${escapeHtml(item.make)}</strong><small>${escapeHtml(item.model)}</small></article>`;
    if(state.tab==='israel')return `<article class="result-row"><span class="year">${item.year}</span><strong>${escapeHtml(item.make)}</strong><small>${escapeHtml(item.model)} · ${escapeHtml(item.fuel)}</small></article>`;
    if(state.tab==='can')return `<article class="result-row can-row"><strong>${escapeHtml(item.name)}</strong><small>${format(Math.round(item.size/1024))}KB</small><a href="${escapeHtml(item.rawUrl)}" target="_blank" rel="noopener">פתח מקור ↗</a></article>`;
    return `<article class="result-row source-row"><strong>${escapeHtml(item.name)}</strong><span class="license">${escapeHtml(item.license)}</span><a href="${escapeHtml(item.homepage)}" target="_blank" rel="noopener">למקור ↗</a></article>`;
  }
  function updatePager(total){
    const pages=Math.max(1,Math.ceil(total/state.pageSize));state.page=Math.min(state.page,pages);
    const start=total?(state.page-1)*state.pageSize+1:0,end=Math.min(state.page*state.pageSize,total);
    els.range.textContent=`מציג ${format(start)}–${format(end)} מתוך ${format(total)}`;els.pageLabel.textContent=`${format(state.page)} / ${format(pages)}`;
    const atStart=state.page<=1,atEnd=state.page>=pages;[els.prev,els.prevBottom].forEach(button=>button.disabled=atStart);[els.next,els.nextBottom].forEach(button=>button.disabled=atEnd);
  }
  function render(){
    const list=currentList(),titles={models:'כל הדגמים במאגר',israel:'דגמים פעילים בישראל · מידע רשמי',can:'הגדרות CAN פתוחות',sources:'מקורות מאומתים'};
    els.filters.hidden=state.tab!=='models';els.title.textContent=titles[state.tab];els.count.textContent=`${format(list.length)} תוצאות`;updatePager(list.length);
    const start=(state.page-1)*state.pageSize,pageItems=list.slice(start,start+state.pageSize);
    els.results.innerHTML=pageItems.length?pageItems.map(rowHtml).join(''):'<div class="empty">לא נמצאו תוצאות. נסה שם יצרן, דגם או מונח אחר.</div>';
  }
  function resetAndRender(){state.page=1;render()}
  function changePage(delta){
    const pages=Math.max(1,Math.ceil(currentList().length/state.pageSize)),next=Math.max(1,Math.min(state.page+delta,pages));if(next===state.page)return;
    state.page=next;render();document.querySelector('.result-head').scrollIntoView({behavior:'smooth',block:'start'});
  }
  let searchTimer;
  els.query.addEventListener('input',event=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.query=event.target.value;resetAndRender()},90)});
  els.make.addEventListener('change',event=>{state.make=event.target.value;resetAndRender()});
  els.year.addEventListener('change',event=>{state.year=event.target.value;resetAndRender()});
  els.pageSize.addEventListener('change',event=>{state.pageSize=Number(event.target.value)||40;resetAndRender()});
  els.clear.addEventListener('click',()=>{state.make='';state.year='';state.query='';els.make.value='';els.year.value='';els.query.value='';resetAndRender()});
  els.prev.addEventListener('click',()=>changePage(-1));els.prevBottom.addEventListener('click',()=>changePage(-1));els.next.addEventListener('click',()=>changePage(1));els.nextBottom.addEventListener('click',()=>changePage(1));
  document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{
    clearTimeout(searchTimer);state.query=els.query.value;
    document.querySelectorAll('.tab').forEach(tab=>{tab.classList.remove('active');tab.setAttribute('aria-selected','false')});button.classList.add('active');button.setAttribute('aria-selected','true');state.tab=button.dataset.tab;resetAndRender();
  }));
  render();
})();

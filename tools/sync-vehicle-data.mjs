import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=path.join(root,'data');
const cacheDir=path.join(dataDir,'.cache');
const sourceFile=path.join(root,'vehicle-data-sources.json');
const outputFile=path.join(dataDir,'vehicle-index.json');
const outputScript=path.join(dataDir,'vehicle-index.js');
const args=new Set(process.argv.slice(2));
const offline=args.has('--offline');
const refresh=args.has('--refresh');
const maxAgeMs=24*60*60*1000;

await mkdir(cacheDir,{recursive:true});
const config=JSON.parse(await readFile(sourceFile,'utf8'));

function clean(value){return String(value??'').replace(/\s+/g,' ').trim()}
function key(value){return clean(value).toLocaleUpperCase('en-US')}
function cachePath(id){return path.join(cacheDir,`${id}.json`)}

async function readCache(id){
  try{return JSON.parse(await readFile(cachePath(id),'utf8'))}catch{return null}
}

async function fetchJson(source,url=source.url){
  const cached=await readCache(source.id);
  if(offline){
    if(!cached)throw new Error(`No cached data for ${source.id}`);
    return cached.data;
  }
  if(!refresh&&cached&&Date.now()-new Date(cached.fetchedAt).getTime()<maxAgeMs)return cached.data;
  const headers={'Accept':'application/vnd.github+json','User-Agent':'AutoBro-vehicle-data-sync'};
  if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  if(cached?.etag)headers['If-None-Match']=cached.etag;
  let lastError;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const response=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
      if(response.status===304&&cached)return cached.data;
      if(!response.ok)throw new Error(`${source.id}: HTTP ${response.status}`);
      const data=await response.json();
      await writeFile(cachePath(source.id),JSON.stringify({fetchedAt:new Date().toISOString(),etag:response.headers.get('etag'),data}));
      return data;
    }catch(error){lastError=error;if(attempt<3)await new Promise(resolve=>setTimeout(resolve,attempt*800))}
  }
  if(cached){console.warn(`${source.id}: using stale cache (${lastError.message})`);return cached.data}
  throw lastError;
}

async function githubRepo(source){
  const meta=await fetchJson({...source,id:`${source.id}-repo`},`https://api.github.com/repos/${source.repo}`);
  return {meta,tree:source.kind==='github-tree'?await fetchJson({...source,id:`${source.id}-tree`},`https://api.github.com/repos/${source.repo}/git/trees/${meta.default_branch}?recursive=1`):null};
}

const byId=Object.fromEntries(config.sources.map(source=>[source.id,source]));
const rawModels=await fetchJson(byId['global-models']);
const vpic=await fetchJson(byId['nhtsa-vpic']);
const openDbc=await githubRepo(byId.opendbc);
const awesome=await githubRepo(byId['awesome-automotive']);
const israel=await fetchJson(byId['israel-active-vehicles']);
const israelParams=new URLSearchParams({
  resource_id:byId['israel-active-vehicles'].resourceId,
  limit:'5000',fields:'tozeret_nm,kinuy_mishari,shnat_yitzur,sug_delek_nm',sort:'shnat_yitzur desc'
});
const israelCurrent=await fetchJson({...byId['israel-active-vehicles'],id:'israel-current-models'},`https://data.gov.il/api/3/action/datastore_search?${israelParams}`);

const modelMap=new Map();
for(const row of rawModels){
  const year=Number(row.year),make=clean(row.make),model=clean(row.model);
  if(!Number.isInteger(year)||year<1886||year>new Date().getFullYear()+2||!make||!model)continue;
  modelMap.set(`${year}|${key(make)}|${key(model)}`,{year,make,model});
}
const models=[...modelMap.values()].sort((a,b)=>b.year-a.year||a.make.localeCompare(b.make)||a.model.localeCompare(b.model));

const vpicMakes=new Map((vpic.Results||[]).map(item=>[key(item.Make_Name),{id:item.Make_ID,name:clean(item.Make_Name)}]));
const makeStats=new Map();
for(const model of models){
  const id=key(model.make),current=makeStats.get(id)||{name:model.make,models:new Set(),firstYear:model.year,lastYear:model.year};
  current.models.add(model.model);current.firstYear=Math.min(current.firstYear,model.year);current.lastYear=Math.max(current.lastYear,model.year);makeStats.set(id,current);
}
const makes=[...makeStats.entries()].map(([id,item])=>({
  name:item.name,modelCount:item.models.size,firstYear:item.firstYear,lastYear:item.lastYear,vpicId:vpicMakes.get(id)?.id||null
})).sort((a,b)=>a.name.localeCompare(b.name));

const catalogMap=new Map();
for(const model of models){
  const id=`${key(model.make)}|${key(model.model)}`,current=catalogMap.get(id)||{make:model.make,model:model.model,firstYear:model.year,lastYear:model.year};
  current.firstYear=Math.min(current.firstYear,model.year);current.lastYear=Math.max(current.lastYear,model.year);catalogMap.set(id,current);
}
const catalogModels=[...catalogMap.values()].sort((a,b)=>a.make.localeCompare(b.make)||a.model.localeCompare(b.model));

const israelModelMap=new Map();
for(const row of israelCurrent.result?.records||[]){
  const year=Number(row.shnat_yitzur),make=clean(row.tozeret_nm),model=clean(row.kinuy_mishari),fuel=clean(row.sug_delek_nm);
  if(!Number.isInteger(year)||!make||!model)continue;
  israelModelMap.set(`${year}|${key(make)}|${key(model)}|${key(fuel)}`,{year,make,model,fuel});
}
const israelModels=[...israelModelMap.values()].sort((a,b)=>b.year-a.year||a.make.localeCompare(b.make)||a.model.localeCompare(b.model));

const dbcFiles=(openDbc.tree?.tree||[]).filter(item=>item.type==='blob'&&item.path.startsWith('opendbc/dbc/')&&item.path.endsWith('.dbc')).map(item=>({
  name:path.basename(item.path,'.dbc').replace(/^_+/,'').replaceAll('_',' '),path:item.path,size:item.size||0,
  rawUrl:`https://raw.githubusercontent.com/${byId.opendbc.repo}/${openDbc.meta.default_branch}/${item.path}`
})).sort((a,b)=>a.name.localeCompare(b.name));

const israelResources=(israel.result?.resources||[]).filter(resource=>resource.datastore_active).map(resource=>({
  id:resource.id,name:resource.name,format:resource.format,lastModified:resource.last_modified,
  api:`https://data.gov.il/api/3/action/datastore_search?resource_id=${resource.id}`
}));

const sourceStatus=[
  {...byId['global-models'],records:models.length},
  {...byId['nhtsa-vpic'],records:vpic.Results?.length||0},
  {...byId.opendbc,records:dbcFiles.length,updatedAt:openDbc.meta.updated_at},
  {...byId['awesome-automotive'],records:awesome.meta.size,updatedAt:awesome.meta.updated_at},
  {...byId['israel-active-vehicles'],records:israelResources.length,updatedAt:israel.result?.metadata_modified}
].map(({kind,url,repo,purpose,...source})=>source);

const output={
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  counts:{makes:makes.length,models:models.length,catalogModels:catalogModels.length,israelModels:israelModels.length,canDefinitions:dbcFiles.length,sources:sourceStatus.length},
  sources:sourceStatus,
  makes,
  catalogModels,
  models,
  canDefinitions:dbcFiles,
  israel:{
    title:israel.result?.title||byId['israel-active-vehicles'].name,
    notes:israel.result?.notes||'',license:israel.result?.license_title||byId['israel-active-vehicles'].license,
    homepage:byId['israel-active-vehicles'].homepage,resources:israelResources,models:israelModels,
    sampleNote:'Compact catalog of distinct current models from the newest 5,000 official records, sorted by production year.',
    privacyNote:'The compact site index does not copy registration numbers, chassis numbers or individual vehicle records.'
  }
};

const serialized=JSON.stringify(output);
await writeFile(outputFile,serialized,'utf8');
await writeFile(outputScript,`window.AUTOBRO_VEHICLE_INDEX=${serialized};\n`,'utf8');
console.log(JSON.stringify({output:outputFile,browserScript:outputScript,...output.counts,bytes:Buffer.byteLength(serialized)},null,2));

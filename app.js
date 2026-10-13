/* All rendering, media and encoding stay on this device. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const effects = ['星点漂浮','文字落雨','横波排列','隧道透视','环形旋转','重力文字','矢量文字','追踪 HUD','弹性拉伸','故障错位','液态波纹','卡片翻转','打字机','运动残影','呼吸缩放'];
const defaultFonts = ['Arial','Georgia','Courier New','Microsoft YaHei','SimSun','KaiTi','Segoe UI'];
let fonts = [...defaultFonts], copyIndex = 0, time = 0, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let busy = false, cancelled = false, loadingMedia = false, openingProject = false, media = null, mediaUrl = null, mediaData = null, mediaName = '', last = performance.now();
const video = $('background-video'), preview = $('preview'), ctx = preview.getContext('2d');
const defaults = () => ({text:'MOOD IS THE MESSAGE 🫧',effect:2,font:'Georgia',weight:400,size:52,speed:1,density:.55,color:'#fff8e8',background:'#ce5e20',seed:20260702,coordinates:true,date:true,hud:true,topLeft:'31.224361° N',topRight:'121.469170° E',bottomLeft:'Happy,\nFriday:)',bottomRight:new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})+'\n'+new Date().toLocaleTimeString('en-GB'),duration:5,fps:30,resolution:1080,format:'mp4'});
let state = defaults();
const bindings = {'text':'text','effect':'effect','font':'font','weight':'weight','size':'size','speed':'speed','density':'density','color':'color','background':'background','coordinates':'coordinates','date':'date','hud':'hud','top-left':'topLeft','top-right':'topRight','bottom-left':'bottomLeft','bottom-right':'bottomRight','duration':'duration','fps':'fps','resolution':'resolution','format':'format'};
const numbers = new Set(['effect','weight','size','speed','density','duration','fps','resolution']);
const wrap = value => ((value % 1) + 1) % 1;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function status(message) { $('status').textContent = message; }
function choices(select, entries) { select.replaceChildren(...entries.map(([value,name]) => { const option = document.createElement('option'); option.value=value; option.textContent=name; return option; })); }
choices($('effect'),effects.map((name,index) => [index,name]));
function fontChoices(){choices($('font'),fonts.map(name => [name,({Arial:'Arial / 黑体',Georgia:'Georgia / 衬线', 'Courier New':'Courier New / 等宽','Microsoft YaHei':'微软雅黑',SimSun:'宋体',KaiTi:'楷体','Segoe UI':'Segoe UI'})[name] || name]));}
fontChoices();
function synchronize(){
  for(const [id,key] of Object.entries(bindings)){ const input=$(id); if(input.type==='checkbox') input.checked=state[key]; else input.value=state[key]; }
  updateInfo(); render(ctx,state,time,media);
}
function updateInfo(){
  $('size-value').textContent=state.size; $('speed-value').textContent=state.speed.toFixed(1)+'×'; $('density-value').textContent=Math.round(state.density*100)+'%';
  $('timeline').max=state.duration; $('timeline').value=time;
  $('canvas-info').textContent=`${state.resolution} × ${state.resolution*4/3} · ${state.duration} 秒 · ${state.fps} fps`;
  $('play').textContent=playing?'暂停':'播放';
}
for(const [id,key] of Object.entries(bindings)) $(id).addEventListener('input',() => {
  const input=$(id); let value=input.type==='checkbox'?input.checked:numbers.has(key)?Number(input.value):input.value;
  if(key==='duration'){ if(!Number.isFinite(value)) value=5; value=Math.max(1,Math.min(10,value)); input.value=value; time=Math.min(time,value); }
  state[key]=value; updateInfo(); render(ctx,state,time,media);
});
function random(seed){let value=seed>>>0; return () => { value+=0x6D2B79F5; let n=value; n=Math.imul(n^(n>>>15),n|1); n^=n+Math.imul(n^(n>>>7),n|61); return ((n^(n>>>14))>>>0)/4294967296; };}
function glyphs(s,seconds){
  const chars=(typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(s.text)].map(x=>x.segment):Array.from(s.text)).filter(c=>c.trim());
  if(!chars.length)return [];
  const count=Math.max(12,Math.min(96,Math.floor(18+s.density*70))), phase=wrap(seconds*Math.max(.05,s.speed)/s.duration), rand=random(s.seed), offset=rand(), result=[];
  for(let i=0;i<count;i++){
    const t=i/Math.max(1,count-1),jx=rand(),jy=rand(); let rotation=(rand()-.5)*40,x,y,scale=1,opacity=.92;
    switch(s.effect){
      case 0:x=jx;y=wrap(jy-phase*(.15+i%5*.025));scale=.5+rand();break;
      case 1:x=(i+.5)/count;y=wrap(jy+phase*(.7+i%4*.12));rotation*=.2;break;
      case 2:x=t;y=.5+Math.sin((t*3+phase*2+offset)*Math.PI*2)*.22;rotation=Math.cos((t*3+phase*2)*Math.PI*2)*22;break;
      case 3:{const a=t*Math.PI*8+phase*Math.PI*2,r=.05+t*.65;x=.5+Math.cos(a)*r;y=.5+Math.sin(a)*r*.75;scale=.25+t*2;rotation=a*180/Math.PI+90;break;}
      case 4:{const a=t*Math.PI*2+phase*Math.PI*2;x=.5+Math.cos(a)*.32;y=.5+Math.sin(a)*.24;rotation=a*180/Math.PI+90;break;}
      case 5:x=jx;y=1-(1-wrap(jy+phase*(.35+jx*.45)))**2;rotation+=phase*120;break;
      case 6:x=.08+t*.84;y=.12+t*.76+Math.sin(t*12+phase*8)*.06;rotation=-22+Math.sin(t*8)*25;break;
      case 7:{const rows=Math.ceil(count/5);x=.08+i%5*.21+(jx-.5)*.04;y=.1+Math.floor(i/5)/Math.max(1,rows-1)*.8+Math.sin(phase*Math.PI*2+i)*.025;scale=.65+i%4*.25;opacity=.55+i%3*.2;break;}
      case 8:x=.08+t*.84;y=.5+Math.sin(t*Math.PI*4+phase*Math.PI*2)*.08;scale=.45+Math.abs(Math.sin(phase*Math.PI*2+t*5))*1.9;rotation=Math.sin(phase*Math.PI*2+t*4)*12;break;
      case 9:{const glitch=Math.sin(phase*Math.PI*30+i*17)>.82?1:0;x=.08+t*.84+glitch*(rand()-.5)*.22;y=.22+i%5*.14+glitch*(rand()-.5)*.08;rotation=glitch*(rand()-.5)*18;opacity=glitch?.62:1;break;}
      case 10:x=.06+t*.88+Math.sin(t*12+phase*8)*.035;y=.5+Math.sin(t*Math.PI*4+phase*Math.PI*2)*.28+Math.cos(t*19-phase*5)*.045;scale=1.05+Math.sin(t*9+phase*7)*.35;rotation=Math.cos(t*8+phase*6)*35;break;
      case 11:{const p=phase*Math.PI*2+t*Math.PI*3;x=.1+t*.8;y=.5+Math.sin(t*Math.PI*2)*.18;scale=Math.max(.12,Math.abs(Math.cos(p)))*1.45;rotation=Math.sin(p)*18;opacity=.45+Math.abs(Math.cos(p))*.55;break;}
      case 12:x=.08+i%12/11*.84;y=.23+Math.floor(i/12)*.12;opacity=i<=phase*(count+10)?1:.04;scale=i===Math.floor(phase*count)%count?1.5:1;rotation=0;break;
      case 13:{const trail=i%5,source=i/5/Math.max(1,count/5);x=.1+source*.8-trail*.018;y=.5+Math.sin(source*Math.PI*4+phase*6)*.2+trail*.014;opacity=1-trail*.18;scale=1.15-trail*.12;rotation=Math.cos(source*9+phase*5)*18;break;}
      case 14:{const p=.75+(Math.sin(phase*Math.PI*4-t*8)+1)*.55,a=t*Math.PI*2;x=.5+Math.cos(a)*.31*p;y=.5+Math.sin(a)*.23*p;scale=p;rotation=a*180/Math.PI+90;break;}
    }
    result.push({char:chars[i%chars.length],x,y,scale,rotation,opacity});
  }
  return result;
}
function render(context,s,seconds,background){
  const {width:w,height:h}=context.canvas, ratio=w/1080;
  context.save();context.clearRect(0,0,w,h);context.fillStyle=s.background;context.fillRect(0,0,w,h);
  if(background){const bw=background.videoWidth||background.naturalWidth,bh=background.videoHeight||background.naturalHeight;if(bw&&bh){const factor=Math.max(w/bw,h/bh);context.drawImage(background,(w-bw*factor)/2,(h-bh*factor)/2,bw*factor,bh*factor);}}
  context.fillStyle=s.color;context.textAlign='center';context.textBaseline='middle';
  for(const glyph of glyphs(s,seconds)){
    context.save();context.translate(glyph.x*w,glyph.y*h);context.rotate(glyph.rotation*Math.PI/180);context.globalAlpha=glyph.opacity;
    const size=Math.max(12*ratio,s.size*ratio*glyph.scale);context.font=`${s.weight} ${size}px "${s.font.replace(/["\\]/g,'')}", "Microsoft YaHei", sans-serif`;
    context.fillText(glyph.char,0,0);
    if(s.effect===7&&s.hud){context.globalAlpha=glyph.opacity*.4;context.strokeStyle=s.color;context.lineWidth=ratio;const half=size*.75;context.strokeRect(-half,-half,half*2,half*2);context.beginPath();context.moveTo(-half*1.3,0);context.lineTo(half*1.3,0);context.moveTo(0,-half*1.3);context.lineTo(0,half*1.3);context.stroke();}
    context.restore();
  }
  context.globalAlpha=1;context.fillStyle='#fff';context.textBaseline='top';const ix=w*12/432,iy=h*12/576;
  context.font=`700 ${w*11/432}px Arial, "Microsoft YaHei", sans-serif`;
  if(s.coordinates){context.textAlign='left';context.fillText(s.topLeft,ix,iy);context.textAlign='right';context.fillText(s.topRight,w-ix,iy);}
  const size=w*13/432;context.font=`700 ${size}px Arial, "Microsoft YaHei", sans-serif`;context.textBaseline='bottom';
  function footer(text,right){const lines=text.replace(/\r/g,'').split('\n');context.textAlign=right?'right':'left';lines.forEach((line,index)=>context.fillText(line,right?w-ix:ix,h-iy-(lines.length-1-index)*size*1.05));}
  footer(s.bottomLeft,false);if(s.date)footer(s.bottomRight,true);context.restore();
}
function frame(now){const delta=Math.min(.1,(now-last)/1000);last=now;if(playing&&!busy){time=(time+delta)%state.duration;if(media===video&&!video.seeking&&Number.isFinite(video.duration)&&Math.abs(video.currentTime-time%video.duration)>.1)video.currentTime=time%video.duration;}
  if(!busy){render(ctx,state,time,media);$('timeline').value=time;}requestAnimationFrame(frame);}
$('play').onclick=()=>{playing=!playing;updateInfo();};$('restart').onclick=()=>{time=0;playing=true;updateInfo();};
$('timeline').oninput=()=>{time=Number($('timeline').value);playing=false;updateInfo();if(media===video)video.currentTime=time%video.duration;render(ctx,state,time,media);};
function newSeed(){return crypto.getRandomValues(new Uint32Array(1))[0];}
$('random-text').onclick=()=>{state.text=['MAKE IT MOVE / MAKE IT YOURS','GOOD TASTE IS SUSPICIOUS 👀','TODAY FEELS LIKE A NEW FILE','MOOD IS THE MESSAGE 🫧'][copyIndex++%4];synchronize();};
$('random-style').onclick=()=>{state.effect=(state.effect+1+Math.floor(Math.random()*14))%15;const other=fonts.filter(name=>name!==state.font);state.font=other[Math.floor(Math.random()*other.length)];state.weight=[300,400,700].filter(x=>x!==state.weight)[Math.floor(Math.random()*2)];state.seed=newSeed();synchronize();};
$('system-fonts').onclick=async()=>{try{if(!window.queryLocalFonts)throw Error('当前浏览器不支持字体列表访问。已有字体选项仍可使用，更多字体请使用 Chrome / Edge。');const entries=await window.queryLocalFonts();fonts=[...new Set([...defaultFonts,...entries.map(x=>x.family)])];fontChoices();$('font').value=state.font;status(`已载入 ${fonts.length} 个电脑字体`);}catch(error){status(error.name==='NotAllowedError'?'未获得字体访问权限，仍可使用常用字体。':error.message);}};
$('apply-font').onclick=()=>{const name=$('custom-font').value.trim().replace(/["\\]/g,'');if(!name)return;if(!fonts.includes(name)){fonts.push(name);fontChoices();}state.font=name;synchronize();status('已选择字体：'+name+'。请确保此字体已安装在电脑上。');};
function releaseMedia(){media=null;mediaData=null;mediaName='';video.pause();video.removeAttribute('src');video.load();if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=null;$('media-name').textContent='未添加背景素材';}
function waitEvent(target,event,action){return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>finish(Error('素材读取超时，请更换文件。')),15000);const ok=()=>finish(),bad=()=>finish(Error('浏览器无法解码此素材，请转换为 JPG / PNG 或 H.264 MP4。'));function finish(error){clearTimeout(timeout);target.removeEventListener(event,ok);target.removeEventListener('error',bad);error?reject(error):resolve();}target.addEventListener(event,ok,{once:true});target.addEventListener('error',bad,{once:true});action();});}
async function loadMedia(file){
  if(busy||loadingMedia){status('请等待当前操作完成后再更换素材。');return false;}
  loadingMedia=true;status('正在读取素材…');
  const previous=media; let next,url=URL.createObjectURL(file);
  try{
    if(file.type.startsWith('video/')||/\.(mp4|mov)$/i.test(file.name)){next=video;await waitEvent(video,'loadeddata',()=>{video.src=url;video.load();});if(!Number.isFinite(video.duration)||video.duration<=0)throw Error('视频时长无效。');}
    else if(file.type.startsWith('image/')||/\.(png|jpe?g|webp)$/i.test(file.name)){next=new Image();await waitEvent(next,'load',()=>next.src=url);}
    else throw Error('请选择 PNG、JPG、WebP 图片，或 MP4、MOV 视频。');
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('素材读取失败。'));reader.readAsDataURL(file);});
    if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=url;media=next;mediaData=data;mediaName=file.name;$('media-name').textContent=file.name;time=0;status('已添加：'+file.name);render(ctx,state,time,media);return true;
  }catch(error){URL.revokeObjectURL(url);if(previous===video){releaseMedia();}status(error.message);return false;}
  finally{loadingMedia=false;}
}
$('upload').onclick=()=>$('media-file').click();$('media-file').onchange=async()=>{const file=$('media-file').files[0];if(file)await loadMedia(file);$('media-file').value='';};
$('remove-media').onclick=()=>{if(busy||loadingMedia||openingProject)return;releaseMedia();render(ctx,state,time,media);};
const workspace=document.querySelector('.workspace');workspace.ondragover=e=>{e.preventDefault();workspace.classList.add('dragging');};workspace.ondragleave=()=>workspace.classList.remove('dragging');workspace.ondrop=async e=>{e.preventDefault();workspace.classList.remove('dragging');if(e.dataTransfer.files[0])await loadMedia(e.dataTransfer.files[0]);};
function download(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('save').onclick=()=>{download(new Blob([JSON.stringify({version:1,state,media:mediaData,mediaName},null,2)],{type:'application/json'}),'戌無动态封面.xuwu');status('项目已保存，背景素材也包含在项目中。');};
$('new').onclick=()=>{if(busy||loadingMedia||openingProject)return;if(confirm('新建会替换当前画布。请先保存需要保留的项目。')){releaseMedia();state=defaults();time=0;synchronize();status('新项目已创建');}};
$('open').onclick=()=>$('project-file').click();
function validateProject(raw){const s={...defaults(),...raw};for(const key of ['text','font','topLeft','topRight','bottomLeft','bottomRight'])if(typeof s[key]!=='string')throw Error('项目文字参数无效。');for(const key of numbers)if(!Number.isFinite(s[key]))throw Error('项目数字参数无效。');if(s.duration<1||s.duration>10||s.effect<0||s.effect>14||!Number.isInteger(s.effect)||s.size<12||s.size>180||s.speed<.1||s.speed>3||s.density<0||s.density>1||![30,60,90,120].includes(s.fps)||![540,720,1080].includes(s.resolution)||![300,400,700].includes(s.weight)||!['mp4','png','gif','live'].includes(s.format)||!/^#[0-9a-f]{6}$/i.test(s.color)||!/^#[0-9a-f]{6}$/i.test(s.background))throw Error('项目参数超出有效范围。');s.seed=(Number(s.seed)||1)>>>0;return s;}
function importWindowsProject(project){
  if(typeof project.Text!=='string'||!Number.isInteger(project.Effect))throw Error('无法识别此项目文件。');
  const color=value=>/^#[0-9a-f]{8}$/i.test(value)?'#'+value.slice(3):value;
  return {...defaults(),text:project.Text,effect:project.Effect,font:project.FontFamily||'Arial',weight:[300,400,700][project.FontWeight??1],size:project.FontSize,speed:project.Speed,density:project.Density,color:color(project.TextColor),background:color(project.BackgroundColor),seed:project.Seed,coordinates:project.ShowCoordinates,date:project.ShowDate,hud:project.ShowHud,topLeft:project.CoordinateLeft,bottomLeft:project.FooterLeft,topRight:project.CoordinateRight,bottomRight:project.FooterRight,duration:project.DurationSeconds,fps:project.FramesPerSecond};
}
$('project-file').onchange=async()=>{let acquired=false;try{if(busy||loadingMedia||openingProject)throw Error('请等待当前操作完成后再打开项目。');openingProject=true;acquired=true;const file=$('project-file').files[0];if(!file)return;const project=JSON.parse(await file.text());const next=validateProject(project.state||importWindowsProject(project));if(project.media){if(typeof project.media!=='string'||!/^data:(image\/(png|jpeg|webp)|video\/(mp4|quicktime));base64,/i.test(project.media))throw Error('项目背景格式无效。');const response=await fetch(project.media);const loaded=await loadMedia(new File([await response.blob()],project.mediaName||'background',{type:response.headers.get('content-type')}));if(!loaded)throw Error('项目背景读取失败。');}else releaseMedia();state=next;if(!fonts.includes(state.font)){fonts.push(state.font);fontChoices();}time=0;synchronize();status(project.MediaPath?'Windows 项目文字已打开，请重新添加背景素材。':'项目已打开');}catch(error){status('打开失败：'+error.message);}finally{if(acquired)openingProject=false;$('project-file').value='';}};
async function seekVideo(seconds){if(media!==video)return;const target=Math.min(Math.max(0,seconds%video.duration),Math.max(0,video.duration-.001));if(Math.abs(video.currentTime-target)<.0001&&video.readyState>=2)return;await waitEvent(video,'seeked',()=>{video.currentTime=target;});}
function checkCancel(){if(cancelled)throw new DOMException('导出已取消','AbortError');}
function progress(value){$('progress').value=value;status(`正在导出 ${Math.round(value*100)}%`);}
function canvasBlob(canvas,type='image/png'){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片编码失败。')),type,.95));}
async function encodeMp4(s,canvas,context){
  if(!window.VideoEncoder)throw Error('此浏览器不支持 MP4 编码。请用最新版 Chrome / Edge 打开，或选择 PNG / GIF。');
  const config={codec:'avc1.420034',width:canvas.width,height:canvas.height,bitrate:Math.min(24000000,Math.max(2500000,canvas.width*canvas.height*s.fps*.12)),framerate:s.fps,avc:{format:'avc'},hardwareAcceleration:'no-preference'};
  const support=await VideoEncoder.isConfigSupported(config);if(!support.supported)throw Error(`此电脑的浏览器不支持 ${s.fps} fps 的 H.264 编码。请降低帧率或尺寸再试。`);
  const {Muxer,ArrayBufferTarget}=window.PosterCodecs;let encodingError;const muxer=new Muxer({target:new ArrayBufferTarget(),video:{codec:'avc',width:canvas.width,height:canvas.height},fastStart:'in-memory'});
  const encoder=new VideoEncoder({output:(chunk,metadata)=>{try{muxer.addVideoChunk(chunk,metadata);}catch(error){encodingError=error;}},error:error=>{encodingError=error;}});
  try{
    encoder.configure(config);const count=Math.ceil(s.duration*s.fps);
    for(let index=0;index<count;index++){
      checkCancel();if(encodingError)throw encodingError;while(encoder.encodeQueueSize>4){await tick();checkCancel();if(encodingError)throw encodingError;}
      const seconds=index/s.fps;await seekVideo(seconds);render(context,s,seconds,media);const frame=new VideoFrame(canvas,{timestamp:Math.round(index*1e6/s.fps),duration:Math.round(1e6/s.fps)});try{encoder.encode(frame,{keyFrame:index%s.fps===0});}finally{frame.close();}
      progress((index+1)/count*.95);if(index%4===0)await tick();
    }
    await encoder.flush();checkCancel();if(encodingError)throw encodingError;muxer.finalize();return new Blob([muxer.target.buffer],{type:'video/mp4'});
  }finally{if(encoder.state!=='closed')encoder.close();}
}
async function encodeGif(s,canvas,context){
  const {GIFEncoder,quantize,applyPalette}=window.PosterCodecs;const gif=GIFEncoder(),fps=Math.min(30,s.fps),count=Math.ceil(s.duration*fps);
  for(let index=0;index<count;index++){checkCancel();const seconds=index/fps;await seekVideo(seconds);render(context,s,seconds,media);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data,palette=quantize(pixels,256),indexed=applyPalette(pixels,palette);gif.writeFrame(indexed,canvas.width,canvas.height,{palette,delay:Math.round(1000/fps),repeat:0});progress((index+1)/count*.95);await tick();}
  gif.finish();return new Blob([gif.bytes()],{type:'image/gif'});
}
$('cancel').onclick=()=>{cancelled=true;status('正在取消，请稍候…');};
$('export').onclick=async()=>{
  if(busy||loadingMedia||openingProject){status('请等待当前素材或项目读取完成。');return;}busy=true;cancelled=false;const s=structuredClone(state),capturedTime=time,wasPlaying=playing;playing=false;$('export').disabled=true;document.querySelector('.progress-area').hidden=false;
  for(const id of ['upload','remove-media','open','new','media-file','project-file','timeline'])$(id).disabled=true;
  const canvas=document.createElement('canvas');canvas.width=s.resolution;canvas.height=s.resolution*4/3;const context=canvas.getContext('2d',{willReadFrequently:s.format==='gif'});
  try{
    if(!window.PosterCodecs)throw Error('离线编码文件缺失，请完整解压网页版文件夹。');await document.fonts.ready;let blob,extension=s.format;
    if(s.format==='png'){await seekVideo(capturedTime);render(context,s,capturedTime,media);blob=await canvasBlob(canvas);}
    else if(s.format==='gif')blob=await encodeGif(s,canvas,context);
    else if(s.format==='mp4')blob=await encodeMp4(s,canvas,context);
    else{
      const movie=await encodeMp4(s,canvas,context);checkCancel();await seekVideo(s.duration/2);render(context,s,s.duration/2,media);const still=await canvasBlob(canvas,'image/jpeg');
      const {zipSync,strToU8}=window.PosterCodecs;blob=new Blob([zipSync({'戌無动态封面.JPG':new Uint8Array(await still.arrayBuffer()),'戌無动态封面.MP4':new Uint8Array(await movie.arrayBuffer()),'导入说明.txt':strToU8('这是实况转换素材包，不是原生 Live Photo。\n在 iPhone 使用支持视频转实况照片的快捷指令或工具选择 MP4；JPG 可作为静态封面。\n请不要将本 ZIP 直接导入苹果照片。')},{level:0})],{type:'application/zip'});extension='live-material.zip';
    }
    checkCancel();progress(1);download(blob,'戌無动态封面.'+extension);status('导出完成，请查看浏览器下载文件夹。');
  }catch(error){status(error.name==='AbortError'?'导出已取消，可以继续编辑。':'导出失败：'+error.message);}
  finally{busy=false;playing=wasPlaying;$('export').disabled=false;document.querySelector('.progress-area').hidden=true;for(const id of ['upload','remove-media','open','new','media-file','project-file','timeline'])$(id).disabled=false;last=performance.now();updateInfo();render(ctx,state,time,media);}
};
if(!window.VideoEncoder)$('browser-note').textContent='当前浏览器支持 PNG / GIF；MP4 请使用最新版 Chrome / Edge。';
synchronize();requestAnimationFrame(frame);
// Expose only the pure renderer for local regression verification.
window.PosterWeb={glyphs,render,validateProject,getState:()=>structuredClone(state),isBusy:()=>busy};
})();

/* Community-inspired motion systems. No network assets or templates. */
(() => {
  'use strict';
  const TAU=Math.PI*2, wrap=x=>((x%1)+1)%1, clamp=(x,min=0,max=1)=>Math.max(min,Math.min(max,x));
  const entries=[
    ['霓虹描边','发光轮廓沿波浪漂移，适合夜色与音乐封面。'],
    ['液态融字','字形横向扭曲、纵向拉伸，形成黏稠的液态节奏。'],
    ['滚动跑马灯','整句文字交错滚动，适合潮流品牌与宣言海报。'],
    ['旋转文字球','文字分布在旋转球体上，带有前后景深变化。'],
    ['无限缩放','整句文字层层进入视野，形成循环缩放隧道。'],
    ['节奏跳字','文字依次弹跳与挤压，适合轻快、活泼的主题。'],
    ['折叠波浪','文字像折扇一样依次收窄与展开。'],
    ['镜像万花筒','八向镜像文字随时间旋转，形成对称图案。'],
    ['像素闪烁','低分辨率字形按节奏闪烁，呈现复古数字质感。'],
    ['光束扫字','扫描光带经过文字网格，依次点亮字形。'],
    ['RGB 色差','彩色边缘与原色文字错位，呈现数字故障质感。'],
    ['字符解码','随机代码逐字恢复为你的文字，形成解码动画。'],
    ['文字磁场','文字绕中心涡旋汇聚，像被磁场牵引。'],
    ['扭转双螺旋','两条文字链条交错旋转，带有远近缩放。'],
    ['唱片转盘','三圈文字反向旋转，适合音乐与复古主题。'],
    ['层叠阶梯','完整语句错层排列，形成透视感的文字阶梯。'],
    ['电影字幕','完整文案缓缓揭开、停留再隐去，适合情绪记录。'],
    ['斜向弹幕','不同大小的整句文字沿斜向错层移动。'],
    ['轨道星环','文字在三条倾斜轨道运行，形成空间环绕效果。'],
    ['镀铬流光','金属反射光带扫过字面，颜色随你的色盘变化。']
  ].map(([name,description],index)=>({id:index+15,name,description}));
  const macros=new Set([17,19,30,31,32,34]);
  const pixelCanvas=document.createElement('canvas'),pixelContext=pixelCanvas.getContext('2d');
  function random(seed){let v=seed>>>0;return()=>{v+=0x6D2B79F5;let x=v;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return((x^(x>>>14))>>>0)/4294967296;};}
  function characters(text){return(typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text)).filter(x=>x.trim());}
  function phaseOf(s,seconds){return wrap(seconds*s.speed/s.duration);}
  function glyphs(s,seconds){
    const chars=characters(s.text);if(!chars.length||macros.has(s.effect))return[];
    const phase=phaseOf(s,seconds),rand=random(s.seed),angle=phase*TAU;
    let count=clamp(Math.floor(18+s.density*70),12,96);if(s.effect===22)count=Math.round(count/8)*8;
    if([15,16,21].includes(s.effect))count=Math.min(80,chars.length);
    const columns=Math.min(10,Math.max(3,chars.length)),rows=Math.ceil(count/columns),result=[];
    for(let i=0;i<count;i++){
      const t=i/Math.max(1,count-1),jx=rand(),jy=rand(),u=.1+i%columns/Math.max(1,columns-1)*.8,v=.2+Math.floor(i/columns)/Math.max(1,rows-1)*.6;
      const g={char:chars[i%chars.length],x:u,y:v,scale:1,rotation:0,opacity:1,depth:0};
      switch(s.effect){
        case 15:g.x=.08+t*.84;g.y=.5+Math.sin(t*TAU*2+angle)*.19;g.scale=1.35;g.style='neon';g.glow=1+Math.sin(angle+t*4)*.3;break;
        case 16:{const wave=Math.sin(t*TAU*2+angle);g.x=.1+t*.8;g.y=.5+wave*.09;g.scaleX=1.15+wave*.6;g.scaleY=1.2-wave*.7;g.rotation=wave*7;g.style='melt';break;}
        case 18:{const z=1-2*(i+.5)/count,r=Math.sqrt(1-z*z),a=i*2.3999632297,px=r*Math.cos(a),pz=r*Math.sin(a),dx=px*Math.cos(angle)+pz*Math.sin(angle),depth=-px*Math.sin(angle)+pz*Math.cos(angle);g.x=.5+dx*.32;g.y=.5+z*.25;g.scale=.45+(depth+1)*.55;g.opacity=.22+(depth+1)*.38;g.depth=depth;break;}
        case 20:{const jump=Math.max(0,Math.sin(angle-i*.58));g.y=v-jump*.09;g.scale=1+jump*.35;g.scaleX=1+jump*.18;g.scaleY=1-jump*.12;g.rotation=Math.sin(angle-i*.58)*6;break;}
        case 21:{const a=t*TAU*3-angle;g.x=.1+t*.8;g.y=.5+Math.sin(a)*.15;g.scale=1.4;g.scaleX=.12+Math.abs(Math.cos(a))*.88;g.rotation=Math.sin(a)*15;g.opacity=.35+.65*g.scaleX;break;}
        case 22:{const ring=Math.floor(i/8),rings=count/8,a=i%8*TAU/8+angle*.5,r=.09+ring/Math.max(1,rings-1)*.32;g.char=chars[ring%chars.length];g.x=.5+Math.cos(a)*r;g.y=.5+Math.sin(a)*r*.75;g.rotation=a*180/Math.PI+90;g.scaleX=i%2?-1:1;g.style='outline';g.scale=.8+ring/rings*.6;break;}
        case 23:g.opacity=.25+Math.max(0,Math.sin(angle*2+i*.8))*.75;g.scale=.8+Math.floor(wrap(phase+i/count)*3)*.25;g.style='pixel';break;
        case 24:{const beam=.12+phase*.76;g.opacity=.18+.82*Math.exp(-(((v-beam)/.11)**2));g.scale=1.1;g.style='scan';break;}
        case 25:g.x=u+Math.sin(angle*3+i*9)*.008;g.y=v+Math.cos(angle*2+i)*.01;g.style='chroma';g.shift=2+Math.abs(Math.sin(angle*3+i))*8;break;
        case 26:{const reveal=clamp(phase/.7),alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%';if(t>reveal){const r=random((s.seed+i*379+Math.floor(phase*48)*917)>>>0);g.char=alphabet[Math.floor(r()*alphabet.length)];g.opacity=.35+.4*jy;}g.scale=1.05;break;}
        case 27:{const a=t*TAU*3-angle*2,r=.07+jx*.32+Math.sin(angle+t*6)*.04;g.x=.5+Math.cos(a)*r;g.y=.5+Math.sin(a)*r*.78;g.rotation=a*180/Math.PI+90;g.scale=.55+jx*.8;g.opacity=.45+jx*.55;break;}
        case 28:{const pairs=Math.ceil(count/2),a=Math.floor(i/2)/Math.max(1,pairs-1)*TAU*2+angle+(i%2)*Math.PI,depth=Math.sin(a);g.x=.5+Math.cos(a)*.25;g.y=.13+Math.floor(i/2)/Math.max(1,pairs-1)*.74;g.scale=.55+(depth+1)*.4;g.opacity=.25+(depth+1)*.36;g.depth=depth;break;}
        case 29:{const ring=i%3,items=Math.ceil(count/3),a=Math.floor(i/3)/items*TAU+angle*(ring%2?-1:1),r=.13+ring*.12;g.x=.5+Math.cos(a)*r;g.y=.5+Math.sin(a)*r*.75;g.rotation=a*180/Math.PI+90;g.scale=.75+ring*.25;break;}
        case 33:{const orbit=i%3,a=t*TAU+angle*(1+orbit*.25),tilt=(orbit-1)*Math.PI/4,px=Math.cos(a)*.34,py=Math.sin(a)*.11;g.x=.5+px*Math.cos(tilt)-py*Math.sin(tilt);g.y=.5+(px*Math.sin(tilt)+py*Math.cos(tilt))*.75;g.scale=.8+(Math.sin(a)+1)*.3;g.opacity=.5+(Math.sin(a)+1)*.25;g.rotation=(tilt+a*.3)*180/Math.PI;g.style='orbit';break;}
        case 34:g.x=.1+t*.8;g.y=.5+Math.sin(t*TAU+angle)*.1;g.scale=1.5;g.style='chrome';g.light=phase;break;
      }
      result.push(g);
    }
    if(s.effect===18)result.sort((a,b)=>a.depth-b.depth);
    return result;
  }
  function tint(hex,factor){return '#'+[1,3,5].map(index=>Math.round(clamp(parseInt(hex.slice(index,index+2),16)*factor,0,255)).toString(16).padStart(2,'0')).join('');}
  function drawGlyph(ctx,s,g,size){
    if(!g.style)return false;
    ctx.lineJoin='round';ctx.lineWidth=Math.max(.7,size*.018);ctx.strokeStyle=s.color;
    switch(g.style){
      case 'neon':ctx.shadowColor=s.color;ctx.shadowBlur=size*.28*g.glow;ctx.strokeText(g.char,0,0);ctx.shadowBlur=0;ctx.globalAlpha*=.25;ctx.fillText(g.char,0,0);break;
      case 'outline':ctx.strokeText(g.char,0,0);break;
      case 'melt':ctx.shadowColor=s.color;ctx.shadowBlur=size*.07;ctx.fillText(g.char,0,0);break;
      case 'pixel':{
        const cells=14;pixelCanvas.width=cells;pixelCanvas.height=cells;pixelContext.font=`${s.weight} 10px "${s.font.replace(/["\\]/g,'')}",sans-serif`;pixelContext.textAlign='center';pixelContext.textBaseline='middle';pixelContext.fillStyle=s.color;pixelContext.fillText(g.char,7,7);
        ctx.imageSmoothingEnabled=false;ctx.drawImage(pixelCanvas,-size*.7,-size*.7,size*1.4,size*1.4);break;
      }
      case 'scan':ctx.shadowColor=s.color;ctx.shadowBlur=size*.18;ctx.fillText(g.char,0,0);break;
      case 'chroma':{const alpha=ctx.globalAlpha;ctx.globalAlpha=alpha*.52;ctx.fillStyle='#ff407f';ctx.fillText(g.char,-g.shift*size/52,0);ctx.fillStyle='#38ddff';ctx.fillText(g.char,g.shift*size/52,0);ctx.globalAlpha=alpha;ctx.fillStyle=s.color;ctx.fillText(g.char,0,0);break;}
      case 'orbit':ctx.shadowColor=s.color;ctx.shadowBlur=size*.1;ctx.fillText(g.char,0,0);break;
      case 'chrome':{
        const gradient=ctx.createLinearGradient(-size*.3,-size*.6,size*.3,size*.6),light=.42+Math.sin(g.light*TAU)*.12;
        gradient.addColorStop(0,tint(s.color,.9));gradient.addColorStop(.2,tint(s.color,.4));gradient.addColorStop(light,tint(s.color,1.5));gradient.addColorStop(light+.07,tint(s.color,.16));gradient.addColorStop(.8,tint(s.color,1.35));gradient.addColorStop(1,tint(s.color,.45));
        ctx.fillStyle=gradient;ctx.shadowColor='#00000055';ctx.shadowBlur=size*.035;ctx.shadowOffsetY=size*.025;ctx.fillText(g.char,0,0);ctx.shadowBlur=0;ctx.strokeText(g.char,0,0);break;
      }
      default:return false;
    }
    return true;
  }
  function backdrop(ctx,s,seconds,list){
    if(!s.text.trim())return;
    const {width:w,height:h}=ctx.canvas,phase=phaseOf(s,seconds);ctx.save();ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=w/1080;
    if(s.effect===24){const y=(.12+phase*.76)*h,gradient=ctx.createLinearGradient(0,y-h*.08,0,y+h*.08);gradient.addColorStop(0,s.color+'00');gradient.addColorStop(.5,s.color+'35');gradient.addColorStop(1,s.color+'00');ctx.fillStyle=gradient;ctx.fillRect(0,y-h*.08,w,h*.16);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(w*.07,y);ctx.lineTo(w*.93,y);ctx.stroke();}
    if(s.effect===28){ctx.globalAlpha=.16;for(let i=0;i+1<list.length;i+=2){ctx.beginPath();ctx.moveTo(list[i].x*w,list[i].y*h);ctx.lineTo(list[i+1].x*w,list[i+1].y*h);ctx.stroke();}}
    if(s.effect===29){ctx.globalAlpha=.18;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(w*.5,h*.5,w*(.13+i*.12),h*(.13+i*.12)*.75,0,0,TAU);ctx.stroke();}}
    ctx.restore();
  }
  function family(s){return `"${s.font.replace(/["\\]/g,'')}","Microsoft YaHei",sans-serif`;}
  function setFont(ctx,s,size){ctx.font=`${s.weight} ${size}px ${family(s)}`;}
  function fit(ctx,s,text,size,width){setFont(ctx,s,size);const measured=ctx.measureText(text).width;return measured>width?size*width/measured:size;}
  function typography(ctx,s,seconds){
    if(!macros.has(s.effect))return false;
    const text=s.text.replace(/\s+/g,' ').trim();if(!text)return true;
    const {width:w,height:h}=ctx.canvas,ratio=w/1080,phase=phaseOf(s,seconds),angle=phase*TAU;ctx.save();ctx.fillStyle=s.color;ctx.strokeStyle=s.color;ctx.textAlign='left';ctx.textBaseline='middle';
    if(s.effect===17||s.effect===32){
      const rows=4+Math.round(s.density*4),phrase=text+'   /   ';for(let row=0;row<rows;row++){
        ctx.save();const size=Math.max(16*ratio,s.size*ratio*(s.effect===17?1.7:1.2+row%3*.55));setFont(ctx,s,size);const width=Math.max(1,ctx.measureText(phrase).width),direction=row%2?-1:1,y=h*(.17+row/Math.max(1,rows-1)*.66);
        if(s.effect===32){ctx.translate(w*.5,y);ctx.rotate(-Math.PI/12);ctx.translate(-w*.5,0);}else ctx.translate(0,y);
        const distance=phase*width*(s.effect===17?2:row%3+1)*direction+row*width*.17,start=-wrap(distance/width)*width-width;
        ctx.globalAlpha=s.effect===17?.95:.5+row%3*.2;for(let x=start;x<w+width;x+=width)ctx.fillText(phrase,x,0);ctx.restore();
      }
    }else if(s.effect===19){
      const size=fit(ctx,s,text,Math.max(s.size*ratio*2,32*ratio),w*.75);setFont(ctx,s,size);ctx.textAlign='center';
      for(let layer=0;layer<5;layer++){const p=wrap(phase+layer/5),scale=Math.pow(5,p*2-1);ctx.save();ctx.translate(w*.5,h*.5);ctx.scale(scale,scale);ctx.globalAlpha=Math.sin(p*Math.PI)*.85;ctx.lineWidth=Math.max(.6,size*.012);layer%2?ctx.strokeText(text,0,0):ctx.fillText(text,0,0);ctx.restore();}
    }else if(s.effect===30){
      const size=fit(ctx,s,text,Math.max(28*ratio,s.size*ratio*1.7),w*.72),layers=4+Math.round(s.density*4);setFont(ctx,s,size);ctx.textAlign='center';
      for(let i=layers-1;i>=0;i--){ctx.save();const x=w*.5+(i-(layers-1)/2)*w*.025+Math.sin(angle+i*.5)*w*.022,y=h*.5+(i-(layers-1)/2)*h*.085;ctx.translate(x,y);ctx.transform(1,-.08,Math.sin(angle)*.15,1,0,0);ctx.globalAlpha=.3+(layers-i)/layers*.65;ctx.lineWidth=size*.015;i%2?ctx.strokeText(text,0,0):ctx.fillText(text,0,0);ctx.restore();}
    }else if(s.effect===31){
      const lines=s.text.split('\n').filter(line=>line.trim()),alpha=clamp(Math.sin(phase*Math.PI)*2),reveal=clamp(phase/.3),lineHeight=Math.max(32*ratio,s.size*ratio*1.6);
      ctx.globalAlpha=alpha;ctx.beginPath();ctx.rect(w*.08,h*.18,w*.84*reveal,h*.65);ctx.clip();ctx.textAlign='center';
      lines.slice(0,6).forEach((line,index)=>{const size=fit(ctx,s,line,lineHeight,w*.8);setFont(ctx,s,size);ctx.fillText(line,w*.5,h*.5+(index-(Math.min(6,lines.length)-1)/2)*lineHeight*1.25+(1-alpha)*h*.025);});
    }else if(s.effect===34){
      const size=fit(ctx,s,text,Math.max(42*ratio,s.size*ratio*3),w*.84);setFont(ctx,s,size);ctx.textAlign='center';ctx.translate(w*.5,h*.5);ctx.transform(1,Math.sin(angle)*.035,0,1,0,0);
      ctx.fillStyle=tint(s.color,.22);for(let depth=size*.12;depth>0;depth-=Math.max(.7,ratio*2))ctx.fillText(text,depth*.6,depth);
      const light=.42+Math.sin(angle)*.12,gradient=ctx.createLinearGradient(-size*.4,-size*.65,size*.4,size*.65);
      for(const [stop,factor] of [[0,.9],[.2,.4],[light,1.5],[light+.07,.16],[.8,1.35],[1,.45]])gradient.addColorStop(stop,tint(s.color,factor));
      ctx.fillStyle=gradient;ctx.fillText(text,0,0);ctx.lineWidth=Math.max(.5,size*.01);ctx.strokeText(text,0,0);
    }
    ctx.restore();return true;
  }
  window.PosterEffects={entries,glyphs,drawGlyph,backdrop,typography};
})();

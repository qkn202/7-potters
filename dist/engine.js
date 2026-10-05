(()=>{
const W=1200,H=660,PW=30,PH=44;
const floor=[[0,570,1200,90]];
const levels=[
 {map:'common-room',name:'Phòng sinh hoạt chung',hint:'Chạy tới chiếc vớ, rồi kéo cả hội đến cửa. X để ném bạn ở gần!',platforms:[...floor,[350,510,105,18],[670,500,95,18]],key:[870,522],door:[1100,498],spikes:[],pumpkins:[[630,515,110]]},
 {map:'great-hall',name:'Đại Sảnh Đường',hint:'Cứ chạy! Trượt quá đà thì kéo bạn theo. Chiếc vớ ở ngay phía trước.',platforms:[...floor,[530,505,140,18]],key:[920,510],door:[1100,498],spikes:[],ice:[240,1040],pumpkins:[[680,520,130]]},
 {map:'charms',name:'Lớp học Bùa chú',hint:'Đệm tím tự bật. Bước lên, bay cùng bạn và chộp chiếc vớ!',platforms:[...floor,[420,495,100,18],[780,455,170,18]],key:[865,422],door:[1100,498],spikes:[],springs:[[360,570,90],[695,570,100]]},
 {map:'greenhouse',name:'Nhà kính Thảo dược',hint:'Quạt thổi cả hội sang phải. Tai dài hơi thiệt, nhưng bay rất vui!',platforms:[...floor,[540,510,95,18]],key:[905,500],door:[1100,498],spikes:[],fans:[[340,430,180,1],[680,420,150,1]],pumpkins:[[840,525,60]]},
 {map:'stairs',name:'Cầu thang Hogwarts',hint:'Cầu nghiêng qua lại. Đi tới thôi! Rơi xuống sàn vẫn đi tiếp được.',platforms:[...floor,[285,500,95,18],[690,515,75,18]],key:[915,505],door:[1100,498],spikes:[],seesaw:[420,495,270],moving:[800,505,130,18,35]},
 {map:'kitchen',name:'Nhà bếp gia tinh',hint:'Bí ngô chỉ hất bạn bay, không loại ai. Nhảy qua hoặc… làm bóng bowling!',platforms:[...floor,[420,510,120,18]],key:[930,510],door:[1100,498],spikes:[],pumpkins:[[450,515,140],[780,520,130],[980,525,65]],ice:[350,1030]},
 {map:'chamber',name:'Phòng Chứa Bí Mật',hint:'Cánh cửa quay hất bạn sang bên. Đệm tím sẽ giúp cả hội bay qua!',platforms:[...floor,[285,505,95,18],[750,505,80,18]],key:[945,510],door:[1100,498],spikes:[],rotors:[[580,480,76],[870,480,68]],springs:[[420,570,85]]},
 {map:'courtyard',name:'Sân lâu đài Hogwarts',hint:'Bơ, quạt, bí ngô, boing! Lấy vớ rồi kéo hội lầy về cửa. Không có mật mã!',platforms:[[0,570,560,90],[650,570,550,90]],key:[925,490],door:[1100,498],spikes:[],springs:[[430,570,90],[730,570,85]],fans:[[650,415,130,1]],pumpkins:[[900,525,85]],ice:[680,1060]}
];
// Eight authored routes: each stage is an epic 12-chapter adventure through Hogwarts!
const routes=[
 ['steps','pumpkin','gap','bounce','wind','bridge','ice','rotor','conveyor','bouncegap','bowling','finale'],
 ['ice','bowling','steps','gap','icewind','bridge','bounce','conveyor','rotor','wind','bouncegap','finale'],
 ['bounce','steps','wind','gap','rotor','ice','bridge','bouncegap','bowling','conveyor','icewind','finale'],
 ['wind','pumpkin','gap','steps','icewind','bridge','bouncegap','rotor','conveyor','bounce','bowling','finale'],
 ['steps','bridge','gap','rotor','conveyor','bouncegap','wind','ice','bounce','pumpkin','icewind','finale'],
 ['bowling','ice','gap','steps','pumpkin','wind','bridge','rotor','bouncegap','conveyor','icewind','finale'],
 ['rotor','steps','gap','bridge','bowling','ice','bouncegap','wind','conveyor','pumpkin','icewind','finale'],
 ['gap','wind','ice','steps','bowling','bridge','bouncegap','rotor','conveyor','bounce','icewind','finale']
];
const stopNames={steps:'Chồng vai qua bậc',pumpkin:'Bí ngô thích ôm',gap:'Kéo bạn qua vực',bounce:'Cả hội thành tên lửa',wind:'Tai dài bắt gió',bridge:'Cầu nghiêng, hội nghiêng',bowling:'Gia tinh bowling',ice:'Ai bôi bơ lên sàn?',icewind:'Trượt rồi bay luôn',rotor:'Cửa xoay không chờ',bouncegap:'Boing qua vực',conveyor:'Băng chuyền đổi chiều',finale:'Vớ ở cuối đường!'};
const chapterNames=[
 ['Núi gối khổng lồ','Bí ngô giành ghế','Thảm bị thủng!','Ghế sofa BOING','Ống khói hắt hơi','Cầu bàn trà nghiêng','Bơ đổ trên thảm','Cánh quạt trần quay','Băng chuyền dọn dẹp','Vực sâu sàn gỗ','Bí ngô đánh bowling','Vớ sau lò sưởi'],
 ['Bơ đổ trên sàn','Bữa tiệc bí ngô','Leo bàn ăn dài','Sàn thiếu một miếng','Khăn bàn hóa diều','Bàn tiệc bập bênh','Đệm bánh pudding','Băng chuyền đĩa thức ăn','Cửa phục vụ quay','Gió lốc trần sảnh','Hào nước cống ngầm','Vớ tráng miệng'],
 ['Bùa bật tung người','Sách xếp thành núi','Leviosa thổi tai','Sàn tàng hình','Đũa phép quay cuồng','Sàn bơ Wingardium','Bàn học bập bênh','Phóng qua hố mực','Quả cầu tuyết bowling','Băng chuyền cuộn giấy','Gió lốc bùa chú','Vớ biết bay'],
 ['Cây quạt hắt hơi','Bí ngô cần ôm','Mương tưới cây','Chậu cây xếp tầng','Sương trơn bắt gió','Cầu gỗ tưới nước','Nấm phóng qua mương','Cánh quạt thông gió','Băng rêu trôi ngược','Nấm nổ tung người','Thu hoạch bowling','Vớ giữa luống cây'],
 ['Bậc thang chồng vai','Cầu thang lắc lư','Bậc thang mất tích','Lan can xoay tròn','Thang cuốn trái tính','Cầu thang bật tung','Gió lùa hành lang','Sàn đá trơn trượt','Đệm lò xo cứu nguy','Bí ngô ngáng bậc','Cầu thang bão tuyết','Vớ trên tầng cuối'],
 ['Bí ngô trốn nồi','Bơ không có phanh','Ống thoát nước hở','Bếp ga xếp tầng','Bí ngô đuổi đầu bếp','Máy hút mùi quá mạnh','Cầu thớt bập bênh','Cánh quạt trộn bột','Lò nướng bật tưng','Băng chuyền rửa chén','Bơ trượt gặp bão','Vớ khỏi dây phơi'],
 ['Đuôi rắn quay vòng','Tượng đá xếp tầng','Mương nước bí mật','Cầu đá bập bênh','Trứng rắn bowling','Rêu trơn bóng đêm','Bật qua cống sâu','Luồng khí lạnh rít','Nền đá chạy ngược','Bẫy đá dội ngược','Cống ngầm gió tuyết','Vớ sau cửa rắn'],
 ['Cống sân lâu đài','Gió giật tai dài','Sân phủ sương trơn','Bậc đá tường thành','Bí ngô đá bóng','Cầu gỗ chòng chành','Hào sâu trắc trở','Cối xay gió cổ','Băng chuyền lát đá','Đệm hoa chuông BOING','Bão tuyết sân thượng','Vớ dưới ánh trăng']
];
levels.forEach((l,index)=>{
 const stride=1800+index*30;l.width=180+stride*12+520;l.platforms=[];l.pumpkins=[];l.rotors=[];l.fans=[];l.springs=[];l.iceZones=[];l.seesaws=[];l.movers=[];l.checkpoints=[];l.stops=[];l.conveyors=[];
 delete l.ice;delete l.moving;delete l.seesaw;
 let floorStart=0;
 const gap=(a,b)=>{l.platforms.push([floorStart,570,a-floorStart,90]);floorStart=b;};
 routes[index].forEach((kind,i)=>{
  const x=180+i*stride;l.stops.push({x,label:chapterNames[index][i],kind,instruction:stopNames[kind]});
  if(i)l.checkpoints.push(x-80);

  if(kind==='steps'){
    l.platforms.push([x+160,510,95,60],[x+250,455,95,115],[x+340,400,95,170],[x+430,345,110,225],[x+570,340,140,18]);
    gap(x+680,x+1040); // 360px wide abyss!
    l.platforms.push([x+765,530,85,18],[x+895,530,85,18],[x+730,410,110,18],[x+890,390,110,18],[x+1080,410,110,18],[x+1250,350,110,18],[x+1420,430,110,18],[x+1580,490,110,18]);
  }
  if(kind==='pumpkin'||kind==='bowling'){
    l.pumpkins.push([x+300,526,100],[x+600,526,90],[x+1150,526,105],[x+1450,526,95]);
    if(kind==='bowling')l.pumpkins.push([x+430,526,75],[x+1300,526,75],[x+1600,526,85]);
    gap(x+720,x+1060); // 340px wide chasm!
    l.platforms.push([x+380,460,120,18],[x+805,530,85,18],[x+935,530,85,18],[x+1180,450,120,18],[x+1520,410,120,18]);
  }
  if(kind==='gap'||kind==='bouncegap'){
    gap(x+335,x+675); // 340px wide abyss!
    l.platforms.push([x+420,530,85,18],[x+545,530,85,18],[x+700,390,110,18],[x+920,440,110,18]);
    gap(x+1050,x+1400); // 350px wide abyss!
    l.platforms.push([x+1135,530,85,18],[x+1265,530,85,18],[x+1360,430,120,18],[x+1580,390,110,18]);
    if(kind==='bouncegap')l.springs.push([x+245,570,85],[x+960,570,85]);
  }
  if(kind==='bounce'){
    l.springs.push([x+180,570,80],[x+620,570,85],[x+1080,570,80],[x+1480,570,85]);
    gap(x+280,x+620); // 340px wide spring abyss!
    l.platforms.push([x+365,530,85,18],[x+495,530,85,18],[x+680,340,120,18],[x+1160,350,140,18],[x+1560,360,120,18]);
  }
  if(kind==='wind'||kind==='icewind'){
    l.fans.push([x+200,410,180,1],[x+1050,410,180,1]);
    gap(x+300,x+640); // 340px wide windy abyss!
    l.platforms.push([x+385,530,85,18],[x+515,530,85,18],[x+800,410,110,18],[x+1240,460,110,18],[x+1630,420,110,18]);
  }
  if(kind==='ice'||kind==='icewind'){
    l.iceZones.push([x+140,x+600],[x+980,x+1500]);
    l.pumpkins.push([x+450,526,90],[x+1350,526,90]);
    gap(x+620,x+960); // 340px wide butter abyss!
    l.platforms.push([x+705,530,85,18],[x+835,530,85,18],[x+520,440,110,18],[x+1420,430,110,18]);
  }
  if(kind==='bridge'){
    gap(x+200,x+640); // 440px wide abyss spanned by seesaw!
    l.seesaws.push([x+190,545,460]);
    l.movers.push([x+740,460,110,18,45]);
    gap(x+950,x+1390); // 440px wide abyss spanned by seesaw!
    l.seesaws.push([x+940,545,460]);
    l.movers.push([x+1480,450,110,18,45]);
  }
  if(kind==='rotor'){
    l.rotors.push([x+280,470,75],[x+1120,470,75]);
    gap(x+320,x+660); // 340px wide rotor abyss!
    l.platforms.push([x+405,530,85,18],[x+535,530,85,18],[x+780,420,110,18],[x+1220,460,110,18],[x+1620,420,110,18]);
  }
  if(kind==='conveyor'){
    l.conveyors.push([x+140,x+500],[x+880,x+1400]);
    gap(x+520,x+860); // 340px wide conveyor drop abyss!
    l.platforms.push([x+605,530,85,18],[x+735,530,85,18],[x+400,460,110,18],[x+860,510,140,60],[x+1300,440,110,18]);
  }
  if(kind==='finale'){
    l.springs.push([x+150,570,80],[x+1050,570,80]);
    l.pumpkins.push([x+400,526,90],[x+1300,526,90]);
    l.rotors.push([x+650,460,75],[x+1550,460,75]);
    l.iceZones.push([x+240,x+600]);
    gap(x+620,x+960); // 340px wide grand finale abyss!
    l.platforms.push([x+705,530,85,18],[x+835,530,85,18],[x+480,430,110,18],[x+1380,410,110,18]);
  }

 });
 l.platforms.push([floorStart,570,l.width-floorStart,90]);l.key=[l.width-330,520];l.door=[l.width-115,498];
 l.hint='12 chặng thử thách! Cùng chạy, nhảy và kéo bạn. Cờ nghỉ lưu khi cả đội đi qua.';
});
function worldWidth(room){return levels[room.level].width;}
function spawn(room){const base=Math.max(15,(room.checkpoint||80)-Math.max(0,room.players.length-4)*35);room.players.forEach((p,i)=>Object.assign(p,{x:base+i*35,y:526,vx:0,vy:0,kickX:0,ground:false,dead:0,keys:{},jumpHeld:false,tossHeld:false,tossCooldown:0,ready:false,spin:0,invincible:100,facing:1,coyote:0,dangling:false,hauling:false}));}
function init(room){room.checkpoint=80;room.checkpointsPassed=0;room.runDeaths=0;room.elapsed=undefined;spawn(room);room.key=false;room.gateOpen=true;room.teamRespawn=0;room.ropeLength=185;room.ropeMax=300;room.status='playing';room.ticks=0;room.movingY=undefined;room.deaths=room.deaths||0;room.pranks=0;room.bumps=0;room.variant=Math.floor(Math.random()*3);room.started=Date.now();}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function obstacles(room){const l=levels[room.level],t=room.ticks||0,v=room.variant||0;return {pumpkins:(l.pumpkins||[]).map(([x,y,amp],i)=>({x:x+Math.sin(t/(65+i*11)+v)*amp,y:y+Math.sin(t/15+i)*3,w:40,h:40,phase:t/12+i})),rotors:(l.rotors||[]).map(([x,y,r],i)=>({x,y,r,angle:t/(42+i*10)+v})),slope:l.seesaw?Math.sin(t/85+v)*.3:0};}
function solidsFor(room){const l=levels[room.level],s=l.platforms.map(([x,y,w,h])=>({x,y,w,h}));
 for(const[x,y,w,h,a]of l.movers)s.push({x,y:y+Math.sin(room.ticks/90+x)*a,w,h,moving:true,baseY:y,amp:a});
 for(const[x,y,w]of l.seesaws)s.push({x,y,w,h:16,slope:Math.sin(room.ticks/85+(room.variant||0)+x)*.16});return s;}
function top(b,p){return b.y+(b.slope||0)*(p.x+PW/2-b.x-b.w/2);}
function tick(room){if(room.status!=='playing')return;const l=levels[room.level],ps=room.players;if(ps.length<2||ps.some(p=>!p.connected))return;room.ticks++;
 if(room.teamRespawn>0){room.teamRespawn--;ps.forEach(p=>p.dead=room.teamRespawn);if(!room.teamRespawn)spawn(room);return;}
 const solids=solidsFor(room);room.movingY=solids.find(b=>b.moving)?.y;const obs=obstacles(room);
 const anyGrounded=ps.some(p=>p.ground&&p.y<580);
 for(const p of [...ps].sort((a,b)=>b.y-a.y)){
  p.invincible=Math.max(0,p.invincible-1);p.spin=Math.max(0,p.spin-1);p.tossCooldown=Math.max(0,p.tossCooldown-1);p.bumpCooldown=Math.max(0,(p.bumpCooldown||0)-1);
  p.dangling=!p.ground&&p.y>545&&anyGrounded;
  if(p.dangling){p.y=Math.min(H+50,p.y);if(p.y>=H+50)p.vy=Math.min(0,p.vy);}
  for(const moving of solids.filter(b=>b.moving)){const prevY=moving.baseY+Math.sin((room.ticks-1)/90+moving.x)*moving.amp;if(p.ground&&Math.abs(p.y+PH-prevY)<4&&p.x+PW>moving.x&&p.x<moving.x+moving.w)p.y+=moving.y-prevY;}
  const k=p.keys||{},dir=(k.right?1:0)-(k.left?1:0),icy=(l.iceZones||[]).some(([a,b])=>p.x>a&&p.x<b)&&p.y>480;
  if(dir)p.facing=dir;p.vx=icy?p.vx*.96+dir*.4:p.vx*.65+dir*1.65;p.vx=Math.max(-5.5,Math.min(5.5,p.vx));p.kickX=(p.kickX||0)*.9;
  p.coyote=p.ground?7:Math.max(0,(p.coyote||0)-1);
  if(k.jump&&!p.jumpHeld&&(p.ground||p.coyote||p.dangling)){p.vy=p.dangling?-11.5:-12;p.ground=false;p.coyote=0;if(p.dangling)p.kickX=(p.kickX||0)*1.3+p.facing*3.5;}p.jumpHeld=!!k.jump;
  if(p.dangling&&dir)p.kickX=Math.max(-8,Math.min(8,(p.kickX||0)+dir*0.8));
  if(k.toss&&!p.tossHeld&&!p.tossCooldown){const q=ps.filter(q=>q!==p&&!q.dead&&Math.hypot(q.x-p.x,q.y-p.y)<85).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(q){q.kickX=p.facing*11;q.vy=-12.5;q.ground=false;q.spin=45;p.kickX=-p.facing*3;p.tossCooldown=55;room.pranks++;}}p.tossHeld=!!k.toss;
  for(const[x,y,w,direction]of l.fans||[]){if(p.x+PW>x&&p.x<x+w&&p.y+PH>y&&p.y<570){p.kickX=Math.max(-9,Math.min(9,p.kickX+direction*.7));if(p.y>y)p.vy-=.85;}}
  for(const[a,b]of l.conveyors){if(p.ground&&p.x+PW>a&&p.x<b)p.kickX=Math.max(-7,Math.min(7,p.kickX+Math.sin(room.ticks/130)*.7));}
  for(const q of ps){if(q!==p&&Math.abs(p.y+PH-q.y)<=4&&p.x+PW>q.x+3&&p.x<q.x+PW-3)p.x+=(q.vx+(q.kickX||0));}
  for(const q of ps){if(q!==p&&Math.abs(p.y+PH-q.y)<=4&&p.x+PW>q.x+3&&p.x<q.x+PW-3)p.x+=(q.vx+(q.kickX||0))*0.7;}
  const dx=p.vx+p.kickX,oldX=p.x;p.x=Math.max(8,Math.min(l.width-PW-8,p.x+dx));
  for(const b of solids){if(b.slope)continue;if(overlap({x:p.x,y:p.y,w:PW,h:PH},b)&&(oldX+PW<=b.x+1||oldX>=b.x+b.w-1)){p.x=dx>0?b.x-PW:b.x+b.w;p.kickX=-p.kickX*.2;p.vx=0;}}
  for(const q of ps){
    if(q===p||(room.key&&p.x>l.door[0]-120&&q.x>l.door[0]-120))continue;
    if(p.y+PH<=q.y+2||q.y+PH<=p.y+2)continue;
    if(overlap({x:p.x,y:p.y,w:PW,h:PH},{x:q.x,y:q.y,w:PW,h:PH})){
      if((dx>0&&oldX<q.x)||(dx<0&&oldX>q.x))p.x=oldX;
    }
  }
  const oldY=p.y;p.vy=Math.min(15,p.vy+.62);p.y+=p.vy;p.ground=false;
  for(const b of solids){if(p.x+PW<=b.x||p.x>=b.x+b.w)continue;const y=top(b,p);if(p.vy>=0&&oldY+PH<=y+8&&p.y+PH>=y){p.y=y-PH;p.vy=0;p.ground=true;}else if(!b.slope&&p.vy<0&&oldY>=b.y+b.h&&p.y<b.y+b.h){p.y=b.y+b.h;p.vy=0;}}
  for(const q of ps){
    if(q===p||(room.key&&p.x>l.door[0]-120&&q.x>l.door[0]-120))continue;
    if(p.x+PW>q.x+3&&p.x<q.x+PW-3){
      if(p.vy>=0&&oldY+PH<=q.y+8&&p.y+PH>=q.y){
        p.y=q.y-PH;
        p.vy=0;
        p.ground=true;
      }else if(q.vy<0&&Math.abs(oldY+PH-q.y)<=16){
        p.y=q.y-PH;
        p.vy=q.vy;
        p.ground=true;
      }
    }
  }
  for(const[x,y,w]of l.springs||[]){if(p.ground&&p.x+PW>x&&p.x<x+w&&Math.abs(p.y+PH-y)<5){p.vy=-16;p.ground=false;p.spin=28;}}
  for(const b of obs.pumpkins){
    if(overlap({x:p.x,y:p.y,w:PW,h:PH},b)){
      const fromLeft=(p.x+PW/2)<=(b.x+b.w/2);
      if(fromLeft){
        p.x=Math.max(8,b.x-PW-6);
        p.vx=Math.min(-5,p.vx);
        p.kickX=-14;
      }else{
        p.x=Math.min(l.width-PW-8,b.x+b.w+6);
        p.vx=Math.max(5,p.vx);
        p.kickX=14;
      }
      p.vy=-8;
      p.spin=35;
      if(!p.bumpCooldown){p.bumpCooldown=10;room.bumps++;}
    }
  }
  for(const b of obs.rotors){
    const ex=b.x+Math.sin(b.angle)*b.r,ey=b.y+Math.cos(b.angle)*b.r;
    if(Math.hypot(p.x+15-ex,p.y+22-ey)<43){
      const fromLeft=(p.x+15)<=ex;
      if(fromLeft){
        p.x=Math.max(8,p.x-18);
        p.vx=Math.min(-5,p.vx);
        p.kickX=-15;
      }else{
        p.x=Math.min(l.width-PW-8,p.x+18);
        p.vx=Math.max(5,p.vx);
        p.kickX=15;
      }
      p.vy=-8.5;
      p.spin=40;
      if(!p.bumpCooldown){p.bumpCooldown=10;room.bumps++;}
    }
  }
  if(!room.key&&Math.hypot(p.x+15-l.key[0],p.y+22-l.key[1])<80)room.key=true;
 }
 for(const q of ps){
  if(!q.ground||q.y>=580){q.hauling=false;continue;}
  const danglingList=ps.filter(o=>o.dangling);
  if(danglingList.length>0){
   const avgX=danglingList.reduce((s,o)=>s+o.x,0)/danglingList.length;
   const pullDir=Math.sign(avgX-q.x);
   q.kickX=Math.max(-5,Math.min(5,(q.kickX||0)+pullDir*0.35));
   const pullingAway=(q.keys?.left&&pullDir>0)||(q.keys?.right&&pullDir<0)||q.keys?.jump;
   q.hauling=!!pullingAway;
   if(q.hauling){
    q.kickX*=0.6;
    danglingList.forEach(o=>{o.vy=Math.min(o.vy,-7.5);o.y=Math.max(520,o.y-3.2);});
   }
  }else{q.hauling=false;}
 }
 constrainRopes(room,solids.filter(b=>!b.slope));
 if(ps.every(p=>p.y>H+20)){room.teamRespawn=32;room.deaths++;room.runDeaths++;ps.forEach(p=>{p.dead=32;p.keys={};p.kickX=0;p.vx=0;p.vy=0;p.dangling=false;p.hauling=false;});return;}
 // A checkpoint advances only after the whole team reaches a safe stretch of floor.
 for(const x of l.checkpoints){if(x>room.checkpoint&&ps.every(p=>p.x>=x&&p.y<580)){room.checkpoint=x;room.checkpointsPassed++;}}
 ps.forEach(p=>p.ready=room.key&&p.x>l.door[0]-95&&p.y+PH>l.door[1]-15);
 if(room.key&&ps.every(p=>p.ready)){room.status='won';room.elapsed=room.ticks/60;}
}
function constrainRopes(room,solids){const ps=room.players,rest=room.ropeLength||185,max=room.ropeMax||300;
 function move(p,dx,dy){const oldY=p.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3));for(let i=0;i<steps;i++){const x=Math.max(8,Math.min(worldWidth(room)-PW-8,p.x+dx/steps));if(!solids.some(b=>overlap({x,y:p.y,w:PW,h:PH},b)))p.x=x;const y=p.y+dy/steps;if(!solids.some(b=>overlap({x:p.x,y,w:PW,h:PH},b)))p.y=y;}if(p.y<oldY-.1){p.ground=false;p.vy=Math.min(p.vy,-2);}}
 for(let i=0;i<ps.length-1;i++){const a=ps[i],b=ps[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<=rest||a.dead||b.dead)continue;const f=Math.min(2.5,(d-rest)*.025),nx=dx/d,ny=dy/d;
  if(b.dangling&&a.ground){b.vy=Math.min(b.vy,-ny*f*2.2);a.kickX=Math.max(-8,Math.min(8,(a.kickX||0)+nx*f*0.7));if(a.hauling){b.vy=Math.min(b.vy,-8);b.y-=3.2;b.y=Math.min(H+10,b.y);}}
  else if(a.dangling&&b.ground){a.vy=Math.min(a.vy,ny*f*2.2);b.kickX=Math.max(-8,Math.min(8,(b.kickX||0)-nx*f*0.7));if(b.hauling){a.vy=Math.min(a.vy,-8);a.y-=3.2;a.y=Math.min(H+10,a.y);}}
  else{a.kickX=Math.max(-10,Math.min(10,(a.kickX||0)+nx*f));b.kickX=Math.max(-10,Math.min(10,(b.kickX||0)-nx*f));if(ny<-.15){a.vy=Math.max(-14,a.vy+ny*f);a.ground=false;}if(ny>.15){b.vy=Math.max(-14,b.vy-ny*f);b.ground=false;}}
 }
 for(let it=0;it<10;it++)for(let i=0;i<ps.length-1;i++){const a=ps[i],b=ps[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<=max)continue;const nx=dx/d,ny=dy/d,e=d-max,ax=a.x,ay=a.y;const aRatio=a.ground?0.2:0.5;const bRatio=1-aRatio;move(a,nx*e*aRatio,ny*e*aRatio);const moved=(a.x-ax)*nx+(a.y-ay)*ny;move(b,-nx*(e-moved),-ny*(e-moved));}
}
// Shared team score; repeated tosses, bumps, and revisiting a flag cannot farm points.
function scoring(r){const won=r.status==='won',seconds=(r.ticks||0)/60;
 const checkpoints=(r.checkpointsPassed||0)*200,sock=r.key?500:0,finish=won?1000:0;
 const speed=won?Math.max(0,1000-Math.floor(seconds*3)):0,care=won?Math.max(0,600-(r.runDeaths||0)*50):0;
 const total=checkpoints+sock+finish+speed+care;
 return {checkpoints,sock,finish,speed,care,total,stars:won?(total>=5000?3:total>=4200?2:1):0};
}
function snapshot(r){return {code:r.code,status:r.status,score:scoring(r),runDeaths:r.runDeaths||0,seconds:(r.ticks||0)/60,spectatorCount:(r.spectators||[]).filter(p=>p.connected).length,level:r.level,key:r.key,gateOpen:true,ropeLength:r.ropeLength||185,ropeMax:r.ropeMax||300,teamRespawn:r.teamRespawn||0,checkpoint:r.checkpoint||80,variant:r.variant||0,pranks:r.pranks||0,bumps:r.bumps||0,movingY:r.movingY,deaths:r.deaths||0,ticks:r.ticks||0,elapsed:r.elapsed,obstacles:obstacles(r),players:r.players.map(({id,name,x,y,vx,vy,dead,ready,connected,house,spin,facing,invincible,dangling,hauling})=>({id,name,x,y,vx,vy,dead,ready,connected,house,spin,facing,invincible,dangling:!!dangling,hauling:!!hauling})),host:r.host};}
const api={W,H,PW,PH,levels,init,tick,snapshot,constrainRopes,obstacles,solidsFor,scoring};if(typeof module!=='undefined')module.exports=api;else window.ElfEngine=api;
})();

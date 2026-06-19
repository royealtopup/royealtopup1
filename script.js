// ===== CURSOR =====
const cursorDot=document.getElementById('cursor-dot');
const cursorRing=document.getElementById('cursor-ring');
const mouseGlow=document.getElementById('mouse-glow');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursorDot.style.left=mx+'px';cursorDot.style.top=my+'px';
  mouseGlow.style.left=mx+'px';mouseGlow.style.top=my+'px';
});
(function animRing(){
  rx+=(mx-rx)*0.1;ry+=(my-ry)*0.1;
  cursorRing.style.left=rx+'px';cursorRing.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();

// ===== PARTICLE CANVAS =====
const canvas=document.getElementById('particleCanvas');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth;canvas.height=window.innerHeight;
window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
const particles=[];
const pColors=['rgba(180,79,255,','rgba(255,34,68,','rgba(0,229,255,','rgba(245,166,35,'];
for(let i=0;i<60;i++){
  particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+.5,c:pColors[Math.floor(Math.random()*pColors.length)],o:Math.random()*.5+.1});
}
function animParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
    if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=p.c+p.o+')';ctx.fill();
  });
  // Connect nearby particles
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<100){
        ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);
        ctx.strokeStyle='rgba(180,79,255,'+(0.06*(1-dist/100))+')';ctx.lineWidth=.5;ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animParticles);
}
animParticles();

// ===== SCROLL REVEAL =====
const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');}});
},{threshold:0.1});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>revealObserver.observe(el));

// ===== STATE =====
let state={
  isLoggedIn:false,
  user:{name:'',email:'',wallet:0},
  currentRecharge:'uid',
  selectedPkg:null,selectedPayment:null,selectedInstant:null,
  orders:[],adminLoggedIn:false
};

const PACKAGES={
  uid:[
    {id:1,icon:'💎',amount:'5+1',label:'5 Diamonds',price:10,bonus:'+1 Bonus'},
    {id:2,icon:'💎',amount:'11',label:'11 Diamonds',price:18,bonus:''},
    {id:3,icon:'💎',amount:'28',label:'28 Diamonds',price:45,bonus:''},
    {id:4,icon:'💎',amount:'56+6',label:'56 Diamonds',price:90,bonus:'+6 Bonus'},
    {id:5,icon:'💎',amount:'112',label:'112 Diamonds',price:180,bonus:''},
    {id:6,icon:'💎',amount:'225',label:'225 Diamonds',price:350,bonus:''},
    {id:7,icon:'💎',amount:'520+52',label:'520 Diamonds',price:800,bonus:'+52 Bonus'},
    {id:8,icon:'💎',amount:'1060',label:'1060 Diamonds',price:1600,bonus:'+108 Bonus'},
    {id:9,icon:'💎',amount:'2180',label:'2180 Diamonds',price:3200,bonus:'+218 Bonus'},
  ],
  weekly:[
    {id:10,icon:'🗓️',amount:'Weekly',label:'Weekly Pass',price:150,bonus:'150 Diamonds/7Days'},
    {id:11,icon:'📅',amount:'Monthly',label:'Monthly Membership',price:500,bonus:'500 Diamonds/30Days'},
    {id:12,icon:'⭐',amount:'LevelMax',label:'Level Max Pass',price:350,bonus:'Unlock All Tiers'},
  ],
  evo:[
    {id:13,icon:'🔫',amount:'Evo',label:'Evolution Gun Pass',price:999,bonus:'Exclusive Skin'},
    {id:14,icon:'🎖️',amount:'Phantom',label:'Phantom Evo Skin',price:1999,bonus:'Ultra Rare'},
    {id:15,icon:'⚔️',amount:'Elite',label:'Elite Evolution',price:2999,bonus:'Premium Bundle'},
  ],
  levelup:[
    {id:16,icon:'🏆',amount:'LevelUp',label:'Level Up Pass',price:270,bonus:'40+ Rewards'},
    {id:17,icon:'🥇',amount:'Elite',label:'Elite Season Pass',price:450,bonus:'60+ Rewards'},
    {id:18,icon:'👑',amount:'Royal',label:'Royal Battle Pass',price:650,bonus:'100+ Rewards'},
  ]
};

const RECHARGE_TITLES={uid:'UID Diamond Top Up',weekly:'Weekly & Monthly Pass',evo:'Evo Access UID',levelup:'Level Up Pass'};
// Admin-controlled payment numbers
let PAYMENT_NUMBERS={bkash:'01612830674',nagad:'01612830674',rocket:'01612830674',upay:'01612830674'};

// ===== ADMIN DB (localStorage) =====
let DB={users:[],orders:[],pendingPayments:[],settings:{telegram:'https://t.me/EagleTopUp',whatsapp:'01612830674',email:'support@eagletopup.com',gplay:''}};
function loadDB(){const d=localStorage.getItem('eagle_db');if(d)DB=JSON.parse(d);}
function saveDB(){localStorage.setItem('eagle_db',JSON.stringify(DB));}

// ===== INIT =====
window.onload=function(){
  loadDB();
  generateParticles();
  startSlider();
  // Load payment numbers from DB settings if set
  if(DB.settings.payNums) PAYMENT_NUMBERS=DB.settings.payNums;
  const saved=localStorage.getItem('eagle_user');
  if(saved){
    state.user=JSON.parse(saved);
    // Reload wallet from DB
    const u=DB.users.find(u=>u.email===state.user.email);
    if(u) state.user.wallet=u.wallet;
    state.isLoggedIn=true;
    setTimeout(()=>initMainSite(),1800);
  } else {
    setTimeout(()=>{document.getElementById('pageLoader').classList.add('hide');showLoginPage();},1800);
  }
};

function generateParticles(){
  const c=document.getElementById('loginParticles');
  const cols=['#b44fff','#ff2244','#00e5ff','#9b59ff','#00ff88'];
  for(let i=0;i<35;i++){
    const s=document.createElement('span');
    const sz=Math.random()*7+3;
    s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;background:${cols[Math.floor(Math.random()*cols.length)]};opacity:.5;animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s;`;
    c.appendChild(s);
  }
}

// ===== AUTH =====
function showLoginPage(){document.getElementById('login-page').style.display='flex';document.getElementById('main-site').classList.remove('active');document.getElementById('admin-page').classList.remove('flex');}
function showRegister(){document.getElementById('login-form-wrap').style.display='none';document.getElementById('register-form-wrap').style.display='block';}
function showLogin(){document.getElementById('login-form-wrap').style.display='block';document.getElementById('register-form-wrap').style.display='none';}

function doLogin(){
  const e=document.getElementById('loginEmail').value.trim();
  const p=document.getElementById('loginPass').value;
  if(!e||!p){toast('Please fill in all fields','error');return;}
  // Check if blocked
  const existing=DB.users.find(u=>u.email===e);
  if(existing&&existing.blocked){toast('Your account has been blocked. Contact support.','error');return;}
  const name=e.split('@')[0].replace(/\./g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const wallet=existing?existing.wallet:0;
  if(!existing){
    DB.users.push({email:e,name,wallet:0,orders:0,joined:new Date().toLocaleDateString('en-GB'),blocked:false});
    saveDB();
  }
  state.user={name,email:e,wallet};
  state.isLoggedIn=true;
  localStorage.setItem('eagle_user',JSON.stringify(state.user));
  initMainSite();
  toast('Welcome back, '+name+'! 🎮','success');
}

function googleLogin(){
  const e='google_'+Date.now()+'@gmail.com';
  const name='Google Gamer';
  DB.users.push({email:e,name,wallet:0,orders:0,joined:new Date().toLocaleDateString('en-GB'),blocked:false});
  saveDB();
  state.user={name,email:e,wallet:0};
  state.isLoggedIn=true;
  localStorage.setItem('eagle_user',JSON.stringify(state.user));
  initMainSite();
  toast('Welcome, Google Gamer! 🎮','success');
}

function doRegister(){
  const n=document.getElementById('regName').value.trim();
  const e=document.getElementById('regEmail').value.trim();
  const p=document.getElementById('regPass').value;
  if(!n||!e||!p){toast('Please fill all fields','error');return;}
  if(DB.users.find(u=>u.email===e)){toast('Email already registered!','error');return;}
  DB.users.push({email:e,name:n,wallet:0,orders:0,joined:new Date().toLocaleDateString('en-GB'),blocked:false});
  saveDB();
  state.user={name:n,email:e,wallet:0};
  state.isLoggedIn=true;
  localStorage.setItem('eagle_user',JSON.stringify(state.user));
  initMainSite();
  toast('Account created! Welcome '+n+' 🎮','success');
}

function initMainSite(){
  document.getElementById('pageLoader').classList.add('hide');
  document.getElementById('login-page').style.display='none';
  document.getElementById('admin-page').classList.remove('flex');
  document.getElementById('main-site').classList.add('active');
  updateWalletUI();
  document.getElementById('panelUserName').textContent=state.user.name;
  document.getElementById('panelUserEmail').textContent=state.user.email;
  goHome();
}

function doLogout(){
  state.isLoggedIn=false;
  localStorage.removeItem('eagle_user');
  closePanel();
  document.getElementById('main-site').classList.remove('active');
  showLoginPage();
  toast('Logged out successfully','info');
}

// ===== WALLET =====
function updateWalletUI(){
  const w=(state.user.wallet||0).toFixed(2);
  document.getElementById('headerWalletBal').textContent='৳'+w;
  document.getElementById('panelWalletBal').textContent='৳'+w;
}

function syncWallet(){
  const u=DB.users.find(u=>u.email===state.user.email);
  if(u){u.wallet=state.user.wallet;saveDB();}
  localStorage.setItem('eagle_user',JSON.stringify(state.user));
  updateWalletUI();
}

// ===== NAVIGATION =====
function goHome(){
  ['recharge-page','payment-page','orders-page','addmoney-page'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='none';
  });
  document.getElementById('home-page').style.display='block';
  // Re-observe reveal elements
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>revealObserver.observe(el));
}

function openPage(p){
  ['home-page','recharge-page','payment-page','orders-page','addmoney-page'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='none';
  });
  const t=document.getElementById(p+'-page');
  if(t){t.style.display='block';}
}

// ===== PROFILE =====
function openProfile(tab){
  document.getElementById('profilePanel').classList.add('show');
  if(tab==='orders'){loadOrders();openPage('orders');closePanel();}
}
function closePanel(){document.getElementById('profilePanel').classList.remove('show');}
function closeProfileOnBg(e){if(e.target===document.getElementById('profilePanel'))closePanel();}
function profileNav(tab){
  closePanel();
  if(tab==='orders'){loadOrders();openPage('orders');}
  else if(tab==='addmoney')openPage('addmoney');
  else if(tab==='account')toast('Profile settings coming soon!','info');
  else if(tab==='support')toast('Support: Telegram @EagleTopUp | WhatsApp: 01612830674','info');
}

// ===== SLIDER =====
let slideIdx=0,sliderTimer;
function startSlider(){sliderTimer=setInterval(nextSlide,4500);}
function updateSlider(){
  document.getElementById('sliderTrack').style.transform=`translateX(-${slideIdx*100}%)`;
  document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===slideIdx));
}
function goSlide(i){slideIdx=i;updateSlider();clearInterval(sliderTimer);startSlider();}
function prevSlide(){slideIdx=(slideIdx-1+4)%4;updateSlider();clearInterval(sliderTimer);startSlider();}
function nextSlide(){slideIdx=(slideIdx+1)%4;updateSlider();clearInterval(sliderTimer);startSlider();}

// ===== RECHARGE =====
function openRecharge(type){
  state.currentRecharge=type;state.selectedPkg=null;state.selectedPayment=null;state.selectedInstant=null;
  document.getElementById('rechargeTitleText').textContent=RECHARGE_TITLES[type];
  renderPackages(type);
  document.getElementById('orderSummary').style.display='none';
  document.getElementById('playerInfoBox').classList.remove('show');
  document.getElementById('playerUID').value='';
  document.getElementById('instantOptions').classList.remove('show');
  document.querySelectorAll('.pm-option').forEach(e=>e.classList.remove('selected'));
  document.querySelectorAll('.ipm-btn').forEach(b=>b.classList.remove('selected'));
  openPage('recharge');
}

function renderPackages(type){
  const g=document.getElementById('packagesGrid');g.innerHTML='';
  PACKAGES[type].forEach(pkg=>{
    const d=document.createElement('div');
    d.className='pkg-card';d.id='pkg-'+pkg.id;
    d.innerHTML=`<div class="pkg-icon">${pkg.icon}</div><div class="pkg-amount">${pkg.amount}</div><div class="pkg-label">${pkg.label}</div><div class="pkg-price">৳${pkg.price}</div>${pkg.bonus?`<div class="pkg-bonus">${pkg.bonus}</div>`:''}`;
    d.onclick=()=>selectPkg(pkg);
    g.appendChild(d);
  });
}

function selectPkg(pkg){
  state.selectedPkg=pkg;
  document.querySelectorAll('.pkg-card').forEach(c=>c.classList.remove('selected'));
  const el=document.getElementById('pkg-'+pkg.id);
  if(el)el.classList.add('selected');
  updateSummary();
}

function selectPayment(type){
  state.selectedPayment=type;
  document.getElementById('pmWallet').classList.toggle('selected',type==='wallet');
  document.getElementById('pmInstant').classList.toggle('selected',type==='instant');
  const io=document.getElementById('instantOptions');
  if(type==='instant')io.classList.add('show');
  else{io.classList.remove('show');state.selectedInstant=null;}
  updateSummary();
}

function selectInstant(method,btn){
  state.selectedInstant=method;
  document.querySelectorAll('.ipm-btn').forEach(b=>b.classList.remove('selected'));
  if(btn)btn.classList.add('selected');
  updateSummary();
}

function updateSummary(){
  if(!state.selectedPkg)return;
  document.getElementById('orderSummary').style.display='block';
  document.getElementById('summPkg').textContent=state.selectedPkg.label+' ('+state.selectedPkg.amount+')';
  document.getElementById('summBonus').textContent=state.selectedPkg.bonus||'—';
  const m=state.selectedInstant?(state.selectedInstant.charAt(0).toUpperCase()+state.selectedInstant.slice(1)):(state.selectedPayment==='wallet'?'Wallet':'—');
  document.getElementById('summMethod').textContent=m;
  document.getElementById('summTotal').textContent='৳'+state.selectedPkg.price;
}

function verifyUID(){
  const uid=document.getElementById('playerUID').value.trim();
  if(!uid||uid.length<5){toast('Enter a valid UID (5+ digits)','error');return;}
  const names=['DragonSlayer','FirePhoenix','StealthPro','BattleKing','ShadowHunter'];
  const regions=['Bangladesh','India','SEA','Global','MENA'];
  document.getElementById('playerName').textContent=names[Math.floor(Math.random()*names.length)]+'_FF';
  document.getElementById('playerRegion').textContent='Region: '+regions[Math.floor(Math.random()*regions.length)];
  document.getElementById('playerInfoBox').classList.add('show');
  toast('Player verified! ✅','success');
}

function proceedBuy(){
  if(!state.selectedPkg){toast('Please select a package first!','error');return;}
  const uid=document.getElementById('playerUID').value.trim();
  if(!uid){toast('Please enter your UID','error');return;}
  if(!state.selectedPayment){toast('Please select a payment method','error');return;}
  if(state.selectedPayment==='wallet'){
    if(state.user.wallet<state.selectedPkg.price){toast('Insufficient wallet balance! Add money first.','error');return;}
    state.user.wallet-=state.selectedPkg.price;
    syncWallet();
    const order={id:'#'+Date.now(),pkg:state.selectedPkg,uid,method:'Wallet',status:'Success',date:new Date().toLocaleString(),amount:state.selectedPkg.price};
    addOrder(order);
    showSuccessModal('Purchase Successful! 🎮','Your '+state.selectedPkg.label+' has been delivered to UID: '+uid+' 🎉');
  } else if(state.selectedPayment==='instant'){
    if(!state.selectedInstant){toast('Please select a payment provider','error');return;}
    openPaymentPage(state.selectedInstant);
  }
}

function openPaymentPage(method){
  const labels={bkash:'bKash',nagad:'Nagad',rocket:'Rocket DBBL',upay:'Upay'};
  document.getElementById('payMethodLabel').textContent='Payment via '+labels[method];
  document.getElementById('payMethodName').textContent=labels[method];
  document.getElementById('payAmountInstruct').textContent='৳'+(state.selectedPkg?.price||0);
  document.getElementById('receiverNumber').textContent=PAYMENT_NUMBERS[method]||'01612830674';
  document.getElementById('payAmountInput').value='';
  document.getElementById('txnIdInput').value='';
  openPage('payment');
}

function copyNumber(){
  const n=document.getElementById('receiverNumber').textContent;
  navigator.clipboard.writeText(n).then(()=>toast('Number copied! 📋','success')).catch(()=>toast(n,'info'));
}

function copyAMNumber(){
  const n=document.getElementById('amReceiverNum').textContent;
  navigator.clipboard.writeText(n).then(()=>toast('Number copied! 📋','success')).catch(()=>toast(n,'info'));
}

function submitPayment(){
  const amt=parseFloat(document.getElementById('payAmountInput').value);
  const txn=document.getElementById('txnIdInput').value.trim();
  if(!amt||amt<1){toast('Please enter the amount','error');return;}
  if(!txn||txn.length<4){toast('Please enter a valid Transaction ID','error');return;}
  const order={id:'#'+Date.now(),pkg:state.selectedPkg,uid:document.getElementById('playerUID').value||'N/A',method:state.selectedInstant,txn,status:'Pending',date:new Date().toLocaleString(),amount:amt,userEmail:state.user.email};
  addOrder(order);
  // Push to admin pending
  DB.pendingPayments.push({...order,userName:state.user.name,type:'purchase'});
  saveDB();
  showSuccessModal('Transaction Submitted! ✅','Your payment of ৳'+amt+' is under review. Diamonds will be delivered within 5–15 minutes.\nTXN: '+txn);
}

// ===== ADD MONEY =====
let addMoneyMethod=null;
function selectAddMoneyMethod(m,btn){
  addMoneyMethod=m;
  document.querySelectorAll('#addmoney-page .ipm-btn').forEach(b=>b.classList.remove('selected'));
  if(btn)btn.classList.add('selected');
  document.getElementById('amReceiverNum').textContent=PAYMENT_NUMBERS[m]||'01612830674';
  document.getElementById('addMoneyPaySection').style.display='block';
}

function submitAddMoney(){
  const amt=parseFloat(document.getElementById('addMoneyAmt').value);
  const txn=document.getElementById('amTxnId').value.trim();
  if(!addMoneyMethod){toast('Please select a payment method','error');return;}
  if(!amt||amt<50){toast('Minimum deposit is ৳50','error');return;}
  if(!txn||txn.length<4){toast('Please enter a valid Transaction ID','error');return;}
  DB.pendingPayments.push({id:'#AM'+Date.now(),userEmail:state.user.email,userName:state.user.name,method:addMoneyMethod,amount:amt,txn,status:'Pending',date:new Date().toLocaleString(),type:'add_money'});
  saveDB();
  showSuccessModal('Add Money Submitted! 💎','Your deposit of ৳'+amt+' is under review. Balance will be added within 5–15 minutes.\nTXN: '+txn);
}

// ===== ORDERS =====
function addOrder(order){
  state.orders.unshift(order);
  localStorage.setItem('eagle_orders_'+state.user.email,JSON.stringify(state.orders));
  // Sync to DB
  DB.orders.unshift({...order,userEmail:state.user.email,userName:state.user.name});
  const u=DB.users.find(u=>u.email===state.user.email);
  if(u)u.orders=(u.orders||0)+1;
  saveDB();
}

function loadOrders(){
  const saved=localStorage.getItem('eagle_orders_'+state.user.email);
  state.orders=saved?JSON.parse(saved):[];
  const list=document.getElementById('ordersList');
  if(!list)return;
  if(!state.orders.length){
    list.innerHTML='<li style="text-align:center;padding:60px 20px;color:var(--text-muted);"><div style="font-size:50px;margin-bottom:16px;">📦</div><div>No orders yet. Start recharging!</div></li>';
    return;
  }
  list.innerHTML=state.orders.map(o=>`
    <li class="order-item">
      <div class="order-info">
        <h4>${o.pkg?.label||'Order'} ${o.pkg?.amount?'('+o.pkg.amount+')':''}</h4>
        <p>UID: ${o.uid||'N/A'} &nbsp;•&nbsp; ${o.date||''} &nbsp;•&nbsp; via ${o.method||''}</p>
      </div>
      <div style="text-align:right;">
        <div class="order-amount">৳${o.pkg?.price||o.amount||0}</div>
        <div class="${o.status==='Success'?'s-success':'s-pending'}" style="margin-top:5px;">${o.status==='Success'?'✅ Completed':'⏳ Pending'}</div>
      </div>
    </li>`).join('');
}

// ===== ADMIN =====
function showAdminLogin(){document.getElementById('adminLoginModal').classList.add('show');}

function doAdminLogin(){
  const u=document.getElementById('adminUser').value.trim();
  const p=document.getElementById('adminPass').value;
  // Load custom password from DB
  const adminPass=DB.settings.adminPass||'admin123';
  const adminUser=DB.settings.adminUser||'admin';
  if(u===adminUser&&p===adminPass){
    state.adminLoggedIn=true;
    closeModal('adminLoginModal');
    document.getElementById('main-site').classList.remove('active');
    document.getElementById('login-page').style.display='none';
    document.getElementById('admin-page').classList.add('flex');
    document.getElementById('adminSessionInfo').textContent='Logged in as '+u;
    adminTab('dashboard',document.querySelector('.admin-nav-item'));
    toast('Admin panel accessed! 🔐','success');
  } else {
    toast('Invalid credentials!','error');
    document.getElementById('adminPass').value='';
  }
}

function exitAdmin(){
  state.adminLoggedIn=false;
  document.getElementById('admin-page').classList.remove('flex');
  if(state.isLoggedIn)initMainSite();
  else showLoginPage();
  toast('Exited admin panel','info');
}

function adminTab(tab,el){
  document.querySelectorAll('.admin-nav-item').forEach(n=>n.classList.remove('active'));
  if(el)el.classList.add('active');
  loadDB();
  const main=document.getElementById('adminMain');
  main.innerHTML='<div style="display:flex;align-items:center;justify-content:center;padding:60px;"><div class="spinner" style="width:40px;height:40px;border-width:3px;"></div></div>';
  setTimeout(()=>{
    const renders={dashboard:renderAdminDashboard,orders:renderAdminOrders,users:renderAdminUsers,packages:renderAdminPackages,banners:renderAdminBanners,payments:renderAdminPayments,settings:renderAdminSettings};
    if(renders[tab])main.innerHTML=renders[tab]();
  },300);
}

function renderAdminDashboard(){
  const totalRevenue=DB.orders.filter(o=>o.status==='Success').reduce((s,o)=>s+(o.amount||o.pkg?.price||0),0);
  const totalPending=DB.pendingPayments.filter(p=>p.status==='Pending').length;
  return `<div class="admin-section-title">📊 Dashboard</div>
  <div class="admin-stats-grid">
    <div class="admin-stat-card"><div class="admin-stat-icon">💰</div><div class="admin-stat-label">Total Revenue</div><div class="admin-stat-value">৳${totalRevenue.toFixed(0)}</div><div class="admin-stat-change" style="color:var(--neon-green);">↑ All time</div></div>
    <div class="admin-stat-card"><div class="admin-stat-icon">👥</div><div class="admin-stat-label">Registered Users</div><div class="admin-stat-value">${DB.users.length}</div><div class="admin-stat-change" style="color:var(--neon-green);">↑ Total accounts</div></div>
    <div class="admin-stat-card"><div class="admin-stat-icon">📦</div><div class="admin-stat-label">Total Orders</div><div class="admin-stat-value">${DB.orders.length}</div><div class="admin-stat-change" style="color:var(--neon-cyan);">All transactions</div></div>
    <div class="admin-stat-card"><div class="admin-stat-icon">⏳</div><div class="admin-stat-label">Pending Requests</div><div class="admin-stat-value">${totalPending}</div><div class="admin-stat-change" style="color:${totalPending>0?'var(--neon-gold)':'var(--neon-green)'};">${totalPending>0?'⚠ Needs attention':'✓ All clear'}</div></div>
  </div>
  <div class="admin-card"><h3>Recent Orders (Live)</h3>
    <table class="admin-table"><thead><tr><th>User</th><th>Package</th><th>UID</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>${DB.orders.slice(0,10).map(o=>`<tr><td>${o.userName||o.userEmail||'—'}</td><td>${o.pkg?.label||'—'}</td><td>${o.uid||'—'}</td><td>${o.method||'—'}</td><td style="color:var(--neon-purple);font-family:'Orbitron',monospace;font-size:11px;">৳${o.pkg?.price||o.amount||0}</td><td><span class="status-pill ${o.status==='Success'?'s-success-pill':'s-pending-pill'}">${o.status}</span></td><td style="font-size:11px;">${o.date||'—'}</td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">No orders yet</td></tr>'}</tbody></table></div>`;
}

function renderAdminOrders(){
  return `<div class="admin-section-title">🛒 Order Management</div>
  <div class="admin-card"><h3>All Orders (${DB.orders.length})</h3>
    <table class="admin-table"><thead><tr><th>Order ID</th><th>User</th><th>Package</th><th>UID</th><th>TXN</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>${DB.orders.map(o=>`<tr><td style="font-family:'Orbitron',monospace;font-size:10px;">${o.id||'—'}</td><td>${o.userName||o.userEmail||'—'}</td><td>${o.pkg?.label||'—'}</td><td>${o.uid||'—'}</td><td style="font-size:10px;">${o.txn||'Wallet'}</td><td style="color:var(--neon-purple);">৳${o.pkg?.price||o.amount||0}</td><td><span class="status-pill ${o.status==='Success'?'s-success-pill':'s-pending-pill'}">${o.status}</span></td><td style="font-size:10px;">${o.date||'—'}</td></tr>`).join('')||'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">No orders yet</td></tr>'}</tbody></table></div>`;
}

function renderAdminUsers(){
  return `<div class="admin-section-title">👥 User Management</div>
  <div class="admin-card"><h3>Registered Users (${DB.users.length})</h3>
    <table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Wallet Balance</th><th>Orders</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${DB.users.map((u,i)=>`
    <tr>
      <td><strong>${u.name}</strong></td>
      <td style="font-size:12px;">${u.email}</td>
      <td>
        <div class="wallet-edit-box">
          <span id="walDisp-${i}" style="font-family:'Orbitron',monospace;font-size:13px;color:var(--neon-purple);">৳${(u.wallet||0).toFixed(2)}</span>
          <input class="wallet-edit-input" id="walInput-${i}" type="number" value="${u.wallet||0}" style="display:none;">
          <button class="tbl-btn tbl-blue" onclick="toggleWalletEdit(${i})" id="walEditBtn-${i}">Edit</button>
          <button class="tbl-btn tbl-green" onclick="addWallet(${i},100)" title="Quick +৳100">+100</button>
          <button class="tbl-btn tbl-red" onclick="deductWallet(${i})" title="Deduct amount">Deduct</button>
        </div>
      </td>
      <td>${u.orders||0}</td>
      <td>${u.joined||'—'}</td>
      <td><span class="status-pill ${u.blocked?'s-blocked-pill':'s-success-pill'}">${u.blocked?'Blocked':'Active'}</span></td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="tbl-btn tbl-${u.blocked?'green':'red'}" onclick="toggleBlock(${i})">${u.blocked?'Unblock':'Block'}</button>
          <button class="tbl-btn tbl-purple" onclick="viewUser(${i})">View</button>
        </div>
      </td>
    </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">No users registered yet</td></tr>'}</tbody></table></div>`;
}

function toggleWalletEdit(i){
  const disp=document.getElementById('walDisp-'+i);
  const inp=document.getElementById('walInput-'+i);
  const btn=document.getElementById('walEditBtn-'+i);
  if(inp.style.display==='none'){
    inp.style.display='block';disp.style.display='none';btn.textContent='Save';btn.className='tbl-btn tbl-green';
  } else {
    const newVal=parseFloat(inp.value)||0;
    DB.users[i].wallet=newVal;
    // Sync if current user
    if(DB.users[i].email===state.user?.email){state.user.wallet=newVal;updateWalletUI();}
    saveDB();
    disp.textContent='৳'+newVal.toFixed(2);
    disp.style.display='block';inp.style.display='none';btn.textContent='Edit';btn.className='tbl-btn tbl-blue';
    toast('Wallet updated to ৳'+newVal.toFixed(2),'success');
  }
}

function addWallet(i,amount){
  DB.users[i].wallet=(DB.users[i].wallet||0)+amount;
  if(DB.users[i].email===state.user?.email){state.user.wallet=DB.users[i].wallet;updateWalletUI();}
  saveDB();
  toast('+৳'+amount+' added to '+DB.users[i].name,'success');
  adminTab('users',null);
}

function deductWallet(i){
  const amt=parseFloat(prompt('Enter amount to deduct from '+DB.users[i].name+' (current: ৳'+DB.users[i].wallet+'):'));
  if(!amt||amt<=0)return;
  if(amt>DB.users[i].wallet){toast('Insufficient balance!','error');return;}
  DB.users[i].wallet-=amt;
  if(DB.users[i].email===state.user?.email){state.user.wallet=DB.users[i].wallet;updateWalletUI();}
  saveDB();
  toast('৳'+amt+' deducted from '+DB.users[i].name,'success');
  adminTab('users',null);
}

function toggleBlock(i){
  DB.users[i].blocked=!DB.users[i].blocked;
  saveDB();
  toast(DB.users[i].name+(DB.users[i].blocked?' blocked':' unblocked'),'info');
  adminTab('users',null);
}

function viewUser(i){
  const u=DB.users[i];
  const userOrders=DB.orders.filter(o=>o.userEmail===u.email);
  alert(`User: ${u.name}\nEmail: ${u.email}\nWallet: ৳${(u.wallet||0).toFixed(2)}\nOrders: ${u.orders||0}\nJoined: ${u.joined||'—'}\nStatus: ${u.blocked?'Blocked':'Active'}\nTotal Orders in DB: ${userOrders.length}`);
}

function renderAdminPackages(){
  return `<div class="admin-section-title">📦 Package Management</div>
  <div class="admin-card"><h3>Add New Package</h3>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Package Name</label><input class="admin-input" placeholder="e.g. 520 Diamonds" id="newPkgName"></div>
      <div><label class="admin-form-label">Diamond Amount</label><input class="admin-input" placeholder="e.g. 520+52" id="newPkgAmount"></div>
      <div><label class="admin-form-label">Price (৳)</label><input class="admin-input" type="number" placeholder="800" id="newPkgPrice"></div>
    </div>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Bonus Text</label><input class="admin-input" placeholder="+52 Bonus" id="newPkgBonus"></div>
      <div><label class="admin-form-label">Icon (emoji)</label><input class="admin-input" placeholder="💎" id="newPkgIcon"></div>
      <div><label class="admin-form-label">Category</label><select class="admin-input" id="newPkgCat"><option value="uid">UID Diamonds</option><option value="weekly">Weekly/Monthly</option><option value="evo">EVO Access</option><option value="levelup">Level Up Pass</option></select></div>
    </div>
    <button class="btn-admin" onclick="addAdminPackage()">+ Add Package</button>
  </div>
  <div class="admin-card"><h3>UID Packages (${PACKAGES.uid.length})</h3>
    <table class="admin-table"><thead><tr><th>Name</th><th>Amount</th><th>Price</th><th>Bonus</th><th>Action</th></tr></thead>
    <tbody>${PACKAGES.uid.map((p,i)=>`<tr><td>${p.label}</td><td>${p.amount}</td><td style="color:var(--neon-purple);">৳${p.price}</td><td style="color:var(--neon-green);">${p.bonus||'—'}</td><td><button class="tbl-btn tbl-red" onclick="deletePackage('uid',${i})">Delete</button></td></tr>`).join('')}</tbody></table></div>
  <div class="admin-card"><h3>Weekly/Monthly Packages</h3>
    <table class="admin-table"><thead><tr><th>Name</th><th>Price</th><th>Bonus</th><th>Action</th></tr></thead>
    <tbody>${PACKAGES.weekly.map((p,i)=>`<tr><td>${p.label}</td><td style="color:var(--neon-purple);">৳${p.price}</td><td style="color:var(--neon-green);">${p.bonus||'—'}</td><td><button class="tbl-btn tbl-red" onclick="deletePackage('weekly',${i})">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}

function addAdminPackage(){
  const n=document.getElementById('newPkgName').value.trim();
  const amt=document.getElementById('newPkgAmount').value.trim();
  const p=parseFloat(document.getElementById('newPkgPrice').value);
  const b=document.getElementById('newPkgBonus').value.trim();
  const icon=document.getElementById('newPkgIcon').value.trim()||'💎';
  const cat=document.getElementById('newPkgCat').value;
  if(!n||!p){toast('Fill name and price!','error');return;}
  PACKAGES[cat].push({id:Date.now(),icon,amount:amt||n,label:n,price:p,bonus:b});
  toast('Package "'+n+'" added!','success');
  document.getElementById('newPkgName').value='';document.getElementById('newPkgPrice').value='';document.getElementById('newPkgBonus').value='';
  adminTab('packages',null);
}

function deletePackage(cat,i){
  if(!confirm('Delete package "'+PACKAGES[cat][i].label+'"?'))return;
  PACKAGES[cat].splice(i,1);
  toast('Package deleted','info');
  adminTab('packages',null);
}

function renderAdminBanners(){
  return `<div class="admin-section-title">🖼️ Banner Management</div>
  <div class="admin-card"><h3>Add New Banner</h3>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Banner Title</label><input class="admin-input" placeholder="e.g. Diamond Blast Offer" id="bannerTitle"></div>
      <div><label class="admin-form-label">Tag Text</label><input class="admin-input" placeholder="HOT DEAL" id="bannerTag"></div>
    </div>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Description</label><input class="admin-input" placeholder="Banner description..." id="bannerDesc"></div>
      <div><label class="admin-form-label">Links To</label><select class="admin-input" id="bannerLink"><option value="uid">UID Diamonds</option><option value="weekly">Weekly Pass</option><option value="evo">EVO Access</option><option value="levelup">Level Up</option></select></div>
    </div>
    <button class="btn-admin" onclick="addBanner()">+ Add Banner</button>
  </div>
  <div class="admin-card"><h3>Active Banners (4)</h3>
    ${['💎 Diamond Top Up Blast → UID','📅 Weekly Pass Discount → Weekly','🔫 Evo Gun Access → EVO','🏆 Level Up Pass Event → LevelUp'].map((b,i)=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border-card);">
      <div><span style="color:var(--neon-purple);font-weight:700;">Banner ${i+1}:</span> ${b}</div>
      <div style="display:flex;gap:8px;">
        <button class="tbl-btn tbl-blue" onclick="toast('Edit mode – coming soon','info')">Edit</button>
        <button class="tbl-btn tbl-red" onclick="toast('Banner deleted','error')">Delete</button>
      </div>
    </div>`).join('')}
  </div>`;
}

function addBanner(){
  const t=document.getElementById('bannerTitle').value.trim();
  if(!t){toast('Enter banner title!','error');return;}
  toast('Banner "'+t+'" added!','success');
  document.getElementById('bannerTitle').value='';
}

function renderAdminPayments(){
  const pending=DB.pendingPayments.filter(p=>p.status==='Pending');
  return `<div class="admin-section-title">💳 Payments & Requests</div>
  <div class="admin-card"><h3>Payment Numbers (all methods use same number)</h3>
    <div class="admin-form-row">
      <div><label class="admin-form-label">bKash Number</label><input class="admin-input" value="${PAYMENT_NUMBERS.bkash}" id="numBkash"></div>
      <div><label class="admin-form-label">Nagad Number</label><input class="admin-input" value="${PAYMENT_NUMBERS.nagad}" id="numNagad"></div>
    </div>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Rocket Number</label><input class="admin-input" value="${PAYMENT_NUMBERS.rocket}" id="numRocket"></div>
      <div><label class="admin-form-label">Upay Number</label><input class="admin-input" value="${PAYMENT_NUMBERS.upay}" id="numUpay"></div>
    </div>
    <button class="btn-admin" onclick="savePaymentNumbers()">💾 Save Numbers</button>
  </div>
  <div class="admin-card"><h3>Pending Payment Requests (${pending.length})</h3>
    ${pending.length===0?'<p style="color:var(--text-muted);padding:20px 0;">No pending requests ✓</p>':
    `<table class="admin-table"><thead><tr><th>Type</th><th>User</th><th>Method</th><th>Amount</th><th>TXN ID</th><th>Date</th><th>Action</th></tr></thead>
    <tbody>${DB.pendingPayments.map((r,i)=>r.status==='Pending'?`
    <tr>
      <td><span class="status-pill ${r.type==='add_money'?'s-success-pill':'s-pending-pill'}">${r.type==='add_money'?'Add Money':'Purchase'}</span></td>
      <td>${r.userName||r.userEmail||'—'}</td>
      <td>${r.method||'—'}</td>
      <td style="color:var(--neon-purple);font-weight:700;">৳${r.amount||0}</td>
      <td style="font-family:'Orbitron',monospace;font-size:10px;">${r.txn||'—'}</td>
      <td style="font-size:11px;">${r.date||'—'}</td>
      <td><div style="display:flex;gap:6px;">
        <button class="tbl-btn tbl-green" onclick="approveRequest(${i})">✓ Approve</button>
        <button class="tbl-btn tbl-red" onclick="rejectRequest(${i})">✗ Reject</button>
      </div></td>
    </tr>`:'').join('')}
    </tbody></table>`}
  </div>
  <div class="admin-card"><h3>Completed Requests</h3>
    <table class="admin-table"><thead><tr><th>Type</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>${DB.pendingPayments.filter(p=>p.status!=='Pending').map(r=>`<tr><td>${r.type==='add_money'?'Add Money':'Purchase'}</td><td>${r.userName||r.userEmail||'—'}</td><td style="color:var(--neon-purple);">৳${r.amount||0}</td><td><span class="status-pill ${r.status==='Approved'?'s-success-pill':'s-blocked-pill'}">${r.status}</span></td><td style="font-size:11px;">${r.date||'—'}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">No completed requests yet</td></tr>'}</tbody></table>
  </div>`;
}

function savePaymentNumbers(){
  PAYMENT_NUMBERS.bkash=document.getElementById('numBkash').value.trim();
  PAYMENT_NUMBERS.nagad=document.getElementById('numNagad').value.trim();
  PAYMENT_NUMBERS.rocket=document.getElementById('numRocket').value.trim();
  PAYMENT_NUMBERS.upay=document.getElementById('numUpay').value.trim();
  DB.settings.payNums=PAYMENT_NUMBERS;saveDB();
  toast('Payment numbers saved! ✅','success');
}

function approveRequest(i){
  const r=DB.pendingPayments[i];
  if(!r||r.status!=='Pending')return;
  r.status='Approved';
  if(r.type==='add_money'){
    const u=DB.users.find(u=>u.email===r.userEmail);
    if(u){u.wallet=(u.wallet||0)+parseFloat(r.amount||0);if(r.userEmail===state.user?.email){state.user.wallet=u.wallet;updateWalletUI();}}
    toast('৳'+r.amount+' added to '+r.userName+'\'s wallet!','success');
  } else {
    const ord=DB.orders.find(o=>o.txn===r.txn);
    if(ord)ord.status='Success';
    toast('Order approved for '+r.userName,'success');
  }
  saveDB();adminTab('payments',null);
}

function rejectRequest(i){
  if(!confirm('Reject this request?'))return;
  DB.pendingPayments[i].status='Rejected';saveDB();
  toast('Request rejected','error');adminTab('payments',null);
}

function renderAdminSettings(){
  return `<div class="admin-section-title">⚙️ Settings</div>
  <div class="admin-card"><h3>Site & Contact Settings</h3>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Telegram Link</label><input class="admin-input" value="${DB.settings.telegram||'https://t.me/EagleTopUp'}" id="setTg"></div>
      <div><label class="admin-form-label">WhatsApp Number</label><input class="admin-input" value="${DB.settings.whatsapp||'01612830674'}" id="setWa"></div>
    </div>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Support Email</label><input class="admin-input" value="${DB.settings.email||'support@eagletopup.com'}" id="setEmail"></div>
      <div><label class="admin-form-label">Google Play Link</label><input class="admin-input" value="${DB.settings.gplay||''}" id="setGplay" placeholder="https://play.google.com/..."></div>
    </div>
    <button class="btn-admin" onclick="saveSettings()">💾 Save Settings</button>
  </div>
  <div class="admin-card"><h3>Admin Credentials</h3>
    <div class="admin-form-row">
      <div><label class="admin-form-label">Admin Username</label><input class="admin-input" value="${DB.settings.adminUser||'admin'}" id="setAdminUser"></div>
      <div><label class="admin-form-label">New Password</label><input class="admin-input" type="password" placeholder="Leave blank to keep current" id="setAdminPass"></div>
      <div><label class="admin-form-label">Confirm Password</label><input class="admin-input" type="password" placeholder="Confirm new password" id="setAdminPass2"></div>
    </div>
    <button class="btn-admin" onclick="saveAdminCreds()">🔐 Update Credentials</button>
  </div>
  <div class="admin-card"><h3>Database</h3>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn-admin" onclick="exportDB()">📤 Export Data</button>
      <button class="btn-admin btn-admin-red" onclick="if(confirm('Clear ALL data? This cannot be undone!')){localStorage.clear();DB={users:[],orders:[],pendingPayments:[],settings:{}};saveDB();toast('Database cleared','error');}">🗑 Clear DB</button>
    </div>
    <p style="margin-top:14px;font-size:12px;color:var(--text-muted);">Users: ${DB.users.length} &nbsp;|&nbsp; Orders: ${DB.orders.length} &nbsp;|&nbsp; Payments: ${DB.pendingPayments.length}</p>
  </div>`;
}

function saveSettings(){
  DB.settings.telegram=document.getElementById('setTg').value;
  DB.settings.whatsapp=document.getElementById('setWa').value;
  DB.settings.email=document.getElementById('setEmail').value;
  DB.settings.gplay=document.getElementById('setGplay').value;
  saveDB();toast('Settings saved!','success');
}

function saveAdminCreds(){
  const u=document.getElementById('setAdminUser').value.trim();
  const p=document.getElementById('setAdminPass').value;
  const p2=document.getElementById('setAdminPass2').value;
  if(!u){toast('Username cannot be empty','error');return;}
  if(p&&p!==p2){toast('Passwords do not match!','error');return;}
  DB.settings.adminUser=u;
  if(p)DB.settings.adminPass=p;
  saveDB();toast('Credentials updated!','success');
}

function exportDB(){
  const data=JSON.stringify(DB,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='eagle-db-'+Date.now()+'.json';a.click();
  toast('Database exported!','success');
}

// ===== MODALS =====
function closeModal(id){document.getElementById(id).classList.remove('show');}
function showSuccessModal(title,msg){
  document.getElementById('successTitle').textContent=title;
  document.getElementById('successMsg').textContent=msg;
  document.getElementById('successModal').classList.add('show');
}

// ===== TOAST =====
function toast(msg,type='info'){
  const t=document.createElement('div');
  t.className='toast toast-'+type;
  t.innerHTML=(type==='success'?'✅':type==='error'?'❌':'ℹ️')+' '+msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.classList.add('toast-out');setTimeout(()=>t.remove(),400);},3200);
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
});
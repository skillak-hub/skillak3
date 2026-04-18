/* ═══════════════════════════════════════════════════════════════════
   patch_final.js — Skillak Platform v8.0
   ✅ الشات يعمل أثناء paused (جلسة معلّقة)
   ✅ تقرير الجلسة في الأدمن — يبقى بعد التحويل
   ✅ شاشة تحميل PWA احترافية
   ✅ إصلاح window.CU → let CU
   ✅ لوحة مزدوجة للاثنان (معلم+متعلم)
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ════════════════════════════════════════════════════
   0. وصول آمن للمتغيرات (let scope في script.js)
   ════════════════════════════════════════════════════ */
function _pf_getCU() { try { return typeof CU  !== 'undefined' ? CU  : null; } catch(_){return null;} }
function _pf_getCP() { try { return typeof CP  !== 'undefined' ? CP  : null; } catch(_){return null;} }
function _pf_getDb() { try { return typeof db  !== 'undefined' ? db  : null; } catch(_){return null;} }

/* ════════════════════════════════════════════════════
   1. PWA — شاشة تحميل احترافية
   ════════════════════════════════════════════════════ */

(function _pf_initSplash() {
  /* لا نُظهرها لو كانت الصفحة محمّلة كاملاً بالفعل */
  if (document.readyState === 'complete') return;

  const splash = document.createElement('div');
  splash.id = 'pfSplash';
  splash.innerHTML = `
    <div class="pfs-inner">
      <div class="pfs-logo-wrap">
        <img src="skillak.png" class="pfs-img" alt="Skillak" onerror="this.style.display='none';document.getElementById('pfsText').style.display='block'">
        <div id="pfsText" class="pfs-text" style="display:none">Skill<span>ak</span></div>
      </div>
      <div class="pfs-ring"><div class="pfs-arc"></div></div>
      <div class="pfs-msg" id="pfsSplashMsg">جاري التحميل...</div>
      <div class="pfs-dots"><span></span><span></span><span></span></div>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    #pfSplash {
      position: fixed; inset: 0; z-index: 99999;
      background: linear-gradient(160deg, #040d18 0%, #071a2e 50%, #040d14 100%);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; transition: opacity .5s ease; overflow: hidden;
    }
    #pfSplash.pfs-hidden { opacity: 0; pointer-events: none; }
    .pfs-inner { display:flex;flex-direction:column;align-items:center;gap:18px; }
    .pfs-logo-wrap { position:relative; }
    .pfs-img { width:120px;height:120px;object-fit:contain;border-radius:24px;box-shadow:0 8px 40px rgba(13,110,117,.4),0 0 0 1px rgba(255,255,255,.07);animation:pfsPulse 2s ease-in-out infinite; }
    .pfs-text { font-family:'Fraunces',serif;font-size:3rem;font-weight:900;color:#fff;letter-spacing:-.03em; }
    .pfs-text span { color:#f59e0b; }
    .pfs-ring { position:relative;width:60px;height:60px;margin-top:4px; }
    .pfs-arc {
      position:absolute;inset:0;border-radius:50%;
      border:3px solid rgba(255,255,255,.08);
      border-top-color:#0d6e75;border-right-color:#14b8a6;
      animation:pfsSpin .9s linear infinite;
    }
    .pfs-msg { font-family:'Cairo',sans-serif;font-size:.88rem;color:rgba(255,255,255,.5);letter-spacing:.02em;min-height:22px;text-align:center;transition:opacity .3s; }
    .pfs-dots { display:flex;gap:6px; }
    .pfs-dots span { width:6px;height:6px;border-radius:50%;background:#0d6e75;animation:pfsDot 1.2s ease-in-out infinite; }
    .pfs-dots span:nth-child(2){animation-delay:.2s;background:#14b8a6;}
    .pfs-dots span:nth-child(3){animation-delay:.4s;background:#f59e0b;}
    @keyframes pfsSpin { to { transform: rotate(360deg); } }
    @keyframes pfsPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
    @keyframes pfsDot { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
  `;
  document.head.appendChild(style);
  document.body.appendChild(splash);

  /* رسائل متناوبة */
  const msgs = ['جاري التحميل...', 'تجهيز المنصة...', 'اتصال بالخوادم...', 'مرحباً بك في Skillak 🎓'];
  let mi = 0;
  const msgEl = splash.querySelector('#pfsSplashMsg');
  const msgInt = setInterval(() => {
    if (!msgEl) { clearInterval(msgInt); return; }
    msgEl.style.opacity = '0';
    setTimeout(() => { if(msgEl) { msgEl.textContent = msgs[mi++ % msgs.length]; msgEl.style.opacity = '1'; } }, 300);
  }, 1200);

  /* إخفاء عند اكتمال التحميل */
  const hideSplash = () => {
    clearInterval(msgInt);
    splash.classList.add('pfs-hidden');
    setTimeout(() => { splash.remove(); style.remove(); }, 600);
  };
  window.addEventListener('load', () => setTimeout(hideSplash, 600));
  /* خطوط أمان */
  setTimeout(hideSplash, 6000);
})();

/* ════════════════════════════════════════════════════
   2. PWA — Install Prompt
   ════════════════════════════════════════════════════ */
let _pf_dp = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); _pf_dp = e;
  setTimeout(_pf_showInstallBanner, 5000);
});

function _pf_showInstallBanner() {
  if (!_pf_dp || document.getElementById('pfIB')) return;
  const bn = document.createElement('div');
  bn.id = 'pfIB';
  bn.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0d6e75,#14b8a6);color:#fff;border-radius:16px;padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 6px 32px rgba(13,110,117,.55);z-index:9999;max-width:340px;width:90%;font-family:\'Cairo\',sans-serif;font-size:.85rem;animation:slideUp .4s cubic-bezier(.25,.46,.45,.94)';
  bn.innerHTML = `
    <img src="icon-192.png" style="width:40px;height:40px;border-radius:12px;flex-shrink:0" alt="">
    <div style="flex:1">
      <div style="font-weight:800;font-size:.9rem">ثبّت تطبيق Skillak</div>
      <div style="font-size:.74rem;opacity:.8;margin-top:1px">تجربة أفضل — يعمل بدون إنترنت</div>
    </div>
    <button id="pfIBbtn" style="background:#fff;color:#0d6e75;border:none;border-radius:10px;padding:8px 14px;font-weight:900;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.82rem;white-space:nowrap">تثبيت ⚡</button>
    <button onclick="this.closest('#pfIB').remove()" style="background:rgba(255,255,255,.18);border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;flex-shrink:0;font-size:1rem">✕</button>`;
  document.body.appendChild(bn);
  document.getElementById('pfIBbtn').onclick = async () => {
    if (!_pf_dp) return;
    _pf_dp.prompt();
    const { outcome } = await _pf_dp.userChoice;
    if (outcome === 'accepted' && typeof showT === 'function') showT('✅ تم تثبيت Skillak!', 'suc');
    _pf_dp = null; bn.remove();
  };
}
window.addEventListener('appinstalled', () => { _pf_dp = null; document.getElementById('pfIB')?.remove(); });

/* ════════════════════════════════════════════════════
   3. إصلاح isBookingStillOpen — يشمل paused
   ════════════════════════════════════════════════════ */

window.isBookingStillOpen = function(bk) {
  if (!bk) return false;
  /* الشات يُقفل فقط إذا: لا يوجد حجز أو (مكتملة + تم التحويل) */
  if (bk.status === 'completed' && bk.adminConfirmed === true) return false;
  if (['cancelled', 'refunded'].includes(bk.status)) return false;
  /* confirmed / active / paused / completed(قبل التحويل) = مفتوحة */
  return ['confirmed', 'active', 'paused', 'completed'].includes(bk.status);
};

/* ════════════════════════════════════════════════════
   4. إصلاح sendSesMsg — يسمح بالشات في paused
   ════════════════════════════════════════════════════ */

window.sendSesMsg = async function() {
  const _db = _pf_getDb(), _CU = _pf_getCU(), _CP = _pf_getCP();
  if (!_db || !_CU) return;

  const inp = document.getElementById('sesInp');
  const text = inp?.value?.trim();
  if (!text) return;

  /* نسمح بالإرسال إذا كانت الجلسة confirmed/active/paused */
  const bid = typeof curSesBid !== 'undefined' ? curSesBid : null;
  const bk  = typeof curSesBk  !== 'undefined' ? curSesBk  : null;

  if (!bid || !bk) {
    if (typeof showT === 'function') showT('لا توجد جلسة نشطة', 'err');
    return;
  }

  /* يُقفل الشات فقط إذا مكتملة+تحويل أو ملغاة */
  const chatClosed = (bk.status === 'completed' && bk.adminConfirmed === true)
    || ['cancelled','refunded'].includes(bk.status);
  if (chatClosed) {
    if (typeof showT === 'function') showT('الشات مغلق — الجلسة منتهية ومُحوَّلة', 'err');
    return;
  }

  if (inp) inp.value = '';

  try {
    await _db.collection('sessions').doc(bid).collection('chat').add({
      senderId: _CU.uid,
      senderName: _CP?.name || 'أنا',
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    /* مزامنة مع شات الرسائل العادي */
    if (typeof mirrorSessionToChat === 'function') {
      await mirrorSessionToChat(bk, text, _CP?.name || 'أنا', _CP?.photo || '').catch(() => {});
    }
  } catch(e) {
    if (typeof showT === 'function') showT('فشل الإرسال: ' + e.message, 'err');
  }
};

/* ════════════════════════════════════════════════════
   5. loadSesChat — تحديث: يبقى مفتوحاً في paused
   ════════════════════════════════════════════════════ */

const _pf_origLoadSesChat = window.loadSesChat;
window.loadSesChat = function(bid) {
  const _db = _pf_getDb(), _CU = _pf_getCU();
  if (!_db || !_CU || !bid) return;

  if (typeof sesChatL !== 'undefined' && sesChatL) { try { sesChatL(); } catch(_) {} sesChatL = null; }

  const unsubscribe = _db.collection('sessions').doc(bid).collection('chat')
    .orderBy('createdAt', 'asc')
    .onSnapshot(snap => {
      const el = document.getElementById('sesMsgs');
      if (!el) return;

      el.innerHTML = snap.docs.map(d => {
        const m = d.data(), mine = m.senderId === _CU.uid;
        const t = m.createdAt?.toDate
          ? m.createdAt.toDate().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
          : '';
        return `<div style="display:flex;flex-direction:column;align-items:${mine?'flex-end':'flex-start'}">
          <div class="sesmb ${mine?'mine':'theirs'}">
            ${(m.text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
            <div class="sesmeta">${t}</div>
          </div>
        </div>`;
      }).join('');
      el.scrollTop = el.scrollHeight;

      /* الشات مفتوح في confirmed/active/paused */
      const bk = typeof curSesBk !== 'undefined' ? curSesBk : null;
      /* الشات مفتوح إلا إذا: مكتملة+تحويل أو ملغاة */
      const chatClosed2 = !bk || (bk.status==='completed'&&bk.adminConfirmed===true) || ['cancelled','refunded'].includes(bk.status);
      const canTalk = !chatClosed2;
      const inp = document.getElementById('sesInp');
      const btn = document.querySelector('#sesChatPnl .btn.btn-p.btn-sm');
      if (inp) {
        inp.disabled = !canTalk;
        inp.placeholder = canTalk ? 'اكتب رسالة...' : 'الجلسة منتهية';
      }
      if (btn) btn.disabled = !canTalk;

      /* إشعار رسائل غير مقروءة */
      const chatPnl = document.getElementById('sesChatPnl');
      if (chatPnl?.classList.contains('hidden')) {
        if (typeof unreadSes !== 'undefined') unreadSes = (unreadSes||0) + 1;
        document.getElementById('chatTogBtn')?.classList.add('unread');
      } else {
        if (typeof unreadSes !== 'undefined') unreadSes = 0;
        document.getElementById('chatTogBtn')?.classList.remove('unread');
      }
    }, err => console.warn('[pf] sesChat:', err));

  if (typeof sesChatL !== 'undefined') sesChatL = unsubscribe;
};

/* ════════════════════════════════════════════════════
   6. enterSession — نظيف (بدون window.CU)
   ════════════════════════════════════════════════════ */

window.enterSession = async function(bookingId) {
  const _db=_pf_getDb(), _CU=_pf_getCU(), _CP=_pf_getCP();
  if (!bookingId) { if(typeof showT==='function')showT('معرّف الجلسة غير صحيح','err'); return; }
  if (!_CU) { if(typeof openM==='function')openM('loginMod'); return; }

  let bk;
  try {
    const s = await _db.collection('bookings').doc(bookingId).get();
    if (!s.exists) { if(typeof showT==='function')showT('لم يُعثر على الجلسة','err'); return; }
    bk = { id:bookingId, ...s.data() };
  } catch(e) { if(typeof showT==='function')showT('خطأ: '+e.message,'err'); return; }

  if (!['confirmed','active','paused'].includes(bk.status)) {
    const m={pending:'⏳ الجلسة لم تُؤكد بعد',completed:'🏁 انتهت مسبقاً',cancelled:'❌ ملغاة',refunded:'↩️ مُستردّة'};
    if(typeof showT==='function')showT(m[bk.status]||'حالة: '+bk.status,'err'); return;
  }

  const uid=_CU.uid, isStudent=bk.studentId===uid, isTutor=bk.tutorId===uid, isAdmin=_CP?.role==='admin';
  if (!isStudent&&!isTutor&&!isAdmin) { if(typeof showT==='function')showT('⛔ لا صلاحية','err'); return; }

  if (bk.status==='paused') {
    try {
      const now=Date.now(), pAt=bk.lastPausedAt?.toDate?.()?.getTime?.()||now;
      const origEnd=Number(bk.sessionEndsAtMs||0), newEnd=origEnd?origEnd+(now-pAt):0;
      await _db.collection('bookings').doc(bookingId).set({
        status:'active', resumedAt:firebase.firestore.FieldValue.serverTimestamp(),
        ...(newEnd?{sessionEndsAtMs:newEnd}:{})
      },{merge:true});
    } catch(_){}
  }

  curSesBid=bookingId; curSesBk=bk; sesSec=0; unreadSes=0;
  if(sesTInt){clearInterval(sesTInt);sesTInt=null;}
  if(sesChatL){try{sesChatL();}catch(_){} sesChatL=null;}

  const $=id=>document.getElementById(id);
  if($('sesTitle'))$('sesTitle').textContent=`جلسة مع ${isTutor?bk.studentName:bk.tutorName}`;
  if($('mainNav'))$('mainNav').style.display='none';
  const waitOv=$('waitOv');
  if(waitOv){waitOv.classList.remove('hidden');waitOv.style.display='';}
  if($('sesDot'))$('sesDot').style.background='var(--amber)';
  if($('sesTxt'))$('sesTxt').textContent='جاري الاتصال...';
  if($('sesTimer'))$('sesTimer').textContent='00:00:00';

  _pf_buildWaitingRoom(waitOv,bk,isTutor);
  if(typeof go==='function')go('session');

  await _db.collection('bookings').doc(bookingId).set({
    status:'active', lastEnteredAt:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true}).catch(()=>{});

  try {
    locSt=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    const lv=$('locVid'); if(lv)lv.srcObject=locSt;
    micOn=true; camOn=true; if(typeof updCtrl==='function')updCtrl();
  } catch(e) { if(typeof showT==='function')showT('⚠️ تعذّر الكاميرا: '+e.message,'err'); locSt=null; }

  if(pc){try{pc.close();}catch(_){}pc=null;}
  pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]});
  const _pc=pc;
  if(locSt)locSt.getTracks().forEach(t=>_pc.addTrack(t,locSt));

  _pc.ontrack=e=>{
    const rv=$('remVid'); if(rv)rv.srcObject=e.streams[0];
    if(waitOv)waitOv.classList.add('hidden');
    if($('sesDot'))$('sesDot').style.background='var(--green)';
    if($('sesTxt'))$('sesTxt').textContent='متصل ✓';
    if(!sesTInt)sesTInt=setInterval(()=>{
      sesSec=(sesSec||0)+1;
      const h=String(Math.floor(sesSec/3600)).padStart(2,'0');
      const m=String(Math.floor((sesSec%3600)/60)).padStart(2,'0');
      const s=String(sesSec%60).padStart(2,'0');
      const t=$('sesTimer'); if(t)t.textContent=`${h}:${m}:${s}`;
    },1000);
  };

  let iceR=0;
  _pc.oniceconnectionstatechange=()=>{
    const st=_pc.iceConnectionState;
    if(['disconnected','failed'].includes(st)){
      if($('sesDot'))$('sesDot').style.background='var(--red)';
      if($('sesTxt'))$('sesTxt').textContent='📶 انقطع الاتصال...';
      if(waitOv)waitOv.classList.remove('hidden');
      if(iceR<3){iceR++;setTimeout(()=>{try{_pc.restartIce?.();}catch(_){}},2000*iceR);}
    } else if(st==='connected'){
      if($('sesDot'))$('sesDot').style.background='var(--green)';
      if($('sesTxt'))$('sesTxt').textContent='متصل ✓'; iceR=0;
    }
  };

  const sesRef=_db.collection('sessions').doc(bookingId);
  if(isTutor||(isAdmin&&!isStudent)){
    _pc.onicecandidate=async e=>{if(e.candidate)await sesRef.collection('tCand').add(e.candidate.toJSON()).catch(()=>{});};
    const offer=await _pc.createOffer();
    await _pc.setLocalDescription(offer);
    await sesRef.set({offer:{type:offer.type,sdp:offer.sdp},tutorId:uid,status:'active',startedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const u=sesRef.onSnapshot(async s=>{const d=s.data();if(d?.answer&&!_pc.currentRemoteDescription){try{await _pc.setRemoteDescription(new RTCSessionDescription(d.answer));u();}catch(_){}}});
    sesRef.collection('sCand').onSnapshot(s=>s.docChanges().forEach(async c=>{if(c.type==='added'){try{await _pc.addIceCandidate(new RTCIceCandidate(c.doc.data()));}catch(_){}}}));
  } else {
    _pc.onicecandidate=async e=>{if(e.candidate)await sesRef.collection('sCand').add(e.candidate.toJSON()).catch(()=>{});};
    const doAns=async of=>{
      if(_pc.currentRemoteDescription)return;
      try{await _pc.setRemoteDescription(new RTCSessionDescription(of));const a=await _pc.createAnswer();await _pc.setLocalDescription(a);await sesRef.set({answer:{type:a.type,sdp:a.sdp},studentId:uid},{merge:true});}catch(_){}
    };
    const init=await sesRef.get();
    if(init.exists&&init.data()?.offer)await doAns(init.data().offer);
    else{const u2=sesRef.onSnapshot(async s=>{const d=s.data();if(d?.offer&&!_pc.currentRemoteDescription){await doAns(d.offer);u2();}});}
    sesRef.collection('tCand').onSnapshot(s=>s.docChanges().forEach(async c=>{if(c.type==='added'){try{await _pc.addIceCandidate(new RTCIceCandidate(c.doc.data()));}catch(_){}}}));
  }

  window.loadSesChat(bookingId);

  setTimeout(()=>{
    const eb=$('endBtn'); if(!eb)return;
    const exitWrap=$('studentExitWrap');

    if(isStudent&&!isTutor){
      /* الطالب: نُخفي زر الإنهاء الأحمر، فقط زر الخروج المؤقت */
      const endWrap=eb.closest?.('.cwrap');
      if(endWrap) endWrap.style.display='none';
      /* إظهار زر الخروج المؤقت فقط */
      if(exitWrap) exitWrap.style.display='';
    } else if(isTutor){
      /* المعلم: الـ endBtn هو خروج مؤقت */
      eb.innerHTML='🚪'; eb.title='خروج مؤقت';
      eb.style.cssText='background:rgba(245,158,11,.25);box-shadow:0 2px 8px rgba(0,0,0,.2);width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;font-size:1.4rem;display:flex;align-items:center;justify-content:center';
      const lbl=eb.closest?.('.cwrap')?.querySelector?.('.clbl'); if(lbl)lbl.textContent='خروج';
      if(exitWrap) exitWrap.style.display='none';
    } else if(isAdmin){
      /* الأدمن: خروج فقط */
      eb.innerHTML='🚪'; eb.title='خروج (أدمن)';
      eb.style.cssText='background:rgba(99,102,241,.25);width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;font-size:1.4rem;display:flex;align-items:center;justify-content:center';
      if(exitWrap) exitWrap.style.display='none';
    }
  },1000);

  if(typeof showT==='function')showT('📡 جاري الاتصال...','inf');
};

/* ════════════════════════════════════════════════════
   7. غرفة الانتظار
   ════════════════════════════════════════════════════ */
function _pf_buildWaitingRoom(waitOv,bk,isTutor){
  if(!waitOv)return;
  const other=isTutor?(bk.studentName||'الطالب'):(bk.tutorName||'المعلم');
  const endMs=typeof getBookingEndMs==='function'?getBookingEndMs(bk):0;
  waitOv.innerHTML=`<div class="swr-inner">
    <div class="swr-logo">Skill<span>ak</span></div>
    <div class="swr-av"><div class="swr-initials" style="background:linear-gradient(135deg,#0d6e75,#14b8a6);color:#fff">${other.charAt(0)||'؟'}</div></div>
    <p class="swr-name">${other}</p>
    <p class="swr-role">${isTutor?'الطالب':'المعلم'}</p>
    <div class="swr-status"><div class="swr-spin"></div><span>في انتظار الانضمام...</span></div>
    <div id="pfWaitCD" style="font-size:.8rem;color:rgba(255,255,255,.5);margin-top:4px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px">
      <button onclick="window._pfRetry()" style="background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:8px 16px;font-size:.82rem;cursor:pointer;font-family:'Cairo',sans-serif">🔄 إعادة الاتصال</button>
      <button onclick="window._pfExitWait()" style="background:transparent;color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 16px;font-size:.82rem;cursor:pointer;font-family:'Cairo',sans-serif">← خروج</button>
    </div>
  </div>`;
  if(endMs){
    const el=document.getElementById('pfWaitCD');
    const tick=()=>{if(!el)return;const r=endMs-Date.now();if(r<=0){el.textContent='⏰ انتهى الوقت';return;}const m=Math.floor(r/60000),s=Math.floor((r%60000)/1000);el.textContent=`⏱️ ${m}:${String(s).padStart(2,'0')} متبقي`;setTimeout(tick,1000);};tick();
  }
}
window._pfRetry=async()=>{const bid=typeof curSesBid!=='undefined'?curSesBid:null;if(!bid)return;if(typeof pc!=='undefined'&&pc){try{pc.close();}catch(_){}pc=null;}await window.enterSession(bid);};
window._pfExitWait=function(){
  const bid=typeof curSesBid!=='undefined'?curSesBid:null,_db=_pf_getDb();
  if(bid&&_db)_db.collection('bookings').doc(bid).set({status:'paused',lastPausedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(()=>{});
  _pfCleanup();
  if(typeof curSesBid!=='undefined')curSesBid=null;
  if(typeof curSesBk!=='undefined')curSesBk=null;
  if(document.getElementById('mainNav'))document.getElementById('mainNav').style.display='';
  if(typeof go==='function')go('dashboard');
  setTimeout(()=>{if(typeof dNav==='function')dNav('sessions');},300);
};

/* ════════════════════════════════════════════════════
   8. endSession
   ════════════════════════════════════════════════════ */
window.endSession=async function(){
  const _db=_pf_getDb(),_CU=_pf_getCU();
  const bid=typeof curSesBid!=='undefined'?curSesBid:null,bk=typeof curSesBk!=='undefined'?curSesBk:null,uid=_CU?.uid;
  if(!bid||!bk||!uid){_pfCleanup();if(typeof curSesBid!=='undefined')curSesBid=null;if(typeof curSesBk!=='undefined')curSesBk=null;document.getElementById('mainNav') && (document.getElementById('mainNav').style.display='');if(typeof go==='function')go('dashboard');setTimeout(()=>{if(typeof dNav==='function')dNav('sessions');},300);return;}
  const isStudent=bk.studentId===uid,isTutor=bk.tutorId===uid;
  const secs=typeof sesSec!=='undefined'?sesSec:0, mins=Math.floor(secs/60);
  const durStr=mins>0?`${mins}د ${secs%60}ث`:`${secs} ثانية`;
  if(isStudent){
    if(!confirm(`إنهاء الجلسة نهائياً؟\nالمدة: ${durStr}\n\n⚠️ لن يمكن العودة بعدها.`))return;
    _pfCleanup();
    try{
      await _db.collection('bookings').doc(bid).update({status:'completed',completedAt:firebase.firestore.FieldValue.serverTimestamp(),completedBy:uid,actualDuration:mins||bk.duration||60,adminConfirmed:false,paymentStatus:'pending_admin'});
      await _db.collection('sessions').doc(bid).set({status:'ended',endedAt:firebase.firestore.FieldValue.serverTimestamp(),endedBy:uid},{merge:true}).catch(()=>{});
      _db.collection('adminNotifications').add({type:'session_completed',bookingId:bid,tutorName:bk.tutorName||'—',studentName:bk.studentName||'—',price:bk.price||0,read:false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),message:'انتهت الجلسة — يتطلب اعتماد الأدمن'}).catch(()=>{});
    }catch(e){console.error('[pf]end',e);}
    curSesBid=null;curSesBk=null;
    document.getElementById('mainNav')&&(document.getElementById('mainNav').style.display='');
    if(typeof go==='function')go('dashboard');
    setTimeout(()=>{if(typeof dNav==='function')dNav('sessions');},300);
    setTimeout(()=>{if(!bk.reviewed&&typeof openRevFromBk==='function')openRevFromBk(bid,bk.tutorId,bk.tutorName||'المعلم');},800);
  } else if(isTutor){
    const endMs=typeof getBookingEndMs==='function'?getBookingEndMs(bk):0;
    const remMin=endMs?Math.max(0,Math.round((endMs-Date.now())/60000)):'؟';
    if(!confirm(`خروج مؤقت؟\n⏸️ الجلسة تبقى نشطة (${remMin}د متبقية)\nيمكنك العودة لاحقاً.`))return;
    _pfCleanup();
    try{await _db.collection('bookings').doc(bid).set({status:'paused',lastPausedAt:firebase.firestore.FieldValue.serverTimestamp(),pausedBy:uid},{merge:true});await _db.collection('sessions').doc(bid).set({status:'paused',pausedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(()=>{});}catch(_){}
    curSesBid=null;curSesBk=null;
    document.getElementById('mainNav')&&(document.getElementById('mainNav').style.display='');
    if(typeof go==='function')go('dashboard');
    setTimeout(()=>{if(typeof dNav==='function')dNav('sessions');},300);
    if(typeof showT==='function')showT('⏸️ خرجت مؤقتاً — يمكنك العودة','inf');
  }
};

/* ════════════════════════════════════════════════════
   زر خروج الطالب — يخرج مؤقتاً مثل المعلم
   ════════════════════════════════════════════════════ */
window.studentExitSession = async function() {
  const _db = _pf_getDb(), _CU = _pf_getCU();
  const bid = typeof curSesBid !== 'undefined' ? curSesBid : null;
  const bk  = typeof curSesBk  !== 'undefined' ? curSesBk  : null;
  const uid  = _CU?.uid;

  if (!bid || !bk || !uid) {
    _pfCleanup();
    if(typeof curSesBid!=='undefined')curSesBid=null;
    if(typeof curSesBk!=='undefined')curSesBk=null;
    document.getElementById('mainNav')&&(document.getElementById('mainNav').style.display='');
    if(typeof go==='function')go('dashboard');
    setTimeout(()=>{if(typeof dNav==='function')dNav('sessions');},300);
    return;
  }

  const endMs = typeof getBookingEndMs==='function' ? getBookingEndMs(bk) : 0;
  const remMin = endMs ? Math.max(0, Math.round((endMs-Date.now())/60000)) : '؟';

  if (!confirm(`الخروج من الجلسة مؤقتاً؟
⏸️ الجلسة ستبقى محجوزة (${remMin} دقيقة متبقية)

يمكنك العودة من قسم "جلساتي"`)) return;

  _pfCleanup();
  try {
    await _db.collection('bookings').doc(bid).set({
      status: 'paused',
      lastPausedAt: firebase.firestore.FieldValue.serverTimestamp(),
      pausedBy: uid,
      pausedByRole: 'student'
    }, { merge: true });
    await _db.collection('sessions').doc(bid).set({
      status: 'paused',
      pausedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(()=>{});
  } catch(_) {}

  if(typeof curSesBid!=='undefined')curSesBid=null;
  if(typeof curSesBk!=='undefined')curSesBk=null;
  document.getElementById('mainNav')&&(document.getElementById('mainNav').style.display='');
  if(typeof go==='function')go('dashboard');
  setTimeout(()=>{if(typeof dNav==='function')dNav('sessions');},300);
  if(typeof showT==='function')showT('⏸️ خرجت مؤقتاً — يمكنك العودة من جلساتي','inf');
};

function _pfCleanup(){
  /* إخفاء زر خروج الطالب عند التنظيف */
  const ew=document.getElementById('studentExitWrap'); if(ew)ew.style.display='none';
  /* إعادة إظهار endBtn للمرة القادمة */
  const eb2=document.getElementById('endBtn'); if(eb2){const ew2=eb2.closest('.cwrap');if(ew2)ew2.style.display='';}
  if(typeof sesTInt!=='undefined'&&sesTInt){clearInterval(sesTInt);sesTInt=null;}
  if(typeof sesChatL!=='undefined'&&sesChatL){try{sesChatL();}catch(_){}sesChatL=null;}
  if(typeof pc!=='undefined'&&pc){try{pc.close();}catch(_){}pc=null;}
  if(typeof locSt!=='undefined'&&locSt){try{locSt.getTracks().forEach(t=>t.stop());}catch(_){}locSt=null;}
  if(typeof scrSt!=='undefined'&&scrSt){try{scrSt.getTracks().forEach(t=>t.stop());}catch(_){}scrSt=null;}
}

/* ════════════════════════════════════════════════════
   9. تقرير الجلسة في الأدمن — يبقى بعد التحويل
   ════════════════════════════════════════════════════ */

/* دالة لعرض تقرير الجلسة التفصيلي */
window.adminShowSessionReport = async function(bid) {
  const _db = _pf_getDb();
  if (!_db) return;

  /* نموذج التقرير */
  let modal = document.getElementById('pfRepModal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'pfRepModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9998;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)';
  modal.innerHTML = '<div style="background:#fff;border-radius:20px;padding:28px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto"><div style="text-align:center;padding:20px"><div class="spin" style="margin:0 auto"></div><p style="color:var(--muted);margin-top:12px">تحميل تقرير الجلسة...</p></div></div>';
  document.body.appendChild(modal);
  modal.onclick = e => { if(e.target===modal) modal.remove(); };

  try {
    const [bSnap, sesSnap, chatSnap] = await Promise.all([
      _db.collection('bookings').doc(bid).get(),
      _db.collection('sessions').doc(bid).get().catch(()=>null),
      _db.collection('sessions').doc(bid).collection('chat').orderBy('createdAt','asc').get().catch(()=>({docs:[]}))
    ]);

    if (!bSnap.exists) { modal.querySelector('div>div').innerHTML='<p style="color:red;text-align:center">لم يُعثر على الجلسة</p>'; return; }

    const b = { id:bid, ...bSnap.data() };
    const ses = sesSnap?.exists ? sesSnap.data() : {};
    const msgs = chatSnap.docs.map(d=>d.data());

    const fmt = ts => ts?.toDate ? ts.toDate().toLocaleString('ar-SA') : '—';
    const money = n => Number(n||0).toFixed(2) + ' ج.م';
    const netTutor = Number((b.price||0)-(b.tutorFee??b.fee??0)).toFixed(2);
    const platformProfit = (Number(b.studentFee||0) + Number(b.tutorFee??0)).toFixed(2);

    modal.querySelector('div>div').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="margin:0;font-family:'Fraunces',serif;font-size:1.35rem">📋 تقرير الجلسة</h2>
          <p style="margin:4px 0 0;color:var(--muted);font-size:.78rem">معرّف: ${bid}</p>
        </div>
        <button onclick="document.getElementById('pfRepModal').remove()" style="background:#f3f4f6;border:none;border-radius:10px;padding:8px 14px;cursor:pointer;font-family:'Cairo',sans-serif">✕ إغلاق</button>
      </div>

      <!-- الأطراف -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:14px;padding:14px;border:1px solid #bfdbfe">
          <div style="font-size:.7rem;color:#1e40af;font-weight:700;margin-bottom:6px">👨‍🎓 الطالب</div>
          <div style="font-weight:800">${b.studentName||'—'}</div>
          <div style="font-size:.74rem;color:var(--muted);margin-top:2px">${b.studentPhone||''}</div>
        </div>
        <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:14px;padding:14px;border:1px solid #a7f3d0">
          <div style="font-size:.7rem;color:#065f46;font-weight:700;margin-bottom:6px">🎓 المعلم</div>
          <div style="font-weight:800">${b.tutorName||'—'}</div>
          <div style="font-size:.74rem;color:var(--muted);margin-top:2px">${b.tutorPhone||''}</div>
        </div>
      </div>

      <!-- التوقيت -->
      <div style="background:#f9fafb;border-radius:14px;padding:14px;margin-bottom:16px">
        <div style="font-weight:700;margin-bottom:10px;font-size:.88rem">⏰ التوقيت</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;font-size:.8rem">
          <div><span style="color:var(--muted)">تاريخ الجلسة:</span> <strong>${b.date||'—'} ${b.timeLbl||b.time||''}</strong></div>
          <div><span style="color:var(--muted)">مدة الحجز:</span> <strong>${b.duration||60} دقيقة</strong></div>
          <div><span style="color:var(--muted)">المدة الفعلية:</span> <strong>${b.actualDuration||'—'} دقيقة</strong></div>
          <div><span style="color:var(--muted)">بدأت:</span> <strong>${fmt(ses.startedAt||b.lastEnteredAt)}</strong></div>
          <div><span style="color:var(--muted)">انتهت:</span> <strong>${fmt(ses.endedAt||b.completedAt)}</strong></div>
          <div><span style="color:var(--muted)">الحالة:</span> <strong>${{pending:'⏳ انتظار',confirmed:'✅ مؤكد',active:'🟢 نشط',paused:'⏸️ معلق',completed:'🏁 مكتمل',cancelled:'❌ ملغى',refunded:'↩️ مُسترد'}[b.status]||b.status}</strong></div>
        </div>
      </div>

      <!-- المالية -->
      <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:1px solid #a7f3d0;border-radius:14px;padding:14px;margin-bottom:16px">
        <div style="font-weight:700;margin-bottom:10px;font-size:.88rem">💰 التفاصيل المالية</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;font-size:.83rem">
          <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;border:1px solid #d1fae5">
            <div style="font-size:1.2rem;font-weight:900;color:#0d6e75;font-family:'Fraunces',serif">${money(b.price)}</div>
            <div style="font-size:.68rem;color:var(--muted)">سعر الجلسة</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;border:1px solid #d1fae5">
            <div style="font-size:1.2rem;font-weight:900;color:#6366f1;font-family:'Fraunces',serif">${money(b.studentFee||b.fee)}</div>
            <div style="font-size:.68rem;color:var(--muted)">عمولة الطالب</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;border:1px solid #d1fae5">
            <div style="font-size:1.2rem;font-weight:900;color:#f59e0b;font-family:'Fraunces',serif">${money(b.tutorFee)}</div>
            <div style="font-size:.68rem;color:var(--muted)">عمولة المعلم</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;border:1px solid #d1fae5">
            <div style="font-size:1.2rem;font-weight:900;color:#059669;font-family:'Fraunces',serif">${netTutor} ج.م</div>
            <div style="font-size:.68rem;color:var(--muted)">صافي للمعلم</div>
          </div>
          <div style="background:linear-gradient(135deg,#0d6e75,#14b8a6);border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:1.2rem;font-weight:900;color:#fff;font-family:'Fraunces',serif">${platformProfit} ج.م</div>
            <div style="font-size:.68rem;color:rgba(255,255,255,.8)">ربح المنصة</div>
          </div>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="background:${b.adminConfirmed?'#dcfce7':'#fef3c7'};color:${b.adminConfirmed?'#166534':'#92400e'};border-radius:20px;padding:4px 12px;font-size:.78rem;font-weight:700">
            ${b.adminConfirmed?'✅ تم التحويل للمعلم':'⏳ في انتظار التحويل'}
          </span>
          ${b.adminConfirmed?`<span style="font-size:.74rem;color:var(--muted)">بتاريخ: ${fmt(b.paidToTutorAt)}</span>`:''}
          ${b.paymentStatus?`<span style="background:#f3f4f6;border-radius:20px;padding:4px 10px;font-size:.74rem;color:var(--muted)">${b.paymentStatus}</span>`:''}
        </div>
      </div>

      <!-- سجل الشات -->
      ${msgs.length>0?`
      <div style="margin-bottom:16px">
        <div style="font-weight:700;margin-bottom:10px;font-size:.88rem">💬 سجل الشات (${msgs.length} رسالة)</div>
        <div style="background:#f9fafb;border-radius:14px;padding:12px;max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
          ${msgs.map(m=>{
            const t=m.createdAt?.toDate?m.createdAt.toDate().toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'}):'';
            return `<div style="display:flex;gap:8px;align-items:flex-start"><div style="font-size:.72rem;font-weight:700;color:#0d6e75;white-space:nowrap;margin-top:2px">${m.senderName||'—'}</div><div style="background:#fff;border-radius:10px;padding:6px 10px;font-size:.82rem;flex:1;border:1px solid #e5e7eb">${(m.text||'').replace(/</g,'&lt;')}<span style="font-size:.64rem;color:var(--muted);margin-right:6px">${t}</span></div></div>`;
          }).join('')}
        </div>
      </div>`:'<div style="background:#f9fafb;border-radius:14px;padding:16px;text-align:center;color:var(--muted);font-size:.84rem;margin-bottom:16px">💬 لا توجد رسائل في هذه الجلسة</div>'}

      <!-- أزرار التحكم -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;padding-top:12px;border-top:1px solid #f3f4f6">
        ${b.status==='completed'&&!b.adminConfirmed?`<button onclick="adminPayTutor('${bid}','${b.tutorId}',${b.price||0},${b.fee||0});document.getElementById('pfRepModal').remove()" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">💰 تحويل للمعلم</button><button onclick="adminRefundBk('${bid}','${b.studentId}',${b.total||0});document.getElementById('pfRepModal').remove()" style="background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">↩️ إرجاع للطالب</button>`:''}
        ${['confirmed','active','paused'].includes(b.status)?`<button onclick="window.enterSession('${bid}');document.getElementById('pfRepModal').remove()" style="background:linear-gradient(135deg,#0d6e75,#14b8a6);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">🎥 دخول الجلسة</button>`:''}
        <button onclick="document.getElementById('pfRepModal').remove()" style="background:#f3f4f6;border:none;border-radius:10px;padding:10px 18px;cursor:pointer;font-family:'Cairo',sans-serif;color:#374151">إغلاق</button>
      </div>`;

  } catch(e) {
    modal.querySelector('div>div').innerHTML = `<p style="color:red;text-align:center">خطأ: ${e.message}</p>`;
  }
};

/* تحسين جدول الحجوزات في الأدمن — إضافة زر التقرير */
function _pf_enhanceAdminBookings() {
  const rows = document.querySelectorAll('#adCon table tbody tr');
  rows.forEach(row => {
    if (row.querySelector('.pf-rep-btn')) return;
    let bid = null;
    row.querySelectorAll('button[onclick]').forEach(btn => {
      const m = btn.getAttribute('onclick')?.match(/['"]([A-Za-z0-9]{15,})['"]/);
      if (m && !bid) bid = m[1];
    });
    if (!bid) return;
    const lastTd = row.querySelector('td:last-child');
    if (!lastTd) return;

    /* زر التقرير — يظهر دائماً */
    const rBtn = document.createElement('button');
    rBtn.className = 'pf-rep-btn btn btn-gh btn-xs';
    rBtn.style.cssText = 'margin-top:4px;width:100%';
    rBtn.innerHTML = '📋 تقرير الجلسة';
    rBtn.onclick = () => window.adminShowSessionReport(bid);
    lastTd.appendChild(rBtn);

    /* زر دخول الجلسة — للجلسات النشطة/المعلّقة */
    const pill = row.querySelector('.pill');
    const txt = pill?.textContent || '';
    const isOpen = ['نشطة','مؤكدة','معلقة','confirmed','active','paused'].some(s => txt.includes(s));
    if (isOpen) {
      const eBtn = document.createElement('button');
      eBtn.className = 'pf-adm-ses btn btn-xs';
      eBtn.style.cssText = 'margin-top:4px;width:100%;background:linear-gradient(135deg,#0d6e75,#14b8a6)!important;color:#fff!important;font-weight:800!important';
      eBtn.innerHTML = '🎥 دخول';
      eBtn.onclick = () => window.enterSession(bid);
      lastTd.appendChild(eBtn);
    }
  });
}

/* ── Hook adTab ── */
const _pf_prevAdTab = window.adTab;
window.adTab = async function(tab, el) {
  const r = typeof _pf_prevAdTab === 'function' ? await _pf_prevAdTab(tab, el) : undefined;
  if (tab === 'bookings') setTimeout(_pf_enhanceAdminBookings, 700);
  return r;
};

/* ════════════════════════════════════════════════════
   10. لوحة مزدوجة (الاثنان)
   ════════════════════════════════════════════════════ */
const _pf_origRdOverview = window.rdOverview;
window.rdOverview = async function(el) {
  const _CU=_pf_getCU(),_CP=_pf_getCP(),_db=_pf_getDb();
  if(!_CU||!_CP||!_db||_CP.role!=='both'){
    if(typeof _pf_origRdOverview==='function')return _pf_origRdOverview(el);
    return;
  }
  el.innerHTML='<div style="text-align:center;padding:40px"><div class="spin" style="margin:0 auto"></div></div>';
  try{
    const uid=_CU.uid,p=_CP;
    const[sb,tb,ws]=await Promise.all([
      _db.collection('bookings').where('studentId','==',uid).get().catch(()=>({docs:[]})),
      _db.collection('bookings').where('tutorId','==',uid).get().catch(()=>({docs:[]})),
      _db.collection('wallets').doc(uid).get().catch(()=>null)
    ]);
    const sB=sb.docs.map(d=>({id:d.id,...d.data()})),tB=tb.docs.map(d=>({id:d.id,...d.data()}));
    const walBal2=ws?.exists?Number(ws.data()?.balance||0):0;
    const sComp=sB.filter(b=>b.status==='completed').length;
    const sUp=sB.filter(b=>['pending','confirmed','active','paused'].includes(b.status)).length;
    const sSpent=sB.filter(b=>b.status==='completed').reduce((s,b)=>s+Number(b.price||0)+Number(b.studentFee||0),0);
    const tComp=tB.filter(b=>b.status==='completed').length;
    const tUp=tB.filter(b=>['pending','confirmed','active','paused'].includes(b.status)).length;
    const tEarn=tB.filter(b=>b.status==='completed').reduce((s,b)=>s+Number((b.price||0)-(b.tutorFee??b.fee??0)),0);
    const tPend=tB.filter(b=>b.status==='pending').length;
    const allBks=[...sB,...tB].filter((b,i,a)=>a.findIndex(x=>x.id===b.id)===i).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,8);
    const upAll=allBks.filter(b=>['pending','confirmed','active','paused'].includes(b.status));

    el.innerHTML=`
<div class="dashphdr"><div><div style="font-size:.72rem;font-weight:800;letter-spacing:.1em;color:var(--amber);margin-bottom:3px">لوحة التحكم</div><div class="dashph">مرحباً، ${p.name?.split(' ')[0]||'أهلاً'} 👋</div></div><button class="btn btn-p" onclick="go('explore')">+ احجز جلسة</button></div>
<div style="background:linear-gradient(135deg,#0a0a1a,#0d1a2e);border-radius:18px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
  <div style="display:flex;align-items:center;gap:12px"><span style="font-size:1.5rem">💳</span><div><div style="font-size:.7rem;color:rgba(255,255,255,.4);margin-bottom:2px">رصيد المحفظة</div><div style="font-size:1.5rem;font-weight:900;font-family:'Fraunces',serif;color:#fff">${walBal2.toFixed(2)}<span style="font-size:.75rem;opacity:.6"> ج.م</span></div></div></div>
  <div style="display:flex;gap:8px"><button class="btn btn-p btn-sm" onclick="go('wallet')">شحن</button><button class="btn btn-gh btn-sm" onclick="go('wallet')">💸 سحب</button></div>
</div>
<div class="dual-block student-block">
  <div class="dual-block-hd"><div class="dual-block-icon">📚</div><div><div class="dual-block-title">أنا كمتعلم</div><div class="dual-block-sub">جلساتي التي حجزتها</div></div><button class="btn btn-sm" style="margin-right:auto;background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.2)" onclick="dNav('sessions')">عرض ←</button></div>
  <div class="dual-stats"><div class="ds-item"><div class="ds-val">${sB.length}</div><div class="ds-lbl">إجمالي</div></div><div class="ds-item"><div class="ds-val">${sComp}</div><div class="ds-lbl">مكتملة ✅</div></div><div class="ds-item"><div class="ds-val">${sUp}</div><div class="ds-lbl">قادمة ⏰</div></div><div class="ds-item"><div class="ds-val">${sSpent.toFixed(0)}<small> ج.م</small></div><div class="ds-lbl">الإنفاق</div></div></div>
  ${sUp>0?`<div class="dual-alert">⏰ <strong>${sUp} جلسة</strong> قادمة كطالب<button onclick="dNav('sessions')" style="margin-right:auto;background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:8px;padding:5px 12px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.78rem">عرض</button></div>`:`<div class="dual-alert" style="background:rgba(255,255,255,.08);border:none">💡 ابحث عن معلم<button onclick="go('explore')" style="margin-right:auto;background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:8px;padding:5px 12px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.78rem">استكشف ←</button></div>`}
</div>
<div class="dual-block teacher-block">
  <div class="dual-block-hd"><div class="dual-block-icon">🎓</div><div><div class="dual-block-title">أنا كمعلم</div><div class="dual-block-sub">${p.category||'معلم'} · ${(p.rating||0).toFixed(1)} ⭐ · $${p.price||0}/ساعة</div></div><button class="btn btn-sm" style="margin-right:auto;background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.2)" onclick="go('editProfile')">تعديل ✏️</button></div>
  <div class="dual-stats"><div class="ds-item"><div class="ds-val">${tComp}</div><div class="ds-lbl">مكتملة</div></div><div class="ds-item"><div class="ds-val">${tUp}</div><div class="ds-lbl">قادمة ⏰</div></div><div class="ds-item"><div class="ds-val">${tEarn.toFixed(0)}<small> ج.م</small></div><div class="ds-lbl">الأرباح 💰</div></div><div class="ds-item"><div class="ds-val">${(p.rating||0).toFixed(1)}<small>⭐</small></div><div class="ds-lbl">تقييمي</div></div></div>
  ${tPend>0?`<div class="dual-alert" style="background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.3)">🔔 <strong>${tPend} طلب</strong> ينتظر موافقتك<button onclick="dNav('sessions')" style="margin-right:auto;background:rgba(245,158,11,.25);color:#fff;border:none;border-radius:8px;padding:5px 12px;cursor:pointer;font-family:'Cairo',sans-serif;font-size:.78rem">راجع</button></div>`:`<div class="dual-teacher-info"><span class="dti-badge">🏆 ${p.experience||0} سنة</span><span class="dti-badge">📂 ${p.category||'—'}</span><span class="dti-badge">🌐 ${p.language||'عربي'}</span><button onclick="dNav('availability')" class="btn btn-sm dti-btn">⏰ أوقاتي</button></div>`}
</div>
${upAll.length>0?`<div class="dsec" style="margin-bottom:16px;border-color:var(--teal)"><div class="dsech" style="background:var(--teal3)"><div class="dsect" style="color:var(--teal)">⏰ الجلسات القادمة (${upAll.length})</div><button class="btn btn-p btn-sm" onclick="dNav('sessions')">الكل</button></div>${typeof bkTblHTML==='function'?bkTblHTML(upAll):''}</div>`:''}
<div class="dsec"><div class="dsech"><div class="dsect">📋 آخر الجلسات</div><button class="btn btn-gh btn-sm" onclick="dNav('sessions')">الكل</button></div>${typeof bkTblHTML==='function'?bkTblHTML(allBks):'<p style="padding:16px;color:var(--muted)">لا توجد جلسات</p>'}</div>`;
  }catch(e){ if(typeof _pf_origRdOverview==='function')return _pf_origRdOverview(el); }
};

/* ════════════════════════════════════════════════════
   11. CSS
   ════════════════════════════════════════════════════ */
(()=>{const s=document.createElement('style');s.textContent=`
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.dual-block{border-radius:20px;padding:18px 20px;margin-bottom:14px;color:#fff}
.student-block{background:linear-gradient(135deg,#1e40af,#3b82f6);box-shadow:0 6px 24px rgba(59,130,246,.2)}
.teacher-block{background:linear-gradient(135deg,#064e3b,#059669);box-shadow:0 6px 24px rgba(5,150,105,.2)}
.dual-block-hd{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.dual-block-icon{width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:1.35rem;flex-shrink:0}
.dual-block-title{font-weight:900;font-size:1rem}
.dual-block-sub{font-size:.73rem;opacity:.65;margin-top:2px}
.dual-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
@media(max-width:540px){.dual-stats{grid-template-columns:repeat(2,1fr)}}
.ds-item{background:rgba(255,255,255,.12);border-radius:12px;padding:10px 8px;text-align:center}
.ds-val{font-size:1.4rem;font-weight:900;font-family:'Fraunces',serif;line-height:1}
.ds-val small{font-size:.62rem;font-weight:600;opacity:.7}
.ds-lbl{font-size:.63rem;opacity:.7;margin-top:4px}
.dual-alert{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border-radius:10px;padding:9px 13px;font-size:.81rem;margin-top:4px;flex-wrap:wrap}
.dual-teacher-info{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px}
.dti-badge{background:rgba(255,255,255,.14);border-radius:8px;padding:4px 10px;font-size:.76rem;font-weight:700}
.dti-btn{background:rgba(255,255,255,.16)!important;color:#fff!important;border:1px solid rgba(255,255,255,.25)!important}
`;document.head.appendChild(s);})();

console.log('✅ patch_final.js v8.0 — Chat in Paused + Admin Report + PWA Splash');

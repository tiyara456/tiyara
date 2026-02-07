// ===== Helpers =====
const WA_NUMBER_INTL = "6281350258345";
const WA_TEXT = encodeURIComponent("Hallo kak Tiyara, aku mau order.");
const WA_LINK = `https://wa.me/${WA_NUMBER_INTL}?text=${WA_TEXT}`;

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return [...document.querySelectorAll(sel)]; }

// ===== Background particles (subtle) =====
(function initBg(){
  const canvas = document.getElementById("fxBg");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w=0,h=0, dpr=1;
  let dots=[];

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    dots = Array.from({length: Math.floor((window.innerWidth*window.innerHeight)/22000)}, () => ({
      x: Math.random()*w,
      y: Math.random()*h,
      r: (Math.random()*2.2+0.6)*dpr,
      vx: (Math.random()*0.35-0.175)*dpr,
      vy: (Math.random()*0.35-0.175)*dpr,
      a: Math.random()*0.35 + 0.10
    }));
  }
  window.addEventListener("resize", resize, {passive:true});
  resize();

  function loop(){
    ctx.clearRect(0,0,w,h);
    for(const p of dots){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=w; if(p.x>w) p.x=0;
      if(p.y<0) p.y=h; if(p.y>h) p.y=0;

      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// ===== Loader (index only) =====
(function loader(){
  const loaderEl = document.getElementById("loader");
  if(!loaderEl) return;

  // A bit of "cute delay" but fast
  const done = () => {
    loaderEl.style.opacity = "0";
    loaderEl.style.transition = "opacity .25s ease";
    setTimeout(()=> loaderEl.remove(), 260);
  };

  // finish after progress animation + small buffer
  setTimeout(done, 1500);
})();

// ===== Payment modal QR =====
(function payment(){
  const openBtn = document.getElementById("openQris");
  const modal = document.getElementById("qrisModal");
  const closeBtn = document.getElementById("closeQris");
  const downloadBtn = document.getElementById("downloadQris");
  const proofBtn = document.getElementById("sendProof");

  if(openBtn && modal){
    openBtn.addEventListener("click", () => modal.classList.add("show"));
  }
  if(closeBtn && modal){
    closeBtn.addEventListener("click", () => modal.classList.remove("show"));
  }
  if(modal){
    modal.addEventListener("click", (e) => {
      if(e.target === modal) modal.classList.remove("show");
    });
  }
  if(downloadBtn){
    downloadBtn.addEventListener("click", () => {
      // force download qris image
      const a = document.createElement("a");
      a.href = "image/qris.jpg";
      a.download = "QRIS-TIYARA274-STR.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
  if(proofBtn){
    proofBtn.addEventListener("click", () => {
      const text = encodeURIComponent("Hallo kak Tiyara, ini aku kirim bukti pembayaran ya.");
      window.location.href = `https://wa.me/${WA_NUMBER_INTL}?text=${text}`;
    });
  }
})();

// ===== Attach WA links everywhere =====
(function linkify(){
  $all("[data-wa='order']").forEach(el=>{
    el.setAttribute("href", WA_LINK);
    el.setAttribute("target","_blank");
    el.setAttribute("rel","noopener");
  });
})();

// ===== Game: Dino Catch (Canvas, responsive, touch + keyboard) =====
(function game(){
  const canvas = document.getElementById("gameCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w=0,h=0, dpr=1;

  const state = {
    running: true,
    score: 0,
    best: Number(localStorage.getItem("tiyara_best") || 0),
    lives: 3,
    t: 0,
    difficulty: 1,
    touchX: null,
    player: { x: 0.5, y: 0.82, vx: 0, size: 32 },
    drops: []
  };

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    w = canvas.width = Math.floor(rect.width * dpr);
    h = canvas.height = Math.floor(rect.height * dpr);
    // scale sizes with height
    state.player.size = Math.max(26*dpr, Math.min(44*dpr, h*0.06));
  }
  window.addEventListener("resize", resize, {passive:true});
  resize();

  function spawn(){
    const speed = (1.15 + Math.random()*0.55) * dpr * state.difficulty;
    const isBad = Math.random() < Math.min(0.20, 0.10 + state.difficulty*0.03);
    state.drops.push({
      x: Math.random()*w,
      y: -20*dpr,
      r: (isBad ? 16 : 14)*dpr,
      vy: speed,
      bad: isBad,
      wob: Math.random()*Math.PI*2
    });
  }

  function drawMascot(x,y,s){
    // original cute yellow dino (simple shapes)
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(s,s);

    // glow
    ctx.beginPath();
    ctx.arc(0,0,1.35,0,Math.PI*2);
    ctx.fillStyle = "rgba(255,214,77,0.18)";
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.roundRect(-1.0,-1.1,2.0,2.2,0.7);
    ctx.fillStyle = "rgba(255,214,77,0.95)";
    ctx.fill();

    // belly
    ctx.beginPath();
    ctx.roundRect(-0.62,0.0,1.24,0.95,0.55);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();

    // eyes
    ctx.fillStyle = "rgba(16,16,24,0.92)";
    ctx.beginPath(); ctx.arc(-0.42,-0.26,0.13,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0.42,-0.26,0.13,0,Math.PI*2); ctx.fill();

    // smile
    ctx.strokeStyle = "rgba(16,16,24,0.85)";
    ctx.lineWidth = 0.10;
    ctx.beginPath();
    ctx.arc(0,0.10,0.42,0,Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  function drawStar(x,y,r){
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    for(let i=0;i<10;i++){
      const a = (Math.PI*2/10)*i - Math.PI/2;
      const rr = i%2===0 ? r : r*0.45;
      ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(124,243,255,0.92)";
    ctx.fill();
    ctx.restore();
  }

  function drawBomb(x,y,r){
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0,0,r,0,Math.PI*2);
    ctx.fillStyle = "rgba(20,20,28,0.90)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-r*0.25,-r*0.25,r*0.25,0,Math.PI*2);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fill();
    // fuse
    ctx.strokeStyle = "rgba(255,214,77,0.85)";
    ctx.lineWidth = Math.max(1, r*0.18);
    ctx.beginPath();
    ctx.moveTo(r*0.2,-r*0.9);
    ctx.quadraticCurveTo(r*1.0,-r*1.2,r*0.9,-r*2.0);
    ctx.stroke();
    // spark
    ctx.beginPath();
    ctx.arc(r*0.95,-r*2.02, r*0.22, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,214,77,0.85)";
    ctx.fill();
    ctx.restore();
  }

  function hud(){
    const elScore = document.getElementById("score");
    const elBest = document.getElementById("best");
    const elLives = document.getElementById("lives");
    if(elScore) elScore.textContent = state.score;
    if(elBest) elBest.textContent = state.best;
    if(elLives) elLives.textContent = state.lives;
  }

  function reset(){
    state.running = true;
    state.score = 0;
    state.lives = 3;
    state.difficulty = 1;
    state.drops = [];
    hud();
  }

  function gameOver(){
    state.running = false;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem("tiyara_best", String(state.best));
    hud();
  }

  // Controls
  const keys = { left:false, right:false };
  window.addEventListener("keydown", (e)=>{
    if(e.key==="ArrowLeft"||e.key==="a") keys.left=true;
    if(e.key==="ArrowRight"||e.key==="d") keys.right=true;
    if(e.key==="r") reset();
  });
  window.addEventListener("keyup", (e)=>{
    if(e.key==="ArrowLeft"||e.key==="a") keys.left=false;
    if(e.key==="ArrowRight"||e.key==="d") keys.right=false;
  });

  canvas.addEventListener("pointerdown", (e)=>{
    canvas.setPointerCapture(e.pointerId);
    state.touchX = e.clientX;
  });
  canvas.addEventListener("pointermove", (e)=>{
    if(state.touchX==null) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left)/rect.width;
    state.player.x = Math.max(0.05, Math.min(0.95, x));
  });
  canvas.addEventListener("pointerup", ()=> state.touchX=null);
  canvas.addEventListener("pointercancel", ()=> state.touchX=null);

  const btnRestart = document.getElementById("restartGame");
  if(btnRestart) btnRestart.addEventListener("click", reset);

  hud();

  let spawnTimer = 0;
  function loop(){
    const dt = 1/60;
    state.t += dt;

    // bg
    ctx.clearRect(0,0,w,h);

    // decorative floating bubbles
    for(let i=0;i<14;i++){
      const x = (i/14)*w + Math.sin(state.t*0.6 + i)*20*dpr;
      const y = (h*0.12) + Math.cos(state.t*0.7 + i*0.8)*18*dpr;
      ctx.beginPath();
      ctx.arc(x,y, (2.5 + (i%4))*dpr, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fill();
    }

    // difficulty ramp
    state.difficulty = 1 + Math.min(2.2, state.score/22);

    // spawn drops
    spawnTimer += dt;
    const spawnEvery = Math.max(0.22, 0.46 - state.difficulty*0.08);
    if(state.running && spawnTimer > spawnEvery){
      spawnTimer = 0;
      spawn();
    }

    // player movement (keyboard)
    if(state.running){
      const accel = 0.022 * dpr;
      if(keys.left) state.player.x -= accel;
      if(keys.right) state.player.x += accel;
      state.player.x = Math.max(0.05, Math.min(0.95, state.player.x));
    }

    const px = state.player.x * w;
    const py = state.player.y * h;

    // drops update
    for(const d of state.drops){
      d.wob += 0.06;
      d.y += d.vy;
      d.x += Math.sin(d.wob)*0.6*dpr;

      // draw
      if(d.bad) drawBomb(d.x, d.y, d.r);
      else drawStar(d.x, d.y, d.r);

      // collision
      const dx = d.x - px;
      const dy = d.y - py;
      const dist = Math.hypot(dx,dy);
      const hit = dist < (d.r + state.player.size*0.75);
      if(state.running && hit){
        d.y = h + 9999; // remove later
        if(d.bad){
          state.lives -= 1;
          hud();
          if(state.lives <= 0) gameOver();
        }else{
          state.score += 1;
          if(state.score > state.best){
            state.best = state.score;
            localStorage.setItem("tiyara_best", String(state.best));
          }
          hud();
        }
      }
    }
    state.drops = state.drops.filter(d => d.y < h + 80*dpr);

    // draw player
    drawMascot(px, py, state.player.size);

    // overlay if game over
    if(!state.running){
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0,0,w,h);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.textAlign = "center";
      ctx.font = `${Math.floor(28*dpr)}px system-ui`;
      ctx.fillText("Game Over 😵", w/2, h*0.42);
      ctx.font = `${Math.floor(16*dpr)}px system-ui`;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText("Tap tombol Restart atau tekan R", w/2, h*0.49);
      ctx.restore();
    }

    requestAnimationFrame(loop);
  }
  loop();
})();
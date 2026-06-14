const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  const [a,b,c] = burger.querySelectorAll('span');
  a.style.transform = open ? 'rotate(45deg) translate(4.5px,4.5px)' : '';
  b.style.opacity   = open ? '0' : '1';
  c.style.transform = open ? 'rotate(-45deg) translate(4.5px,-4.5px)' : '';
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => { s.style.transform=''; s.style.opacity=''; });
}));

const phrases = [
  "Primero el concepto. Después el código.",
  "Tu negocio merece un sitio con identidad propia.",
  "Sitios que dicen algo antes de que leas una sola palabra.",
  "Diseño desde cero. Sin plantillas. Sin atajos.",
];
let pi=0, ci=0, del=false;
const typedEl = document.querySelector('.typed-text');
function type() {
  if (!typedEl) return;
  const p = phrases[pi];
  typedEl.textContent = del ? p.slice(0,--ci) : p.slice(0,++ci);
  if (!del && ci===p.length) { del=true; setTimeout(type,2800); return; }
  if  (del && ci===0) { del=false; pi=(pi+1)%phrases.length; }
  setTimeout(type, del?26:50);
}
setTimeout(type, 1200);

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.rv').forEach((el,i) => {
  el.style.transitionDelay = `${(i%4)*70}ms`;
  io.observe(el);
});

(function stageCanvas() {
  const canvas = document.getElementById('stageCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const SPOTS = Array.from({ length: 7 }, (_, i) => ({

    ax: (i + 0.5) / 7,
    angle: (Math.random() - 0.5) * 0.6,
    speed: (Math.random() * 0.003 + 0.001) * (Math.random()>.5?1:-1),
    maxAngle: Math.random() * 0.35 + 0.1,
    hue: i % 3 === 0 ? '58,171,240' : i%3===1 ? '30,120,200' : '100,200,255',
    alpha: Math.random() * 0.08 + 0.04,
    len: Math.random() * 0.55 + 0.45,
  }));

  class Dust {
    constructor(init) {
      this.x    = Math.random() * (W||1200);
      this.y    = init ? Math.random() * (H||900) : (H||900)+6;
      this.r    = Math.random() * 1.4 + 0.2;
      this.vy   = -(Math.random() * 0.18 + 0.05);
      this.vx   = (Math.random()-0.5) * 0.06;
      this.a    = Math.random() * 0.4 + 0.06;
      this.da   = (Math.random()*.003+.001) * (Math.random()>.5?1:-1);
      this.life = Math.random()*600+200;
      this.blue = Math.random()<0.15;
    }
    tick() {
      this.x+=this.vx; this.y+=this.vy;
      this.a+=this.da; this.life--;
      if(this.a>.5)this.da=-Math.abs(this.da);
      if(this.a<.04)this.da=Math.abs(this.da);
      if(this.y<-6||this.life<=0) Object.assign(this, new Dust(false));
    }
    draw() {
      const rgb = this.blue ? '180,200,255':'58,171,240';
      const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*5);
      g.addColorStop(0,`rgba(${rgb},${this.a*.7})`);
      g.addColorStop(1,`rgba(${rgb},0)`);
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r*5,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rgb},${Math.min(1,this.a+.2)})`; ctx.fill();
    }
  }

  let dust = [];
  function spawnDust() {
    const n = Math.min(90, Math.floor((W*H)/10000));
    dust = Array.from({length:n}, ()=>new Dust(true));
  }
  spawnDust();
  window.addEventListener('resize', spawnDust, {passive:true});

  let t = 0;
  function loop() {
    ctx.clearRect(0,0,W,H);

    const atm = ctx.createRadialGradient(W*.5, 0, 0, W*.5, 0, H*.8);
    atm.addColorStop(0,'rgba(20,80,160,0.12)');
    atm.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=atm; ctx.fillRect(0,0,W,H);

    SPOTS.forEach(s => {
      s.angle += s.speed;
      if (Math.abs(s.angle) > s.maxAngle) s.speed *= -1;

      const bx = s.ax * W;
      const by = H;
      const tx = bx + Math.sin(s.angle) * s.len * H;
      const ty = by - Math.cos(s.angle) * s.len * H;

      const beamW = 60 + Math.abs(Math.sin(s.angle)) * 20;

      const dx = tx - bx, dy = ty - by;
      const len = Math.sqrt(dx*dx+dy*dy);
      const px = -dy/len * beamW * 0.5;
      const py =  dx/len * beamW * 0.5;

      const g = ctx.createLinearGradient(bx, by, tx, ty);
      g.addColorStop(0, `rgba(${s.hue},${s.alpha*1.5})`);
      g.addColorStop(0.6,`rgba(${s.hue},${s.alpha*0.4})`);
      g.addColorStop(1, `rgba(${s.hue},0)`);

      ctx.beginPath();
      ctx.moveTo(bx - px*2, by - py*2);
      ctx.lineTo(bx + px*2, by + py*2);
      ctx.lineTo(tx + px*0.05, ty + py*0.05);
      ctx.lineTo(tx - px*0.05, ty - py*0.05);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();

      const flare = ctx.createRadialGradient(bx,by,0,bx,by,30);
      flare.addColorStop(0,`rgba(${s.hue},${s.alpha*3})`);
      flare.addColorStop(1,`rgba(${s.hue},0)`);
      ctx.beginPath(); ctx.arc(bx,by,30,0,Math.PI*2);
      ctx.fillStyle=flare; ctx.fill();
    });

    dust.forEach(d => { d.tick(); d.draw(); });

    const floor = ctx.createLinearGradient(0,H,0,H-4);
    floor.addColorStop(0,'rgba(58,171,240,0.12)');
    floor.addColorStop(1,'rgba(58,171,240,0)');
    ctx.fillStyle=floor; ctx.fillRect(0,H-40,W,40);

    const fade=ctx.createLinearGradient(0,H*.6,0,H);
    fade.addColorStop(0,'rgba(6,8,14,0)');
    fade.addColorStop(1,'rgba(6,8,14,0.97)');
    ctx.fillStyle=fade; ctx.fillRect(0,0,W,H);

    t++;
    requestAnimationFrame(loop);
  }
  loop();
})();

(function miniStage() {
  const c = document.getElementById('miniStage');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t=0;
  function resize() { W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  window.addEventListener('resize', resize, {passive:true}); resize();

  const MINI = Array.from({length:5}, (_,i)=>({
    ax:(i+0.5)/5, angle:(Math.random()-.5)*.5,
    speed:(Math.random()*.008+.003)*(Math.random()>.5?1:-1),
    maxAngle:.3
  }));

  function draw() {
    ctx.clearRect(0,0,W,H);
    MINI.forEach(s => {
      s.angle+=s.speed;
      if(Math.abs(s.angle)>s.maxAngle) s.speed*=-1;
      const bx=s.ax*W, by=H;
      const tx=bx+Math.sin(s.angle)*H*.95, ty=0;
      const g=ctx.createLinearGradient(bx,by,tx,ty);
      g.addColorStop(0,'rgba(58,171,240,0.15)');
      g.addColorStop(1,'rgba(58,171,240,0)');
      ctx.beginPath();
      ctx.moveTo(bx-5,by); ctx.lineTo(bx+5,by);
      ctx.lineTo(tx+1,ty); ctx.lineTo(tx-1,ty);
      ctx.closePath(); ctx.fillStyle=g; ctx.fill();
    });
    t++; requestAnimationFrame(draw);
  }
  draw();
})();

const sects = document.querySelectorAll('section[id], [id]');
const links = document.querySelectorAll('.nav-links a:not(.nav-cta)');
window.addEventListener('scroll', () => {
  let cur='';
  document.querySelectorAll('[id]').forEach(s => {
    if(window.scrollY >= s.offsetTop - 200) cur=s.id;
  });
  links.forEach(a => { a.style.color = a.getAttribute('href')==='#'+cur ? 'var(--white)' : ''; });
}, { passive: true });
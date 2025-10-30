// Neon Pulse - interactive button with particle background
// Works with any modern browser (no dependencies)

// ----- Canvas background particles -----
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;

window.addEventListener('resize', () => {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
});

// Particle system
class Particle {
  constructor(x,y,dx,dy,r,color,life){
    this.x=x; this.y=y; this.dx=dx; this.dy=dy; this.r=r; this.color=color; this.life=life;
  }
  update(){
    this.x += this.dx;
    this.y += this.dy;
    this.life -= 1;
    this.r *= 0.995;
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, this.life/100);
    ctx.arc(this.x, this.y, Math.max(0, this.r), 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const particles = [];
const palette = ['rgba(0,240,255,1)','rgba(255,49,232,1)','rgba(122,255,74,1)'];

function spawn(x,y,amount=14){
  for(let i=0;i<amount;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*3 + 0.6;
    const dx = Math.cos(angle)*speed;
    const dy = Math.sin(angle)*speed;
    const r = Math.random()*6 + 3;
    const color = palette[Math.floor(Math.random()*palette.length)];
    particles.push(new Particle(x,y,dx,dy,r,color, 60 + Math.random()*60));
  }
}

function updateParticles(){
  for(let i = particles.length-1;i>=0;i--){
    const p = particles[i];
    p.update();
    if(p.life <= 0 || p.r < 0.2) particles.splice(i,1);
  }
}

function drawParticles(){
  ctx.clearRect(0,0,W,H);
  // subtle gradient overlay
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0, 'rgba(10,10,20,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // draw glow blobs from palette for ambient effect
  for(let i=0;i<3;i++){
    ctx.beginPath();
    const cx = (i+0.5) * W / 3;
    const cy = H*0.18 + Math.sin(Date.now()/1200 + i)*40;
    const rad = 260 + Math.sin(Date.now()/800 + i)*80;
    ctx.fillStyle = palette[i] ? palette[i].replace('1)','0.06)') : 'rgba(255,255,255,0.05)';
    ctx.arc(cx,cy,rad,0,Math.PI*2);
    ctx.fill();
  }

  // draw particles
  for(const p of particles) p.draw();
}

// animation loop
function loop(){
  updateParticles();
  drawParticles();
  requestAnimationFrame(loop);
}
loop();

// occasional ambient spawns
setInterval(()=>{
  const x = Math.random()*W;
  const y = Math.random()*(H*0.6) + H*0.05;
  spawn(x,y, 6 + Math.floor(Math.random()*6));
}, 1100 + Math.random()*900);

// ----- Button interactions -----
const btn = document.getElementById('neonBtn');
let pressed=false;

function togglePulse(colorIndex){
  // flash the button glow and spawn particles at center
  btn.classList.add('pulsing');
  setTimeout(()=>btn.classList.remove('pulsing'), 900);

  // temporarily alter CSS custom properties (neon colors)
  const colors = [
    ['#00f0ff','#ff31e8'],
    ['#ff31e8','#7aff4a'],
    ['#7aff4a','#00f0ff']
  ];
  const c = colors[colorIndex % colors.length];
  btn.style.setProperty('--neon1', c[0]);
  btn.style.setProperty('--neon2', c[1]);

  // spawn particles
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  spawn(cx, cy, 28);
}

let currentColor = 0;

btn.addEventListener('pointerdown', (e)=>{
  pressed = true;
  btn.classList.add('pressed');
  btn.setAttribute('aria-pressed','true');
  // spawn a tighter burst
  const rect = btn.getBoundingClientRect();
  spawn(rect.left + rect.width/2, rect.top + rect.height/2, 20);
});

btn.addEventListener('pointerup', (e)=>{
  if(pressed){
    btn.classList.remove('pressed');
    btn.setAttribute('aria-pressed','false');
    // cycle color & pulse
    togglePulse(++currentColor);
  }
  pressed = false;
});

btn.addEventListener('pointerleave', ()=>{
  if(pressed){
    btn.classList.remove('pressed');
    btn.setAttribute('aria-pressed','false');
    pressed=false;
  }
});

// keyboard accessibility
btn.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' || e.key === ' '){
    e.preventDefault();
    togglePulse(++currentColor);
  }
});

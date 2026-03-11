// ============================================================
// LOADER
// ============================================================
(function(){
  const loader = document.getElementById('loader');
  const pct    = document.getElementById('loader-pct');
  let n = 0;
  const t = setInterval(() => {
    n = Math.min(n + Math.random() * 4, 100);
    if (pct) pct.textContent = Math.floor(n) + '%';
    if (n >= 100) {
      clearInterval(t);
      setTimeout(() => {
        loader.classList.add('hidden');
        init();
      }, 300);
    }
  }, 30);
})();

// ============================================================
// CURSOR
// ============================================================
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;

document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; if(cur) gsap.to(cur,{x:mx,y:my,duration:.05}); });
(function loop(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; if(ring) gsap.set(ring,{x:rx,y:ry}); requestAnimationFrame(loop); })();
document.querySelectorAll('a,button,.btn,.srv-card,.port-item,.fbtn,.tag,.soc-lnk').forEach(el => {
  el.addEventListener('mouseenter', () => { cur?.classList.add('hovered'); ring?.classList.add('hovered'); });
  el.addEventListener('mouseleave', () => { cur?.classList.remove('hovered'); ring?.classList.remove('hovered'); });
});

// ============================================================
// SCROLL PROGRESS
// ============================================================
window.addEventListener('scroll', () => {
  const p = document.getElementById('scroll-prog');
  if (!p) return;
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  p.style.transform = `scaleX(${pct})`;
});

// ============================================================
// HEADER SCROLL HIDE
// ============================================================
let lastSY = 0;
window.addEventListener('scroll', () => {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;
  const sy = window.scrollY;
  if (sy > 150) { hdr.classList.add('scrolled'); }
  if (sy > lastSY && sy > 150) { hdr.style.transform = 'translateY(-100%)'; }
  else { hdr.style.transform = 'translateY(0)'; }
  lastSY = sy;
});

// ============================================================
// NAVIGATION
// ============================================================
const hamBtn = document.getElementById('hamburger');
const navFS  = document.getElementById('nav-fs');
let navOpen  = false;

function openNav() {
  navOpen = true;
  hamBtn?.classList.add('open');
  hamBtn?.setAttribute('aria-expanded','true');
  navFS?.classList.add('open');
  navFS?.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  navOpen = false;
  hamBtn?.classList.remove('open');
  hamBtn?.setAttribute('aria-expanded','false');
  navFS?.classList.remove('open');
  navFS?.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
hamBtn?.addEventListener('click', () => navOpen ? closeNav() : openNav());
navFS?.querySelectorAll('a').forEach(a => { a.addEventListener('click', closeNav); });
document.addEventListener('keydown', e => { if(e.key==='Escape' && navOpen) closeNav(); });

// ============================================================
// SMOOTH SCROLL
// ============================================================
gsap.registerPlugin(ScrollToPlugin);
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const tgt = document.querySelector(a.getAttribute('href'));
    if (!tgt) return;
    e.preventDefault();
    closeNav();
    gsap.to(window, { scrollTo: { y: tgt, offsetY: 70 }, duration: 1.1, ease: 'power3.inOut' });
  });
});

// ============================================================
// SCROLL REVEAL
// ============================================================
gsap.registerPlugin(ScrollTrigger);
function initReveal() {
  document.querySelectorAll('.reveal,.sec-title').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 87%',
      onEnter: () => { el.classList.add('vis'); },
    });
  });

  // Counter
  document.querySelectorAll('.cnt').forEach(el => {
    const t = parseInt(el.getAttribute('data-t')) || 0;
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', once: true,
      onEnter: () => {
        let c = 0;
        const step = () => {
          c = Math.min(c + Math.ceil(t / 60), t);
          el.textContent = c;
          if (c < t) requestAnimationFrame(step);
        };
        step();
      }
    });
  });

  // Parallax hero bg
  gsap.to('.hero-bg-word', {
    y: '35%',
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Service cards tilt
  document.querySelectorAll('.srv-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      gsap.to(card, { rotateY: x*12, rotateX: -y*12, duration:.3, ease:'power2.out', transformPerspective:800 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY:0, rotateX:0, duration:.5, ease:'elastic.out(1,.5)' });
    });
  });

  // Portfolio items tilt
  document.querySelectorAll('.port-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const r = item.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      gsap.to(item, { rotateY: x*9, rotateX: -y*9, z: 20, duration:.3, ease:'power1.out', transformPerspective:700 });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { rotateY:0, rotateX:0, z:0, duration:.6, ease:'elastic.out(1,.5)' });
    });
  });

  // Stagger service grid
  gsap.fromTo('.srv-card',
    { opacity:0, y:50, scale:.96 },
    { opacity:1, y:0, scale:1, stagger:.08, duration:.6, ease:'power3.out',
      scrollTrigger: { trigger:'.srv-grid', start:'top 82%' } }
  );

  // Portfolio stagger
  gsap.fromTo('.port-item',
    { opacity:0, scale:.92 },
    { opacity:1, scale:1, stagger:.05, duration:.5, ease:'power2.out',
      scrollTrigger: { trigger:'#port-grid', start:'top 85%' } }
  );

  // Process steps
  gsap.fromTo('.proc-item',
    { opacity:0, x:-30 },
    { opacity:1, x:0, stagger:.1, duration:.55, ease:'power2.out',
      scrollTrigger: { trigger:'.proc-list', start:'top 80%' } }
  );

  // CTA title split animation
  gsap.fromTo('.cta-title',
    { opacity:0, scale:.95 },
    { opacity:1, scale:1, duration:1, ease:'power3.out',
      scrollTrigger: { trigger:'#cta', start:'top 80%' } }
  );
}

// ============================================================
// THREE.JS HERO SCENE
// ============================================================
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = window.innerWidth, H = window.innerHeight;
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W/H, .1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0,0);

  // Particles
  const cnt = 900;
  const pos = new Float32Array(cnt * 3);
  for (let i = 0; i < cnt; i++) {
    pos[i*3]   = (Math.random()-.5)*22;
    pos[i*3+1] = (Math.random()-.5)*22;
    pos[i*3+2] = (Math.random()-.5)*12;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color:0xffffff, size:.014, transparent:true, opacity:.5, sizeAttenuation:true }));
  scene.add(pts);

  // Wireframe shapes
  const wmat = () => new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:true, transparent:true, opacity:.07 });
  const meshes = [];

  const add = (g, x, y, z) => { const m = new THREE.Mesh(g, wmat()); m.position.set(x,y,z); scene.add(m); meshes.push(m); };
  add(new THREE.IcosahedronGeometry(1.6,1),  3.2, .6, -2.5);
  add(new THREE.OctahedronGeometry(1.1),    -3.8,-1.2,-3);
  add(new THREE.TorusGeometry(.9,.2,8,24),  -1.8, 2.2,-1.5);
  add(new THREE.BoxGeometry(1.1,1.1,1.1),    4.2,-2,-2);
  add(new THREE.TorusKnotGeometry(.6,.15,64,8), -4.8,1.8,-2.5);
  add(new THREE.DodecahedronGeometry(1.1),   1.5,-3,-1.5);

  let mouseX=0, mouseY=0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX/W-.5)*2;
    mouseY = -(e.clientY/H-.5)*2;
  });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    pts.rotation.y = t*.025;
    pts.rotation.x = t*.008;
    meshes.forEach((m,i) => { m.rotation.x = t*(.18+i*.09); m.rotation.y = t*(.25+i*.07); });
    camera.position.x += (mouseX*.35 - camera.position.x) * .04;
    camera.position.y += (mouseY*.25 - camera.position.y) * .04;
    renderer.render(scene, camera);
  })();
}

// ============================================================
// THREE.JS TESTIMONIAL SPHERE
// ============================================================
function initTesScene() {
  const canvas = document.getElementById('t3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const s = new THREE.Scene();
  const c = new THREE.PerspectiveCamera(50,1,.1,100);
  c.position.z = 3.2;
  const r = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  r.setSize(200,200);
  r.setClearColor(0,0);

  const mat = (op) => new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:true, transparent:true, opacity:op });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1,20,20), mat(.12));
  const inner  = new THREE.Mesh(new THREE.SphereGeometry(.55,32,32), mat(.04));
  const ring1  = new THREE.Mesh(new THREE.TorusGeometry(1.3,.008,8,80), mat(.25));
  const ring2  = new THREE.Mesh(new THREE.TorusGeometry(.85,.006,8,60), mat(.2));
  ring1.rotation.x = Math.PI/2;
  ring2.rotation.x = Math.PI/3;
  s.add(sphere, inner, ring1, ring2);

  let ti = 0;
  (function loop(){ requestAnimationFrame(loop); ti+=.01;
    sphere.rotation.y = ti; sphere.rotation.x = ti*.28;
    inner.rotation.y = -ti*.7;
    ring1.rotation.z = ti*.4;
    ring2.rotation.y = ti*.55;
    r.render(s,c);
  })();
}

// ============================================================
// TESTIMONIALS SLIDER
// ============================================================
let tidx = 0;
function initSlider() {
  const track = document.getElementById('ttrack');
  const dots  = document.getElementById('tdots');
  if (!track) return;

  const slides = track.querySelectorAll('.tslide');
  const n = slides.length;

  // Build dots
  if (dots) {
    slides.forEach((_,i) => {
      const d = document.createElement('div');
      d.className = 'tdot' + (i===0?' act':'');
      d.addEventListener('click', () => goTo(i));
      dots.appendChild(d);
    });
  }

  function goTo(i) {
    tidx = ((i % n) + n) % n;
    gsap.to(track, { x: `-${tidx*100}%`, duration:.75, ease:'power3.inOut' });
    dots?.querySelectorAll('.tdot').forEach((d,j) => d.classList.toggle('act', j===tidx));
  }

  document.getElementById('tnext')?.addEventListener('click', () => goTo(tidx+1));
  document.getElementById('tprev')?.addEventListener('click', () => goTo(tidx-1));

  // Auto
  let apl = setInterval(() => goTo(tidx+1), 5500);
  track.addEventListener('mouseenter', () => clearInterval(apl));
  track.addEventListener('mouseleave', () => { apl = setInterval(() => goTo(tidx+1), 5500); });
}

// ============================================================
// PORTFOLIO FILTER
// ============================================================
function initFilter() {
  document.querySelectorAll('.fbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-f');
      document.querySelectorAll('.port-item').forEach(item => {
        const c = item.getAttribute('data-f') || '';
        if (f==='all' || c===f) {
          gsap.fromTo(item,{opacity:0,scale:.92},{opacity:1,scale:1,duration:.4,ease:'power2.out',clearProps:'display'});
          item.style.display = '';
        } else {
          gsap.to(item,{opacity:0,scale:.92,duration:.3,onComplete:()=>{ item.style.display='none'; }});
        }
      });
    });
  });
}

// ============================================================
// CONTACT FORM
// ============================================================
function initForm() {
  const form = document.getElementById('cform');
  const msg  = document.getElementById('form-msg');
  const stxt = document.getElementById('sbtxt');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (stxt) stxt.textContent = 'Отправка...';
    setTimeout(() => {
      if (stxt) stxt.textContent = 'Отправить сообщение';
      if (msg) {
        msg.style.display = 'block';
        msg.style.color = 'rgba(255,255,255,.6)';
        msg.textContent = '✓ Сообщение отправлено! Мы ответим в течение 24 часов.';
        gsap.fromTo(msg,{opacity:0,y:8},{opacity:1,y:0,duration:.4});
        form.reset();
      }
    }, 1600);
  });
}

// ============================================================
// GLITCH EFFECT ON HOVER
// ============================================================
function initGlitch() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  document.querySelectorAll('.logo, .hero-word').forEach(el => {
    const orig = el.textContent;
    el.addEventListener('mouseenter', () => {
      let iter = 0;
      const max = orig.length * 3;
      const iv = setInterval(() => {
        el.textContent = orig.split('').map((ch,i) => {
          if (ch===' ') return ' ';
          if (i < iter/3) return orig[i];
          return chars[Math.floor(Math.random()*chars.length)];
        }).join('');
        if (++iter >= max) { clearInterval(iv); el.textContent = orig; }
      }, 28);
    });
  });
}

// ============================================================
// CURSOR TRAIL CANVAS
// ============================================================
function initTrail() {
  if (window.innerWidth < 768) return;
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const trail = [];
  const max = 22;
  window.addEventListener('resize', () => { cv.width=window.innerWidth; cv.height=window.innerHeight; });
  document.addEventListener('mousemove', e => { trail.push({x:e.clientX,y:e.clientY}); if(trail.length>max) trail.shift(); });
  (function draw(){ requestAnimationFrame(draw);
    ctx.clearRect(0,0,cv.width,cv.height);
    trail.forEach((p,i) => {
      const t = i/max;
      ctx.beginPath(); ctx.arc(p.x,p.y,t*2.5,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${t*.25})`; ctx.fill();
    });
  })();
}

// ============================================================
// INIT
// ============================================================
// INIT
// ============================================================
function init() {
  initHeroScene();
  initTesScene();
  initSlider();
  initFilter();
  initForm();
  initGlitch();
  initTrail();

  // ScrollTrigger reveals
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    document.querySelectorAll('.reveal, .sec-title').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => el.classList.add('vis')
      });
    });

    // Counter animation
    document.querySelectorAll('.cnt').forEach(el => {
      const target = +el.getAttribute('data-t');
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          let start = 0;
          const dur = 1800;
          const step = timestamp => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / dur, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
          };
          requestAnimationFrame(step);
        }
      });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          gsap.to(window, { scrollTo: target, duration: 1, ease: 'power3.inOut' });
        }
      });
    });
  }
}

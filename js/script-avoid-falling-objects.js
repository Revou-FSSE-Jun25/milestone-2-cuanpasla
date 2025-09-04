(() => {
    // Ambil elemen canvas dan context untuk menggambar
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    // Ambil elemen HUD untuk menampilkan skor, best, nyawa, level, dan progress level
    const elScore = document.getElementById('score');
    const elBest = document.getElementById('best');
    const elLives = document.getElementById('lives');
    const elLevel = document.getElementById('level');
    const levelFill = document.getElementById('levelFill');

    // Ambil elemen overlay untuk pause/game over
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMsg = document.getElementById('overlayMsg');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');

    // Event listener tombol pause dan new game
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('newBtn').addEventListener('click', newGame);
    resumeBtn.addEventListener('click', () => setPaused(false));
    restartBtn.addEventListener('click', newGame);

    // State utama game
    const state = {
        running: false, // status game berjalan
        paused: false,  // status game pause
        score: 0,       // skor saat ini
        best: parseInt(localStorage.getItem('avoid_best') || '0', 10), // skor terbaik dari localStorage
        lives: 3,       // jumlah nyawa
        level: 1,       // level saat ini
        levelProg: 0,   // progress ke level berikutnya (0..1)
        lastTime: 0,    // waktu frame terakhir
        spawnTimer: 0,  // timer spawn objek
        objects: [],    // array objek jatuh
        keys: { left:false, right:false }, // status tombol kiri/kanan
        player: {
            x: 300, y: 740, w: 80, h: 18, // posisi dan ukuran player
            speed: 420, color: '#3b82f6'
        },
        touch: { active:false, startX:0, startPX:0 } // data drag/touch
    };
    elBest.textContent = state.best; // tampilkan skor terbaik

    // Mulai game baru
    function newGame(){
        state.running = true;
        state.paused = false;
        state.score = 0;
        state.lives = 3;
        state.level = 1;
        state.levelProg = 0;
        state.objects = [];
        state.spawnTimer = 0;
        state.player.x = (canvas.width - state.player.w)/2; // reset posisi player
        elScore.textContent = state.score;
        elLives.textContent = state.lives;
        elLevel.textContent = state.level;
        levelFill.style.width = '0%';
        hideOverlay();
        state.lastTime = performance.now(); // set waktu awal
        requestAnimationFrame(loop); // mulai loop game
    }

    // Toggle pause
    function togglePause(){ setPaused(!state.paused); }

    // Set status pause
    function setPaused(v){
        if (!state.running) return;
        state.paused = v;
        if (v){
            showOverlay('Paused', 'Press P to resume');
        } else {
            hideOverlay();
            state.lastTime = performance.now();
            requestAnimationFrame(loop);
        }
    }

    // Game over
    function gameOver(){
        state.running = false;
        state.paused = true;
        // Update skor terbaik jika perlu
        if (state.score > state.best){
            state.best = state.score;
            localStorage.setItem('avoid_best', String(state.best));
            elBest.textContent = state.best;
        }
        showOverlay('Game Over', `Final Score: ${state.score}`);
    }

    // Tampilkan overlay
    function showOverlay(title, msg){
        overlayTitle.textContent = title;
        overlayMsg.textContent = msg;
        overlay.hidden = false;
    }
    // Sembunyikan overlay
    function hideOverlay(){ overlay.hidden = true; }

    // Parameter level (difficulty scaling)
    function params(){
        const lvl = state.level;
        return {
            spawnInterval: Math.max(280 - (lvl * 15), 90), // interval spawn objek (ms)
            minSpeed: 140 + (lvl * 20), // kecepatan minimum objek
            maxSpeed: 220 + (lvl * 30), // kecepatan maksimum objek
            sizeMin: 18, // ukuran minimum objek
            sizeMax: Math.max(26 - lvl, 14), // ukuran maksimum objek
            wobble: Math.min(70, 30 + lvl*5), // tingkat goyangan horizontal
        };
    }

    // Spawn objek baru
    function spawn(){
        const p = params();
        const size = rand(p.sizeMin, p.sizeMax);
        const x = rand(0, canvas.width - size);
        const speed = rand(p.minSpeed, p.maxSpeed);
        const hue = rand(0, 360);
        const rightBias = Math.random() * 2 - 1;
        state.objects.push({
            x, y: -size, w: size, h: size,
            vy: speed, // kecepatan vertikal
            vx: rightBias * 20, // kecepatan horizontal
            hue, // warna objek
            t: 0, // waktu hidup objek
        });
    }

    // Fungsi random integer
    function rand(min, max){ return Math.floor(Math.random()*(max-min+1)) + min; }

    // Main game loop
    function loop(time){
        if (!state.running || state.paused) return;

        let dt = Math.min(40, time - state.lastTime) / 1000; // delta time (maks 40ms)
        if (dt < 0) dt = 0;
        state.lastTime = time;

        update(dt); // update logika game
        draw();     // gambar ke canvas

        requestAnimationFrame(loop); // panggil frame berikutnya
    }

    // Update logika game
    function update(dt){
        // Skor bertambah sesuai waktu bertahan
        state.score += Math.floor(60 * dt);
        elScore.textContent = state.score;

        // Progress level
        state.levelProg += 0.08 * dt * (1 + state.level * 0.25);
        if (state.levelProg >= 1){
            state.level += 1;
            state.levelProg = 0;
            elLevel.textContent = state.level;
        }
        levelFill.style.width = `${Math.floor(state.levelProg * 100)}%`;

        // Gerakan player
        const p = state.player;
        let dir = 0;
        if (state.keys.left) dir -= 1;
        if (state.keys.right) dir += 1;
        p.x += dir * p.speed * dt;

        // Batasi posisi player di dalam canvas
        if (p.x < 0) p.x = 0;
        if (p.x + p.w > canvas.width) p.x = canvas.width - p.w;

        // Timer spawn objek
        state.spawnTimer -= dt * 1000;
        if (state.spawnTimer <= 0){
            spawn();
            state.spawnTimer = params().spawnInterval;
        }

        // Update posisi dan status objek
        const gravity = 6; // percepatan vertikal
        for (let i = state.objects.length - 1; i >= 0; i--){
            const o = state.objects[i];
            o.vy += gravity * dt;
            // Goyangan horizontal
            o.t += dt;
            o.x += o.vx * dt + Math.sin(o.t * 2) * (params().wobble * dt);
            o.y += o.vy * dt;

            // Batasi objek di dalam canvas
            if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx); }
            if (o.x + o.w > canvas.width) { o.x = canvas.width - o.w; o.vx = -Math.abs(o.vx); }

            // Cek tabrakan dengan player
            if (rectsOverlap(o, p)){
                state.objects.splice(i,1);
                damage();
                continue;
            }

            // Hapus objek jika sudah di luar layar
            if (o.y > canvas.height + 50){
                state.objects.splice(i,1);
            }
        }
    }

    // Kurangi nyawa jika kena objek
    function damage(){
        state.lives -= 1;
        elLives.textContent = state.lives;
        flashScreen();
        if (state.lives <= 0) gameOver();
    }

    // Deteksi tabrakan antara dua rectangle
    function rectsOverlap(a,b){
        return (a.x < b.x + b.w &&
                a.x + a.w > b.x &&
                a.y < b.y + b.h &&
                a.y + a.h > b.y);
    }

    // Gambar semua elemen ke canvas
    function draw(){
        // Bersihkan canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Gambar grid latar belakang
        drawGrid();

        // Gambar objek jatuh
        for (const o of state.objects){
            ctx.fillStyle = `hsl(${o.hue} 85% 55%)`;
            roundRect(ctx, o.x, o.y, o.w, o.h, 6, true, false);
        }

        // Gambar player
        ctx.fillStyle = '#3b82f6';
        roundRect(ctx, state.player.x, state.player.y, state.player.w, state.player.h, 8, true, false);

        // Efek glow jika nyawa tinggal 1
        if (state.lives === 1){
            ctx.strokeStyle = 'rgba(239,68,68,.7)';
            ctx.lineWidth = 4;
            roundRect(ctx, state.player.x-6, state.player.y-6, state.player.w+12, state.player.h+12, 10, false, true);
        }
    }

    // Gambar grid latar belakang
    function drawGrid(){
        const gap = 40;
        ctx.save();
        ctx.globalAlpha = .07;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let x=0; x<canvas.width; x+=gap){
            ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
        }
        for (let y=0; y<canvas.height; y+=gap){
            ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
        }
        ctx.restore();
    }

    // Gambar rectangle dengan sudut membulat
    function roundRect(ctx, x, y, w, h, r, fill, stroke){
        if (w < 2*r) r = w/2;
        if (h < 2*r) r = h/2;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y,   x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x,   y+h, r);
        ctx.arcTo(x,   y+h, x,   y,   r);
        ctx.arcTo(x,   y,   x+w, y,   r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    // Efek flash pada canvas
    function flashScreen(){
        canvas.style.filter = 'brightness(180%)';
        setTimeout(()=> canvas.style.filter = 'none', 80);
    }

    // Kontrol keyboard
    window.addEventListener('keydown', (e)=>{
        if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = true;
        if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = true;
        if (e.key === 'p' || e.key === 'P') togglePause();
    });
    window.addEventListener('keyup', (e)=>{
        if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = false;
        if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = false;
    });

    // Kontrol touch/drag untuk mobile
    let rect = canvas.getBoundingClientRect();
    const updateRect = () => rect = canvas.getBoundingClientRect();
    new ResizeObserver(updateRect).observe(canvas);
    window.addEventListener('scroll', updateRect);

    // Konversi posisi pointer ke koordinat canvas
    function clientToCanvasX(clientX){
        const scaleX = canvas.width / rect.width;
        return (clientX - rect.left) * scaleX;
    }
    canvas.addEventListener('pointerdown', (e)=>{
        state.touch.active = true;
        state.touch.startX = clientToCanvasX(e.clientX);
        state.touch.startPX = state.player.x;
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e)=>{
        if (!state.touch.active) return;
        const x = clientToCanvasX(e.clientX);
        const delta = x - state.touch.startX;
        state.player.x = state.touch.startPX + delta;
        if (state.player.x < 0) state.player.x = 0;
        if (state.player.x + state.player.w > canvas.width) state.player.x = canvas.width - state.player.w;
    });
    canvas.addEventListener('pointerup', ()=>{ state.touch.active = false; });

    // Tampilkan overlay saat game dimulai (belum start)
    showOverlay('Ready?', 'Press New Game to start, or P to pause at any time.');
})
();

// Modul tombol kembali ke beranda
(function(){
    const HOME = "index.html";
    const btn = document.getElementById("backBtn");

    // Cek apakah bisa kembali ke halaman sebelumnya (origin sama)
    function canGoBackSameOrigin(){
        try{
            if (!document.referrer) return false;
            const ref = new URL(document.referrer);
            return ref.origin === location.origin;
        }catch(e){ return false; }
    }

    // Fungsi kembali ke beranda atau history.back
    function goBack(){
        if (canGoBackSameOrigin()) {
            history.back();
        } else {
            location.href = HOME;
        }
    }

    // Event tombol klik kembali
    btn.addEventListener("click", goBack);

    // Event keyboard: Esc atau Alt + ArrowLeft untuk kembali
    window.addEventListener("keydown", (e) => {
        const altLeft = (e.altKey && (e.key === "ArrowLeft" || e.code === "ArrowLeft"));
        const esc = (e.key === "Escape" || e.code === "Escape");
        if (altLeft || esc){
            e.preventDefault();
            goBack();
        }
    });
})
();
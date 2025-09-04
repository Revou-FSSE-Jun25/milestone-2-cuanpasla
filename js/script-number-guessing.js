const els = {
    // Kumpulan elemen DOM yang digunakan dalam game
    rangePill: document.getElementById('rangePill'),
    difficulty: document.getElementById('difficulty'),
    min: document.getElementById('min'),
    max: document.getElementById('max'),
    newGameBtn: document.getElementById('newGameBtn'),
    resetBtn: document.getElementById('resetBtn'),
    guessInput: document.getElementById('guess'),
    guessBtn: document.getElementById('guessBtn'),
    status: document.getElementById('status'),
    attemptsLeft: document.getElementById('attemptsLeft'),
    totalAttempts: document.getElementById('totalAttempts'),
    progress: document.getElementById('progress'),
    history: document.getElementById('history'),
    giveUpBtn: document.getElementById('giveUpBtn'),
    revealHintBtn: document.getElementById('revealHintBtn'),
};

// Jumlah percobaan berdasarkan tingkat kesulitan
const DIFF = { easy: 10, normal: 7, hard: 5 };

// State awal game
let state = {
    min: 1, max: 100,
    secret: null,        // angka rahasia
    attemptsLeft: 0,     // sisa percobaan
    totalAttempts: 0,    // total percobaan
    guesses: [],         // riwayat tebakan
    gameOver: true,      // apakah game selesai
    lowerBound: null,    // batas bawah untuk hint
    upperBound: null,    // batas atas untuk hint
};

// Utility: menghasilkan angka random inklusif
function randInt(min, max){
    min = Math.ceil(min); max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inisialisasi game baru
function initGame(){
    const min = parseInt(els.min.value, 10);
    const max = parseInt(els.max.value, 10);

    // Validasi input range
    if (Number.isNaN(min) || Number.isNaN(max) || min >= max){
        toast('Invalid range. Please ensure Min < Max.', true);
        return;
    }

    // Set jumlah percobaan sesuai tingkat kesulitan
    const tries = DIFF[els.difficulty.value] ?? DIFF.normal;

    // Reset state game
    state = {
        min, max,
        secret: randInt(min, max),
        attemptsLeft: tries,
        totalAttempts: tries,
        guesses: [],
        gameOver: false,
        lowerBound: min - 1,
        upperBound: max + 1,
    };

    // Update tampilan UI
    els.rangePill.textContent = `Range: ${min} – ${max}`;
    els.status.textContent = 'Game started. Make your first guess!';
    els.attemptsLeft.textContent = state.attemptsLeft;
    els.totalAttempts.textContent = state.totalAttempts;
    els.progress.style.width = '0%';
    els.history.innerHTML = '';
    els.giveUpBtn.disabled = false;
    els.revealHintBtn.disabled = false;
    els.resetBtn.disabled = false;
    els.guessInput.disabled = false;
    els.guessBtn.disabled = false;
    els.guessInput.value = '';
    els.guessInput.focus();
}

// Utility: tampilkan pesan status
function toast(msg, isError=false){
    els.status.innerHTML = isError ? `<span class="danger">${msg}</span>` : msg;
}

// Akhiri game (menang/kalah)
function endGame(win){
    state.gameOver = true;
    els.guessInput.disabled = true;
    els.guessBtn.disabled = true;
    els.giveUpBtn.disabled = true;
    els.revealHintBtn.disabled = true;

    const msg = win
        ? `<strong class="success">Correct!</strong> The secret number was <strong>${state.secret}</strong>.`
        : `<strong class="danger">Game over.</strong> The secret number was <strong>${state.secret}</strong>.`;

    toast(msg);
    els.progress.style.width = '100%';
}

// Tambahkan riwayat tebakan ke tampilan
function pushHistory(n){
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = n;
    els.history.prepend(chip);
}

// Handler ketika user menebak angka
function handleGuess(){
    if (state.gameOver) return;

    const val = parseInt(els.guessInput.value, 10);

    // Validasi input
    if (Number.isNaN(val)) { toast('Please enter a number.', true); return; }
    if (val < state.min || val > state.max){
        toast(`Out of range. Enter a number between ${state.min} and ${state.max}.`, true);
        return;
    }

    // Simpan tebakan
    state.guesses.push(val);
    pushHistory(val);
    state.attemptsLeft -= 1;
    els.attemptsLeft.textContent = state.attemptsLeft;

    // Update progress bar
    const used = state.totalAttempts - state.attemptsLeft;
    els.progress.style.width = `${(used / state.totalAttempts) * 100}%`;

    // Cek hasil tebakan
    if (val === state.secret){ endGame(true); return; }

    if (val < state.secret){
        state.lowerBound = Math.max(state.lowerBound, val);
        toast(`Too low. Try a number between <strong>${state.lowerBound + 1}</strong> and <strong>${state.upperBound - 1}</strong>.`);
    } else {
        state.upperBound = Math.min(state.upperBound, val);
        toast(`Too high. Try a number between <strong>${state.lowerBound + 1}</strong> and <strong>${state.upperBound - 1}</strong>.`);
    }

    // Kalau sudah habis percobaan
    if (state.attemptsLeft <= 0){ endGame(false); return; }

    els.guessInput.select();
}

// Event untuk tombol "New Game"
els.newGameBtn.addEventListener('click', initGame);

// Reset semua ke default
els.resetBtn.addEventListener('click', () => {
    els.difficulty.value = 'normal';
    els.min.value = 1; els.max.value = 100;
    els.status.textContent = 'Reset complete. Choose settings and start a new game.';
    els.rangePill.textContent = 'Range: 1 – 100';
    els.attemptsLeft.textContent = '—';
    els.totalAttempts.textContent = '—';
    els.progress.style.width = '0%';
    els.history.innerHTML = '';
    state.gameOver = true;
    els.guessInput.value='';
    els.guessInput.disabled = true; els.guessBtn.disabled = true;
    els.giveUpBtn.disabled = true; els.revealHintBtn.disabled = true; els.resetBtn.disabled = true;
});

// Event untuk tombol "Guess"
els.guessBtn.addEventListener('click', handleGuess);
els.guessInput.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') handleGuess(); });

// Tombol menyerah
els.giveUpBtn.addEventListener('click', () => {
    if (state.gameOver) return;
    endGame(false);
});

// Tombol hint (bantuan)
els.revealHintBtn.addEventListener('click', () => {
    if (state.gameOver) return;
    const mid = Math.floor((state.lowerBound + state.upperBound) / 2);
    toast(`Hint: The number is ${state.secret > mid ? 'greater' : 'less'} than <strong>${mid}</strong>.`);
});

// Nonaktifkan input sebelum game dimulai
els.guessInput.disabled = true; els.guessBtn.disabled = true;

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
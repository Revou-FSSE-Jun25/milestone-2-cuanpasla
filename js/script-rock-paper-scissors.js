let playerScore = 0;                  // Skor pemain
let computerScore = 0;                // Skor komputer

function playGame(playerChoice) {
    const choices = ['rock', 'paper', 'scissors'];                        // Pilihan yang tersedia
    const computerChoice = choices[Math.floor(Math.random() * 3)];        // Pilihan komputer secara acak
    let result = '';                                                      // Variabel hasil

    // Logika penentuan hasil
    if (playerChoice === computerChoice) {
        result = "It's a draw! You both chose " + playerChoice + ".";     // Seri
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        result = `You Win! ${playerChoice} beats ${computerChoice}.`;     // Pemain menang
        playerScore++;                                                    // Tambah skor pemain
    } else {
        result = `You Lose! ${computerChoice} beats ${playerChoice}.`;    // Komputer menang
        computerScore++;                                                  // Tambah skor komputer
    }

    document.getElementById('result').textContent = result;               // Tampilkan hasil di layar
    document.getElementById('score').textContent = 
        `Player: ${playerScore} | Computer: ${computerScore}`;            // Tampilkan skor di layar
}

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
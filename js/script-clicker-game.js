let score = 0;                 // Nilai skor saat ini
let pointsPerClick = 1;        // Jumlah poin yang didapat setiap klik
let upgradeCost = 10;          // Biaya upgrade awal

const scoreDisplay = document.getElementById('score');           // Elemen tampilan skor
const clickButton = document.getElementById('clickButton');      // Tombol klik utama
const upgradeButton = document.getElementById('upgradeButton');  // Tombol upgrade

// Event klik pada tombol utama
clickButton.addEventListener('click', () => {
    score += pointsPerClick;    // Tambah skor sesuai poin per klik
    updateScore();              // Update tampilan skor
});

// Event klik pada tombol upgrade
upgradeButton.addEventListener('click', () => {
    if (score >= upgradeCost) {             // Jika skor cukup untuk upgrade
        score -= upgradeCost;               // Kurangi skor sesuai biaya upgrade
        pointsPerClick++;                   // Tambah poin per klik
        upgradeCost *= 2;                   // Gandakan biaya upgrade berikutnya
        upgradeButton.textContent = `Upgrade (+1 per click) - Cost: ${upgradeCost}`; // Update teks tombol upgrade
        updateScore();                      // Update tampilan skor
    } else {
        alert('Not enough points!');        // Tampilkan pesan jika skor kurang
    }
});

// Fungsi untuk update tampilan skor di layar
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
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
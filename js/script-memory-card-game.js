const emojis = ["🍎","🍌","🍇","🍉","🍓","🍍","🥝","🍒"]; // Daftar emoji yang digunakan sebagai kartu
let cardsArray = [...emojis, ...emojis];                // Duplikat array emoji untuk pasangan kartu
let flippedCards = [];                                  // Array untuk menyimpan kartu yang sedang dibuka
let matchedCount = 0;                                   // Jumlah kartu yang sudah cocok

// Shuffle cards
cardsArray.sort(() => 0.5 - Math.random());             // Acak urutan kartu

const gameBoard = document.getElementById("gameBoard"); // Ambil elemen board dari HTML

// Buat elemen kartu untuk setiap emoji
cardsArray.forEach((emoji) => {
    const card = document.createElement("div");         // Buat elemen div untuk kartu
    card.classList.add("card");                         // Tambahkan class "card"
    card.dataset.emoji = emoji;                         // Simpan emoji di dataset
    card.addEventListener("click", flipCard);           // Event klik untuk membalik kartu
    gameBoard.appendChild(card);                        // Tambahkan kartu ke board
});

// Fungsi untuk membalik kartu
function flipCard() {
    // Jika kartu sudah dibuka, sudah cocok, atau sudah ada 2 kartu terbuka, abaikan klik
    if (this.classList.contains("flipped") || this.classList.contains("matched") || flippedCards.length === 2) {
        return;
    }

    this.classList.add("flipped");                      // Tambahkan class flipped
    this.textContent = this.dataset.emoji;              // Tampilkan emoji pada kartu
    flippedCards.push(this);                            // Simpan kartu yang dibuka

    if (flippedCards.length === 2) {                    // Jika sudah 2 kartu terbuka, cek kecocokan
        checkMatch();
    }
}

// Fungsi untuk mengecek apakah dua kartu cocok
function checkMatch() {
    const [card1, card2] = flippedCards;                // Ambil dua kartu yang dibuka
    if (card1.dataset.emoji === card2.dataset.emoji) {  // Jika emoji sama
        card1.classList.add("matched");                 // Tandai kartu sudah cocok
        card2.classList.add("matched");
        matchedCount += 2;                              // Tambah jumlah kartu cocok
        flippedCards = [];                              // Reset array kartu terbuka
        if (matchedCount === cardsArray.length) {       // Jika semua kartu sudah cocok
            setTimeout(() => alert("You Win! 🎉"), 300);// Tampilkan pesan menang
        }
    } else {
        // Jika tidak cocok, tutup kembali kedua kartu setelah delay
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            card1.textContent = "";
            card2.textContent = "";
            flippedCards = [];
        }, 800);
    }
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
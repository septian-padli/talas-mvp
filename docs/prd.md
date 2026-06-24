# Product Requirement Document (PRD) — Talas App (MVP)

## 1. Executive Summary

### 1.1. Context & Problem Statement

Dalam ekosistem digital saat ini, platform sosial untuk _developer_ dan _creator_ cenderung terfragmentasi. Platform _micro-blogging_ menawarkan kecepatan interaksi tetapi sering kali kekurangan kedalaman substansi dan rentan terhadap distraksi. Di sisi lain, forum tradisional menawarkan kedalaman informasi namun memiliki batasan interaksi yang kaku. Akibatnya, sulit bagi para profesional untuk berdiskusi secara mendalam sekaligus membangun audiens organik di satu tempat yang sama.

### 1.2. Product Vision

**Talas** hadir sebagai platform sosial dan diskusi _hybrid_ yang dirancang khusus untuk profesional tech, developer, dan kreator digital. Dengan mengadopsi kecepatan interaksi _feed_ modern namun mempertahankan kultur diskusi yang berbobot, berbasis pengetahuan, dan terorganisasi ke dalam sub-komunitas khusus, Talas menjadi ruang tunggal untuk membagikan progres, berdiskusi teknis, dan membuka peluang kolaborasi nyata.

### 1.3. Core Value Proposition

- **Unified Streamlining (Artifact):** Satu format konten fleksibel yang dapat mengakomodasi pemikiran singkat, pertanyaan teknis, diskusi, maupun dokumentasi proyek mendalam tanpa sekat tipe konten yang kaku.

- **Merit-Based Engagement (Boost/Reduce):** Mengeliminasi indikator popularitas semu (_likes_) dan menggantinya dengan sistem penilaian berbasis bobot untuk memastikan konten berkualitas yang naik ke permukaan.

- **Guild-Driven Ecosystem:** Distribusi konten yang terarah melalui sub-komunitas khusus (_Guilds_), memungkinkan pengguna langsung menemukan topik yang relevan dan membangun interaksi profesional sejak hari pertama.

---

## 2. Glossary (Istilah & Konsep Utama)

Untuk menyamakan persepsi selama fase perancangan dan pengembangan, berikut adalah daftar istilah inti yang digunakan dalam ekosistem Talas:

- **Artifact:** Format konten atau postingan tunggal di platform yang bersifat modular. Berfungsi sebagai media bagi pengguna untuk membagikan gagasan, kode, pertanyaan, atau dokumentasi hasil karya tanpa batasan tipe. Dukungan _rich-text_, penyematan media/kode, serta penandaan kategori (_tagging_) tersedia di dalamnya. Konten ini dapat diterbitkan ke _feed_ umum atau diarahkan ke dalam _Guild_ tertentu.

- **Guild / Guilds:** Fitur sub-komunitas atau forum berbasis topik/minat spesifik (misal: _Guild_ TypeScript, _Guild_ UI/UX). Pengguna dapat melakukan _subscribe_ ke _Guild_ untuk mengurasi isi _feed_ mereka, dan merilis _Artifact_ langsung di dalamnya agar menjangkau audiens yang tepat.

- **Boost & Reduce System:** Mekanisme penilaian utama berbasis bobot komunitas untuk menggantikan metrik konvensional seperti "Like". **Boost** digunakan untuk mendorong konten berkualitas agar naik, sedangkan **Reduce** digunakan untuk meredam konten yang kurang relevan. Sistem ini berlaku pada _Artifact_ maupun _Discussion_.

- **Discussion:** Sistem komentar bertingkat (_multi-level/nested_) di bawah sebuah _Artifact_ yang memungkinkan diskusi teknis berjalan rapi tanpa kehilangan konteks pembicaraan utama. Fitur ini mendukung _User Mentions_ (`@username`) untuk mengundang pengguna lain ke dalam utas pembicaraan.

- **Collect & Collection:** Fitur utilitas personal (semacam _bookmark_) yang memungkinkan pengguna menyimpan _Artifact_ berharga yang mereka temukan. Halaman khusus tempat berkumpulnya seluruh _Artifact_ yang telah disimpan oleh pengguna disebut sebagai **Collection**.

- **Amplify:** Fitur atau tombol berbagi (_share button_) yang memfasilitasi pengguna untuk menyebarkan atau mendistribusikan tautan _Artifact_ berharga secara langsung ke luar platform (seperti ke WhatsApp atau menyalin tautan).

- **Tech Taxonomy (Tagging/Category):** Sistem pelabelan menggunakan _hashtag_ (seperti `#Nextjs`, `#DevOps`) untuk mengelompokkan konten secara spesifik di luar batasan topik utama sebuah _Guild_.

- **Notification Center:** Sistem pemberitahuan _real-time_ untuk melacak interaksi aktivitas pengguna seperti saat _Artifact_ mereka mendapatkan _Boost/Reduce_, _Discussion_ baru, sebutan (_mentions_), atau aktivitas langganan pada _Guild_.

- **Watchlist:** Daftar akun pengguna lain yang dipantau atau diikuti oleh seorang pengguna untuk mendapatkan pembaruan aktivitas dan konten Artifact terbaru di linimasa mereka (menggantikan istilah _Following_).

- **Watchers:** Kumpulan pengguna lain yang memantau atau mengikuti akun milik pengguna, yang akan menerima distribusi notifikasi setiap kali pengguna tersebut menerbitkan Artifact baru (menggantikan istilah _Followers_).

- **Connections:** Status hubungan jaringan dua arah (_mutual connection_) yang terjadi secara otomatis ketika dua orang pengguna di platform Talas saling masuk ke dalam _Watchlist_ satu sama lain (saling memantau).

---

## 3. Pages Structure

```
/ (Root)
├── /login
├── /register
├── /forgot-password
├── /change-password
├── / (homepage / Feed utama)
├── /search?q={query-param}
├── /notifications
├── /collection
├── /artifact
│   ├── /create
│   └── /[slug]
│       └── /edit
├── /guild
│   ├── /create
│   └── /[slug]
│       ├── /edit
│       └── /insight
├── /profile/[id-user]
│   ├── / (Artifact publik milik user)
│   ├── /edit
│   ├── /archives
│   └── /invites (Daftar pending undangan kolaborasi)
└── /setting
    ├── /support
    └── /privacy-policy
```

## 4. Expected Features

### 4.1. Authentication, Identity, & User Profile Dashboard

**Deskripsi Singkat:**
Menyediakan sistem manajemen identitas terpusat untuk otentikasi pengguna (manual & Google OAuth), verifikasi keamanan berbasis OTP, serta penyediaan dasbor profil publik dan privat untuk mengelola data personal dan portofolio konten milik pengguna.

**Alur Utama (User Flow):**

- **Alur Pendaftaran Manual (Register) & Verifikasi OTP:**
  1. User mengakses halaman `/register` dan mengisi form pendaftaran (Email, Username, Password).
  2. Sistem melakukan validasi, menyimpan data akun dengan status belum terverifikasi (`is_verified: false`), lalu mengarahkan User secara otomatis ke halaman `/verification`.
  3. Di halaman `/verification`, User mengklik tombol "Send Verification", sistem membuat kode OTP unik dan mengirimkannya ke email User.
  4. User memasukkan kode OTP ke dalam form input di halaman tersebut. Jika kode cocok, status akun berubah menjadi aktif (`is_verified: true`) dan User diarahkan ke halaman `/login`.

- **Alur Pendaftaran & Login OAuth (Google Auth):**
  1. User mengakses halaman `/login` atau `/register` dan menekan tombol "Continue with Google".
  2. User diarahkan ke halaman persetujuan Google, memilih akun Google mereka, dan diarahkan kembali ke platform Talas.
  3. Sistem memeriksa apakah email Google sudah terdaftar di database.
  4. **Skenario A (Belum Terdaftar):** Sistem menahan proses login dan melempar User ke halaman khusus `/setup-username`. Setelah User menginput username baru yang unik dan valid, sistem menyimpan data akun dengan status langsung terverifikasi (`is_verified: true`), lalu menerbitkan JWT.
  5. **Skenario B (Sudah Terdaftar):** Sistem langsung menerbitkan JWT dan mengarahkan pengguna ke halaman utama `/`.

- **Alur Masuk Manual (Login):**
  1. User mengakses halaman `/login` dan memasukkan kombinasi Email/Username serta Password.
  2. Sistem memvalidasi kredensial. Jika kredensial cocok namun akun belum terverifikasi (`is_verified: false`), sistem akan memblokir proses masuk dan langsung memaksa (_force redirect_) User ke halaman `/verification` untuk melakukan prosedur verifikasi OTP.
  3. Jika akun sudah terverifikasi, sistem menerbitkan JWT dan mengarahkan User ke halaman `/`.

- **Alur Manajemen Profil:**
  1. User masuk ke halaman `/profile/[id-user]` untuk melihat portofolio Artifact publik, bio, keahlian utama, serta tautan eksternal (GitHub/LinkedIn).
  2. Pemilik profil dapat mengakses rute `/profile/[id-user]/edit` untuk memperbarui seluruh data personal dan informasi portofolio developer (kecuali alamat email yang bersifat permanen/terkunci).
  3. Pemilik profil dapat mengakses rute privat `/profile/[id-user]/archives` untuk melihat daftar Artifact miliknya yang sedang disembunyikan dari publik.

**Ketentuan Fungsional (Business Rules):**

- **Metode Identifikasi:** Login manual wajib mendukung penanganan dua opsi pengenal unik secara fleksibel, yaitu menggunakan alamat email atau username.
- **Validasi Kredensial:** Password wajib memenuhi standar keamanan minimal 8 karakter dengan kombinasi huruf dan angka. Kredensial password wajib disimpan dalam bentuk _hashing_ aman (seperti bcrypt atau argon2).
- **Mekanisme & Penyimpanan JWT:** Sesi otentikasi dikelola via JSON Web Token (JWT) yang disimpan di sisi klien pada HttpOnly Cookie dengan atribut `Secure` dan `SameSite=Strict` untuk mitigasi risiko XSS dan CSRF. Token wajib memiliki masa kedaluwarsa yang jelas dan dibersihkan saat _logout_.
- **Aturan Verifikasi Email:** Akun hasil pendaftaran manual dilarang keras mengakses beranda atau fitur internal sebelum menyelesaikan verifikasi OTP. Kode OTP memiliki masa aktif maksimal 15-30 menit, sedangkan akses ke halaman `/verification` dilindungi oleh session pendaftaran sementara.
- **Sinergi Kredensial & OAuth:** Jika email dari Google OAuth sudah terdaftar via pendaftaran manual, pengguna diarahkan untuk masuk menggunakan metode Google Auth, kecuali mereka telah menyetel password manual secara eksplisit di dalam pengaturan profil.
- **Otorisasi Halaman Privat:** Halaman `/profile/[id-user]/archives` dan halaman manajemen undangan kolaborasi bersifat privat dan dilindungi oleh _middleware_ otorisasi berbasis kecocokan JWT session dengan `id-user` pada parameter rute.

---

### 4.2. Artifact Publishing & Collaborative Co-Authoring Engine

**Deskripsi Singkat:**
Sistem pembuatan dan penerbitan konten modular menggunakan WYSIWYG Editor berbasis Markdown yang mendukung kepemilikan ganda (_co-authoring_) hingga maksimal 5 pengguna melalui mekanisme persetujuan undangan kolaborasi yang terintegrasi.

**Alur Utama (User Flow):**

- **Alur Pembuatan Artifact & Penanganan Media (Frontend-Driven):**
  1. User A membuka form pemformatan di `/artifact/create` yang ditenagai oleh MDXEditor.
  2. Saat User A memasukkan gambar ke dalam konten, komponen _React Easy Crop_ menyediakan antarmuka pemotongan gambar secara visual di sisi klien.
  3. Hasil pemotongan gambar langsung diproses secara asinkronus oleh _Browser-Image-Resizer_ di latar belakang untuk dikompresi skala dimensinya dan dikonversi menjadi format `.webp`.
  4. Frontend melakukan request ke API Route `/api/media/presigned-url` untuk meminta tautan unggah Cloudflare R2, kemudian melakukan HTTP `PUT` biner langsung dari browser ke R2 menggunakan presigned URL tersebut.
  5. User A menginput hingga maksimal 5 username pengguna lain (misal: User B) pada kolom input kolaborator, lalu menekan tombol terbit (_publish_).

- **Alur Konfirmasi & Distribusi Kolaborasi:**
  1. Setelah Artifact terbit, status relasi kolaborasi di database disimpan sebagai `PENDING`. Artifact tersebut tayang di feed atas nama User A saja.
  2. Sistem mengirimkan notifikasi _real-time_ ke User B. Ketika diklik, User B diarahkan ke halaman dasbor privat `/profile/[id-user]/invites`.
  3. Jika User B menekan tombol "Accept", status relasi di database berubah menjadi `ACCEPTED`. Konten Artifact otomatis diperbarui untuk menampilkan atribusi penulis ganda (_By User A and User B_), muncul di halaman profil publik User B, dan didistribusikan ke jaringan pengikut (_followers_) kedua belah pihak.
  4. Jika User B menekan tombol "Decline", data undangan dihapus dan Artifact tetap berjalan normal hanya atas nama User A.

- **Alur Pelepasan Konten Kolaboratif:**
  1. User B (Collaborator) tidak memiliki hak akses untuk mengubah isi teks, melakukan _archive_, atau menghapus Artifact yang diinisiasi oleh User A.
  2. Namun, User B memiliki opsi tombol "Leave Collaboration" di halaman manajemen mereka.
  3. Jika diklik, sistem menghapus relasi User B dari Artifact tersebut. Atribusi nama User B hilang dari konten, dan Artifact otomatis ditarik dari halaman profil publik User B.

**Ketentuan Fungsional (Business Rules):**

- **Pemformatan Konten:** Konten utama wajib ditulis dan disimpan dalam bentuk struktur string Markdown/MDX asli hasil luaran MDXEditor.
- **Validasi Batasan Kolaborator:** Jumlah akun yang dapat diundang sebagai kolaborator dibatasi maksimal 5 pengguna per satu Artifact.
- **Manajemen Hak Akses Konten:** Hak untuk melakukan penyuntingan isi (_edit_), pengarsipan ke halaman privat (_archive_), dan penghapusan permanen (_delete_) secara eksklusif hanya dimiliki oleh pemilik/pembuat asli Artifact (User A).
- **Penanganan Duplikasi Slug Rute:** Komponen router mengandalkan properti slug unik yang dibentuk otomatis dari judul Artifact. Jika sistem mendeteksi adanya slug yang duplikat di database, sistem wajib menambahkan stempel waktu numerik (_timestamp_) di bagian akhir string slug tersebut (misal: `/artifact/panduan-setup-nextjs-171892012`).

### 4.3. Guild Community Spaces & Insights Hub

**Deskripsi Singkat:**
Menyediakan fitur sub-komunitas terbuka (Guild) berbasis topik atau minat teknologi tertentu yang bebas dibuat oleh pengguna mana pun untuk mengurasi distribusi Artifact, serta dilengkapi dengan dasbor analitik khusus bagi pemilik Guild.

**Alur Utama (User Flow):**

- **Alur Pembuatan & Manajemen Guild:**
  1. User mengakses halaman `/guild/create` dan mengisi form data Guild (Nama Guild, Deskripsi, Avatar, Banner, dan Topik Utama).
  2. Sistem memvalidasi keunikan nama Guild, lalu membuat entitas Guild baru di database dan otomatis menyematkan status pembuat tersebut sebagai `Guild Owner`.
  3. `Guild Owner` dapat mengakses rute `/guild/[slug]/edit` untuk mengubah informasi profil komunitas kapan saja.

- **Alur Akses Konten & Subskripsi (Umum):**
  1. Pengguna (baik yang sudah login maupun tamu anonim) dapat membuka rute `/guild/[slug]` untuk melihat seluruh linimasa Artifact yang dipublikasikan di dalam Guild tersebut secara bebas.
  2. Pengguna yang sudah login dapat mengklik tombol "Subscribe" untuk berlangganan. Setelah diklik, sistem memasukkan data pengguna ke dalam daftar pengikut Guild, dan konten dari Guild tersebut akan otomatis diprioritaskan muncul di halaman beranda (`/`) mereka.

- **Alur Akses Analitik Dasbor (Eksklusif Owner):**
  1. `Guild Owner` membuka halaman Guild miliknya dan menekan tombol dasbor analitik yang mengarah ke rute `/guild/[slug]/insight`.
  2. Sistem menampilkan visualisasi data performa Guild. Owner dapat mengubah filter visualisasi berdasarkan rentang waktu Mingguan (_Weekly_) atau Bulanan (_Monthly_).
  3. Owner juga dapat melihat daftar nama pengguna (_subscriber list_) yang aktif mengikuti Guild tersebut pada tab terpisah di halaman yang sama.

**Ketentuan Fungsional (Business Rules):**

- **Hak Akses Pembuatan:** Fitur pembuatan Guild bersifat demokratis dan dapat diakses secara bebas oleh seluruh pengguna aplikasi yang status akunnya telah terverifikasi (`is_verified: true`).
- **Sifat Visibilitas Konten:** Seluruh Guild di dalam platform bersifat publik tanpa pengecualian. Siapa pun dapat membaca konten di dalamnya tanpa harus menekan tombol _Subscribe_ terlebih dahulu.
- **Otorisasi Fitur Khusus Peran:** Hak untuk melihat halaman `/insight`, melihat daftar pengikut (_subscriber list_), dan melakukan penyuntingan profil Guild secara eksklusif hanya diberikan kepada `Guild Owner`. Pengguna biasa yang mencoba mengakses rute ini secara paksa akan dialihkan secara otomatis ke rute `/guild/[slug]` dengan status eror _Unauthorized_.
- **Spesifikasi Metrik Insights Layer:** Dasbor analitik wajib menyajikan data tren pergerakan (grafik naik-turun) beserta akumulasi angka total untuk tiga metrik utama berikut:
  - Tren dan jumlah total pelanggan baru (_Subscribers_).
  - Tren dan jumlah total Artifact yang berhasil diterbitkan di dalam Guild (_Artifacts Published_).
  - Tren dan jumlah total interaksi diskusi yang terjadi (_Discussions Count_).
- **Mekanisme Filter Waktu:** Sistem _backend_ wajib menyediakan kueri penanganan data agregasi yang mendukung pengelompokan rentang waktu secara presisi untuk kebutuhan filter mingguan dan bulanan pada grafik dasbor.

---

### 4.4. Nested Discussions System

**Deskripsi Singkat:**
Fasilitas ruang interaksi bertingkat (_multi-level threaded comments_) di bawah setiap Artifact untuk mewadahi diskusi teknis yang terstruktur tanpa kehilangan konteks, serta didukung oleh fitur penyebutan pengguna (_user mentions_) yang terintegrasi ke sistem notifikasi.

**Alur Utama (User Flow):**

- **Alur Memberikan Tanggapan (Discussion):**
  1. User membuka halaman detail Artifact di rute `/artifact/[slug]`.
  2. User dapat menuliskan tanggapan utama langsung pada kolom komentar dasar yang tersedia di bawah konten Artifact (Level 1).
  3. User lain dapat mengklik tombol "Reply" pada komentar Level 1 tersebut untuk memberikan tanggapan bersarang di bawahnya (Level 2). Prosedur yang sama berlaku untuk membalas komentar Level 2 menjadi Level 3.

- **Alur Penyebutan Pengguna (User Mentions):**
  1. Saat menulis tanggapan di kolom boks diskusi, User mengetikkan simbol `@` diikuti dengan string nama pengguna lain (misal: `@username`).
  2. Sistem memunculkan rekomendasi _dropdown list_ nama pengguna yang sesuai secara dinamis.
  3. User memilih target pengguna, menyelesaikan tulisan, lalu menekan tombol kirim. Tanggapan terbit dengan teks `@username` yang berubah menjadi tautan aktif menuju profil target, dan sistem memicu pengiriman notifikasi ke para pihak terkait.

**Ketentuan Fungsional (Business Rules):**

- **Batasan Kedalaman Struktur (_Nested Limit_):** Struktur visual dan hierarki data tanggapan bersarang dibatasi maksimal hingga 3 tingkat (Level 3). Jika ada pengguna yang melakukan _Reply_ pada tanggapan di Level 3, maka posisi tanggapan baru tersebut akan tetap diletakkan sejajar pada Level 3 secara visual dan struktural di dalam database untuk menjaga kerapian UI (khususnya pada perangkat _mobile_).
- **Format Konten Diskusi:** Isi teks di dalam boks tanggapan mendukung pemformatan dasar teks teks serta penulisan blok kode pemrograman (_syntax highlighting code blocks_).
- **Logika Distribusi Notifikasi Diskusi:** Ketika sebuah tanggapan baru berhasil diterbitkan di bawah suatu Artifact, sistem _Worker_ di latar belakang wajib mendistribusikan notifikasi _real-time_ dengan ketentuan target sebagai berikut:
  - **Skenario Komentar Biasa:** Notifikasi otomatis dikirimkan kepada pemilik asli (_Owner_) Artifact serta seluruh Kolaborator (_Collaborators_) yang statusnya sudah `ACCEPTED`.
  - **Skenario Komentar dengan User Mentions:** Notifikasi khusus _"Anda disebut dalam sebuah diskusi"_ wajib dikirimkan secara instan kepada pengguna yang di-_mention_ (`@username`), di samping notifikasi diskusi reguler yang tetap dikirimkan kepada pemilik asli dan kolaborator Artifact tersebut.

### 4.5. Merit-Based Reputation System (Boost / Reduce Engine)

**Deskripsi Singkat:**
Sistem penilaian konten berbasis suara komunitas untuk mengatur tingkat visibilitas dan kurasi kualitas konten Artifact di dalam platform melalui aksi Boost (mendukung) atau Reduce (meredam).

**Alur Utama (User Flow):**

1. User melihat kartu konten Artifact di halaman linimasa (_feed_) atau halaman detail.
2. User mengklik ikon "Boost" jika menganggap konten tersebut bermanfaat, atau ikon "Reduce" jika dirasa kurang berbobot.
3. Sistem memperbarui status secara instan di _frontend_ dengan mengubah warna indikator tombol untuk menandai pilihan aktif pengguna.

**Ketentuan Fungsional (Business Rules):**

- **Mekanisme Pembatalan (Toggle Netral):** Jika pengguna mengklik kembali tombol interaksi yang sedang aktif (misalnya, mengklik "Boost" saat status interaksinya sudah mem-Boost), sistem akan membatalkan aksi tersebut dan mengembalikan status interaksi menjadi netral.
- **Mekanisme Perpindahan Langsung:** Jika pengguna sedang dalam status mem-Boost suatu konten lalu tiba-tiba mengklik tombol "Reduce", sistem otomatis menonaktifkan status Boost terdahulu dan mengalihkan status aktif ke Reduce secara langsung (begitu pula untuk kondisi sebaliknya).
- **Hak Akses Tanpa Batas:** Fitur pemberian hak suara Boost dan Reduce terbuka secara bebas untuk seluruh pengguna yang telah melakukan login sejak hari pertama pendaftaran akun tanpa memerlukan prasyarat batas skor reputasi tertentu.
- **Cakupan Pengaruh Fase MVP:** Untuk fase awal ini, kalkulasi akumulasi nilai bersih dari Boost/Reduce murni hanya dipersiapkan untuk memengaruhi algoritma pengurutan dan visibilitas distribusi konten di dalam _feed_ (logika algoritma _feed_ akan dikembangkan menyusul) dan belum diakumulasikan sebagai skor reputasi/karma permanen pada profil pengguna.

---

### 4.6. Artifact Archiving & Curated Collection Vault

**Deskripsi Singkat:**
Fasilitas penyimpanan terisolasi yang menyediakan fungsi pengarsipan konten privat bagi penulis asli serta fitur penanda buku (_bookmark_) tunggal bagi pengguna untuk menyimpan referensi konten penting.

**Alur Utama (User Flow):**

- **Alur Penandaan Buku (Bookmark):**
  1. User menemukan Artifact menarik milik pengguna lain dan mengklik ikon "Save/Bookmark".
  2. Artifact tersebut otomatis tersimpan ke dalam repositori koleksi pribadinya yang dapat diakses melalui tab koleksi di halaman profilnya sendiri.
- **Alur Pengarsipan Konten (Archive):**
  1. Pemilik asli Artifact mengklik opsi "Archive" pada menu pengelolaan konten miliknya.
  2. Konten Artifact tersebut langsung ditarik dari seluruh linimasa publik dan berpindah tempat ke rute halaman privat `/profile/[id-user]/archives`.

**Ketentuan Fungsional (Business Rules):**

- **Struktur Kontainer Tunggal:** Pada fase MVP ini, sistem hanya menyediakan satu wadah penampung koleksi default (_single default collection vault_) untuk setiap akun pengguna. Fitur pembuatan folder atau kategori koleksi kustom belum tersedia.
- **Sifat Privasi Total:** Halaman koleksi tersimpan milik pengguna bersifat sepenuhnya privat. Daftar konten yang disimpan di dalamnya hanya dapat dilihat oleh pemilik akun yang sah melalui verifikasi JWT session, serta tersembunyi dari pandangan pengguna lain yang mengunjungi profil publiknya.
- **Dampak Kaskade Pengarsipan Konten:** Apabila seorang penulis asli (atau _owner_) melakukan tindakan _Archive_ atau _Delete_ pada Artifact miliknya, sistem di bagian latar belakang wajib secara otomatis menghapus keterikatan relasi data Artifact tersebut dari seluruh _Collection Vault_ milik pengguna lain yang pernah menandainya. Konten tersebut akan otomatis hilang dari daftar koleksi orang lain demi menjamin hak privasi penuh penulis asli.

---

### 4.7. Social Amplification & Sharing Interface

**Deskripsi Singkat:**
Fitur perluasan jangkauan informasi internal platform (Amplify) yang berfungsi selayaknya mekanisme pembagian ulang konten (_repost/retweet_) untuk menyebarkan kembali Artifact berbobot ke jaringan pengikut pengguna.

**Alur Utama (User Flow):**

1. User menemukan Artifact milik pengguna lain yang dirasa perlu disebarluaskan di linimasa.
2. User mengklik tombol "Amplify" yang berada di baris interaksi bawah konten.
3. Sistem memproses permintaan, dan Artifact tersebut otomatis muncul kembali di linimasa atau _feed_ utama milik para pengikut (_followers_) dari pengguna yang mengklik tombol Amplify tersebut.

**Ketentuan Fungsional (Business Rules):**

- **Mekanisme Operasional Internal:** Fitur Amplify bekerja murni sebagai instrumen multiplikasi penyebaran konten di dalam sirkulasi _feed_ internal platform Talas itu sendiri (meniru perilaku fungsional _repost_).
- **Skema Insentif Kreator Masa Depan:** Setiap aktivitas Amplify yang dilakukan oleh pengguna lain direncanakan akan dicatat oleh sistem sebagai poin keterikatan (_engagement score_) tambahan bagi pemilik atau kolaborator asli konten tersebut. Namun, seluruh implementasi logika perhitungan poin insentif ini ditangguhkan dan baru akan diaktifkan secara penuh pada fase pengembangan lanjutan pasca-MVP.

### 4.8. Multi-Channel Notification Hub

**Deskripsi Singkat:**
Pusat pengelolaan pemberitahuan aktivitas interaksi sosial di dalam platform untuk memberikan informasi pembaruan secara berkala kepada pengguna tanpa membebani performa server.

**Alur Utama (User Flow):**

1. User melihat indikator lencana angka (_notification badge_) pada ikon lonceng di menu navigasi atas yang menandakan adanya aktivitas baru yang belum dibaca.
2. User mengklik ikon lonceng untuk membuka panel _dropdown_ atau halaman notifikasi.
3. Sistem menampilkan daftar notifikasi (seperti interaksi Boost/Reduce, komentar baru, atau undangan kolaborasi), dan secara otomatis menghilangkan lencana angka tanda belum dibaca.

**Ketentuan Fungsional (Business Rules):**

- **Mekanisme Penarikan Data (Data Fetching):** Sistem tidak menggunakan koneksi persisten yang berat (seperti WebSockets/SSE), melainkan mengandalkan mekanisme pembaruan berkala (_polling_) yang efisien di sisi klien memanfaatkan fitur _refetch interval_ dari _TanStack React Query_.
- **Otomatisasi Status Baca (Auto-Read Event):** Seluruh daftar notifikasi yang ditayangkan dalam panel akan otomatis diubah statusnya menjadi telah dibaca (`is_read: true`) secara massal di database begitu pengguna memicu aksi membuka panel notifikasi. Karena sifatnya yang otomatis, platform tidak memerlukan tombol manual "Mark all as read".
- **Keterikatan dengan Modul Worker:** Pencatatan entitas notifikasi baru ke database dilakukan secara asinkronus oleh _Worker Module_ sesaat setelah aksi interaksi (seperti _Discussion_ atau _Collaboration Invite_) dinyatakan sukses.

---

### 4.9. Global Search & Tabbed Indexing

**Deskripsi Singkat:**
Fasilitas pencarian global terpadu yang memungkinkan pengguna menemukan konten Artifact, profil sesama pengguna, sub-komunitas Guild, dan tag taksonomi secara toleran terhadap kesalahan pengetikan kata kunci.

**Alur Utama (User Flow):**

1. User memasukkan kata kunci pencarian pada bilah pencarian global (_search bar_) di menu navigasi, lalu menekan tombol enter.
2. User diarahkan ke halaman khusus di rute `/search?q=keyword`.
3. Halaman menampilkan hasil pencarian yang terbagi secara terstruktur ke dalam beberapa tab kategori terpisah (Tab Artifact, Tab User, dan Tab Guild). User dapat mengklik masing-masing tab untuk melihat hasil yang relevan.

**Ketentuan Fungsional (Business Rules):**

- **Arsitektur Pemrosesan Kueri (Fuzzy Search):** Mesin pencarian wajib mendukung pencarian tidak presisi (_fuzzy search_) untuk mentoleransi kesalahan pengetikan (_typo_) dari pengguna. Logika _fuzzy_ diimplementasikan langsung pada level database menggunakan fitur native ekstensi **PostgreSQL Trigram (`pg_trgm`)** demi menjaga efisiensi penggunaan RAM pada lingkungan VPS 2GB.
- **Pemisahan Tampilan Indeks (Tabbed Interface):** Hasil kueri wajib dipisahkan secara ketat sejak dari layer repositori database ke dalam struktur data yang berbeda sesuai kategorinya, sehingga tidak terjadi percampuran data mentah antara entitas dokumen Artifact, akun User, dan ruang Guild pada satu halaman UI yang sama.
- **Manajemen State Kueri:** Halaman `/search` memanfaatkan sinkronisasi URL parameter (`?q=`) yang terintegrasi dengan _TanStack React Query_, memastikan hasil pencarian dapat dibagikan (_shareable link_) dan mendukung fungsi navigasi kembali (_browser history back/forward_) secara konsisten.

### 4.10. Developer Network System (Watch & Connection Engine)

**Deskripsi Singkat:**
Fasilitas pembangunan jejaring sosial antar-developer satu arah melalui fitur Watchlist/Watchers untuk pemantauan aktivitas konten, yang dapat meningkat menjadi hubungan dua arah (Connections) saat terjadi interaksi timbal balik.

**Alur Utama (User Flow):**

- **Alur Menambahkan ke Watchlist (Satu Arah):**
  1. User A mengunjungi halaman profil publik User B di `/profile/[id-user]`.
  2. User A mengklik tombol "Watch". Sistem memperbarui status interaksi, memasukkan User B ke dalam _Watchlist_ milik User A, dan menjadikan User A sebagai salah satu _Watchers_ dari User B.
  3. Aktivitas publik atau Artifact baru yang dirilis oleh User B setelahnya akan otomatis mengalir masuk ke halaman linimasa (_feed_) milik User A.

- **Alur Terbentuknya Koneksi (Dua Arah / Mutual):**
  1. User B mendapatkan notifikasi bahwa User A mulai memantau akunnya.
  2. User B mengunjungi profil User A dan mengklik tombol "Watch Back".
  3. Sistem mendeteksi adanya relasi timbal balik (_mutual relation_). Status di database otomatis meningkat menjadi `CONNECTIONS`, dan indikator tombol di UI pada kedua profil pengguna berubah dari label "Watching" menjadi "Connected".

**Ketentuan Fungsional (Business Rules):**

- **Struktur Relasi Database:** Hubungan satu arah dikelola menggunakan tabel perantara (_self-referential junction table_) yang mencatat `watcher_id` dan `watched_id`. Status hubungan dua arah (`CONNECTIONS`) dihitung secara dinamis atau ditandai lewat stempel _flag mutual_ ketika ada dua baris data yang saling bersilangan untuk ID pengguna yang sama.
- **Mekanisme Pembatalan (Unwatch):** Jika pengguna mengklik kembali tombol "Watching" atau "Connected", sistem akan menghapus baris relasi searah tersebut dari database. Jika hubungan sebelumnya adalah _Connections_, hubungan akan diturunkan (_downgrade_) kembali menjadi hubungan satu arah biasa untuk pihak yang tidak membatalkan interaksi.
- **Integrasi Algoritma Feed:** Konten Artifact yang diterbitkan oleh akun-akun yang berada di dalam status `CONNECTIONS` wajib mendapatkan bobot prioritas tertinggi untuk muncul di urutan paling atas pada _feed_ beranda pengguna, diikuti oleh akun yang berstatus _Watchlist_ biasa.
- **Pemicu Notifikasi Jaringan:** Sistem _Worker_ wajib mengirimkan notifikasi instan kepada target pengguna saat seseorang pertama kali memasukkan akun mereka ke dalam _Watchlist_, memberikan opsi akses cepat untuk melakukan "Watch Back".

## 5. Technology Stack & Infrastructure Specifications

### 5.1. Core Application Stack

- **Frontend Framework:** Next.js (Latest Version - App Router).
- **Styling & UI Components:** Tailwind CSS & Shadcn UI.
- **Rich-Text Editor:** MDXEditor (Markdown/MDX native WYSIWYG editor).
- **State Management & Data Fetching:** TanStack React Query v5.
- **Form Handling & Validation:** React Hook Form & Zod Schema Validation.
- **Animation Library:** Framer Motion (Untuk interaksi UI mikro yang deklaratif).
- **Authentication Provider:** Clerk Auth (OIDC Compliant Provider untuk kesiapan SSO masa depan).

* **Image Processing:** React Easy Crop (Antarmuka pemotongan gambar client-side) & Browser-Image-Resizer (Melakukan kompresi dimensi, reduksi kualitas, dan konversi format biner ke WebP secara asinkronus langsung di sisi browser via Web Workers).
* **Object Object Relational Mapping (ORM):** Prisma ORM (Type-safe database client untuk mengelola pemetaan skema relasional, migrasi tabel, dan kueri data).

### 5.2. Backend & Core Infrastructure (Modular Monolith Setup)

- **Database Engine:** PostgreSQL (Self-hosted via Docker container di dalam VPS).
- **Database Connectivity:** PgBouncer (Transaction mode connection pooler untuk menghemat memori dan mengoptimalkan siklus koneksi singkat Next.js).
- **Caching & Local Event Layer:** Redis (Digunakan untuk caching feed dan penanganan in-memory event management).
- **Object Storage:** Cloudflare R2 (S3-compatible, tanpa biaya egress untuk aset gambar/media Artifact).

### 5.3. DevOps, Server & Deployment (Target Environment: VPS 2 Core / 2GB RAM)

- **Orchestration:** Docker & Docker Compose (Mengisolasi dan menjalankan seluruh modul aplikasi, Postgres, PgBouncer, Redis, dan Proxy dalam satu kesatuan).
- **Reverse Proxy & SSL:** Nginx (Bertindak sebagai entry point utama untuk menangani HTTPS, routing lalu lintas ke kontainer aplikasi, dan mengonfigurasi rate limiting).
- **Monitoring Tool:** cAdvisor (Memantau penggunaan resource RAM dan CPU antar kontainer Docker secara real-time).
- **Backup Strategy:** Automated Cron Job + pg_dump (Skrip otomatis untuk melakukan backup berkala database setiap malam dan mengunggahnya langsung ke Cloudflare R2).
- **OS Stabilization:** Linux Swap File Management (Mengaktifkan 1GB - 2GB Swap Memory pada VPS sebagai jaring pengaman untuk menghindari crash akibat Out of Memory).

Berikut adalah revisi **Bagian 6** yang telah disesuaikan dengan strategi _write/read_ dan struktur folder yang telah kita sepakati. Dokumen ini menekankan pada isolasi _Write_ antar-modul, kebebasan _Read_ via _Join_, serta struktur folder yang lebih granular untuk setiap modul.

---

## 6. Application Patterns & Layering Structures

### 6.1. Architectural Pattern: Modular Monolith

Aplikasi ini dirancang menggunakan pola **Modular Monolith** untuk memastikan batas domain yang jelas. Setiap modul diisolasi dalam struktur folder yang mandiri, sehingga mempermudah proses ekstraksi kode menjadi _individual microservices_ (Go) di masa depan.

### 6.2. Layering Architecture Specifications

Setiap modul menerapkan _Separation of Concerns_ melalui layer berikut:

1. **Layer API (Route Handlers):** Terletak pada `src/app/api/...`. Bertugas menerima HTTP request, melakukan validasi skema (Zod), memanggil layer interface, dan mengembalikan response.
2. **Layer Interface:** Berisi kontrak dan _facade_ yang menjadi gerbang komunikasi antar-modul. Modul luar **dilarang keras** memanggil _Service_ modul lain secara langsung; komunikasi wajib melalui _Interface_.
3. **Layer Service & Aggregator:**

- **`*.service.ts`:** Mengelola logika bisnis dan operasi **Write** (Create/Update/Delete) yang bersifat eksklusif pada tabel milik modul tersebut.
- **`*.aggregator.ts`:** Mengelola operasi **Read** yang kompleks. Diizinkan melakukan _Join_ antar-modul (via Prisma `include`) untuk kebutuhan tampilan data yang efisien di sisi _frontend_ tanpa harus melakukan _over-fetching_.

4. **Layer UI & Presentation:** Pemisahan ketat antara _Server Components_ (`page.tsx`) dan _Client Components_ (`*Client.tsx`).

### 6.3. Project Directory & Directory Convention

Struktur direktori diatur untuk mendukung modularitas dan kemudahan pemeliharaan:

```text
src/
├── app/                        # Next.js App Router (Routing Layer)
├── modules/                    # Core Logic (Modular Monolith)
│   └── [module_name]/
│       ├── [module_name].interface.ts   # Kontrak antar-modul
│       ├── [module_name].service.ts     # Logika Bisnis & Write Operations
│       ├── [module_name].aggregator.ts  # Read Operations dengan JOIN
│       ├── utils/                       # Unit function pendukung modul
│       └── components/                  # UI lokal modul
├── hooks/                      # TanStack Query & Local State
├── components/                 # Global UI Components (Shadcn UI)
└── common/                     # Shared Utils, Prisma Client, Constants

```

### 6.4. Database Interaction Rules

Untuk menjaga integritas data dan kemudahan migrasi ke _microservices_, diberlakukan aturan berikut:

- **Rule of Write (Strict Isolation):** Operasi **Write** (_INSERT, UPDATE, DELETE_) wajib dilakukan secara lokal di dalam `*.service.ts` milik modul itu sendiri. Modul dilarang keras melakukan manipulasi data (Write) pada tabel milik modul lain secara langsung. Jika sebuah aksi memerlukan update di dua modul berbeda, maka harus dipicu melalui _event-driven logic_ atau koordinasi antar-_service_ via _Interface_.
- **Rule of Read (Permissive Join):** Operasi **Read** diizinkan menggunakan _Join_ lintas modul melalui `*.aggregator.ts` dengan memanfaatkan fitur `include` pada Prisma. Pendekatan ini diperbolehkan untuk memangkas _round-trip_ kueri ke database guna menjaga performa pada infrastruktur VPS 2GB RAM, dengan catatan bahwa ketergantungan _Join_ ini harus didokumentasikan untuk memudahkan _refactoring_ saat migrasi ke sistem _microservices_.
- **Refactoring Blueprint:** File `*.aggregator.ts` adalah target utama pembuangan kueri saat migrasi ke Go, sementara `*.service.ts` akan menjadi basis logika bisnis yang diporting ke _microservice_ baru.

## 7. Module List

- **Auth & User Module**
  Mengelola sistem otentikasi (kredensial & Google OAuth), pengiriman verifikasi email, manajemen sesi berbasis JWT, profil akun publik, pengaturan privasi, dasbor repositori personal pengguna, serta penanganan skema relasi grafik sosial satu arah (_Watchlist/Watchers_) maupun dua arah (_Connections_).

- **Artifact & Collaboration Module**
  Mengatur siklus hidup pembuatan konten (Artifact), penyimpanan draf privat (_Archives_), pelabelan taksonomi teknologi, serta penanganan skema relasi perantara (_junction table_) untuk manajemen status undangan kolaborasi multi-user (`PENDING`, `ACCEPTED`).

- **Guild Module**
  Mengelola entitas ruang sub-komunitas khusus, proses pendaftaran anggota (_subscription_), pembatasan otorisasi pembuatan wadah diskusi, serta penyediaan data analitik internal (_insight_) untuk pengelola ruang.

- **Discussion Module**
  Menangani sistem interaksi komentar bertingkat (_nested comments_) di bawah aset digital, fitur pemanggilan pengguna lain (_user mentions_).

- **Engagement Module**
  Bertanggung jawab atas kalkulasi sistem reputasi berbasis komunitas melalui mekanisme penilaian _Boost_ dan _Reduce_ untuk menaikkan atau meredam visibilitas konten di dalam platform.

- **Collection Module**
  Menyediakan utilitas penanda buku (_bookmarking_) personal bagi pengguna untuk mengurasi, menyimpan, dan mengelompokkan referensi eksternal dari konten-konten publik yang berbobot.

- **Interaction & Delivery Module**
  Mengelola fungsi perluasan jangkauan informasi ke luar platform melalui tautan terintegrasi (_Amplify_) secara instan.

- **Notification Module**
  Mengisolasi manajemen notifikasi _real-time_ aplikasi, menangani pembuatan tipe _feed_ pemberitahuan (seperti interaksi _Boost/Reduce_, _Discussion_ baru, atau undangan kolaborasi), dan mengatur preferensi baca/belum dibaca oleh pengguna.

- **Worker Module**
  Menangani antrean tugas latar belakang (_background jobs_) yang bersifat asinkronus dan intensif sumber daya, seperti pemrosesan webhook dari _Clerk Auth_, pemicu fungsi _event-driven_, pembungkusan log, dan eksekusi tugas terjadwal rutin.

- **Media Module**
  Mengelola fungsi otorisasi keamanan untuk pembuatan token Presigned URL Cloudflare R2, validasi tipe berkas WebP dari sisi server, serta bertanggung jawab penuh atas manipulasi penghapusan berkas media usang yang tersimpan pada Cloudflare R2 storage.

- **Search Module**
  Bertanggung jawab atas pengindeksan teks untuk kueri pencarian global dan manajemen kurasi taksonomi _hashtag_ di seluruh _Artifact_ dan _Guild_.

## 8. Shadcn

`--preset b2BpQABbk`

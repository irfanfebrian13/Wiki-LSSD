import type { Pocketbook } from "./types";

export const POCKETBOOK: Pocketbook = {
  meta: {
    title: "LSSD Deputy Pocketbook",
    subtitle: "Los Santos Sheriff Department",
  },
  sections: [
    {
      id: "chain-of-command",
      icon: "★",
      title: "Chain of Command",
      group: "Struktur",
      blocks: [
        {
          type: "intro",
          text: "Kalian harus tau susunan dari Chain of Command di LSSD. Urutan dari pangkat tertinggi ke terendah:",
        },
        {
          type: "ranks",
          items: [
            "Sheriff",
            "Undersheriff",
            "Assistant Sheriff",
            "Division Chief",
            "Area Commander",
            "Captain",
            "Lieutenant",
            "Sergeant",
            "Deputy Sheriff 2",
            "Deputy Sheriff 1",
            "Deputy Sheriff",
            "Deputy Sheriff Trainee",
            "Academy Recruit",
          ],
        },
        {
          type: "legend",
          title: "Warna Tingkatan Staff",
          items: [
            { color: "#9ca3af", label: "Abu", desc: "Academy Recruit" },
            { color: "#eab308", label: "Kuning", desc: "Field Staff" },
            { color: "#ef4444", label: "Merah", desc: "Supervisory Staff" },
            { color: "#22c55e", label: "Hijau", desc: "Command Staff" },
            { color: "#3b82f6", label: "Biru", desc: "Executive Staff" },
          ],
        },
        {
          type: "note",
          title: "Yang Harus Kalian Patuhi",
          text: "Perihal Chain of Command, kalian harus mematuhi semua Deputy dan Sheriff di LSSD. Jika terdapat suatu hal mengenai persetujuan maupun omongan apapun yang memerlukan bantuan dari atasan, bicarakan terlebih dahulu kepada seseorang dengan pangkat 1 tingkat di atas dirimu.",
        },
        {
          type: "example",
          title: "Contoh",
          text: "Jika kamu seorang Deputy yang ingin menanyakan kenaikan pangkat, mintalah tolong kepada Deputy Bonus I atau FTO terlebih dahulu. Jangan langsung menanyakan kepada Captain atau Sergeant — karena kita menerapkan Chain of Command.",
        },
        {
          type: "callout",
          text: "Ingat — Chain of Command adalah RANTAI KOMANDO!!! Bukan LINE PURSUIT!!!",
        },
      ],
    },
    {
      id: "divisi-biro",
      icon: "▣",
      title: "Divisi & Biro",
      group: "Struktur",
      blocks: [
        {
          type: "tree",
          items: [
            {
              name: "Professional Standards Division",
              children: ["Internal Affairs Bureau", "Advocacy Bureau"],
            },
            {
              name: "Administrative Services Division",
              children: ["Sheriff's Information Bureau", "Human Resources Bureau"],
            },
            {
              name: "Patrol Division",
              children: ["Park Ranger Bureau", "Paleto Bay Station", "Roxwood Station"],
            },
            {
              name: "Criminal Investigation Division",
              children: ["Major Crime Bureau", "Operation Safe Street Bureau"],
            },
            {
              name: "Special Operation Division",
              children: ["Aero Bureau", "High Speed Response Bureau", "Special Enforcement Bureau"],
            },
          ],
        },
      ],
    },
    {
      id: "callsign",
      icon: "◈",
      title: "Callsign System",
      group: "Struktur",
      blocks: [
        {
          type: "table",
          head: ["Callsign", "Unit"],
          rows: [
            ["SHERIFF", "High Command"],
            ["CHARLES", "Command Staff"],
            ["ROBERT", "Partnered Unit"],
            ["KING", "Solo Unit"],
            ["HAVANA", "Interceptor Unit"],
            ["HIENA", "Interceptor High Command"],
            ["MILE", "Motorcycle Unit"],
            ["XIERRA", "Metro / Tactical Unit"],
            ["KONG", "Bearcat / Armored Unit"],
            ["WASHINGTON", "K-9 Unit"],
            ["EAGLE", "Air Support Unit (Aero)"],
            ["NORA", "Detective Bureau"],
          ],
        },
      ],
    },
    {
      id: "ten-codes",
      icon: "✕",
      title: "Ten Codes",
      group: "Komunikasi",
      blocks: [
        {
          type: "intro",
          text: "Ten Codes yang paling sering dipakai di lapangan. Harus dipahami semua ya.",
        },
        {
          type: "table",
          head: ["Code", "Arti"],
          rows: [
            ["10-1", "Berkumpul / Meeting"],
            ["10-2", "Sinyal radio bagus / Good Signal"],
            ["10-3", "Menghentikan transmisi di radio (terlalu banyak suara)"],
            ["10-4", "OK / Copy That"],
            ["10-6", "Sedang sibuk / tidak dapat diganggu"],
            ["10-7", "Tidak dalam pekerjaan / istirahat (melamun, makan, latihan)"],
            ["10-8", "Kembali melakukan pekerjaan (patroli)"],
            ["10-9", "Meminta mengulang transmisi terakhir"],
            ["10-10", "Fight in Progress"],
            ["10-12", "Stand By"],
            ["10-13A", "Officer Down (Urgent / mengancam nyawa)"],
            ["10-13B", "Officer Down (Not Urgent)"],
            ["10-14", "Medic Down"],
            ["10-20", "Menanyakan / menyatakan Lokasi"],
            ["10-22", "Cancel"],
            ["10-23", "Sampai di Lokasi"],
            ["10-28", "Info Plate Vehicle"],
            ["10-29", "Mengecek Criminal Record di MDT"],
            ["10-31A", "Burglary / Pencurian Rumah"],
            ["10-31B", "Store Robbery / Pencurian Toko"],
            ["10-32", "Seseorang membawa Senjata Api"],
            ["10-34", "Penjualan Narcotics"],
            ["10-37", "Investigasi kendaraan misterius"],
            ["10-38", "Melakukan Felony Stop"],
            ["10-41", "On Duty"],
            ["10-42", "Off Duty"],
            ["10-45", "Illegal Hunting"],
            ["10-47", "Terdapat orang yang terluka"],
            ["10-50", "Kecelakaan kendaraan"],
            ["10-52", "Membutuhkan EMS"],
            ["10-55", "Melakukan Traffic Stop"],
            ["10-57", "Sedang Melakukan Pengejaran / Pursuit"],
            ["10-60", "Deskripsi Kendaraan di lokasi"],
            ["10-61", "Deskripsi Suspect di lokasi"],
            ["10-70", "Kebakaran yang terjadi"],
            ["10-71", "Terjadi Penembakan / Shots Fired"],
            ["10-74", "Negative"],
            ["10-76", "Menuju ke lokasi / Enroute"],
            ["10-77", "Membutuhkan Backup (Non-Emergency)"],
            ["10-78", "Need Backup (Emergency)"],
            ["10-80", "Officer in Danger, Cannot Respond"],
            ["10-89", "Bomb Threat"],
            ["10-90", "Bank / Jewelry / Cargo / Cash Exchange Robbery"],
            ["10-94", "Illegal Racing in Progress"],
            ["10-95", "Suspect tertangkap / in Custody"],
            ["10-97", "Unauthorized Access"],
            ["10-98", "Jailbreak"],
            ["10-99", "Clear Area / situasi telah selesai"],
          ],
        },
      ],
    },
    {
      id: "response-code",
      icon: "◉",
      title: "Response Codes",
      group: "Komunikasi",
      blocks: [
        {
          type: "deflist",
          items: [
            { term: "Code 0", desc: "Situasi Emergency yang membutuhkan All Unit Kepolisian." },
            { term: "Code 1", desc: "Merespon situasi non-emergency. Tidak menggunakan Sirine maupun Lampu strobo." },
            { term: "Code 2", desc: "Situasi emergency tapi tidak sangat emergency (mis. store robbery). Lampu strobo aktif, tanpa Sirine." },
            { term: "Code 3", desc: "Situasi sangat emergency. Menggunakan lampu strobo dan sirine." },
            { term: "Code 4", desc: "Memberitahu unit lain bahwa situasi sudah terkendali, tidak butuh anggota tambahan." },
            { term: "Code 5", desc: "Memberitahu officer lain bahwa Divisi Detective sedang melakukan investigasi pada sebuah case." },
            { term: "Code 6", desc: "Memerintahkan deputy lain untuk melakukan pencarian di sekitar area terakhir visual." },
            { term: "Code 7", desc: "Sedang istirahat sejenak di tempat yang aman (Meal Break, memasang perban, mengecek MDT)." },
          ],
        },
      ],
    },
    {
      id: "priority-threat",
      icon: "⚠",
      title: "Priority & Threat Level",
      group: "Komunikasi",
      blocks: [
        {
          type: "deflist",
          title: "Priority Codes",
          items: [
            { term: "Priority 1", desc: "71 (Penembakan), 90 (Perampokan — ada 12 jenis), 13a (Burglary / Pencurian Rumah), dan Hostaging", color: "#ef4444" },
            { term: "Priority 2", desc: "78 (Need Assistance Urgent), 31 (Perampokan — 4 jenis), 34 (Narcotics Dealing dekat), dan 13b (Store Robbery / Pencurian Toko).", color: "#eab308" },
            { term: "Priority 3", desc: "77 (Need Assistance Non-Urgent), 55 (Traffic Stop), 34 (Narcotics Dealing jauh).", color: "#22c55e" },
          ],
        },
        {
          type: "legend",
          title: "Threat Level",
          items: [
            { color: "#22c55e", label: "Green — Low", desc: "1-2 orang per unit mobil." },
            { color: "#eab308", label: "Amber — Medium", desc: "1-2 orang per unit, harus ada Sergeant dengan Class 3." },
            { color: "#ef4444", label: "Red — High", desc: "All Unit and SEB deployed." },
          ],
        },
      ],
    },
    {
      id: "radio-abbr",
      icon: "≡",
      title: "Radio Abbreviations",
      group: "Komunikasi",
      blocks: [
        {
          type: "table",
          head: ["Singkatan", "Kepanjangan"],
          rows: [
            ["ALS", "Advanced Life Support"],
            ["ASAP", "As Soon As Possible"],
            ["BLS", "Basic Life Support"],
            ["BOLO", "Be On the Look Out"],
            ["DOA", "Dead On Arrival"],
            ["DOB", "Date of Birth"],
            ["DOC", "Department of Corrections"],
            ["DOJ", "Department of Justice"],
            ["EMS", "Emergency Medical Services"],
            ["FTO", "Field Training Officer"],
            ["GOV", "Government"],
            ["GSW", "Gun Shot Wound"],
            ["GSR", "Gun Shot Residue"],
            ["IC", "Incident Commander"],
            ["LEO", "Law Enforcement Officer"],
            ["MDT", "Mobile Data Terminal"],
            ["PIT", "Pursuit Immobilization Technique"],
            ["SOS", "Shoot on Sight"],
            ["VCB", "Visual Contact Broken"],
          ],
        },
      ],
    },
    {
      id: "radio-basics",
      icon: "📡",
      title: "Radio Basics",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Dasar komunikasi radio LSSD. Seluruh panggilan radio diucapkan dalam bahasa Inggris — terjemahan Indonesia hanya untuk memudahkan pemahaman, bukan untuk disiarkan.",
        },
        {
          type: "bullets",
          title: "1.1 Radio Communication Rules",
          items: [
            "Tekan tombol PTT, beri jeda satu detik, baru mulai berbicara.",
            "Sebutkan callsign di awal dan akhir transmisi.",
            "Gunakan bahasa Inggris yang singkat dan jelas. Buang kata yang tidak perlu.",
            "Jangan memotong transmisi unit lain. Gunakan 10-3 jika radio terlalu ramai.",
            "Jika suara tidak jelas, gunakan 10-9 untuk meminta pengulangan. Jangan menebak.",
            "Sampaikan informasi secara berurutan, jangan melompat-lompat.",
            "Selalu kembali ke 10-8 setelah situasi selesai.",
          ],
        },
        {
          type: "steps",
          title: "1.2 Standard Radio Format",
          items: [
            "Tujuan — Dispatch atau To IC",
            "Identitas — [CALLSIGN]",
            "Kejadian — kode situasi (10-55, 10-38, dan seterusnya)",
            "Lokasi — [STREET] atau [LOCATION]",
            "Deskripsi — 60 (kendaraan) atau 61 (suspect)",
            "Permintaan — backup atau instruksi lanjutan",
          ],
        },
        {
          type: "radiocall",
          title: "Contoh Format Standar",
          phrase:
            "Dispatch, this is [CALLSIGN] reporting [SITUATION] at [LOCATION]. Standby for future updates.",
          phrase_id:
            "Dispatch, ini [CALLSIGN] melaporkan [SITUATION] di [LOCATION]. Standby untuk informasi selanjutnya.",
          note: "Urutan ini dipakai untuk semua panggilan. Sesuaikan [SITUATION] dengan kode yang sesuai.",
        },
        {
          type: "table",
          title: "1.3 Common Radio Terms",
          head: ["Term", "Arti"],
          rows: [
            ["10-3", "Menghentikan transmisi di radio (terlalu banyak suara)"],
            ["10-4", "OK / Copy That"],
            ["10-8", "Kembali melakukan pekerjaan (patroli)"],
            ["10-9", "Meminta mengulang transmisi terakhir"],
            ["10-20", "Menanyakan / menyatakan Lokasi"],
            ["10-28", "Info Plate Vehicle"],
            ["10-29", "Mengecek Criminal Record di MDT"],
            ["10-34", "Penjualan Narcotics"],
            ["10-38", "Melakukan Felony Stop"],
            ["10-55", "Melakukan Traffic Stop"],
            ["10-57", "Sedang Melakukan Pengejaran / Pursuit"],
            ["10-60", "Deskripsi Kendaraan di lokasi"],
            ["10-61", "Deskripsi Suspect di lokasi"],
            ["10-76", "Menuju ke lokasi / Enroute"],
            ["10-77", "Membutuhkan Backup (Non-Emergency)"],
            ["10-78", "Need Backup (Emergency)"],
            ["10-95", "Suspect tertangkap / in Custody"],
            ["95", "Sebutan singkat untuk 10-95 (suspect tertangkap)"],
            ["Code 4", "Situasi sudah terkendali, tidak butuh unit tambahan"],
            ["BOLO", "Be On the Look Out"],
            ["IC", "Incident Commander"],
            ["Dispatch", "Pusat komunikasi yang mengatur lalu lintas radio"],
          ],
        },
        {
          type: "steps",
          title: "1.4 Callsign Format",
          items: [
            "Format: (Station)-(Callsign)-(Badge number)",
            "Contoh: 61-Robert-210 ditulis sebagai [CALLSIGN]",
            "Station menunjukkan asal unit, misalnya 61",
            "Callsign menunjukkan tipe unit, misalnya Robert untuk partnered unit atau King untuk solo unit",
            "Badge number adalah nomor badge deputy",
          ],
        },
        {
          type: "note",
          title: "Catatan",
          text: "Di seluruh handbook ini callsign ditulis sebagai [CALLSIGN]. Ganti dengan callsign milikmu saat melakukan panggilan. Daftar lengkap callsign ada di bagian Callsign System.",
        },
      ],
    },
    {
      id: "radio-patrol",
      icon: "🚔",
      title: "Patrol & Unit Status",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Panggilan dasar saat memulai patroli dan saat kembali bertugas setelah menangani situasi.",
        },
        {
          type: "radiocall",
          title: "2.1 Starting Patrol",
          phrase:
            "Dispatch, [CALLSIGN] will be doing 10-8 in County Area. Standby for any update.",
          phrase_id:
            "Dispatch, [CALLSIGN] akan melakukan 10-8 di County Area. Standby untuk informasi selanjutnya.",
          note: "Kapan dipakai: saat mulai patroli, sebelum meninggalkan station.",
        },
        {
          type: "radiocall",
          title: "2.2 Returning to 10-8",
          phrase: "Dispatch, [CALLSIGN] is 10-8. Back to patrol.",
          phrase_id: "Dispatch, [CALLSIGN] kembali 10-8. Kembali patroli.",
          note: "Kapan dipakai: setelah situasi selesai dan unit sudah siap menerima tugas baru.",
        },
        {
          type: "bullets",
          title: "Kapan Harus Kembali ke 10-8",
          items: [
            "Setelah situasi dinyatakan Code 4.",
            "Setelah suspect selesai diproses dan diserahkan ke DOC.",
            "Setelah kendaraan selesai diimpound atau disita.",
            "Setelah mendapat izin break off dari IC.",
            "Saat unit kembali available dan siap menerima tugas baru.",
          ],
        },
      ],
    },
    {
      id: "radio-traffic-stop",
      icon: "🚗",
      title: "Traffic Stop — 10-55",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Alur 10-55: memulai traffic stop, melakukan pengecekan, lalu menutupnya dengan Code 4. Jika situasi berkembang, lanjut ke 10-57 (pursuit) atau 10-38 (felony stop).",
        },
        {
          type: "radiocall",
          title: "3.1 Initiating Traffic Stop",
          phrase:
            "Dispatch, [CALLSIGN] reporting doing 10-55 on [STREET]. 10-60 gonna be [VEHICLE] with [NUMBER] occupants. Need 77. Standby for future updates.",
          phrase_id:
            "Dispatch, [CALLSIGN] melaporkan sedang melakukan 10-55 di [STREET]. 10-60 adalah [VEHICLE] dengan [NUMBER] penumpang. Membutuhkan 77. Standby untuk informasi selanjutnya.",
          note: "Kapan dipakai: saat menghentikan kendaraan. Sebutkan lokasi, deskripsi 10-60, dan jumlah penumpang.",
        },
        {
          type: "radiocall",
          title: "3.2 Vehicle / Criminal Record Check",
          phrase: "Officer, please check 28 [PLATE] & 29 [CRIMINAL RECORD].",
          phrase_id:
            "Officer, tolong lakukan pengecekan 28 [PLATE] dan 29 [CRIMINAL RECORD].",
          note: "Kapan dipakai: untuk meminta pengecekan plate (10-28) dan criminal record (10-29) lewat MDT.",
        },
        {
          type: "radiocall",
          title: "3.3 Traffic Stop Cleared / Code 4",
          phrase:
            "Dispatch, [CALLSIGN] reporting for the last 10-55, now Code 4 at [STREET]. Back to 10-8.",
          phrase_id:
            "Dispatch, [CALLSIGN] melaporkan 10-55 sebelumnya sudah Code 4 di [STREET]. Kembali ke 10-8.",
          note: "Kapan dipakai: saat traffic stop selesai tanpa eskalasi.",
        },
      ],
    },
    {
      id: "radio-pursuit",
      icon: "🚨",
      title: "Traffic Stop → Pursuit — 10-57",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Traffic stop yang berkembang menjadi pengejaran. Laporkan perubahan situasi segera, jangan menunggu sampai posisi kendaraan tidak lagi diketahui.",
        },
        {
          type: "radiocall",
          title: "4.1 Changing 10-55 to 10-57",
          phrase:
            "Dispatch, for the last 10-55 situation on [STREET], it's now changing into an active 10-57 (pursuit). Requesting 10-78 (backup) on my 20 (location). Suspect is now heading [DIRECTION].",
          phrase_id:
            "Dispatch, untuk situasi 10-55 terakhir di [STREET], sekarang berubah menjadi 10-57 aktif (pursuit). Meminta 10-78 (backup) di 20 saya (lokasi). Suspect sekarang menuju [DIRECTION].",
          note: "Kapan dipakai: saat kendaraan melarikan diri. Lanjutkan laporan berkala selama pengejaran.",
        },
        {
          type: "bullets",
          title: "4.2 Pursuit Information",
          items: [
            "Lokasi terkini — posisi kendaraan saat ini",
            "Arah — [DIRECTION] yang sedang ditempuh",
            "Deskripsi kendaraan — 60 beserta warna dan plate",
            "Permintaan backup — 10-78",
            "Informasi suspect — deskripsi 61 dan jumlah penumpang",
          ],
        },
        {
          type: "note",
          title: "Informasi Minimum",
          text: "Minimal lima poin di atas harus disampaikan. Jika ada informasi tambahan seperti senjata atau sandera, sampaikan lebih dulu sebelum melanjutkan pengejaran.",
        },
      ],
    },
    {
      id: "radio-felony-stop",
      icon: "🔴",
      title: "Traffic Stop → Felony Stop — 10-38",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Traffic stop yang berubah menjadi felony stop karena suspect terlibat kejahatan berat, memiliki warrant, atau masuk daftar BOLO.",
        },
        {
          type: "radiocall",
          title: "5.1 Changing 10-55 to 10-38",
          phrase:
            "Dispatch, for the last 10-55, we changed to a 10-38. For the 60 and 61, we have warrants and a BOLO. Requesting 10-78 backup on my 20.",
          phrase_id:
            "Dispatch, untuk 10-55 terakhir, kami berubah menjadi 10-38. Untuk 60 dan 61, terdapat warrants dan BOLO. Meminta 10-78 backup di 20 saya.",
          note: "Kapan dipakai: saat suspect terbukti memiliki warrant, BOLO, atau indikasi kejahatan berat.",
        },
        {
          type: "radiocall",
          title: "5.2 Suspect Commands — Turn Off Vehicle",
          phrase: "Turn off the vehicle and throw the keys outside.",
          phrase_id: "Matikan kendaraan dan buang kunci kendaraan ke luar.",
          note: "Berikan perintah satu per satu, dan tunggu suspect menuruti sebelum lanjut ke perintah berikutnya.",
        },
        {
          type: "radiocall",
          title: "5.2 Suspect Commands — Exit Vehicle",
          phrase: "Exit the vehicle with your hands raised.",
          phrase_id: "Keluar dari kendaraan dengan tangan terangkat.",
          note: "Pastikan tangan suspect terlihat sebelum ia keluar dari kendaraan.",
        },
        {
          type: "radiocall",
          title: "5.3 Starting the Felony Stop",
          phrase: "This is IC. We're gonna do a 10-38 on my count. 3... 2... 1.",
          phrase_id:
            "Ini IC. Kita akan melakukan 10-38 sesuai hitungan saya. 3... 2... 1.",
          note: "IC memimpin perhitungan sebelum seluruh unit bergerak. Jangan bergerak sebelum hitungan selesai.",
        },
      ],
    },
    {
      id: "radio-vehicle-search",
      icon: "🔍",
      title: "Felony Stop — Vehicle Search",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Pencarian kendaraan setelah felony stop selesai dan suspect sudah diamankan.",
        },
        {
          type: "radiocall",
          title: "6.1 Vehicle Search Procedure",
          phrase:
            "All officers, I will be checking for the 60. Starting from the glovebox, right door, left door, front trunk, rear trunk. All done.",
          phrase_id:
            "Semua officer, saya akan melakukan pengecekan untuk 60. Dimulai dari glovebox, pintu kanan, pintu kiri, trunk depan, kemudian trunk belakang. Semua sudah selesai.",
          note: "Kapan dipakai: setelah suspect diamankan, sebelum kendaraan diimpound atau disita.",
        },
        {
          type: "steps",
          title: "Urutan Pencarian Kendaraan",
          items: [
            "Glovebox",
            "Pintu kanan (right door)",
            "Pintu kiri (left door)",
            "Trunk depan (front trunk)",
            "Trunk belakang (rear trunk)",
            "Pastikan kendaraan sudah clear",
          ],
        },
        {
          type: "radiocall",
          title: "6.2 Vehicle Disposition — Vehicle Clear",
          phrase: "Vehicle is clear. Impound to Public.",
          phrase_id: "Kendaraan sudah clear. Impound ke Public.",
          note: "Kapan dipakai: kendaraan sudah selesai diperiksa dan tidak ditemukan barang ilegal.",
        },
        {
          type: "radiocall",
          title: "6.2 Vehicle Disposition — Vehicle Not Clear / BOLO",
          phrase: "Vehicle is not clear. Seize the vehicle to Police.",
          phrase_id: "Kendaraan tidak clear atau terdapat BOLO. Sita kendaraan ke Police.",
          note: "Kapan dipakai: kendaraan belum selesai diperiksa, masih ada barang ilegal, atau kendaraan masuk daftar BOLO.",
        },
        {
          type: "callout",
          text: "Kendaraan clear → impound ke PUBLIC. Kendaraan tidak clear atau ada BOLO → sita kendaraan ke POLICE. Jangan tertukar.",
        },
      ],
    },
    {
      id: "radio-custody",
      icon: "👮",
      title: "Felony Stop → 95 / Suspect in Custody",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Menutup felony stop setelah semua suspect berhasil diamankan.",
        },
        {
          type: "radiocall",
          title: "7.1 Suspects Secured",
          phrase:
            "Dispatch, this is [CALLSIGN] reporting for the last 10-38. It's already Code 4. We got [NUMBER] 95s and gonna be escorting them to [STATION]. Thank you for all officers assisting.",
          phrase_id:
            "Dispatch, ini [CALLSIGN] melaporkan 10-38 terakhir. Sudah Code 4. Kami mendapatkan [NUMBER] 95 dan akan mengawal mereka ke [STATION]. Terima kasih kepada seluruh officer yang membantu.",
          note: "Kapan dipakai: saat semua suspect tertangkap dan situasi sudah terkendali.",
        },
        {
          type: "radiocall",
          title: "7.2 Reducing Units",
          phrase:
            "I only need one officer to process the suspect. All other units may break off.",
          phrase_id:
            "Saya hanya membutuhkan satu officer untuk memproses suspect. Unit lainnya dapat break off.",
          note: "Kapan dipakai: saat unit tambahan tidak lagi dibutuhkan di lokasi.",
        },
      ],
    },
    {
      id: "radio-narcotics",
      icon: "💊",
      title: "Narcotics — 34 → 57",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Transaksi narkoba (10-34) yang berubah menjadi pengejaran.",
        },
        {
          type: "radiocall",
          title: "8.1 Changing 34 to 57",
          phrase:
            "Dispatch, we got active 34 changing to 57. For the 60 is [VEHICLE]. Requesting 10-78 on my 20 [LOCATION].",
          phrase_id:
            "Dispatch, kami mendapatkan 34 aktif yang berubah menjadi 57. Untuk 60 adalah [VEHICLE]. Meminta 10-78 di 20 saya [LOCATION].",
          note: "Kapan dipakai: saat transaksi narkoba yang terpantau berubah menjadi pengejaran.",
        },
      ],
    },
    {
      id: "radio-responding",
      icon: "🛡",
      title: "Responding to Active Situations",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Menyatakan diri menuju lokasi situasi aktif. Laporkan 10-76 agar Dispatch dan unit lain tahu ada unit yang bergerak.",
        },
        {
          type: "table",
          title: "Situasi yang Didukung",
          head: ["Code", "Situation"],
          rows: [
            ["31A", "House Robbery"],
            ["31B", "Store Robbery"],
            ["90", "Bank Robbery"],
          ],
        },
        {
          type: "radiocall",
          title: "9.1 Responding / En Route",
          phrase:
            "Dispatch, [CALLSIGN] will be assisting for the last [SITUATION] at [LOCATION]. 10-76, stand by for further updates.",
          phrase_id:
            "Dispatch, [CALLSIGN] akan membantu situasi [SITUATION] terakhir di [LOCATION]. 10-76, standby untuk informasi selanjutnya.",
          note: "Kapan dipakai: saat menuju lokasi situasi. 10-76 bersifat opsional — bisa dilepas jika situasinya sangat mendesak dan kamu langsung bergerak.",
        },
        {
          type: "note",
          title: "Versi Singkat",
          text: "Jika situasi mendesak, lepas bagian \"stand by for further updates\" dan akhiri dengan 10-76.",
        },
      ],
    },
    {
      id: "radio-on-scene",
      icon: "🏪",
      title: "On-Scene Situation Report",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Laporan pertama saat unit sudah tiba di lokasi. Sampaikan berurutan agar Dispatch dan unit lain bisa langsung memahami situasinya.",
        },
        {
          type: "radiocall",
          title: "10.1 Initial Situation Report",
          phrase:
            "For the last [SITUATION] at [LOCATION], we got active store robbery and hostage situation. There is possible 2 61 [SUSPECT] inside with 1 HOSTAGE. For the 60 is [VEHICLE] with red color. Plate number is [PLATE]. Need 10-78 for unit available.",
          phrase_id:
            "Untuk situasi [SITUATION] terakhir di [LOCATION], terdapat store robbery dan hostage situation yang aktif. Kemungkinan terdapat 2 61 [SUSPECT] di dalam bersama 1 HOSTAGE. Untuk 60 adalah [VEHICLE] berwarna merah. Nomor plate adalah [PLATE]. Membutuhkan 10-78 untuk unit yang tersedia.",
          note: "Kapan dipakai: saat tiba di lokasi dan sudah punya gambaran situasinya.",
        },
        {
          type: "steps",
          title: "10.2 Information Checklist",
          items: [
            "SITUATION — jenis kejadian",
            "LOCATION — lokasi kejadian",
            "SUSPECTS — jumlah dan deskripsi 61",
            "HOSTAGES — jumlah sandera",
            "VEHICLE — deskripsi 60",
            "PLATE — nomor plate",
            "BACKUP REQUEST — permintaan unit tambahan",
          ],
        },
      ],
    },
    {
      id: "radio-breaking-off",
      icon: "📻",
      title: "Breaking Off from a Case",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Meninggalkan lokasi kasus sebelum situasi dinyatakan Code 4. Wajib meminta izin IC terlebih dahulu.",
        },
        {
          type: "radiocall",
          title: "11.1 Requesting Permission",
          phrase:
            "To IC, this is [CALLSIGN]. Permission for breaking off. I have processed the suspect under the name of [NAME].",
          phrase_id:
            "Untuk IC, ini [CALLSIGN]. Meminta izin untuk break off. Saya sudah memproses suspect atas nama [NAME].",
          note: "Kapan dipakai: saat tugasmu di lokasi sudah selesai. Tunggu izin IC sebelum meninggalkan lokasi.",
        },
        {
          type: "radiocall",
          title: "11.2 After Permission",
          phrase: "Dispatch, [CALLSIGN] is 10-8. Back to patrol.",
          phrase_id: "Dispatch, [CALLSIGN] kembali 10-8. Kembali patroli.",
          note: "Kapan dipakai: setelah IC memberi izin break off. Kembali ke 10-8 saat unit sudah available.",
        },
      ],
    },
    {
      id: "radio-quick-flow",
      icon: "🧭",
      title: "Quick Radio Flow",
      group: "Radio",
      blocks: [
        {
          type: "intro",
          text: "Ringkasan alur radio untuk dibaca cepat. Ikuti jalur sesuai situasi yang sedang dihadapi.",
        },
        {
          type: "flow",
          title: "Alur Patroli & Traffic Stop",
          tracks: [
            {
              title: "Patrol → Traffic Stop",
              steps: [
                { label: "PATROL" },
                { label: "10-8" },
                { label: "TRAFFIC STOP" },
                { label: "10-55" },
                { label: "CHECK 28 / 29" },
                { label: "CODE 4 → 10-8" },
              ],
            },
            {
              title: "10-55 → Pursuit",
              steps: [
                { label: "10-55" },
                { label: "PURSUIT" },
                { label: "10-57" },
                { label: "10-78 BACKUP" },
              ],
            },
            {
              title: "10-55 → Felony Stop",
              steps: [
                { label: "10-55" },
                { label: "WARRANT / BOLO" },
                { label: "10-38 FELONY STOP" },
                { label: "VEHICLE SEARCH" },
                {
                  label: "VEHICLE DISPOSITION",
                  branches: [
                    { label: "CLEAR → IMPOUND PUBLIC", tone: "ok" },
                    { label: "NOT CLEAR / BOLO → SEIZE TO POLICE", tone: "danger" },
                  ],
                },
                { label: "95 SUSPECT" },
                { label: "PROCESSING" },
                { label: "BREAK OFF / 10-8" },
              ],
            },
            {
              title: "Narcotics — 34 → 57",
              steps: [
                { label: "34" },
                { label: "57" },
                { label: "10-78" },
                { label: "PURSUIT" },
              ],
            },
            {
              title: "Active Situations",
              steps: [
                { label: "31A / 31B / 90" },
                { label: "10-76" },
                { label: "ON-SCENE REPORT" },
                { label: "REQUEST 10-78 IF NEEDED" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "prosedur-penangkapan",
      icon: "①",
      title: "Prosedur Penangkapan",
      group: "Prosedur",
      blocks: [
        {
          type: "steps",
          items: [
            "Setelah pengejaran/tindakan kriminal, suspect yang menyerah harus mengangkat tangannya.",
            "Gunakan Taser saat melakukan penodongan kepada suspect.",
            "Jika suspect berusaha melarikan diri, taser lagi. Beri peringatan saat suspect terjatuh. Jika sampai ketiga kalinya tidak menyerah, langsung borgol suspect.",
            "Bacakan MIRANDA RIGHTS saat memborgol suspect.",
            "Jika terjadi skema menenggelamkan diri / suspect melarikan diri (atas perintah IC), lakukan pelumpuhan menggunakan senjata api, lalu angkut ke mobil.",
            "Lakukan GSR Test (ALT) ke badan suspect — jika positif berarti menggunakan senjata — dan foto sebagai bukti.",
            "Masukan ke dalam kendaraan dan bawa ke station terdekat.",
          ],
        },
      ],
    },
    {
      id: "memproses-suspect",
      icon: "②",
      title: "Memproses Suspect",
      group: "Prosedur",
      blocks: [
        {
          type: "steps",
          items: [
            "Saat sampai di station, bawa suspect ke Sel Tahanan/Ward. Jika banyak suspect, letakkan di tempat luas di station.",
            "Jika suspect pingsan, panggil EMS dan lakukan prosedur BLS, serta cek GSR Test.",
            "Saat suspect pingsan, foto barang bawaan suspect terlebih dahulu (pastikan pas) dan foto GSR Test-nya.",
            "Setelah dibangunkan EMS, biarkan membayar biaya pengobatan, lalu borgol dan bacakan Miranda Right (jangan kelamaan).",
            "Geledah barang bawaan suspect (badan dan tas), foto untuk bukti yang dimasukkan ke MDT.",
            "Sita semua barang ilegal: Senjata, Narkoba, Uang Merah, dan barang ilegal lainnya.",
            "Setelah disita, lepas borgol dan minta suspect melepas topi/kacamata/masker yang menutupi muka.",
            "Minta ID Card lalu foto. Jika tidak punya ID, lakukan Fingerprint, lalu berikan papan mugshot dan foto.",
            "Fingerprint: bawa ke meja fingerprint, masukkan nomor kantong. Jika layar mengeluarkan kode, copy dan foto kode tersebut.",
            "Buka MDT → menu 'Profile', masukkan kode tadi di pencarian. Akan keluar pemilik asli kode tersebut.",
            "Masuk menu 'Incident', cari insiden yang kamu tangani. Pilih tanda + di kolom 'Criminal', masukkan nama suspect.",
            "Masukkan penal code di bagian 'Handle Charge' sesuai arahan IC.",
            "Setelah semua charge masuk, bacakan ke suspect: penal code, denda, dan masa tahanannya.",
            "Tanyakan apakah Plead Guilty atau tidak. Jika tidak, dia bisa memanggil pengacara untuk ke persidangan.",
            "Jika Plead Guilty, kirim denda via 'Send Fine' (kanan bawah) dan centang Processed & Plead Guilty.",
            "Denda juga bisa via tablet (F1) → Billing. Masukkan nomor kantong & denda sesuai MDT. Wajib bayar via bank (bukan Cash).",
            "Cek Billing di History. Jika belum bayar, gunakan 'Force Pay' dari history bill suspect.",
            "Panggil DOC Central atau DOC Lokal untuk membawa suspect ke Penjara.",
            "Jika suspect court verdict, panggil DOC Central untuk escort. Jika tidak ada, lakukan /jail 99999.",
          ],
        },
      ],
    },
    {
      id: "mdt-process",
      icon: "▤",
      title: "Penggunaan MDT",
      group: "Prosedur",
      blocks: [
        {
          type: "intro",
          text: "Catatan penting saat memproses suspect di MDT.",
        },
        {
          type: "bullets",
          items: [
            "Denda dibacakan full, contoh: 24562 dolar (dua puluh empat ribu lima ratus enam puluh dua dolar). Tidak boleh kurang dari denda yang diterima.",
            "Masa tahanan dibacakan, contoh: 90 bulan (tergantung IC jika ada pengurangan).",
            "Charge digunakan 1 kali saja. Jika ada 2 senjata jenis sama bisa ditumpuk jadi 2x.",
            "Bagian Warrant dihidupkan jika terdapat suspect yang dicari/buron.",
            "Processed & Plead Guilty dihidupkan jika suspect telah diproses, merasa bersalah, dan sudah membayar denda.",
            "Processed dihidupkan tapi Plead Guilty tidak, jika suspect terkena charge yang membuatnya harus dibawa ke pengadilan.",
            "Langsung kirim suspect via jail di MDT jika tidak ada DOC available, atau gunakan /jail.",
          ],
        },
      ],
    },
    {
      id: "impound",
      icon: "🚓",
      title: "Impound Kendaraan",
      group: "Prosedur",
      blocks: [
        {
          type: "steps",
          title: "Impound Police / Impound Sita",
          items: [
            "Impound sita dilakukan jika kendaraan suspect berada di lokasi sebuah kasus.",
            "Bisa digunakan jika mobil suspect masuk ke dalam air.",
            "Bisa digunakan jika mobil suspect dibiarkan dan suspect kabur menggunakan kendaraan lain (changing vehicle saat pengejaran).",
            "Kendaraan yang boleh di-Impound Sita harus dari persetujuan IC.",
            "Check identitas kendaraan: F1 → Police Interaction → next page → Checking Vehicle.",
            "Foto dengan mata satu, deskripsi kendaraan tersebut.",
            "Check MDT mengenai kendaraan dan pemiliknya.",
            "Check Trunk dan Glove Box dengan mata satu, lalu foto untuk evidence.",
            "Foto kendaraan terlihat seluruh bagian dan plate number-nya.",
            "Jika ada barang ilegal, ambil menggunakan sarung tangan.",
            "Jika sudah clear, lakukan Impound Sita: F1 → Police Interaction → next page → Impound Sita (tulis di threads & MDT, terutama jika ada tampering).",
            "Masukan semua evidence ke Threads di Website Putih bagian Impound Police, sertakan nomor MDT.",
            "Tulis semua deskripsi kendaraan & kasus, tampilkan foto evidence.",
            "Jika perampokan/aktivitas ilegal dan suspect tertangkap, kendaraan TIDAK pakai impound police melainkan IMPOUND VEHICLE PUBLIC.",
          ],
        },
        {
          type: "steps",
          title: "Pengeluaran Kendaraan dari Impound Police",
          items: [
            "Minta identitas dari warga yang ingin mengeluarkan kendaraannya.",
            "Minta Plate Number kendaraan.",
            "Check riwayat & catatan warga dan kendaraan (di MDT dan Website Putih bagian Impound Police).",
            "PASTIKAN baca NOTES di profile dan kendaraan di MDT & Website. Contoh: notes kasus narkoba — tidak boleh dikeluarkan sampai tanggal tertentu.",
            "Untuk kasus seperti itu, JANGAN keluarkan kendaraan tanpa sepengetahuan IC yang memegang kasus.",
            "Pastikan kendaraan BOLO atau tidak. Jika BOLO, proses sesuai incident MDT (mis. bayar denda dari kasus di MDT).",
            "Jika catatan warga & kendaraan bersih, keluarkan kendaraan.",
            "Check kembali Trunk & Glovebox sebelum diberikan.",
            "Tagih regulasi pengeluaran kendaraan sita sebesar $5,000.",
            "Berikan kunci kepada warga saat kendaraan sudah diberikan.",
          ],
        },
      ],
    },
    {
      id: "bls-miranda",
      icon: "✚",
      title: "BLS & Miranda Right",
      group: "Prosedur",
      blocks: [
        {
          type: "steps",
          title: "Prosedur BLS",
          items: [
            "Amankan Suspect/Deputy yang terluka ke tempat aman.",
            "Lakukan pertolongan pertama dengan CPR (emote CPR). Utamakan Deputy/Officer terlebih dahulu.",
            "Berikan tanda saat melakukan BLS (/me Melakukan BLS / Applying BLS).",
            "Setelah BLS diberikan (/do BLS diberikan / BLS Applied).",
            "Hubungi EMS dari lokasi terdekat (Alta / Roxwood Hospital).",
            "Beritahu EMS bahwa telah melakukan BLS.",
          ],
        },
        {
          type: "quote",
          title: "Miranda Right (English)",
          text: "You have the right to remain silent, anything you say can and will be used against you in the court of law. You have the right to an attorney. If you cannot afford one, one will be provided to you. Do you understand?",
        },
        {
          type: "quote",
          title: "Miranda Right (Indonesia)",
          text: "Anda berhak untuk diam, apapun yang anda katakan dapat melawan anda di pengadilan. Anda berhak memanggil seorang pengacara, jika tidak ada maka negara yang akan memberikannya untuk anda. Apakah anda mengerti?",
        },
      ],
    },
    {
      id: "peraturan-tidak-tertulis",
      icon: "✎",
      title: "Peraturan Tidak Tertulis",
      group: "Prosedur",
      blocks: [
        {
          type: "bullets",
          items: [
            "Jika memproses suspect, arahkan bodycam di vest ke arah suspect (boleh menggunakan mata 3).",
            "Jika suspect masih terkapar (belum diobati dokter), sempatkan tes GSR-nya lalu foto.",
            "Foto isi tas dan badan suspect untuk evidence, setorkan ke MDT dan Threads.",
            "Bawa suspect lewat pintu BELAKANG. DILARANG KERAS membawa suspect lewat pintu depan.",
            "JANGAN LUPA membaca Miranda Right saat memborgol suspect.",
          ],
        },
      ],
    },
    {
      id: "senjata-legal",
      icon: "▦",
      title: "Senjata Kepolisian",
      group: "Senjata",
      blocks: [
        {
          type: "weapons",
          classes: [
            {
              name: "Class 1",
              items: ["Combat Pistol", "AP Pistol", "PD 2011", "Heavy Pistol", "JR136 Timberstrike"],
            },
            {
              name: "Class 2",
              items: ["Combat PDW", "Assault SMG", "SMG MK2", "Revolver MK2", "MI9", "Colt Revolver", "Pump Shotgun MK2", "Bullpup Shotgun", "Combat V7X", "Vector Sector"],
            },
            {
              name: "Class 3",
              items: ["Carbine Rifle MK2", "Special Carbine MK2", "Assault Rifle MK2", "Bullpup Rifle MK2", "CQB Universal Bullpup Rifle", "Modern Universal Bullpup Rifle", "Universal Bullpup Rifle", "SA Tactical Rifle", "SA Tactical Rifle MK2", "XEN7 Warden PD", "RRC3 Achromic"],
            },
          ],
        },
      ],
    },
    {
      id: "senjata-illegal",
      icon: "▩",
      title: "Senjata Illegal / Contraband",
      group: "Senjata",
      blocks: [
        {
          type: "weapons",
          variant: "illegal",
          classes: [
            {
              name: "Class 1",
              items: ["Pistol .50", "Ceramic Pistol", "X17 Modular", "Machine Pistol", "ST84 Skull n Sword", "MX18 Classyblue"],
            },
            {
              name: "Class 2",
              items: ["Mini SMG", "Micro SMG", "SMG", "Navy Revolver", "KVR", "Pump Shotgun", "Revolver Black", "Sawn Off Shotgun", "SDR7", "VTN33 Graveshift"],
            },
            {
              name: "Class 3",
              items: ["Double Action", "Assault Rifle", "Carbine Rifle", "MB47", "AGC", "BK12", "Dragon", "Scarl Godzilla", "AK47 Purplefunk", "AKT", "Foolv2 RED", "M6A9 Diamond Soul", "Scarl Rusty", "M4 T Neon", "Integrale"],
            },
          ],
        },
      ],
    },
    {
      id: "penal-robbery",
      icon: "§",
      title: "Penal Code — Robbery",
      group: "Penal Code",
      blocks: [
        {
          type: "intro",
          text: "Contoh penal code untuk memproses suspect pada berbagai jenis perampokan. Bacakan denda dan masa tahanan sesuai yang tertera.",
        },
        {
          type: "penal",
          title: "Robbery LTD",
          main: "Commercial Robbery (LTD Robbery)",
          charges: [
            "Hostages (1-2 sandera) / Aggravated Hostages (3-4 sandera)",
            "Reckless evading to peace officer / reckless driving (untuk driver)",
            "Possession of stolen goods (uang merah & benda yang didapat)",
            "Barang bawaan dari suspect",
          ],
        },
        {
          type: "penal",
          title: "Robbery Fleeca",
          main: "Grand Larceny Public Bank (Fleeca Robbery)",
          charges: [
            "Hostages (1-2) / Aggravated Hostages (3-4)",
            "Reckless evading to peace officer / reckless driving",
            "Possession of stolen goods",
            "Barang bawaan dari suspect",
          ],
        },
        {
          type: "penal",
          title: "Grupee, Cash Exchange, Laudromart, Bobcat, Cargo Robbery",
          main: "Grand Larceny Major Property",
          charges: [
            "Hostages (1-2) / Aggravated Hostages (3-4)",
            "Reckless evading to peace officer / reckless driving",
            "Possession of stolen goods",
            "Barang bawaan dari suspect",
          ],
        },
        {
          type: "penal",
          title: "Pacific Bank, Maze Bank, Blaine County Bank Robbery",
          main: "Grand Larceny Federal Bank",
          charges: [
            "Hostages (1-2) / Aggravated Hostages (3-4)",
            "Reckless evading to peace officer / reckless driving",
            "Possession of stolen goods",
            "Barang bawaan dari suspect",
          ],
        },
        {
          type: "penal",
          title: "Robbery Vangelico Jewelry",
          main: "Robbery to Vangelico Property",
          charges: [
            "Hostages (1-2) / Aggravated Hostages (3-4)",
            "Reckless evading to peace officer / reckless driving",
            "Possession of stolen goods",
            "Barang bawaan dari suspect",
          ],
        },
      ],
    },
    {
      id: "penal-violence",
      icon: "§",
      title: "Penal Code — Kekerasan",
      group: "Penal Code",
      blocks: [
        {
          type: "penal",
          title: "Gang War",
          main: "Gang Related Shooting (Gang War)",
          charges: [
            "Criminal Use of Firearm (jika GSR positif melakukan penembakan)",
            "Barang bawaan dari suspect",
          ],
        },
        {
          type: "penal",
          title: "Penyerangan terhadap Deputy/Officer",
          main: "Assault with Deadly Weapon to Government Employee",
          charges: [
            "Criminal Use of a Firearm (jika GSR positif)",
            "Disturbing the peace (mengganggu ketertiban)",
            "Barang bawaan dari suspect",
          ],
        },
      ],
    },
    {
      id: "penal-property",
      icon: "§",
      title: "Penal Code — Properti",
      group: "Penal Code",
      blocks: [
        {
          type: "bullets",
          items: [
            "Destruction of Government Property — merusak, merobohkan, atau menghancurkan fasilitas/properti milik pemerintah secara sengaja dengan skala kerusakan mayor (besar).",
            "Vandalism — perusakan ringan (minor physical damage) atau pengotoran properti milik orang lain/publik (contoh: corat-coret/graffiti, menggores, atau merusak fasilitas pribadi/publik).",
            "Vandalism on Government Property — perusakan ringan (minor physical damage) atau pengotoran yang secara spesifik dilakukan terhadap properti milik Pemerintah/Negara.",
          ],
        },
      ],
    },
    {
      id: "penal-firearms",
      icon: "§",
      title: "Penal Code — Senjata",
      group: "Penal Code",
      blocks: [
        {
          type: "intro",
          text: "Pasal yang terkena jika suspect kedapatan membawa senjata.",
        },
        {
          type: "bullets",
          items: [
            "Criminal Use of a Firearm — jika kedapatan positif menggunakan senjata.",
            "Criminal Possession of a Firearm [Class 1/2/3] — membawa senjata ilegal sesuai class.",
            "Possession of Unlicensed Firearm [Class 1] — membawa Pistol/Handgun gunstore tanpa lisensi.",
            "Possession of Unlicensed Firearm [Class 2] — membawa Shotgun/Rifle gunstore tanpa lisensi.",
            "Usage of Suppressor — dengan sengaja menggunakan, memasang (attach), melengkapi (equip), ataupun menembakkan senjata api yang telah terpasang Suppressor, tanpa kewenangan atau otorisasi yang sah.",
          ],
        },
      ],
    },
    {
      id: "penal-ammo",
      icon: "§",
      title: "Penal Code — Amunisi & Vest",
      group: "Penal Code",
      blocks: [
        {
          type: "bullets",
          items: [
            "Unlawful Possession of Ammunition — membawa < 300 butir (jenis apapun, total < 300).",
            "Illegal Distribution of Ammunition — membawa > 300 dan < 2000 butir.",
            "Ammunition Smuggling (Court Verdict) — membawa > 2000 butir.",
            "Misdemeanor Possession of Bulletproof Vest — membawa < 10 vest.",
            "Felony Possession of Bulletproof Vest (Court Verdict) — membawa 10 atau lebih vest.",
          ],
        },
      ],
    },
    {
      id: "penal-narcotics",
      icon: "§",
      title: "Penal Code — Narcotics",
      group: "Penal Code",
      blocks: [
        {
          type: "bullets",
          items: [
            "Misdemeanor Possession of Schedule I — weed bag dam opium bag < 60 gram.",
            "Felony Possession of Schedule I — weed bag dan opium bag > 60 gram.",
            "Misdemeanor Possession of Schedule II — meth bag dan cocaine < 100 gram.",
            "Felony Possession of Schedule II — meth bag dan cocaine > 100 gram.",
            "Distribute of a Schedule Category — kedua jenis narcotics total > 800 gram.",
            "Drug Smuggling — kedua jenis narcotics total > 2000 gram.",
            "Drug Trafficking — kedua jenis narcotics total > 4000 gram.",
            "Drugs Selling — setiap orang yang menjual atau menawarkan untuk menjual suatu zat yang diawasi kepada orang lain, serta memiliki zat yang diawasi tersebut, dinyatakan bersalah melakukan tindak pidana penjualan narkoba.",
            "Possession of Drug Paraphernalia — alat produksi (A < 10, B > 10): Meth Oven, Meth Table, Bagging Table, Baggy, Planting Pot, Cannabis Seed, Weed, Phos, Pseudo, Acid, Liquid Meth, Meth.",
            "Drug Manufacturing — melakukan proses produksi kedua jenis schedule controlled substances.",
            "Unlawful Possession of Poppy — kepemilikan 101 kg – 200 kg Poppy tanpa izin yang sah.",
            "Felony Possession of Poppy — kepemilikan 201 kg – 300 kg Poppy tanpa izin yang sah.",
            "Aggravated Possession of Poppy (Court Verdict) — kepemilikan 301 kg atau lebih tanpa izin yang sah.",
          ],
        },
      ],
    },
    {
      id: "penal-traffic",
      icon: "§",
      title: "Penal Code — Traffic",
      group: "Penal Code",
      blocks: [
        {
          type: "bullets",
          items: [
            "Possession of Nitrous Oxide — menguasai, membawa, atau menyimpan tabung Nitrous Oxide (NOS) yang diperuntukkan bagi peningkatan performa kendaraan tanpa izin sah (authorization).",
            "Use of Nitrous Oxide — mengaktifkan atau menggunakan sistem injeksi Nitrous Oxide (NOS) pada kendaraan secara ilegal saat kendaraan beroperasi/dikemudikan.",
            "Failure to Use Required Safety Equipment (Ticket Only) — mengemudikan atau menumpang kendaraan bermotor di jalan umum tanpa menggunakan perlengkapan keselamatan yang diwajibkan oleh hukum (termasuk namun tidak terbatas pada Helm dan/atau Sabuk Pengaman / Seat Belt).",
          ],
        },
      ],
    },
    {
      id: "penal-money",
      icon: "§",
      title: "Penal Code — Lainnya",
      group: "Penal Code",
      blocks: [
        {
          type: "bullets",
          items: [
            "Possession of Unauthorized Device (Hacking Device) — membawa lockpick atau kartu seperti green card.",
            "Minor Possession of Illegal Money — uang merah < 50.000.",
            "Third Degree Possession of Illegal Money — uang merah < 149.999.",
            "Second Degree Possession of Illegal Money — uang merah < 399.999.",
            "First Degree Possession of Illegal Money (Court Verdict) — uang merah > 400.000.",
          ],
        },
      ],
    },
    {
      id: "patrol-report",
      icon: "📋",
      title: "Patrol Report Generator",
      group: "Form Helper",
      blocks: [
        {
          type: "patrol-form",
        },
      ],
    },
    {
      id: "penal-generator",
      icon: "⚖",
      title: "Penal Code Generator",
      group: "Form Helper",
      blocks: [
        {
          type: "intro",
          text: "Centang / isi apa yang suspect bawa dan lakukan — daftar pasal yang berlaku muncul otomatis di panel bawah. Cukup sebagai bantuan cepat, keputusan akhir tetap di tangan deputy.",
        },
        {
          type: "penal-form",
        },
      ],
    },
  ],
};

// Değişkenler
let workTime = 25;               // Çalışma süresi (dakika)
let shortBreakTime = 5;          // Kısa mola süresi (dakika)
let longBreakTime = 15;          // Uzun mola süresi (dakika)
let timerMinutes = workTime;     // Aktif zamanlayıcının dakika değeri
let timerSeconds = 0;            // Aktif zamanlayıcının saniye değeri
let timerId;                     // setInterval ID
let isRunning = false;           // Zamanlayıcı çalışıyor mu?
let cycleCount = 0;              // Tamamlanan çalışma sayısı (4 çalışmadan sonra uzun mola)
let completedPomodoros = 0;      // Tamamlanan toplam pomodoro sayısı
let currentMode = 'work';        // Mevcut mod ('work', 'shortBreak', 'longBreak')

// HTML elementlerini seçme
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const statusDisplay = document.getElementById('status');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const workTimeInput = document.getElementById('work-time');
const shortBreakInput = document.getElementById('short-break');
const longBreakInput = document.getElementById('long-break');
const saveSettingsButton = document.getElementById('save-settings');
const statsDisplay = document.getElementById('stats');

// Ayarların yüklenmesi
function loadSettings() {
    // LocalStorage'dan kayıtlı ayarları yükle
    if (localStorage.getItem('workTime')) {
        workTime = parseInt(localStorage.getItem('workTime'));
        workTimeInput.value = workTime;
    }
    
    if (localStorage.getItem('shortBreakTime')) {
        shortBreakTime = parseInt(localStorage.getItem('shortBreakTime'));
        shortBreakInput.value = shortBreakTime;
    }
    
    if (localStorage.getItem('longBreakTime')) {
        longBreakTime = parseInt(localStorage.getItem('longBreakTime'));
        longBreakInput.value = longBreakTime;
    }
    
    if (localStorage.getItem('completedPomodoros')) {
        completedPomodoros = parseInt(localStorage.getItem('completedPomodoros'));
        updateStats();
    }
    
    // Zamanlayıcıyı başlangıç değerlerine ayarla
    timerMinutes = workTime;
    timerSeconds = 0;
    updateTimerDisplay();
}

// Ayarları kaydetme
function saveSettings() {
    // Input değerlerini al ve integer'a çevir
    workTime = parseInt(workTimeInput.value) || 25; // Eğer geçersiz değer girilirse, varsayılan değer kullan
    shortBreakTime = parseInt(shortBreakInput.value) || 5;
    longBreakTime = parseInt(longBreakInput.value) || 15;
    
    // LocalStorage'a kaydet
    localStorage.setItem('workTime', workTime);
    localStorage.setItem('shortBreakTime', shortBreakTime);
    localStorage.setItem('longBreakTime', longBreakTime);
    
    // Eğer şu anda çalışma modundaysa, zamanlayıcıyı yeni çalışma süresine ayarla
    if (currentMode === 'work' && !isRunning) {
        timerMinutes = workTime;
        timerSeconds = 0;
        updateTimerDisplay();
    }
    
    alert('Ayarlar kaydedildi!');
}

// Zamanlayıcıyı başlatma
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerId = setInterval(updateTimer, 1000); // Her 1 saniyede bir updateTimer fonksiyonunu çağır
    }
}

// Zamanlayıcıyı duraklatma
function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerId);
    }
}

// Zamanlayıcıyı sıfırlama
function resetTimer() {
    // Zamanlayıcıyı durdur
    pauseTimer();
    
    // Mevcut moda göre zamanı ayarla
    if (currentMode === 'work') {
        timerMinutes = workTime;
    } else if (currentMode === 'shortBreak') {
        timerMinutes = shortBreakTime;
    } else {
        timerMinutes = longBreakTime;
    }
    
    timerSeconds = 0;
    updateTimerDisplay();
}

// Zamanlayıcıyı güncelleme
function updateTimer() {
    if (timerSeconds === 0) {
        if (timerMinutes === 0) {
            // Süre doldu, sonraki moda geç
            completeTimer();
        } else {
            // Bir dakika azalt, saniyeyi 59'a ayarla
            timerMinutes--;
            timerSeconds = 59;
        }
    } else {
        // Bir saniye azalt
        timerSeconds--;
    }
    
    updateTimerDisplay();
}

// Ekrandaki zamanlayıcıyı güncelleme
function updateTimerDisplay() {
    minutesDisplay.textContent = timerMinutes < 10 ? '0' + timerMinutes : timerMinutes;
    secondsDisplay.textContent = timerSeconds < 10 ? '0' + timerSeconds : timerSeconds;
}

// Süre dolduğunda yapılacaklar
function completeTimer() {
    pauseTimer();
    playNotificationSound();
    
    if (currentMode === 'work') {
        // Çalışma süresi tamamlandı
        cycleCount++;
        completedPomodoros++;
        localStorage.setItem('completedPomodoros', completedPomodoros);
        updateStats();
        
        if (cycleCount % 4 === 0) {
            // 4 çalışma döngüsünden sonra uzun mola
            currentMode = 'longBreak';
            statusDisplay.textContent = 'Uzun Mola';
            timerMinutes = longBreakTime;
        } else {
            // Kısa mola
            currentMode = 'shortBreak';
            statusDisplay.textContent = 'Kısa Mola';
            timerMinutes = shortBreakTime;
        }
    } else {
        // Mola bitti, çalışma zamanına geç
        currentMode = 'work';
        statusDisplay.textContent = 'Çalışma Zamanı';
        timerMinutes = workTime;
    }
    
    timerSeconds = 0;
    updateTimerDisplay();
}

// Bildirim sesi çalma
function playNotificationSound() {
    // Ses dosyasını çal
    const audio = new Audio('sounds/notification.wav');
    audio.play().catch(error => console.log('Ses çalınamadı:', error));
    
    // Masaüstü bildirimi göster (eğer izin verildiyse)
    if ('Notification' in window && Notification.permission === 'granted') {
        let mesaj = currentMode === 'work' ? 'Şimdi mola zamanı.' : 'Şimdi çalışma zamanı.';
        new Notification('Pomodoro Zamanlayıcı', { 
            body: 'Zaman doldu! ' + mesaj,
            icon: 'img/pomodoro-icon.png' // İsteğe bağlı: bir ikon ekleyebilirsiniz
        });
    }
}

// İstatistikleri güncelleme
function updateStats() {
    statsDisplay.textContent = `Tamamlanan pomodoro: ${completedPomodoros}`;
}

// Olay dinleyicileri - butonlar için
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde ayarları yükle
    loadSettings();
    
    // Buton event listener'ları
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    saveSettingsButton.addEventListener('click', saveSettings);
});
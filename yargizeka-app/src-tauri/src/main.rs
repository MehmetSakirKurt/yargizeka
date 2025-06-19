// Konsol penceresi Windows'ta gösterilmesin
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Burada Tauri komutlarımızı tanımlayabiliriz
#[tauri::command]
fn merhaba(isim: &str) -> String {
    format!("Merhaba, {}! Tauri'den selamlar!", isim)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![merhaba])
        .run(tauri::generate_context!())
        .expect("Tauri uygulaması çalıştırılamadı");
}
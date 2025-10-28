/**
 * Template management system
 */

class TemplateManager {
  constructor() {
    this.templates = {
      standard: `{salam} pengguna ICONNET atas nama Bpk/Ibu {nama}, sebelumnya kami memohon maaf atas kendala yang Bpk/Ibu alami. Kami dari ICONNET ingin follow-up terkait laporan kendala {kategori} dengan No. Tiket pelaporan {tiket}.

Apakah saat ini Bapak/Ibu kendalanya sudah tertangani?{asp}`,

      wifi_default: `{salam}, pengguna ICONNET atas nama Bpk/Ibu {nama}, sebelumnya kami memohon maaf atas kendala yang Bpk/Ibu alami. Kami dari ICONNET ingin follow-up terkait laporan {kategori} dengan No. Tiket pelaporan {tiket}.
    
Kami informasikan bahwa nama WiFi di lokasi bapak/ibu telah mengalami reset ke pengaturan default. berikut nama wifinya

SSID    : {ssid}
Password : {password}  

Jika ada permintaan khusus terkait nama WiFi (SSID) atau password, silakan informasikan kepada kami agar dapat disesuaikan sesuai kebutuhan{asp}`,

      ganti_ssid_password: `{salam}, pengguna ICONNET atas nama Bpk/Ibu {nama}, sebelumnya kami memohon maaf atas kendala yang Bpk/Ibu alami. Kami dari ICONNET ingin follow-up terkait laporan kendala LAIN-LAIN dengan No. Tiket pelaporan {tiket}.

SSID dan password WiFi Anda sudah kami perbarui sesuai permintaan:
SSID : {ssid}
Password : {password}

Silakan sambungkan kembali perangkat Anda menggunakan SSID dan Password baru. Apabila masih ada kendala, jangan ragu untuk menghubungi kami.{asp}`,

      ganti_ssid: `{salam}, pengguna ICONNET atas nama Bpk/Ibu {nama}, sebelumnya kami memohon maaf atas kendala yang Bpk/Ibu alami. Kami dari ICONNET ingin follow-up terkait laporan kendala LAIN-LAIN dengan No. Tiket pelaporan {tiket}.

SSID WiFi Anda sudah kami perbarui sesuai permintaan:
SSID: {ssid}

Silakan sambungkan kembali perangkat Anda menggunakan SSID baru. Apabila masih ada kendala, jangan ragu untuk menghubungi kami.{asp}`,

      ganti_password: `{salam}, pengguna ICONNET atas nama Bpk/Ibu {nama}, sebelumnya kami memohon maaf atas kendala yang Bpk/Ibu alami. Kami dari ICONNET ingin follow-up terkait laporan kendala LAIN-LAIN dengan No. Tiket pelaporan {tiket}.

Password WiFi Anda sudah kami perbarui sesuai permintaan:
Password: {password}

Silakan sambungkan kembali perangkat Anda menggunakan Password baru. Apabila masih ada kendala, jangan ragu untuk menghubungi kami.{asp}`,

      streaming_service: `{salam}, pengguna ICONNET atas nama Bpk/Ibu {nama}, sebelumnya kami memohon maaf atas kendala yang Bpk/Ibu alami. Kami dari ICONNET ingin follow-up terkait laporan kendala {kategori} dengan No. Tiket pelaporan {tiket}.

Mohon bantuannya untuk mencoba kembali dan disarankan untuk reboot terlebih dahulu. Jika diperlukan login ulang berikut username dan passwordnya:

Username: {ssid}
Password: {password}

Apakah saat ini Bapak/Ibu kendalanya sudah tertangani?{asp}`,
    };

    this.customTemplates = this.loadCustomTemplates();
  }
  /**
   * Get template by type
   */
  getTemplate(type) {
    return this.templates[type] || this.templates.standard;
  }

  /**
   * Render template with data - FIXED ASP FORMAT
   */
  render(templateType, data) {
    const template = this.getTemplate(templateType);
    let rendered = template;

    // Replace all placeholders
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{${key}}`, "g");

      // Special handling untuk ASP
      if (key === "asp") {
        // Jika ASP diisi, tambahkan newline dan format dengan dash
        // Jika kosong, hapus placeholder
        if (value && value.trim()) {
          let formattedASP = value.trim();
          // Tambahkan dash jika belum ada
          if (!formattedASP.startsWith("-")) {
            formattedASP = "-" + formattedASP;
          }
          rendered = rendered.replace(placeholder, `\n\n${formattedASP}`);
        } else {
          rendered = rendered.replace(placeholder, "");
        }
      } else {
        rendered = rendered.replace(placeholder, value || "");
      }
    }

    return rendered;
  }

  /**
   * Validate template data
   */
  validateTemplateData(data) {
    const required = ["salam", "nama", "tiket", "kategori"];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Data template tidak lengkap: ${missing.join(", ")}`);
    }

    return true;
  }

  /**
   * Add custom template
   */
  addCustomTemplate(name, content) {
    this.customTemplates[name] = content;
    this.saveCustomTemplates();
    return true;
  }

  /**
   * Remove custom template
   */
  removeCustomTemplate(name) {
    delete this.customTemplates[name];
    this.saveCustomTemplates();
    return true;
  }

  /**
   * Get all available templates
   */
  getAllTemplates() {
    return {
      ...this.templates,
      ...this.customTemplates,
    };
  }

  /**
   * Load custom templates from storage
   */
  loadCustomTemplates() {
    try {
      return JSON.parse(localStorage.getItem("custom_templates") || "{}");
    } catch (error) {
      console.error("Error loading custom templates:", error);
      return {};
    }
  }

  /**
   * Save custom templates to storage
   */
  saveCustomTemplates() {
    try {
      localStorage.setItem(
        "custom_templates",
        JSON.stringify(this.customTemplates)
      );
      return true;
    } catch (error) {
      console.error("Error saving custom templates:", error);
      return false;
    }
  }

  /**
   * Export templates as JSON
   */
  exportTemplates() {
    const data = {
      builtIn: this.templates,
      custom: this.customTemplates,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    Utils.downloadFile(
      JSON.stringify(data, null, 2),
      `templates-export-${new Date().toISOString().split("T")[0]}.json`,
      "application/json"
    );
  }

  /**
   * Import templates from JSON
   */
  importTemplates(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (data.custom) {
        this.customTemplates = { ...this.customTemplates, ...data.custom };
        this.saveCustomTemplates();
      }

      return true;
    } catch (error) {
      console.error("Error importing templates:", error);
      return false;
    }
  }
}

// Create global instance
const templateManager = new TemplateManager();

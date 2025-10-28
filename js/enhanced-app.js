// enhanced-app.js - FIXED VERSION
class EnhancedApp {
  constructor() {
    this.API_URL =
      "https://script.google.com/macros/s/AKfycbyzcSTlhWoQylIoL013rttPjh3G3oE0saCGvM1dALRj/dev";
    this.currentUser = "Outbound_User";
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;

    console.log("🔄 EnhancedApp constructor called");

    // Set global app state
    window.appReady = false;

    // Delay initialization untuk pastikan DOM ready
    setTimeout(() => {
      this.init();
    }, 100);
  }

  async init() {
    try {
      console.log("🚀 Enhanced App Initializing...");

      // Update status
      this.updateAppStatus("initializing");

      // Pastikan DOM elements sudah tersedia
      if (!this.checkRequiredElements()) {
        console.warn("⚠️ Some DOM elements not ready, retrying...");

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => this.init(), 500);
          return;
        } else {
          throw new Error("Failed to initialize app: DOM elements not found");
        }
      }

      this.initEnhancedFeatures();
      this.initialized = true;
      window.appReady = true;

      console.log("✅ Enhanced App Fully Initialized");
      this.updateAppStatus("ready");
      Utils.showToast("Aplikasi siap digunakan!", "success");
    } catch (error) {
      console.error("❌ App initialization failed:", error);
      this.updateAppStatus("error");
      this.showError("Gagal memulai aplikasi: " + error.message);
    }
  }

  updateAppStatus(status) {
    const statusElement = document.getElementById("appStatus");
    const statusText = document.getElementById("statusText");
    const refreshBtn = document.getElementById("refreshTicketsBtn");

    if (!statusElement || !statusText) return;

    switch (status) {
      case "initializing":
        statusElement.className =
          "mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm";
        statusText.innerHTML =
          '<i class="fas fa-spinner fa-spin text-yellow-500 mr-1"></i> Menyiapkan aplikasi...';
        if (refreshBtn) refreshBtn.disabled = true;
        break;

      case "ready":
        statusElement.className =
          "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm";
        statusText.innerHTML =
          '<i class="fas fa-check-circle text-green-500 mr-1"></i> Aplikasi siap digunakan';
        if (refreshBtn) refreshBtn.disabled = false;
        break;

      case "error":
        statusElement.className =
          "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm";
        statusText.innerHTML =
          '<i class="fas fa-exclamation-triangle text-red-500 mr-1"></i> Gagal memuat aplikasi';
        if (refreshBtn) refreshBtn.disabled = true;
        break;

      default:
        statusElement.className =
          "mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm";
        statusText.innerHTML =
          '<i class="fas fa-circle text-gray-500 mr-1"></i> Status tidak diketahui';
    }

    statusElement.classList.remove("hidden");
  }

  async testBackendConnection() {
    try {
      console.log("🧪 Testing backend connection...");

      const testUrl = this.API_URL + "?action=test";
      const response = await fetch(testUrl, {
        method: "GET",
        mode: "cors",
        redirect: "follow",
      });

      console.log("📨 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Backend test result:", result);

        if (result.success) {
          Utils.showToast("✅ Sistem terhubung dengan backend!", "success");
        } else {
          this.showError("Backend error: " + result.error);
        }
      } else {
        this.showError(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Connection test failed:", error);
      this.showError("Tidak bisa terhubung ke server: " + error.message);
    }
  }

  initTicketForm() {
    const form = document.getElementById("ticketForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleCreateTicket(e));
    }
  }

  async handleCreateTicket(e) {
    e.preventDefault();

    const formData = {
      nama: document.getElementById("inputNamaPelanggan").value,
      id_pelanggan: document.getElementById("inputIdPelanggan").value,
      kategori: document.getElementById("selectKategori").value,
      keperluan: document.getElementById("selectKeperluan").value,
      region: document.getElementById("selectRegion").value,
    };

    // Validation
    if (!formData.nama || !formData.kategori || !formData.keperluan) {
      alert("Harap isi semua field yang wajib!");
      return;
    }

    Utils.showLoading();

    try {
      const result = await this.apiCall("create_ticket", formData);
      this.showTicketResult(result);

      if (result.success) {
        document.getElementById("ticketForm").reset();
        setTimeout(() => this.loadOutboundTickets(), 2000);
      }
    } catch (error) {
      this.showTicketResult({
        success: false,
        error: "Network error: " + error.message,
      });
    } finally {
      Utils.hideLoading();
    }
  }

  async loadOutboundTickets() {
    try {
      console.log("📋 Loading outbound tickets...");
      const tickets = await this.apiCall("get_pending_tickets");
      console.log("✅ Tickets loaded:", tickets);
      this.renderOutboundTickets(tickets);
    } catch (error) {
      console.error("❌ Failed to load tickets:", error);
      this.showError("Gagal memuat data tiket: " + error.message);
    }
  }

  renderOutboundTickets(tickets) {
    const container = document.getElementById("outboundTicketsList");
    if (!container) return;

    // Handle case where tickets is not an array
    if (!Array.isArray(tickets)) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-exclamation-triangle text-4xl mb-4 text-yellow-500"></i>
          <p>Data tiket tidak valid</p>
          <p class="text-sm mt-2">Response: ${JSON.stringify(tickets)}</p>
        </div>
      `;
      return;
    }

    if (tickets.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-4"></i>
          <p>Tidak ada tiket yang menunggu konfirmasi</p>
          <p class="text-sm mt-2">Semua tiket sudah ditangani 🎉</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tickets
      .map(
        (ticket) => `
      <div class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 text-lg">${this.escapeHtml(
              ticket["Nama Pelanggan"] || "N/A"
            )}</h4>
            <div class="flex items-center gap-4 mt-1">
              <span class="text-sm text-gray-600">
                <i class="fas fa-ticket-alt mr-1"></i>${this.escapeHtml(
                  ticket["Nomor Tiket"] || ticket["Nomor TIket"] || "N/A"
                )}
              </span>
              <span class="text-sm text-gray-600">
                <i class="fas fa-map-marker-alt mr-1"></i>${this.escapeHtml(
                  ticket["Region"] || "N/A"
                )}
              </span>
            </div>
          </div>
          <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
            ${this.escapeHtml(ticket["Kategori Gangguan"] || "N/A")}
          </span>
        </div>
        
        <p class="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
          <i class="fas fa-clipboard-list mr-2"></i>
          ${this.escapeHtml(ticket["Keperluan FU"] || "N/A")}
        </p>
        
        <div class="text-xs text-gray-500 mb-3">
          <i class="fas fa-clock mr-1"></i>
          Dibuat: ${this.formatDateTime(ticket["Tanggal & Waktu Input"])}
        </div>
        
        <div class="flex gap-2 flex-wrap">
          <button onclick="app.assignToMe('${this.escapeHtml(
            ticket["Nomor Tiket"] || ticket["Nomor TIket"] || ""
          )}')" 
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
            <i class="fas fa-user-check"></i>
            Ambil Tiket
          </button>
          <button onclick="app.generateMessageForTicket(
            '${this.escapeHtml(
              ticket["Nomor Tiket"] || ticket["Nomor TIket"] || ""
            )}', 
            '${this.escapeHtml(ticket["Nama Pelanggan"] || "")}', 
            '${this.escapeHtml(ticket["Kategori Gangguan"] || "")}', 
            '${this.escapeHtml(ticket["Keperluan FU"] || "")}'
          )" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
            <i class="fas fa-comment"></i>
            Generate Pesan
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  async assignToMe(ticketId) {
    if (!ticketId || ticketId === "N/A") {
      alert("Ticket ID tidak valid");
      return;
    }

    const picName = prompt(
      "Masukkan nama Anda (PIC Outbound):",
      this.currentUser
    );
    if (!picName) return;

    Utils.showLoading();

    try {
      const result = await this.apiCall("update_ticket", {
        ticket_id: ticketId,
        status: "IN PROGRESS",
        pic_fu: picName,
        tanggal_balasan: new Date().toISOString(),
      });

      if (result.success) {
        Utils.showToast("Tiket berhasil diassign ke " + picName, "success");
        this.loadOutboundTickets();
      } else {
        Utils.showToast("Gagal: " + (result.error || "Unknown error"), "error");
      }
    } catch (error) {
      Utils.showToast("Error: " + error.message, "error");
    } finally {
      Utils.hideLoading();
    }
  }

  generateMessageForTicket(ticketId, nama, kategori, keperluan) {
    if (!ticketId || ticketId === "N/A") {
      alert("Ticket ID tidak valid");
      return;
    }

    // Auto-fill the main form
    document.getElementById("inputNama").value = nama || "";
    document.getElementById("inputTiket").value = ticketId;
    document.getElementById("inputKategori").value = kategori || "";
    document.getElementById("inputKeperluan").value = keperluan || "";

    // Scroll ke form utama
    document.getElementById("inputSection").scrollIntoView({
      behavior: "smooth",
    });

    Utils.showToast("Data tiket telah diisi ke form", "success");
  }

  async apiCall(action, data = null) {
    const url = `${this.API_URL}?action=${action}`;

    console.log("🔗 Making API call:", { action, url, data });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      console.log("📨 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        redirected: response.redirected,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log("📝 Raw response text:", text);

      if (!text || text.trim() === "") {
        throw new Error("Empty response from server");
      }

      const result = JSON.parse(text);
      console.log("✅ Parsed result:", result);

      return result;
    } catch (error) {
      console.error("❌ API call failed:", {
        action,
        url,
        error: error.message,
      });

      throw new Error(`API call failed (${action}): ${error.message}`);
    }
  }

  showTicketResult(result) {
    const container = document.getElementById("ticketResult");
    if (!container) return;

    if (result && result.success) {
      container.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 slide-in">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <i class="fas fa-check text-white"></i>
            </div>
            <div>
              <h4 class="font-semibold text-green-800">Berhasil!</h4>
              <p class="text-green-700">${
                result.message || "Operation completed"
              }</p>
              ${
                result.ticket_id
                  ? `<p class="text-sm font-mono">ID: ${result.ticket_id}</p>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 slide-in">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-white"></i>
            </div>
            <div>
              <h4 class="font-semibold text-red-800">Error</h4>
              <p class="text-red-700">${
                result ? result.error : "Unknown error occurred"
              }</p>
            </div>
          </div>
        </div>
      `;
    }

    container.classList.remove("hidden");

    setTimeout(() => {
      container.classList.add("hidden");
    }, 5000);
  }

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString("id-ID") +
        " " +
        date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (e) {
      return dateString;
    }
  }

  showError(message) {
    Utils.showToast(message, "error");
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new EnhancedApp();
});

// Global functions
window.refreshOutboundTickets = () => {
  if (window.app) {
    window.app.loadOutboundTickets();
  }
};

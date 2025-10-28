/**
 * Main application entry point
 */

class MessageGeneratorApp {
  constructor() {
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    console.log("🚀 Message Generator App Initializing...");

    // Check environment
    this.checkEnvironment();

    // Initialize components
    this.initializeComponents();

    // Set up error handling
    this.setupErrorHandling();

    console.log("✅ Message Generator App Ready!");
  }

  /**
   * Check environment and dependencies
   */
  checkEnvironment() {
    let isFullyCompatible = true;
    try {
      const test = "storage_test";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
    } catch (e) {
      console.warn("LocalStorage not available - auto-save disabled");
      Utils.showToast(
        "Mode sementara: Progress tidak akan tersimpan setelah browser ditutup.",
        "warning",
        5000
      );
      isFullyCompatible = false;
    }
    return isFullyCompatible;
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    // Set up global error handler for unhandled promises
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      Utils.showToast("Terjadi kesalahan tak terduga", "error");
    });

    // Add beforeunload handler to save data
    window.addEventListener("beforeunload", () => {
      this.saveBeforeUnload();
    });

    // Initialize keyboard shortcuts help
    this.setupKeyboardShortcuts();

    // Initialize modal backdrop close
    this.setupModalBackdropClose();
  }

  /**
   * Set up global error handling
   */
  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);

      // Don't show toast for minor errors
      if (event.error.message.includes("ResizeObserver")) return;

      Utils.showToast("Terjadi kesalahan aplikasi", "error");
    });
  }

  /**
   * Save data before unload
   */
  saveBeforeUnload() {
    // Save current inputs
    const inputData = uiManager.getInputData();
    storageManager.set("saved_inputs", inputData);

    // Save progress
    uiManager.saveTodayProgress();
  }

  /**
   * Set up keyboard shortcuts help
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Show help on F1
      if (e.key === "F1") {
        e.preventDefault();
        this.showModal("shortcutsModal");
      }
    });
  }

  /**
   * Modal Management Functions - ✅ DIPINDAH KE DALAM CLASS
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = document.getElementById(modalId + "Content");

    if (modal && modalContent) {
      modal.classList.remove("hidden");

      // Trigger animation
      setTimeout(() => {
        modalContent.classList.remove("scale-95", "opacity-0");
        modalContent.classList.add("scale-100", "opacity-100");
      }, 10);

      // Add escape key listener
      this.addEscapeListener(modalId);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = document.getElementById(modalId + "Content");

    if (modal && modalContent) {
      // Trigger exit animation
      modalContent.classList.remove("scale-100", "opacity-100");
      modalContent.classList.add("scale-95", "opacity-0");

      // Wait for animation to complete then hide
      setTimeout(() => {
        modal.classList.add("hidden");
      }, 200);
    }
  }

  addEscapeListener(modalId) {
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        this.closeModal(modalId);
        document.removeEventListener("keydown", escapeHandler);
      }
    };

    document.addEventListener("keydown", escapeHandler);

    // Remove listener when modal closes
    setTimeout(() => {
      const checkModal = document.getElementById(modalId);
      if (checkModal.classList.contains("hidden")) {
        document.removeEventListener("keydown", escapeHandler);
      }
    }, 300);
  }

  setupModalBackdropClose() {
    document.addEventListener("click", (e) => {
      if (e.target.id === "shortcutsModal" || e.target.id === "aboutModal") {
        this.closeModal(e.target.id);
      }
    });
  }
}

// apps.js - Enhanced dengan fitur baru
class EnhancedApp {
  constructor() {
    this.API_URL =
      "https://script.google.com/macros/s/AKfycbyzcSTlhWoQylIoL013rttPjh3G3oE0saCGvM1dALRj/exec";
    this.currentUser = "Outbound_User";
    this.sentMessages = new Map();
    this.todayKey = new Date().toISOString().split("T")[0];
    this.currentMessages = [];

    this.init();
  }

  init() {
    console.log("🚀 App Initializing...");
    this.initEnhancedFeatures();
  }

  initEnhancedFeatures() {
    console.log("🔧 Initializing enhanced features...");

    // Initialize components
    this.initTicketForm();
    this.loadOutboundTickets();

    // Auto-refresh
    setInterval(() => this.loadOutboundTickets(), 30000);

    console.log("✅ Enhanced features initialized");
  }

  /**
   * L1 - Create New Ticket
   */
  async handleTicketCreation(e) {
    e.preventDefault();

    const formData = {
      nama: document.getElementById("inputNamaPelanggan").value,
      id_pelanggan: document.getElementById("inputIdPelanggan").value,
      kategori: document.getElementById("selectKategori").value,
      keperluan: document.getElementById("selectKeperluan").value,
    };

    try {
      const response = await this.apiCall("create_ticket", formData);
      this.showTicketResult(response);

      if (response.success) {
        document.getElementById("ticketForm").reset();
        this.loadOutboundTickets(); // Refresh dashboard
      }
    } catch (error) {
      this.showTicketResult({ success: false, error: error.toString() });
    }
  }

  /**
   * OUTBOUND - Load Pending Tickets
   */
  async loadOutboundTickets() {
    try {
      console.log("📋 Loading outbound tickets...");
      const tickets = await this.apiCall("get_pending_tickets");
      console.log("✅ Tickets loaded:", tickets.length, "tickets");
      this.renderOutboundTickets(tickets);
    } catch (error) {
      console.error("❌ Failed to load tickets:", error);
      this.showError("Gagal memuat data tiket: " + error.message);
    }
  }

  /**
   * OUTBOUND - Render Tickets List
   */
  renderOutboundTickets(tickets) {
    const container = document.getElementById("outboundTicketsList");
    if (!container) {
      console.error("❌ Container outboundTicketsList not found");
      return;
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-4"></i>
          <p>Tidak ada tiket yang menunggu konfirmasi</p>
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
          <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            ${this.escapeHtml(ticket["Kategori Gangguan"] || "N/A")}
          </span>
        </div>
        
        <p class="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
          <i class="fas fa-clipboard-list mr-2"></i>
          ${this.escapeHtml(ticket["Keperluan FU"] || "N/A")}
        </p>
        
        <div class="flex gap-2">
          <button onclick="app.assignToMe('${this.escapeHtml(
            ticket["Nomor Tiket"] || ticket["Nomor TIket"] || ""
          )}')" 
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
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
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
            <i class="fas fa-comment"></i>
            Generate Pesan
          </button>
        </div>
      </div>
    `
      )
      .join("");
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

  async assignToMe(ticketId) {
    if (!ticketId) {
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
    if (!ticketId) {
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

  /**
   * OUTBOUND - Assign Ticket to Self
   */
  async assignTicket(ticketId) {
    const picName = prompt("Masukkan nama PIC Outbound:");
    if (!picName) return;

    try {
      const result = await this.apiCall("update_ticket", {
        ticket_id: ticketId,
        status: "IN PROGRESS",
        pic_fu: picName,
        tanggal_balasan: new Date().toISOString(),
      });

      if (result.success) {
        Utils.showToast("Tiket berhasil diassign", "success");
        this.loadOutboundTickets();
      }
    } catch (error) {
      Utils.showToast("Gagal assign tiket", "error");
    }
  }

  /**
   * GENERIC API CALL - FIXED CORS ISSUE
   */
  async apiCall(action, data = null) {
    const url = `${this.API_URL}?action=${action}`;

    console.log("🔗 API Call:", url);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Gunakan GET untuk data sederhana, POST untuk data kompleks
      const method = data ? "POST" : "GET";

      xhr.open(method, url, true);

      if (data) {
        xhr.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log("📨 XHR Response:", {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
          });

          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(new Error("Invalid JSON response: " + e.message));
            }
          } else {
            reject(new Error(`XHR Error ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = function () {
        reject(new Error("XHR Network error"));
      };

      xhr.ontimeout = function () {
        reject(new Error("XHR Timeout"));
      };

      xhr.timeout = 15000; // 15 detik timeout

      if (data) {
        // Format data sebagai form-urlencoded
        const formData = new URLSearchParams();
        for (const key in data) {
          formData.append(key, data[key]);
        }
        xhr.send(formData.toString());
      } else {
        xhr.send();
      }
    });
  }

  // ✅ ALTERNATIVE METHOD untuk handle CORS
  async alternativeApiCall(action, data = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.API_URL}?action=${action}`;

      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (e) {
            reject(new Error("Invalid JSON response"));
          }
        } else {
          reject(new Error(`XHR Error: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error("XHR Network error"));
      };

      xhr.send(data ? JSON.stringify(data) : null);
    });
  }

  showTicketResult(result) {
    const container = document.getElementById("ticketResult");
    if (!container) return;

    if (result && result.success) {
      container.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
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
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
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
    setTimeout(() => container.classList.add("hidden"), 5000);
  }

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    Utils.showToast(message, "error");
  }
}

// ✅ GLOBAL FUNCTIONS UNTUK HTML ONCLICK
window.refreshOutboundTickets = () => {
  if (window.app && window.app.loadOutboundTickets) {
    window.app.loadOutboundTickets();
  } else {
    console.error("app not initialized");
  }
};

// ✅ INITIALIZE APP
document.addEventListener("DOMContentLoaded", () => {
  window.app = new EnhancedApp();
});

// ✅ Global functions for HTML onclick handlers
window.showKeyboardShortcuts = () => {
  if (window.app) {
    window.app.showModal("shortcutsModal");
  }
};

window.showAbout = () => {
  if (window.app) {
    window.app.showModal("aboutModal");
  }
};

window.closeModal = (modalId) => {
  if (window.app) {
    window.app.closeModal(modalId);
  }
};

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new MessageGeneratorApp();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = MessageGeneratorApp;
}

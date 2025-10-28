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
      "https://script.google.com/macros/s/AKfycby9hs3fUrd0czk4Ga1S9x_GD7LOZ5Pth1CZxaJux4DwZe_Vcy4C3G6m2_bSz_kSJmprhg/exec";
    this.currentUser = "Outbound_User";
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;

    console.log("🔄 EnhancedApp constructor called");

    // Delay initialization untuk pastikan DOM ready
    setTimeout(() => {
      this.init();
    }, 100);
  }

  async init() {
    try {
      console.log("🚀 Enhanced App Initializing...");

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

      console.log("✅ Enhanced App Fully Initialized");
      Utils.showToast("Aplikasi siap digunakan!", "success");
    } catch (error) {
      console.error("❌ App initialization failed:", error);
      this.showError("Gagal memulai aplikasi: " + error.message);
    }
  }

  checkRequiredElements() {
    const requiredElements = [
      "outboundTicketsList",
      "ticketForm",
      "inputSection",
    ];

    const missingElements = requiredElements.filter(
      (id) => !document.getElementById(id)
    );

    if (missingElements.length > 0) {
      console.warn("Missing elements:", missingElements);
      return false;
    }

    return true;
  }

  jsonpCall(action, data = null) {
    return new Promise((resolve, reject) => {
      this.jsonpCallbackId++;
      const callbackName = `jsonpCallback_${this.jsonpCallbackId}`;

      // Create script element
      const script = document.createElement("script");

      // Build URL with callback
      let url = `${this.API_URL}?action=${action}&callback=${callbackName}`;

      // Add data as parameters
      if (data) {
        for (const key in data) {
          if (data[key] !== null && data[key] !== undefined) {
            url += `&${key}=${encodeURIComponent(data[key])}`;
          }
        }
      }

      script.src = url;

      // Define callback function
      window[callbackName] = (response) => {
        // Clean up
        document.head.removeChild(script);
        delete window[callbackName];

        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || "Unknown error"));
        }
      };

      // Error handling
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error("JSONP request failed"));
      };

      // Add to document
      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (window[callbackName]) {
          document.head.removeChild(script);
          delete window[callbackName];
          reject(new Error("JSONP timeout"));
        }
      }, 10000);
    });
  }

  initEnhancedFeatures() {
    console.log("🔧 Initializing enhanced features...");

    try {
      // Initialize components dengan error handling
      this.initTicketForm();

      // Load tickets dengan delay
      setTimeout(() => {
        this.loadOutboundTickets();
      }, 1000);

      // Auto-refresh setiap 30 detik
      setInterval(() => {
        if (this.initialized) {
          this.loadOutboundTickets();
        }
      }, 30000);

      console.log("✅ Enhanced features initialized");
    } catch (error) {
      console.error("❌ Enhanced features init failed:", error);
      throw error;
    }
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
    // Jika app belum initialized, skip dulu
    if (!this.initialized) {
      console.log("⏳ App not ready, skipping ticket load");
      return;
    }

    try {
      console.log("📋 Loading outbound tickets...");

      // Show loading state
      const container = document.getElementById("outboundTicketsList");
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p class="text-gray-500 mt-2">Memuat tiket...</p>
          </div>
        `;
      }

      const tickets = await this.apiCall("get_pending_tickets");
      console.log("✅ Tickets loaded:", tickets);
      this.renderOutboundTickets(tickets);
    } catch (error) {
      console.error("❌ Failed to load tickets:", error);
      this.showError("Gagal memuat data tiket: " + error.message);

      // Show error state
      const container = document.getElementById("outboundTicketsList");
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p>Gagal memuat tiket</p>
            <button 
              onclick="window.refreshOutboundTickets()" 
              class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              <i class="fas fa-refresh mr-1"></i>Coba Lagi
            </button>
          </div>
        `;
      }
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
      // Remove existing listener dan tambahkan yang baru
      form.removeEventListener("submit", this.handleCreateTicket);
      form.addEventListener("submit", (e) => this.handleCreateTicket(e));

      // Add real-time validation
      this.initFormValidation();
    }
  }

  initFormValidation() {
    const fields = [
      { id: "inputNamaPelanggan", errorId: "errorNamaPelanggan" },
      { id: "inputTiketPelanggan", errorId: "errorTiketPelanggan" },
      { id: "selectRegion", errorId: "errorRegion" },
      { id: "selectKategori", errorId: "errorKategori" },
      { id: "selectKeperluan", errorId: "errorKeperluan" },
    ];

    fields.forEach((field) => {
      const element = document.getElementById(field.id);
      const errorElement = document.getElementById(field.errorId);

      if (element && errorElement) {
        // Real-time validation on input change
        element.addEventListener("input", () => {
          this.validateField(element, errorElement);
        });

        element.addEventListener("blur", () => {
          this.validateField(element, errorElement);
        });

        // For select elements, validate on change
        if (element.tagName === "SELECT") {
          element.addEventListener("change", () => {
            this.validateField(element, errorElement);
          });
        }
      }
    });
  }

  validateField(field, errorElement) {
    const value = field.value.trim();

    if (field.hasAttribute("required") && !value) {
      this.showError(
        field,
        errorElement,
        `${field.previousElementSibling?.textContent
          ?.replace("*", "")
          .trim()} wajib diisi`
      );
      return false;
    }

    // Special validation for ticket number
    if (field.id === "inputTiketPelanggan" && value) {
      if (!Utils.isValidTicket(value)) {
        this.showError(
          field,
          errorElement,
          "Format tiket tidak valid. Contoh: RYZN1001"
        );
        return false;
      }
    }

    // If validation passed
    this.hideError(field, errorElement);
    return true;
  }

  async handleCreateTicket(e) {
    e.preventDefault();

    console.log("🎫 Creating new ticket...");

    // Validate form first
    if (!this.validateForm()) {
      Utils.showToast("Harap perbaiki error pada form sebelum submit", "error");
      return;
    }

    const formData = {
      nama: document.getElementById("inputNamaPelanggan").value.trim(),
      tiket: document
        .getElementById("inputTiketPelanggan")
        .value.trim()
        .toUpperCase(),
      id_pelanggan:
        document.getElementById("inputIdPelanggan").value.trim() || "",
      kategori: document.getElementById("selectKategori").value,
      keperluan: document.getElementById("selectKeperluan").value,
      region: document.getElementById("selectRegion").value,
    };

    console.log("📦 Form data:", formData);

    // Additional validation
    if (!Utils.isValidTicket(formData.tiket)) {
      Utils.showToast("Format nomor tiket tidak valid", "error");
      return;
    }

    Utils.showLoading();

    try {
      const result = await this.apiCall("create_ticket", formData);
      this.showTicketResult(result);

      if (result.success) {
        // Reset form setelah sukses
        document.getElementById("ticketForm").reset();

        // Reset visual state
        this.resetFormValidation();

        // Refresh ticket list
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

  resetFormValidation() {
    const fields = [
      "inputNamaPelanggan",
      "inputTiketPelanggan",
      "selectRegion",
      "selectKategori",
      "selectKeperluan",
      "inputIdPelanggan",
    ];

    fields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.classList.remove("border-red-500", "bg-red-50");
        field.classList.add("border-gray-300");
      }
    });

    // Hide all error messages
    const errorElements = document.querySelectorAll('[id^="error"]');
    errorElements.forEach((element) => {
      element.classList.add("hidden");
    });
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

  async loadOutboundTickets() {
    // Jika app belum initialized, skip dulu
    if (!this.initialized) {
      console.log("⏳ App not ready, skipping ticket load");
      return;
    }

    try {
      console.log("📋 Loading outbound tickets...");

      // Show loading state
      const container = document.getElementById("outboundTicketsList");
      if (container) {
        container.innerHTML = `
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p class="text-gray-500 mt-2">Memuat tiket...</p>
        </div>
      `;
      }

      const result = await this.apiCall("get_pending_tickets");
      console.log("✅ API Response:", result);

      // Handle different response structures
      let tickets = [];

      if (result && result.success) {
        if (Array.isArray(result.data)) {
          // Structure: {success: true, data: [...]}
          tickets = result.data;
        } else if (Array.isArray(result)) {
          // Structure: langsung array
          tickets = result;
        } else {
          console.warn("⚠️ Unexpected response structure:", result);
        }
      } else {
        console.warn("⚠️ API returned unsuccessful:", result);
      }

      console.log("🎯 Tickets to render:", tickets);
      this.renderOutboundTickets(tickets);
    } catch (error) {
      console.error("❌ Failed to load tickets:", error);
      this.showError("Gagal memuat data tiket: " + error.message);

      // Show error state
      const container = document.getElementById("outboundTicketsList");
      if (container) {
        container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Gagal memuat tiket</p>
          <p class="text-sm mt-2">${error.message}</p>
          <button 
            onclick="window.refreshOutboundTickets()" 
            class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            <i class="fas fa-refresh mr-1"></i>Coba Lagi
          </button>
        </div>
      `;
      }
    } finally {
      // Reset refresh button state
      this.resetRefreshButton();
    }
  }

  resetRefreshButton() {
    const btn = document.getElementById("refreshTicketsBtn");
    const refreshText = document.getElementById("refreshText");
    const refreshSpinner = document.getElementById("refreshSpinner");

    if (btn && refreshText && refreshSpinner) {
      setTimeout(() => {
        btn.disabled = false;
        refreshText.classList.remove("hidden");
        refreshSpinner.classList.add("hidden");
      }, 500);
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

  showError(field, errorElement, message) {
    field.classList.add("border-red-500", "bg-red-50");
    field.classList.remove("border-gray-300");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }

  hideError(field, errorElement) {
    field.classList.remove("border-red-500", "bg-red-50");
    field.classList.add("border-gray-300");
    errorElement.classList.add("hidden");
  }

  validateForm() {
    const fields = [
      { id: "inputNamaPelanggan", errorId: "errorNamaPelanggan" },
      { id: "inputTiketPelanggan", errorId: "errorTiketPelanggan" },
      { id: "selectRegion", errorId: "errorRegion" },
      { id: "selectKategori", errorId: "errorKategori" },
      { id: "selectKeperluan", errorId: "errorKeperluan" },
    ];

    let isValid = true;

    fields.forEach((field) => {
      const element = document.getElementById(field.id);
      const errorElement = document.getElementById(field.errorId);

      if (element && errorElement) {
        if (!this.validateField(element, errorElement)) {
          isValid = false;
        }
      }
    });

    return isValid;
  }
}

// ✅ GLOBAL FUNCTIONS UNTUK HTML ONCLICK
window.refreshOutboundTickets = () => {
  try {
    if (window.app && typeof window.app.loadOutboundTickets === "function") {
      window.app.loadOutboundTickets();
      Utils.showToast("Memuat ulang tiket...", "info");
    } else {
      console.warn("App belum siap, mencoba inisialisasi ulang...");
      // Coba init ulang app
      if (typeof EnhancedApp !== "undefined") {
        window.app = new EnhancedApp();
        setTimeout(() => {
          if (window.app && window.app.loadOutboundTickets) {
            window.app.loadOutboundTickets();
          } else {
            Utils.showToast("Silakan refresh halaman", "error");
          }
        }, 1000);
      } else {
        Utils.showToast(
          "Aplikasi sedang loading, tunggu sebentar...",
          "warning"
        );
      }
    }
  } catch (error) {
    console.error("Error refreshOutboundTickets:", error);
    Utils.showToast("Error: " + error.message, "error");
  }
};

// ✅ INITIALIZE APP
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM Ready - Initializing Enhanced App...");

  try {
    // Tunggu sedikit untuk memastikan semua script loaded
    setTimeout(() => {
      if (typeof EnhancedApp !== "undefined") {
        window.app = new EnhancedApp();
        console.log("✅ Enhanced App initialized successfully");

        // Tandai bahwa app sudah ready
        document.body.setAttribute("data-app-ready", "true");

        // Load tickets setelah init
        setTimeout(() => {
          if (window.app && window.app.loadOutboundTickets) {
            window.app.loadOutboundTickets();
          }
        }, 2000);
      } else {
        console.error("❌ EnhancedApp class not found");
        Utils.showToast("Error: Aplikasi gagal dimuat", "error");
      }
    }, 100);
  } catch (error) {
    console.error("❌ App initialization failed:", error);
    Utils.showToast("Gagal memuat aplikasi: " + error.message, "error");
  }
});

window.checkAppStatus = () => {
  const status = {
    appDefined: typeof window.app !== "undefined",
    appReady:
      window.app && typeof window.app.loadOutboundTickets === "function",
    EnhancedAppDefined: typeof EnhancedApp !== "undefined",
    domReady: document.readyState === "complete",
  };

  console.log("🔍 App Status:", status);
  return status;
};

// ✅ Global functions for HTML onclick handlers
window.showKeyboardShortcuts = () => {
  try {
    if (window.app && window.app.showModal) {
      window.app.showModal("shortcutsModal");
    } else {
      // Fallback langsung ke modal
      const modal = document.getElementById("shortcutsModal");
      if (modal) {
        modal.classList.remove("hidden");
        Utils.showToast("Buka keyboard shortcuts", "info");
      }
    }
  } catch (error) {
    console.error("Error showing shortcuts:", error);
  }
};

window.showAbout = () => {
  try {
    if (window.app && window.app.showModal) {
      window.app.showModal("aboutModal");
    } else {
      // Fallback langsung ke modal
      const modal = document.getElementById("aboutModal");
      if (modal) {
        modal.classList.remove("hidden");
        Utils.showToast("Tentang aplikasi", "info");
      }
    }
  } catch (error) {
    console.error("Error showing about:", error);
  }
};

window.closeModal = (modalId) => {
  try {
    if (window.app && window.app.closeModal) {
      window.app.closeModal(modalId);
    } else {
      // Fallback langsung tutup modal
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("Error closing modal:", error);
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

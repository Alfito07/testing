/**
 * UI Management and DOM manipulation
 */

class UIManager {
  constructor() {
    this.currentMessages = [];
    this.sentMessages = new Map();
    this.todayKey = new Date().toISOString().split("T")[0];
    this.selectedTemplate = "standard";

    this.initializeEventListeners();
    this.renderStaticComponents();
  }

  /**
   * Initialize all event listeners
   */
  initializeEventListeners() {
    document.addEventListener("input", (e) => {
      if (
        e.target.matches(
          "#inputNama, #inputTiket, #inputKategori, #inputKeperluan"
        )
      ) {
        Utils.debounce(() => {
          this.updateFieldCounts();
          storageManager.set("saved_inputs", this.getInputData());

          // ✅ CHECK DUPLICATES SETIAP KALI INPUT BERUBAH
          if (e.target.id === "inputTiket") {
            this.checkDuplicateTickets();
          }
        }, 300)();
      }
    });

    // Keyboard shortcuts (tetap sama)
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            this.generateMessages();
            break;
          case "p":
            e.preventDefault();
            this.previewAutoDetection();
            break;
          case "c":
            e.preventDefault();
            this.copyAllMessages();
            break;
          case "Delete":
            e.preventDefault();
            this.clearAllInputs();
            break;
        }
      }
    });
  }

  /**
   * Render static UI components
   */
  renderStaticComponents() {
    this.renderInputSection();
    this.renderCustomFields();
    this.renderTemplateSection();
    this.renderActionButtons();
    this.loadSavedData();
  }

  /**
   * Render input section
   */
  renderInputSection() {
    const inputSection = document.getElementById("inputSection");
    if (!inputSection) return;

    const inputFields = [
      {
        id: "inputNama",
        icon: "fa-user",
        iconColor: "text-blue-500",
        label: "Nama Pelanggan",
        placeholder: "LIONEL MESSI\nCRISTIANO RONALDO\nKYLIAN MBAPPE",
        gradient: "from-blue-500 to-cyan-600",
      },
      {
        id: "inputTiket",
        icon: "fa-ticket-alt",
        iconColor: "text-green-500",
        label: "Nomor Tiket",
        placeholder: "RYZN1001\nRYZN1002\nRYZN1003",
        gradient: "from-green-500 to-emerald-600",
      },
      {
        id: "inputKategori",
        icon: "fa-wrench",
        iconColor: "text-orange-500",
        label: "Kategori Gangguan",
        placeholder: "LAIN-LAIN\nINTERNET SLOW\nLAIN-LAIN",
        gradient: "from-orange-500 to-red-600",
      },
      {
        id: "inputKeperluan",
        icon: "fa-clipboard-list",
        iconColor: "text-purple-500",
        label: "Keperluan FU",
        placeholder:
          "KONFIRMASI PERGANTIAN PASSWORD\nKONFIRMASI KENDALA USER\nKONFIRMASI PERGANTIAN SSID & PASSWORD",
        gradient: "from-purple-500 to-pink-600",
      },
    ];

    inputSection.innerHTML = inputFields
      .map(
        (field) => `
        <div class="card-modern">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r ${
              field.gradient
            } rounded-2xl flex items-center justify-center">
              <i class="fas ${field.icon} text-white text-lg"></i>
            </div>
            <div>
              <label class="font-bold text-gray-800 text-lg block">${
                field.label
              }</label>
              <div class="text-sm text-gray-500">Masukkan data per baris</div>
            </div>
          </div>
          
          <div class="relative">
            <textarea
              id="${field.id}"
              rows="6"
              class="input-modern w-full custom-scrollbar focus-ring"
              placeholder="${field.placeholder}"
            ></textarea>
          </div>
          
          <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <span id="count${field.id.replace("input", "")}" 
                  class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              0 data
            </span>
            <button
              onclick="uiManager.clearField('${field.id}')"
              class="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded-lg"
            >
              <i class="fas fa-trash"></i>
              Hapus
            </button>
          </div>
        </div>
      `
      )
      .join("");
  }

  /**
   * Render custom fields section
   */
  renderCustomFields() {
    const customSection = document.getElementById("customFieldsSection");
    if (!customSection) return;

    customSection.innerHTML = `
            <h3 class="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <i class="fas fa-edit"></i> Informasi Tambahan (Untuk Template Khusus)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700">SSID/Username</label>
                    <input
                        type="text"
                        id="customSSID"
                        class="w-full border rounded-lg p-2 text-sm focus-ring"
                        placeholder="Iconnet_2.4GHz"
                        value="Iconnet_2.4GHz"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="text"
                        id="customPassword"
                        class="w-full border rounded-lg p-2 text-sm focus-ring"
                        placeholder="iconnet1234"
                        value="iconnet1234"
                    />
                </div>
                <div>
            <label class="block text-sm font-medium text-gray-700">
                Inisial atau nama anda 
                <span class="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <input
                type="text"
                id="customASP"
                class="w-full border rounded-lg p-2 text-sm focus-ring input-modern"
                placeholder="-Alias atau nama Anda"
                maxlength="20"
            />
        </div>
            </div>
            <div class="text-xs text-yellow-600">
                <i class="fas fa-info-circle"></i> Informasi ini akan digunakan untuk
                template WiFi Default, Ganti SSID/Password, dan Iconplay
            </div>
        `;
  }

  /**
   * Render template selection section
   */
  renderTemplateSection() {
    const templateSection = document.getElementById("templateSection");
    if (!templateSection) return;

    templateSection.innerHTML = `
        <div class="mb-3">
            <label class="font-semibold text-blue-700 flex items-center gap-2">
                <i class="fas fa-robot"></i>
                Auto Template Detection - SYSTEM ONLY
            </label>
            <p class="text-sm text-gray-600 mt-1">
                Template dipilih <strong>otomatis</strong> oleh sistem berdasarkan Kategori dan Keperluan FU
            </p>
        </div>
        <div class="flex gap-2 flex-wrap" id="templateButtons">
            ${this.getTemplateButtonsHTML()}
        </div>
    `;
  }

  /**
   * Get template buttons HTML - FIXED DYNAMIC CLASS ISSUE
   */
  getTemplateButtonsHTML() {
    const templates = [
      {
        id: "standard",
        icon: "fa-broadcast-tower",
        label: "Standard",
        description: "Konfirmasi gangguan umum",
      },
      {
        id: "wifi_default",
        icon: "fa-wifi",
        label: "WiFi Default",
        description: "Reset/default WiFi",
      },
      {
        id: "ganti_ssid_password",
        icon: "fa-exchange-alt",
        label: "Ganti SSID+Password",
        description: "Perubahan SSID & password",
      },
      {
        id: "ganti_password",
        icon: "fa-key",
        label: "Ganti Password",
        description: "Perubahan password saja",
      },
      {
        id: "iconplay",
        icon: "fa-tv",
        label: "Iconplay",
        description: "Gangguan streaming/TV",
      },
    ];

    return templates
      .map(
        (template) => `
        <div class="bg-blue-50 border border-blue-200 px-3 py-2 rounded text-sm">
            <div class="flex items-center gap-2 text-blue-800">
                <i class="fas ${template.icon}"></i> 
                <span class="font-medium">${template.label}</span>
            </div>
            <div class="text-xs text-blue-600 mt-1">${template.description}</div>
        </div>
    `
      )
      .join("");
  }

  /**
   * Render action buttons
   */
  renderActionButtons() {
    const actionButtons = document.getElementById("actionButtons");
    if (!actionButtons) return;

    actionButtons.innerHTML = `
    <button
      onclick="uiManager.generateMessages()"
      class="btn-primary flex items-center justify-center gap-3 text-lg"
      id="generateBtn"
    >
      <i class="fas fa-play-circle"></i>
      Generate Pesan
      <kbd class="text-xs bg-white/20 px-2 py-1 rounded">Ctrl+Enter</kbd>
    </button>
    
    <button
      onclick="uiManager.previewAutoDetection()"
      class="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg"
    >
      <i class="fas fa-search"></i>
      Preview Detection
      <kbd class="text-xs bg-white/20 px-2 py-1 rounded">Ctrl+P</kbd>
    </button>
    
    <button
      onclick="uiManager.copyAllMessages()"
      class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg"
    >
      <i class="fas fa-copy"></i>
      Copy Semua
      <kbd class="text-xs bg-white/20 px-2 py-1 rounded">Ctrl+C</kbd>
    </button>
    
    <button
      onclick="uiManager.clearAllInputs()"
      class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg"
    >
      <i class="fas fa-trash"></i>
      Hapus Semua
      <kbd class="text-xs bg-white/20 px-2 py-1 rounded">Ctrl+Del</kbd>
    </button>
  `;
  }

  /**
   * Update field counts
   */
  updateFieldCounts() {
    const fields = [
      { input: "inputNama", count: "countNama" },
      { input: "inputTiket", count: "countTiket" },
      { input: "inputKategori", count: "countKategori" },
      { input: "inputKeperluan", count: "countKeperluan" },
    ];

    fields.forEach(({ input, count }) => {
      const element = document.getElementById(input);
      const countElement = document.getElementById(count);
      if (element && countElement) {
        const count = element.value
          .trim()
          .split("\n")
          .filter((x) => x).length;
        countElement.textContent = `${count} data`;
      }
    });
  }

  /**
   * Get input data
   */
  getInputData() {
    return {
      nama: document.getElementById("inputNama")?.value || "",
      tiket: document.getElementById("inputTiket")?.value || "",
      kategori: document.getElementById("inputKategori")?.value || "",
      keperluan: document.getElementById("inputKeperluan")?.value || "",
      ssid: document.getElementById("customSSID")?.value || "Iconnet_2.4GHz",
      password:
        document.getElementById("customPassword")?.value || "iconnet1234",
      asp: document.getElementById("customASP")?.value || "",
    };
  }

  /**
   * Set input data
   */
  setInputData(data) {
    if (data.nama) document.getElementById("inputNama").value = data.nama;
    if (data.tiket) document.getElementById("inputTiket").value = data.tiket;
    if (data.kategori)
      document.getElementById("inputKategori").value = data.kategori;
    if (data.keperluan)
      document.getElementById("inputKeperluan").value = data.keperluan;
    if (data.ssid) document.getElementById("customSSID").value = data.ssid;
    if (data.password)
      document.getElementById("customPassword").value = data.password;
    if (data.asp) document.getElementById("customASP").value = data.asp; // ✅ Simpan ASP

    this.updateFieldCounts();
  }

  /**
   * Check for duplicate tickets and show warnings
   */
  checkDuplicateTickets() {
    const data = this.getInputData();
    const tiketList = data.tiket
      .trim()
      .split("\n")
      .filter((x) => x);

    const duplicates = this.findDuplicates(tiketList);

    if (duplicates.length > 0) {
      this.showDuplicateWarning(duplicates);
      return true;
    }

    this.hideDuplicateWarning();
    return false;
  }

  /**
   * Find duplicate tickets in the list
   */
  findDuplicates(tiketList) {
    const seen = new Map();
    const duplicates = [];

    tiketList.forEach((tiket, index) => {
      const cleanTicket = tiket.trim().toUpperCase();
      if (seen.has(cleanTicket)) {
        duplicates.push({
          ticket: cleanTicket,
          firstIndex: seen.get(cleanTicket) + 1,
          duplicateIndex: index + 1,
        });
      } else {
        seen.set(cleanTicket, index);
      }
    });

    return duplicates;
  }

  /**
   * Show duplicate ticket warning
   */
  showDuplicateWarning(duplicates) {
    // Remove existing warning
    this.hideDuplicateWarning();

    const warningHTML = `
        <div id="duplicateWarning" class="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg slide-in">
            <div class="flex items-center gap-2 mb-2">
                <i class="fas fa-exclamation-triangle text-red-500"></i>
                <h4 class="font-semibold text-red-800">Peringatan: Tiket Duplikat Ditemukan</h4>
            </div>
            <p class="text-sm text-red-700 mb-2">
                Beberapa nomor tiket muncul lebih dari satu kali:
            </p>
            <ul class="text-sm text-red-600 space-y-1">
                ${duplicates
                  .map(
                    (dup) =>
                      `<li>• Tiket <strong>${dup.ticket}</strong> duplikat di baris ${dup.firstIndex} dan ${dup.duplicateIndex}</li>`
                  )
                  .join("")}
            </ul>
            <div class="mt-2 text-xs text-red-500">
                <i class="fas fa-lightbulb"></i>
                Pastikan setiap tiket unik untuk menghindari konflik
            </div>
        </div>
    `;

    const inputSection = document.getElementById("inputSection");
    if (inputSection) {
      inputSection.insertAdjacentHTML("afterend", warningHTML);
    }
  }

  /**
   * Hide duplicate ticket warning
   */
  hideDuplicateWarning() {
    const existingWarning = document.getElementById("duplicateWarning");
    if (existingWarning) {
      existingWarning.remove();
    }
  }

  /**
   * Load saved data
   */
  loadSavedData() {
    const savedInputs = storageManager.get("saved_inputs");
    if (savedInputs) {
      this.setInputData(savedInputs);
    }

    // Load progress
    this.loadTodayProgress();

    // ✅ PASTIKAN COUNTER DIUPDATE SETELAH LOAD DATA
    setTimeout(() => {
      this.updateFieldCounts();
    }, 300);
  }

  /**
   * Clear specific field
   */
  clearField(fieldId) {
    if (confirm("Apakah Anda yakin ingin menghapus data di kolom ini?")) {
      const element = document.getElementById(fieldId);
      if (element) {
        element.value = "";
        this.updateFieldCounts();
        storageManager.set("saved_inputs", this.getInputData());

        // ✅ HAPUS WARNING JIKA YANG DIHAPUS ADALAH TIKET
        if (fieldId === "inputTiket") {
          this.hideDuplicateWarning();
        }
      }
    }
  }

  /**
   * Clear all inputs
   */
  clearAllInputs() {
    if (confirm("Apakah Anda yakin ingin menghapus semua data input?")) {
      const inputs = [
        "inputNama",
        "inputTiket",
        "inputKategori",
        "inputKeperluan",
      ];
      inputs.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.value = "";
      });
      this.updateFieldCounts();
      storageManager.set("saved_inputs", this.getInputData());

      // ✅ HAPUS JUGA WARNING DUPLIKAT
      this.hideDuplicateWarning();

      Utils.showToast("Semua data input telah dihapus", "success");
    }
  }

  /**
   * Validate inputs before processing
   */
  validateInputs() {
    const data = this.getInputData();
    const counts = {
      nama: data.nama
        .trim()
        .split("\n")
        .filter((x) => x).length,
      tiket: data.tiket
        .trim()
        .split("\n")
        .filter((x) => x).length,
      kategori: data.kategori
        .trim()
        .split("\n")
        .filter((x) => x).length,
      keperluan: data.keperluan
        .trim()
        .split("\n")
        .filter((x) => x).length,
    };

    // Check if any field is empty
    if (Object.values(counts).some((count) => count === 0)) {
      Utils.showToast("Harap isi semua kolom data!", "error");
      return false;
    }

    // Check if all fields have same number of entries
    const lengths = Object.values(counts);
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);

    if (maxLength !== minLength) {
      const errorDetail = `
Jumlah data tidak sama:
- Nama: ${counts.nama}
- Tiket: ${counts.tiket} 
- Kategori: ${counts.kategori}
- Keperluan: ${counts.keperluan}

Harap sesuaikan jumlah data di semua kolom.`;
      alert(errorDetail);
      return false;
    }

    // ✅ CHECK FOR DUPLICATE TICKETS BEFORE GENERATING
    if (this.checkDuplicateTickets()) {
      const proceed = confirm(
        "⚠️  Ada tiket duplikat yang terdeteksi!\n\n" +
          "Apakah Anda tetap ingin melanjutkan generate pesan?"
      );
      if (!proceed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate messages - UPDATED dengan ASP
   */
  async generateMessages() {
    if (!this.validateInputs()) return;

    try {
      Utils.showLoading();

      const data = this.getInputData();
      const salam = Utils.getTimeBasedGreeting();
      const ssid = data.ssid;
      const password = data.password;
      const asp = data.asp; // ✅ Ambil data ASP

      const namaList = data.nama
        .trim()
        .split("\n")
        .filter((x) => x);
      const tiketList = data.tiket
        .trim()
        .split("\n")
        .filter((x) => x);
      const kategoriList = data.kategori
        .trim()
        .split("\n")
        .filter((x) => x);
      const keperluanList = data.keperluan
        .trim()
        .split("\n")
        .filter((x) => x);

      // Prepare entries for batch detection
      const entries = namaList.map((nama, index) => ({
        nama: nama.trim(),
        tiket: tiketList[index]?.trim() || "[TIKET TIDAK ADA]",
        kategori: kategoriList[index]?.trim() || "[KATEGORI TIDAK ADA]",
        keperluan: keperluanList[index]?.trim() || "[KEPERLUAN TIDAK ADA]",
      }));

      // Batch detect templates
      const detectedEntries = detectionEngine.batchDetect(entries);

      // Generate messages
      this.currentMessages = detectedEntries.map((entry) => {
        const templateData = {
          salam,
          nama: entry.nama,
          tiket: entry.tiket,
          kategori: entry.kategori,
          ssid,
          password,
          asp: asp, // ✅ Sertakan ASP di template data
        };

        const message = templateManager.render(
          entry.templateType,
          templateData
        );

        return {
          ...entry,
          message,
          index: entry.index,
          asp: asp, // ✅ Simpan juga di message data untuk ditampilkan
        };
      });

      // Render messages
      this.renderMessages();

      // Show data quality analysis
      this.showDataQualityAnalysis(detectedEntries);

      Utils.showToast(
        `${this.currentMessages.length} pesan berhasil digenerate`,
        "success"
      );
    } catch (error) {
      console.error("Error generating messages:", error);
      Utils.showToast("Terjadi kesalahan saat generate pesan", "error");
    } finally {
      Utils.hideLoading();
    }
  }

  /**
   * Render messages to output section
   */
  renderMessages() {
    const output = document.getElementById("output");
    if (!output) return;

    if (this.currentMessages.length === 0) {
      output.innerHTML =
        '<p class="text-gray-500 text-center">Tidak ada pesan untuk ditampilkan</p>';
      return;
    }

    output.innerHTML = this.currentMessages
      .map((msg) => this.getMessageCardHTML(msg))
      .join("");

    // Update progress
    this.updateProgress();
    document.getElementById("progressSection").classList.remove("hidden");
  }

  /**
   * Get message card HTML - UPDATED dengan info ASP
   */
  getMessageCardHTML(msg) {
    const isSent = this.sentMessages.has(msg.tiket);
    const sentTime = isSent ? this.sentMessages.get(msg.tiket) : null;
    const timeDisplay = sentTime ? Utils.formatTime(sentTime) : "";

    // Tampilkan info ASP jika ada
    const aspInfo = msg.asp
      ? `
        <div class="mt-2 flex items-center gap-2 text-xs ${
          isSent ? "text-green-600" : "text-blue-600"
        }">
            <i class="fas fa-signature"></i>
            <span>Inisial: ${msg.asp}</span>
        </div>
    `
      : "";

    return `
        <div class="border rounded-lg p-4 shadow-sm transition-all duration-300 message-card ${
          isSent
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 border-2 shadow-md sent-highlight"
            : "bg-gray-50 border-gray-200"
        } relative slide-in">

            ${
              isSent
                ? `
                <div class="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <i class="fas fa-check-circle"></i> TERKIRIM
                </div>
                <div class="absolute top-0 left-0 w-2 h-full bg-green-500 rounded-l-lg"></div>
            `
                : ""
            }

            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-2">
                        ${
                          isSent
                            ? `
                            <i class="fas fa-check-circle text-green-500 text-lg"></i>
                        `
                            : `
                            <i class="fas fa-clock text-gray-400 text-lg"></i>
                        `
                        }
                        <span class="font-semibold ${
                          isSent ? "text-green-800" : "text-gray-800"
                        }">
                            #${msg.index + 1} - ${msg.nama}
                        </span>
                    </div>
                    <span class="text-sm ${
                      isSent ? "text-green-600" : "text-gray-600"
                    }">
                        (${msg.tiket})
                    </span>
                    <span class="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        ${msg.templateName}
                    </span>
                </div>
                <span class="text-sm ${
                  isSent
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                } px-2 py-1 rounded">
                    ${msg.kategori}
                </span>
            </div>

            <div class="text-xs ${
              isSent ? "text-green-600" : "text-gray-500"
            } mb-2 flex items-center gap-1">
                <i class="fas ${
                  isSent ? "fa-check-circle" : "fa-clipboard-list"
                }"></i>
                Keperluan: ${msg.keperluan}
            </div>

            <pre class="whitespace-pre-wrap ${
              isSent
                ? "bg-green-50 border-green-200 text-green-900"
                : "bg-white border-gray-200 text-gray-800"
            } p-3 rounded border text-sm transition-all duration-300 custom-scrollbar">${
      msg.message
    }</pre>

            ${aspInfo}

            <div class="flex gap-2 mt-3">
                <button 
                    onclick="uiManager.copyMessage(${msg.index})" 
                    class="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded flex items-center gap-2 copy-btn transition-all duration-200 flex-1 justify-center"
                    data-index="${msg.index}"
                >
                    <i class="fas fa-copy"></i> Copy Pesan
                </button>
                <button 
                    onclick="uiManager.markAsSent(${msg.index})" 
                    class="${
                      isSent
                        ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    } text-white text-sm px-3 py-2 rounded flex items-center gap-2 transition-all duration-200 flex-1 justify-center"
                >
                    <i class="fas ${
                      isSent ? "fa-undo" : "fa-paper-plane"
                    }"></i> 
                    ${isSent ? "Batalkan Pengiriman" : "Tandai Terkirim"}
                </button>
            </div>

            ${
              isSent && timeDisplay
                ? `
                <div class="mt-2 flex items-center gap-2 text-xs text-green-600">
                    <i class="fas fa-clock"></i>
                    <span>Ditandai terkirim: ${timeDisplay}</span>
                </div>
            `
                : ""
            }
        </div>
    `;
  }

  /**
   * Copy single message
   */
  async copyMessage(index) {
    if (!this.currentMessages[index]) {
      Utils.showToast("Pesan tidak ditemukan", "error");
      return;
    }

    try {
      const success = await Utils.copyToClipboard(
        this.currentMessages[index].message
      );

      if (success) {
        const button = document.querySelector(`button[data-index="${index}"]`);
        if (button) {
          const originalHTML = button.innerHTML;
          button.innerHTML = '<i class="fas fa-check"></i> ✅ Tersalin';
          button.classList.remove("bg-green-600", "hover:bg-green-700");
          button.classList.add("bg-green-500");

          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove("bg-green-500");
            button.classList.add("bg-green-600", "hover:bg-green-700");
          }, 2000);
        }
        Utils.showToast("Pesan berhasil disalin", "success", 1500);
      } else {
        Utils.showToast("Gagal menyalin pesan", "error");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      Utils.showToast("Gagal menyalin pesan", "error");
    }
  }

  /**
   * Mark message as sent
   */
  markAsSent(index) {
    const messageData = this.currentMessages[index];
    const tiket = messageData.tiket;

    if (this.sentMessages.has(tiket)) {
      this.sentMessages.delete(tiket);
      Utils.showToast("Status pengiriman dibatalkan", "warning");
    } else {
      this.sentMessages.set(tiket, new Date().toISOString());
      Utils.showToast("Pesan ditandai sebagai terkirim", "success");
    }

    this.saveTodayProgress();
    this.updateProgress();
    this.renderMessages();
  }

  /**
   * Copy all messages
   */
  async copyAllMessages() {
    if (this.currentMessages.length === 0) {
      Utils.showToast("Tidak ada pesan yang bisa disalin", "warning");
      return;
    }

    const allMessages = this.currentMessages
      .map((msg, index) => {
        return `=== PESAN #${index + 1} ===\n${msg.message}\n\n`;
      })
      .join("");

    try {
      const success = await Utils.copyToClipboard(allMessages);
      if (success) {
        Utils.showToast("Semua pesan berhasil disalin!", "success");
      } else {
        Utils.showToast("Gagal menyalin pesan", "error");
      }
    } catch (error) {
      console.error("Copy all failed:", error);
      Utils.showToast("Gagal menyalin pesan", "error");
    }
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const totalMessages = this.currentMessages.length;
    const sentCount = Array.from(this.sentMessages.keys()).filter((tiket) =>
      this.currentMessages.some((msg) => msg.tiket === tiket)
    ).length;

    const progressPercent = Utils.calculatePercentage(sentCount, totalMessages);

    // Update progress section
    const progressSection = document.getElementById("progressSection");
    if (progressSection) {
      progressSection.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-blue-800">Progress Hari Ini</span>
                    <span id="progressCount" class="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        ${sentCount}/${totalMessages}
                    </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                        id="progressBar"
                        class="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style="width: ${progressPercent}%"
                    ></div>
                </div>
                <div class="mt-2 flex justify-between text-xs text-gray-600">
                    <span id="progressDate">Update: ${new Date().toLocaleTimeString(
                      "id-ID"
                    )}</span>
                    <button
                        onclick="uiManager.clearTodayProgress()"
                        class="text-red-600 hover:text-red-800 transition-colors"
                    >
                        Reset Progress Hari Ini
                    </button>
                </div>
            `;
    }
  }

  /**
   * Save today's progress
   */
  saveTodayProgress() {
    const progressData = Array.from(this.sentMessages.entries());
    storageManager.set(`progress_${this.todayKey}`, progressData);
    this.updateProgress();
  }

  /**
   * Load today's progress
   */
  loadTodayProgress() {
    const savedProgress = storageManager.get(`progress_${this.todayKey}`);
    if (savedProgress && Array.isArray(savedProgress)) {
      this.sentMessages = new Map(savedProgress);
      this.updateProgress();
      document.getElementById("progressSection").classList.remove("hidden");
    }
  }

  /**
   * Clear today's progress
   */
  clearTodayProgress() {
    if (confirm("Apakah Anda yakin ingin mereset progress hari ini?")) {
      this.sentMessages.clear();
      this.saveTodayProgress();
      this.renderMessages();
      Utils.showToast("Progress hari ini telah direset", "success");
    }
  }

  /**
   * Preview auto-detection - IMPLEMENTED MISSING METHOD
   */
  previewAutoDetection() {
    const data = this.getInputData();
    const kategoriList = data.kategori
      .trim()
      .split("\n")
      .filter((x) => x);
    const keperluanList = data.keperluan
      .trim()
      .split("\n")
      .filter((x) => x);

    if (kategoriList.length === 0 || keperluanList.length === 0) {
      Utils.showToast(
        "Harap isi kolom Kategori dan Keperluan FU terlebih dahulu!",
        "warning"
      );
      return;
    }

    // Create detection preview container if not exists
    let detectionPreview = document.getElementById("detectionPreview");
    if (!detectionPreview) {
      detectionPreview = document.createElement("div");
      detectionPreview.id = "detectionPreview";
      detectionPreview.className =
        "mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200";

      const templateSection = document.getElementById("templateSection");
      templateSection.parentNode.insertBefore(
        detectionPreview,
        templateSection.nextSibling
      );
    }

    let resultsDiv = document.getElementById("detectionResults");
    if (!resultsDiv) {
      resultsDiv = document.createElement("div");
      resultsDiv.id = "detectionResults";
      resultsDiv.className = "space-y-2 mt-2";
      detectionPreview.appendChild(resultsDiv);
    }

    resultsDiv.innerHTML = "";

    // Add title and close button
    detectionPreview.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-blue-800 flex items-center gap-2">
                    <i class="fas fa-search"></i> Auto-Detection Preview
                </h3>
                <button onclick="this.parentElement.parentElement.classList.add('hidden')" 
                        class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="detectionResults" class="space-y-2"></div>
        `;

    resultsDiv = document.getElementById("detectionResults");

    kategoriList.forEach((kategori, index) => {
      const keperluan = keperluanList[index] || "";
      const detection = detectionEngine.detect(kategori, keperluan);

      const resultItem = document.createElement("div");
      resultItem.className =
        "flex justify-between items-center p-3 bg-white rounded border slide-in";
      resultItem.innerHTML = `
                <div class="flex-1">
                    <div class="font-medium">#${index + 1}</div>
                    <div class="text-sm text-gray-600 mt-1">
                        <strong>Kategori:</strong> ${kategori}<br>
                        <strong>Keperluan:</strong> ${keperluan}
                    </div>
                </div>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium ml-3">
                    ${detection.name}
                </span>
            `;
      resultsDiv.appendChild(resultItem);
    });

    detectionPreview.classList.remove("hidden");
    Utils.showToast("Auto-detection preview ditampilkan", "success");
  }

  /**
   * Auto-detect all templates - IMPLEMENTED MISSING METHOD
   */
  /**
   * Preview auto-detection results only - FOR DEBUGGING
   */
  autoDetectAllTemplates() {
    const data = this.getInputData();
    const kategoriList = data.kategori
      .trim()
      .split("\n")
      .filter((x) => x);
    const keperluanList = data.keperluan
      .trim()
      .split("\n")
      .filter((x) => x);

    if (kategoriList.length === 0) {
      Utils.showToast("Harap isi data terlebih dahulu!", "warning");
      return;
    }

    // Calculate template distribution
    const templateCounts = {};
    kategoriList.forEach((kategori, index) => {
      const keperluan = keperluanList[index] || "";
      const detection = detectionEngine.detect(kategori, keperluan);
      templateCounts[detection.template] =
        (templateCounts[detection.template] || 0) + 1;
    });

    // Show detection summary
    let summary = "📊 Hasil Auto-Detection:\n\n";
    Object.keys(templateCounts).forEach((template) => {
      const count = templateCounts[template];
      const templateName = this.getTemplateName(template);
      summary += `${count}x ${templateName}\n`;
    });

    // Show as info instead of template selection
    Utils.showToast("Auto-detection summary ditampilkan", "info");

    setTimeout(() => {
      alert(summary);
    }, 300);
  }

  /**
   * Get template display name
   */
  getTemplateName(templateType) {
    const names = {
      standard: "Standard",
      wifi_default: "WiFi Default",
      ganti_ssid_password: "Ganti SSID+Password",
      ganti_password: "Ganti Password",
      iconplay: "Iconplay",
    };
    return names[templateType] || templateType;
  }

  /**
   * Show data quality analysis
   */
  showDataQualityAnalysis(entries) {
    const analysis = detectionEngine.analyzeDataQuality(entries);

    // Hanya show jika ada warnings yang meaningful
    if (analysis.warnings.length === 0) return;

    const warningHTML = `
        <div id="dataQualityWarning" class="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
            <h4 class="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <i class="fas fa-exclamation-triangle"></i>
                Quality Check
            </h4>
            <p class="text-sm text-yellow-700 mb-2">
                Beberapa item perlu diperhatikan:
            </p>
            <ul class="text-sm text-yellow-700 space-y-1">
                ${analysis.warnings
                  .map(
                    (warning) =>
                      `<li>• #${warning.index}: ${warning.message}</li>`
                  )
                  .join("")}
            </ul>
        </div>
    `;

    const outputSection = document.getElementById("output");
    if (outputSection) {
      outputSection.insertAdjacentHTML("beforebegin", warningHTML);
    }
  }

  /**
   * Show template help
   */
  showTemplateHelp() {
    const helpText = `
📋 BANTUAN TEMPLATE OTOMATIS:

• WiFi Default: Untuk reset/default WiFi (LAIN-LAIN + RESET/DEFAULT/TROUBLESHOOT)
• Ganti SSID+Password: Untuk ganti nama dan password WiFi (LAIN-LAIN + SSID/PASSWORD)
• Ganti Password: Hanya ganti password WiFi (LAIN-LAIN + PASSWORD)
• Iconplay: Untuk masalah Iconplay (GANGGUAN-ICONPLAY + ICONPLAY/TV)
• Standard: Template default untuk konfirmasi umum

Sistem akan otomatis memilih template berdasarkan Kategori dan Keperluan FU.
        `;
    alert(helpText);
  }
}

// Create global instance
const uiManager = new UIManager();

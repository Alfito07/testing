/**
 * Intelligent template detection system - COMPLETE VERSION
 */

class DetectionEngine {
  constructor() {
    // Tetap pertahankan structure original untuk compatibility
    this.contextKeywords = {
      tv: ["TV", "STB", "REMOTE", "ICONPLAY", "CHANNEL", "GANGGUAN TV"],
      wifi: [
        "WIFI",
        "INTERNET",
        "JARINGAN",
        "SINYAL",
        "HOTSPOT",
        "ROUTER",
        "MODEM",
      ],
      speed: [
        "INTERNET SLOW",
        "INTERNET LAMBAT",
        "KECEPATAN",
        "BANDWIDTH",
        "DOWNLOAD",
      ],
    };
  }

  /**
   * Detect template based on kategori and keperluan - NEW BUSINESS LOGIC
   */
  /**
   * Detect template based on kategori and keperluan - UPDATED FOR STREAMING SERVICES
   */
  detect(kategori, keperluan) {
    const kategoriUpper = kategori.toUpperCase().trim();
    const keperluanUpper = keperluan.toUpperCase().trim();

    console.log(`🔍 Detecting: ${kategoriUpper} | ${keperluanUpper}`);

    // 1. STREAMING SERVICES (semua layanan OTT/streaming)
    const streamingKeywords = [
      "GANGGUAN-ICONPLAY",
      "GANGGUAN-CUBMU",
      "GANGGUAN-VIU",
      "GANGGUAN-VIDIO",
      "ICONPLAY",
      "CUBMU",
      "VIU",
      "VIDIO",
      "STREAMING",
      "OTT",
      "TV",
      "STB",
    ];

    if (this.containsAny(kategoriUpper, streamingKeywords)) {
      console.log("✅ Matched: Streaming Service");
      return { template: "streaming_service", name: "Layanan Streaming" };
    }

    // 2. RESET/DEFAULT CONDITIONS (kondisi teknis khusus)
    const resetKeywords = [
      "TERRESET",
      "TERESET",
      "RESET",
      "DEFAULT",
      "BAWAAN",
      "PABRIK",
      "KEMBALI KE DEFAULT",
      "TROUBLESHOOT",
      "TROUBLE SHOOT",
      "TROUBLESHOOTING",
      "REBOOT",
      "RESTART",
      "HARD RESET",
      "SOFT RESET",
    ];
   
    const hasResetInKategori = this.containsAny(kategoriUpper, resetKeywords);
    const hasResetInKeperluan = this.containsAny(keperluanUpper, resetKeywords);

    if (hasResetInKategori || hasResetInKeperluan) {
      console.log("✅ Matched: WiFi Default (Reset Condition)");
      return { template: "wifi_default", name: "WiFi Default" };
    }

    // 3. SSID + PASSWORD (kombinasi)
    if (
      (keperluanUpper.includes("SSID") &&
        keperluanUpper.includes("PASSWORD")) ||
      keperluanUpper.includes("SSID DAN PASSWORD") ||
      keperluanUpper.includes("SSID & PASSWORD")
    ) {
      console.log("✅ Matched: Ganti SSID+Password");
      return { template: "ganti_ssid_password", name: "Ganti SSID+Password" };
    }

    // 4. SSID SAJA
    if (
      keperluanUpper.includes("SSID") &&
      !keperluanUpper.includes("PASSWORD")
    ) {
      console.log("✅ Matched: Ganti SSID");
      return { template: "ganti_ssid", name: "Ganti SSID" };
    }

    // 5. PASSWORD SAJA
    if (
      keperluanUpper.includes("PASSWORD") &&
      !keperluanUpper.includes("SSID")
    ) {
      console.log("✅ Matched: Ganti Password");
      return { template: "ganti_password", name: "Ganti Password" };
    }

    // 6. INTERNET ISSUES + KONFIRMASI
    if (
      this.containsAny(kategoriUpper, [
        "INTERNET DOWN",
        "NO INTERNET",
        "INTERNET SLOW",
      ]) &&
      keperluanUpper.includes("KONFIRMASI KENDALA USER")
    ) {
      console.log("✅ Matched: Standard - Internet Issue");
      return { template: "standard", name: "Standard - Internet Issue" };
    }

    // 7. LAIN-LAIN + KONFIRMASI
    if (
      kategoriUpper.includes("LAIN-LAIN") &&
      keperluanUpper.includes("KONFIRMASI KENDALA USER")
    ) {
      console.log("✅ Matched: Standard - Lain-lain");
      return { template: "standard", name: "Standard - Lain-lain" };
    }

    // 8. DEFAULT FALLBACK
    console.log("✅ Matched: Standard - Default");
    return { template: "standard", name: "Standard - Default" };
  }

  /**
   * Check if text contains any of the keywords
   */
  containsAny(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Batch detect templates for multiple entries
   */
  batchDetect(entries) {
    return entries.map((entry, index) => {
      const detection = this.detect(entry.kategori, entry.keperluan);

      // Calculate confidence for compatibility
      const confidence = this.calculateConfidence(
        entry.kategori,
        entry.keperluan,
        detection
      );

      return {
        ...entry,
        index,
        templateType: detection.template,
        templateName: detection.name,
        confidence: confidence,
      };
    });
  }

  /**
   * Calculate detection confidence (0-100) - for compatibility
   */
  calculateConfidence(kategori, keperluan, detection) {
    const kategoriUpper = kategori.toUpperCase();
    const keperluanUpper = keperluan.toUpperCase();

    let confidence = 80; // Base confidence tinggi untuk new logic

    // Boost confidence for exact matches
    if (
      kategoriUpper.includes("GANGGUAN-ICONPLAY") &&
      detection.template === "iconplay"
    ) {
      confidence += 15;
    }

    if (
      keperluanUpper.includes("TERRESET") &&
      detection.template === "wifi_default"
    ) {
      confidence += 15;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Analyze data quality and provide suggestions - UPDATED
   */
  analyzeDataQuality(entries) {
    const warnings = [];

    entries.forEach((entry, index) => {
      // 1. Invalid ticket format
      if (!Utils.isValidTicket(entry.tiket)) {
        warnings.push({
          index: index + 1,
          message: `Format tiket tidak valid: ${entry.tiket}`,
        });
      }

      // 2. Streaming service dengan template yang tidak sesuai
      const kategoriUpper = entry.kategori.toUpperCase();
      const isStreamingService = this.containsAny(kategoriUpper, [
        "GANGGUAN-ICONPLAY",
        "GANGGUAN-CUBMU",
        "GANGGUAN-VIU",
        "GANGGUAN-VIDIO",
      ]);

      if (isStreamingService && entry.templateType !== "streaming_service") {
        warnings.push({
          index: index + 1,
          message: `Service streaming terdeteksi tetapi template mungkin tidak sesuai: ${entry.kategori}`,
        });
      }

      // 3. Potential template mismatch untuk kasus umum
      const detection = this.detect(entry.kategori, entry.keperluan);
      const keperluanUpper = entry.keperluan.toUpperCase();

      if (
        detection.template === "standard" &&
        (keperluanUpper.includes("SSID") ||
          keperluanUpper.includes("PASSWORD") ||
          keperluanUpper.includes("RESET"))
      ) {
        warnings.push({
          index: index + 1,
          message: `Template Standard terdeteksi untuk: "${entry.keperluan}"`,
        });
      }
    });

    return {
      warnings,
      totalEntries: entries.length,
      hasIssues: warnings.length > 0,
    };
  }

  /**
   * Get context-based suggestions
   */
  getContextSuggestion(kategori) {
    if (!kategori) return null;

    const kategoriUpper = kategori.toUpperCase();

    if (this.containsAny(kategoriUpper, this.contextKeywords.tv)) {
      return "Kemungkinan gangguan streaming - pertimbangkan template Iconplay";
    }

    if (this.containsAny(kategoriUpper, this.contextKeywords.wifi)) {
      return "Kemungkinan gangguan WiFi - pertimbangkan template WiFi Default";
    }

    if (this.containsAny(kategoriUpper, this.contextKeywords.speed)) {
      return "Kemungkinan gangguan internet lambat - template Standard sudah tepat";
    }

    return "Pertimbangkan kategori yang lebih spesifik untuk deteksi template yang optimal";
  }

  /**
   * Get detection statistics
   */
  getDetectionStats(entries) {
    if (!entries || entries.length === 0) {
      return {
        templateCounts: {},
        totalEntries: 0,
        averageConfidence: 0,
        mostCommonTemplate: "standard",
      };
    }

    const templateCounts = {};
    let totalConfidence = 0;

    entries.forEach((entry) => {
      templateCounts[entry.templateType] =
        (templateCounts[entry.templateType] || 0) + 1;
      totalConfidence += entry.confidence || 0;
    });

    const avgConfidence =
      entries.length > 0 ? totalConfidence / entries.length : 0;

    return {
      templateCounts,
      totalEntries: entries.length,
      averageConfidence: Math.round(avgConfidence),
      mostCommonTemplate: Object.keys(templateCounts).reduce(
        (a, b) => (templateCounts[a] > templateCounts[b] ? a : b),
        "standard"
      ),
    };
  }

  /**
   * Validate detection rules (for debugging)
   */
  validateRules() {
    const testCases = [
      {
        kategori: "GANGGUAN-ICONPLAY",
        keperluan: "KONFIRMASI",
        expected: "streaming_service",
      },
      {
        kategori: "GANGGUAN-CUBMU",
        keperluan: "KONFIRMASI",
        expected: "streaming_service",
      },
      {
        kategori: "GANGGUAN-VIU",
        keperluan: "KONFIRMASI",
        expected: "streaming_service",
      },
      {
        kategori: "GANGGUAN-VIDIO",
        keperluan: "KONFIRMASI",
        expected: "streaming_service",
      },
      {
        kategori: "LAIN-LAIN",
        keperluan: "TERRESET",
        expected: "wifi_default",
      },
      {
        kategori: "LAIN-LAIN",
        keperluan: "GANTI SSID DAN PASSWORD",
        expected: "ganti_ssid_password",
      },
      {
        kategori: "LAIN-LAIN",
        keperluan: "GANTI PASSWORD",
        expected: "ganti_password",
      },
      {
        kategori: "LAIN-LAIN",
        keperluan: "GANTI SSID",
        expected: "ganti_ssid",
      },
      {
        kategori: "INTERNET DOWN",
        keperluan: "KONFIRMASI KENDALA USER",
        expected: "standard",
      },
      {
        kategori: "LAIN-LAIN",
        keperluan: "KONFIRMASI KENDALA USER",
        expected: "standard",
      },
    ];

    console.log("🧪 Testing Detection Rules:");
    testCases.forEach((test, i) => {
      const result = this.detect(test.kategori, test.keperluan);
      const status = result.template === test.expected ? "✅ PASS" : "❌ FAIL";
      console.log(
        `${status} Test ${i + 1}: ${test.kategori} | ${test.keperluan} → ${
          result.template
        } (expected: ${test.expected})`
      );
    });
  }
}

// Create global instance
const detectionEngine = new DetectionEngine();

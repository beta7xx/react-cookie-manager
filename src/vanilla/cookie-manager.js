// Import Tailwind styles
import "./cookie-manager.css";

// Remove the import and export, make it a pure IIFE
(function () {
  class CookieManager {
    constructor(config) {
      this.config = {
        cookieName: "cookie_consent",
        cookieExpiration: 365,
        style: "banner", // banner, modal, or popup
        theme: "light", // light or dark
        cookieKitId: "", // unique identifier
        categories: {
          analytics: true,
          marketing: true,
          preferences: true,
        },
        translations: {
          title: "Would You Like A Cookie? 🍪",
          message:
            "We use cookies to enhance your browsing experience and analyze our traffic.",
          buttonText: "Accept All",
          declineButtonText: "Decline All",
          manageButtonText: "Customize",
          privacyPolicyText: "Privacy Policy",
          manageTitle: "Cookie Preferences",
          manageMessage: "Choose which cookies you want to accept.",
          savePreferences: "Save Preferences",
          cancel: "Cancel",
        },
        ...config,
      };

      this.state = this.loadConsent();

      // Log the CookieKitId
      if (this.config.cookieKitId) {
        console.log("CookieKit initialized with ID:", this.config.cookieKitId);
      }
    }

    injectStyles(cssContent) {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = cssContent;
      document.head.appendChild(styleSheet);
    }

    loadConsent() {
      const consent = this.getCookie(this.config.cookieName);
      return consent ? JSON.parse(consent) : null;
    }

    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = "; expires=" + date.toUTCString();
      document.cookie = name + "=" + value + expires + "; path=/";
    }

    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    saveConsent(categories) {
      console.log("🍪 Saving consent with categories:", categories);
      this.state = categories;
      this.setCookie(
        this.config.cookieName,
        JSON.stringify(categories),
        this.config.cookieExpiration
      );
      console.log("📝 Cookie saved, now removing UI elements");

      // Hide both banner and modal completely
      if (this.wrapper) {
        console.log("🗑️ Removing banner wrapper");
        this.wrapper.remove();
      }
      if (this.modalWrapper) {
        console.log("🗑️ Removing modal wrapper");
        this.modalWrapper.remove();
      }

      this.applyConsent();
    }

    applyConsent() {
      console.log("🔄 Applying consent state:", this.state);

      if (this.state?.analytics) {
        console.log("📊 Enabling analytics scripts");
        document
          .querySelectorAll('script[data-cookiekit="analytics"]')
          .forEach((script) => script.setAttribute("type", "text/javascript"));
      }

      if (this.state?.marketing) {
        console.log("🎯 Enabling marketing scripts");
        document
          .querySelectorAll('script[data-cookiekit="marketing"]')
          .forEach((script) => script.setAttribute("type", "text/javascript"));
      }

      console.log("📢 Dispatching consent updated event");
      window.dispatchEvent(
        new CustomEvent("cookiekit:consent-updated", {
          detail: this.state,
        })
      );
      console.log("✅ Consent application complete");
    }

    createBanner() {
      const wrapper = document.createElement("div");
      wrapper.className = "cookie-manager";

      const banner = document.createElement("div");
      const isLight = this.config.theme === "light";

      // Base classes for all styles
      const baseClasses = `fixed z-[9999] font-sans transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`;

      // Mobile-first base positioning
      const mobileClasses = "bottom-0 left-0 w-full";

      // Desktop-specific classes
      const desktopClasses = {
        banner:
          "md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl",
        modal: "md:inset-0 md:flex md:items-center md:justify-center md:p-4",
        popup: "md:bottom-4 md:left-4 md:w-80",
      }[this.config.style];

      banner.className = `${baseClasses} ${mobileClasses} ${desktopClasses}`;

      const contentBaseClasses = `
        rounded-t-lg md:rounded-lg backdrop-blur-sm backdrop-saturate-150 
        ${
          isLight
            ? "bg-white/95 border border-black/10 shadow-lg"
            : "bg-black/95 ring-1 ring-white/10"
        }
      `;

      // Content-specific classes
      const contentClasses = {
        banner:
          "p-4 md:hover:-translate-y-2 md:transition-transform md:duration-500",
        modal: "p-4 md:w-full md:max-w-lg md:p-6",
        popup:
          "p-4 md:hover:-translate-y-2 md:transition-transform md:duration-500",
      }[this.config.style];

      banner.innerHTML = `
        <div class="${contentBaseClasses} ${contentClasses}">
          <div class="flex flex-col gap-4">
            <div>
              <h2 class="text-sm font-semibold mb-2 ${
                isLight ? "text-gray-900" : "text-white"
              }">${this.config.translations.title}</h2>
              <p class="text-xs font-medium ${
                isLight ? "text-gray-700" : "text-gray-200"
              }">${this.config.translations.message}</p>
            </div>
            ${
              this.config.style === "popup"
                ? `
                <div class="flex flex-col gap-3 w-full">
                  <button class="accept-all w-full md:hidden px-4 py-2.5 text-sm font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105">
                    ${this.config.translations.buttonText}
                  </button>
                  <button class="decline-all w-full md:hidden px-4 py-2.5 text-sm font-medium rounded-md ${
                    isLight
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  } transition-all duration-200 hover:scale-105">
                    ${this.config.translations.declineButtonText}
                  </button>
                  <div class="hidden md:flex items-center gap-3">
                    <button class="decline-all flex-1 px-3 py-1.5 text-xs font-medium rounded-md ${
                      isLight
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    } transition-all duration-200 hover:scale-105">
                      ${this.config.translations.declineButtonText}
                    </button>
                    <button class="accept-all flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105">
                      ${this.config.translations.buttonText}
                    </button>
                  </div>
                  <button class="customize w-full px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-md border border-blue-500 text-blue-500 bg-transparent hover:text-blue-600 hover:border-blue-600 transition-all duration-200 hover:scale-105">
                    ${this.config.translations.manageButtonText}
                  </button>
                </div>
                `
                : `
                <div class="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3">
                  <div class="flex flex-col md:flex-row md:items-center gap-3">
                    <button class="customize w-full md:w-auto px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-md border border-blue-500 text-blue-500 bg-transparent hover:text-blue-600 hover:border-blue-600 transition-all duration-200 hover:scale-105">
                      ${this.config.translations.manageButtonText}
                    </button>
                    <button class="decline-all w-full md:w-auto px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-md ${
                      isLight
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    } transition-all duration-200 hover:scale-105">
                      ${this.config.translations.declineButtonText}
                    </button>
                    <button class="accept-all w-full md:w-auto px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105">
                      ${this.config.translations.buttonText}
                    </button>
                  </div>
                </div>
                `
            }
          </div>
        </div>
      `;

      banner.querySelector(".accept-all").addEventListener("click", () => {
        this.saveConsent(this.config.categories);
      });

      banner.querySelector(".decline-all").addEventListener("click", () => {
        this.saveConsent({
          analytics: false,
          marketing: false,
          preferences: false,
        });
      });

      banner.querySelector(".customize").addEventListener("click", () => {
        this.showCustomizeModal();
      });

      wrapper.appendChild(banner);
      document.body.appendChild(wrapper);
      this.banner = banner;
      this.wrapper = wrapper;
    }

    createCustomizeModal() {
      const modalWrapper = document.createElement("div");
      modalWrapper.className = "cookie-manager";

      const isLight = this.config.theme === "light";

      const modal = document.createElement("div");
      modal.className =
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg z-[10000] hidden";
      modal.innerHTML = `
        <div class="rounded-xl p-6 ${
          isLight
            ? "bg-white/95 ring-2 ring-gray-200"
            : "bg-black/95 ring-1 ring-white/10"
        }">
          <div class="flex flex-col gap-6">
            <div>
              <h3 class="text-sm font-semibold mb-2 ${
                isLight ? "text-gray-900" : "text-white"
              }">${this.config.translations.manageTitle}</h3>
              <p class="text-xs ${
                isLight ? "text-gray-700" : "text-gray-200"
              }">${this.config.translations.manageMessage}</p>
            </div>

            <div class="flex flex-col gap-4">
              <!-- Essential Cookies -->
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-medium text-left ${
                    isLight ? "text-gray-900" : "text-white"
                  }">Essential</h4>
                  <p class="text-xs text-left ${
                    isLight ? "text-gray-600" : "text-gray-400"
                  }">Required for the website to function properly.</p>
                  <p class="text-xs mt-1 text-left text-gray-500">Always enabled</p>
                </div>
                <div class="px-3 py-1 text-xs text-center font-medium rounded-full ${
                  isLight
                    ? "bg-gray-200 text-gray-600"
                    : "bg-gray-800 text-gray-300"
                }">
                  Required
                </div>
              </div>

              <!-- Analytics Cookies -->
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-medium text-left ${
                    isLight ? "text-gray-900" : "text-white"
                  }">Analytics</h4>
                  <p class="text-xs text-left ${
                    isLight ? "text-gray-600" : "text-gray-400"
                  }">Help us understand how visitors interact with our website.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="analytics" ${
                    this.config.categories.analytics ? "checked" : ""
                  } class="sr-only peer">
                  <div class="w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
                    ${
                      isLight
                        ? "bg-gray-200 peer-checked:bg-blue-500"
                        : "bg-gray-700 peer-checked:bg-blue-500"
                    } 
                    peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
                    after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all">
                  </div>
                </label>
              </div>

              <!-- Marketing Cookies -->
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-medium text-left ${
                    isLight ? "text-gray-900" : "text-white"
                  }">Marketing</h4>
                  <p class="text-xs text-left ${
                    isLight ? "text-gray-600" : "text-gray-400"
                  }">Allow us to personalize your experience and send you relevant content.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="marketing" ${
                    this.config.categories.marketing ? "checked" : ""
                  } class="sr-only peer">
                  <div class="w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
                    ${
                      isLight
                        ? "bg-gray-200 peer-checked:bg-blue-500"
                        : "bg-gray-700 peer-checked:bg-blue-500"
                    } 
                    peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
                    after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all">
                  </div>
                </label>
              </div>

              <!-- Preferences Cookies -->
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-medium text-left ${
                    isLight ? "text-gray-900" : "text-white"
                  }">Preferences</h4>
                  <p class="text-xs text-left ${
                    isLight ? "text-gray-600" : "text-gray-400"
                  }">Remember your settings and provide enhanced functionality.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="preferences" ${
                    this.config.categories.preferences ? "checked" : ""
                  } class="sr-only peer">
                  <div class="w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
                    ${
                      isLight
                        ? "bg-gray-200 peer-checked:bg-blue-500"
                        : "bg-gray-700 peer-checked:bg-blue-500"
                    } 
                    peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
                    after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all">
                  </div>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button class="cancel px-3 py-1.5 text-xs font-medium rounded-md border border-gray-500 text-gray-500 bg-transparent hover:text-gray-600 hover:border-gray-600 transition-all duration-200 hover:scale-105">
                ${this.config.translations.cancel}
              </button>
              <button class="save-preferences px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105">
                ${this.config.translations.savePreferences}
              </button>
            </div>
          </div>
        </div>
      `;

      const overlay = document.createElement("div");
      overlay.className = `fixed inset-0 ${
        this.config.style === "modal"
          ? "bg-black/20 backdrop-blur-[2px]"
          : "bg-black/40"
      } z-[9999] hidden transition-all duration-300`;

      modal.querySelector(".save-preferences").addEventListener("click", () => {
        console.log("💾 Save preferences clicked");
        const categories = {
          analytics: modal.querySelector('input[name="analytics"]').checked,
          marketing: modal.querySelector('input[name="marketing"]').checked,
          preferences: modal.querySelector('input[name="preferences"]').checked,
        };
        console.log("📋 Collected categories:", categories);
        this.saveConsent(categories);
      });

      modal.querySelector(".cancel").addEventListener("click", () => {
        this.hideCustomizeModal();
      });

      // Set initial state if exists
      if (this.state) {
        if (this.state.analytics) {
          modal.querySelector('input[name="analytics"]').checked = true;
        }
        if (this.state.marketing) {
          modal.querySelector('input[name="marketing"]').checked = true;
        }
        if (this.state.preferences) {
          modal.querySelector('input[name="preferences"]').checked = true;
        }
      }

      modalWrapper.appendChild(overlay);
      modalWrapper.appendChild(modal);
      document.body.appendChild(modalWrapper);
      this.modal = modal;
      this.overlay = overlay;
      this.modalWrapper = modalWrapper;
    }

    showCustomizeModal() {
      console.log("🔍 Showing customize modal");
      this.modal.classList.remove("hidden");
      this.overlay.classList.remove("hidden");
    }

    hideCustomizeModal() {
      console.log("🔒 Hiding customize modal");
      if (this.modal) {
        this.modal.classList.add("hidden");
        this.overlay.classList.add("hidden");
      }
    }

    hideBanner() {
      console.log("🔒 Hiding banner");
      this.banner.classList.add("hidden");
    }

    init() {
      console.log("🚀 Initializing CookieKit");
      console.log("Current state:", this.state);

      if (!this.state) {
        console.log("📝 No existing consent found, creating UI elements");
        this.createBanner();
        this.createCustomizeModal();
      } else {
        console.log("✅ Existing consent found:", this.state);
      }
    }
  }

  // Expose to global scope
  window.CookieKit = {
    manager: null,
    init: (config) => {
      console.log("🌟 CookieKit.init called with config:", config);
      window.CookieKit.manager = new CookieManager(config);
      window.CookieKit.manager.init();
      console.log("🎉 CookieKit initialization complete");
    },
    showBanner: () => {
      console.log("🎯 Show banner requested");
      if (window.CookieKit.manager) {
        window.CookieKit.manager.createBanner();
        window.CookieKit.manager.createCustomizeModal();
      }
    },
    showCustomizeModal: () => {
      console.log("🎯 Show customize modal requested");
      if (window.CookieKit.manager) {
        window.CookieKit.manager.showCustomizeModal();
      }
    },
    resetConsent: () => {
      console.log("🔄 Reset consent requested");
      document.cookie =
        "cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      location.reload();
    },
  };
})();

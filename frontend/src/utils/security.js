// Proteções de segurança para DevTools
class DevToolsProtection {
  constructor() {
    this.init();
  }

  init() {
    this.disableRightClick();
    this.disableKeyboardShortcuts();
    this.detectDevTools();
    this.preventContextMenu();
    this.preventSelection();
    this.preventCopy();
    this.preventDrag();
    this.preventDevToolsKeys();
    this.addAntiDebug();
  }

  // Desabilitar botão direito do mouse
  disableRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Prevenir menu de contexto
  preventContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      alert('Ação não permitida!');
      return false;
    });
  }

  // Desabilitar seleção de texto
  preventSelection() {
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });

    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
    });
  }

  // Prevenir cópia
  preventCopy() {
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      alert('Cópia não permitida!');
      return false;
    });

    document.addEventListener('cut', (e) => {
      e.preventDefault();
      alert('Corte não permitido!');
      return false;
    });

    document.addEventListener('paste', (e) => {
      e.preventDefault();
      alert('Colagem não permitida!');
      return false;
    });
  }

  // Prevenir arrastar
  preventDrag() {
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Desabilitar atalhos de teclado para DevTools
  disableKeyboardShortcuts() {
    const blockedKeys = [
      'F12', 'F11', 'F10',
      'Control+Shift+I', 'Control+Shift+J', 'Control+Shift+C',
      'Control+Shift+K', 'Control+U', 'Control+S',
      'Control+Shift+Delete', 'Control+Shift+E'
    ];

    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Bloquear F12
      if (key === 'F12') {
        e.preventDefault();
        this.showWarning();
        return false;
      }

      // Bloquear Ctrl+Shift+I/J/C
      if (ctrl && shift && (key === 'I' || key === 'J' || key === 'C')) {
        e.preventDefault();
        this.showWarning();
        return false;
      }

      // Bloquear Ctrl+U (view source)
      if (ctrl && key === 'U') {
        e.preventDefault();
        this.showWarning();
        return false;
      }

      // Bloquear Ctrl+S (save page)
      if (ctrl && key === 'S') {
        e.preventDefault();
        this.showWarning();
        return false;
      }

      // Bloquear outras combinações
      if (ctrl && shift && key === 'E') {
        e.preventDefault();
        this.showWarning();
        return false;
      }
    });
  }

  // Prevenir teclas específicas do DevTools
  preventDevToolsKeys() {
    let devtoolsOpen = false;

    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          this.showWarning();
        }
      } else {
        devtoolsOpen = false;
      }
    };

    setInterval(checkDevTools, 500);
  }

  // Detectar abertura do DevTools
  detectDevTools() {
    let devtools = {open: false, orientation: null};

    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.showWarning();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Detectar mudança de orientação (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            this.showWarning();
          }
        }
      }, 100);
    });
  }

  // Anti-debugging
  addAntiDebug() {
    // Prevenir debugger
    let debugCount = 0;
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Override console methods
    console.log = (...args) => {
      if (args.join('').includes('debugger') || args.join('').includes('DevTools')) {
        this.showWarning();
        return;
      }
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      if (args.join('').includes('debugger') || args.join('').includes('DevTools')) {
        this.showWarning();
        return;
      }
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      if (args.join('').includes('debugger') || args.join('').includes('DevTools')) {
        this.showWarning();
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    // Detectar debugger statement
    const originalDebugger = window.debugger;
    window.debugger = () => {
      debugCount++;
      if (debugCount > 3) {
        this.showWarning();
        // Redirecionar ou bloquear
        window.location.href = '/blocked';
      }
    };
  }

  // Mostrar aviso
  showWarning() {
    // Criar overlay de aviso
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: Arial, sans-serif;
      text-align: center;
    `;

    overlay.innerHTML = `
      <div style="background: #ff4444; padding: 30px; border-radius: 10px; max-width: 400px;">
        <h2 style="margin: 0 0 20px 0; color: white;">⚠️ ACESSO NEGADO</h2>
        <p style="margin: 0 0 20px 0; line-height: 1.5;">
          O uso de ferramentas de desenvolvedor não é permitido neste site.
        </p>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">
          Feche as ferramentas de desenvolvedor para continuar.
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Remover overlay após 5 segundos
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 5000);
  }
}

// Inicializar proteções quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DevToolsProtection();
  });
} else {
  new DevToolsProtection();
}

// Exportar para uso global
window.DevToolsProtection = DevToolsProtection;
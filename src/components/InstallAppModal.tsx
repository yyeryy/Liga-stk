import { useEffect, useState } from "react";
import "./InstallAppModal.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_STATE_KEY = "liga-stk-installed";

const isMobileDevice = () =>
  window.matchMedia("(max-width: 767px)").matches ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;

export const InstallAppModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (
      !isMobileDevice() ||
      isInstalled() ||
      window.localStorage.getItem(INSTALL_STATE_KEY) === "true"
    ) {
      return;
    }

    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    setIsOpen(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(INSTALL_STATE_KEY, "true");
      setInstallPrompt(null);
      setShowSuccess(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      window.localStorage.setItem(INSTALL_STATE_KEY, "true");
      setShowSuccess(true);
    }
    setInstallPrompt(null);
  };

  if (!isOpen) return null;

  return (
    <div className="install-modal-backdrop" role="presentation">
      <section
        className="install-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        <button
          className="install-modal__close"
          type="button"
          aria-label="Cerrar"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
        {showSuccess ? (
          <div className="install-modal__success">
            <img
              className="install-modal__success-image"
              src="/imagenes/Bien%20manito.jpg"
              alt="Bien manito"
            />
            <h2 id="install-modal-title">Bien manito</h2>
            <p className="install-modal__intro">
              ¡Hecho! Liga STK ya tiene su sitio en tu móvil.
            </p>
            <button
              className="install-modal__later"
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowSuccess(false);
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <img
              className="install-modal__surprise-image"
              src="/imagenes/Cara%20sorpresa.jpg"
              alt="Cara de sorpresa"
            />
            <p className="install-modal__eyebrow">
              {isIOS ? "Liga STK en tu iPhone" : "Liga STK en tu Android"}
            </p>
            <h2 id="install-modal-title">
              {isIOS
                ? "¿Aún no la tienes? ¡Qué poca fe!"
                : "¿Aún no la tienes descargada?"}
            </h2>
            <p className="install-modal__intro">
              {isIOS
                ? "Añádela a tu pantalla de inicio y tendrás la liga a un toque. Tus rivales ya están mirando la clasificación."
                : "Instálala en un toque y tendrás la liga siempre a mano. La clasificación no se va a consultar sola... ¿o sí?"}
            </p>

            {isIOS ? (
              <div className="install-modal__steps">
                <p>
                  <strong>En iPhone o iPad</strong>
                </p>
                <ol>
                  <li>Pulsa el botón Compartir de Safari.</li>
                  <li>
                    Elige <strong>“Añadir a pantalla de inicio”</strong>.
                  </li>
                  <li>
                    Confirma con <strong>“Añadir”</strong>.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="install-modal__steps">
                <p>
                  <strong>En Android</strong>
                </p>
                <ol>
                  <li>Pulsa el menú de tres puntos del navegador.</li>
                  <li>
                    Elige <strong>“Instalar aplicación”</strong> o{" "}
                    <strong>“Añadir a pantalla de inicio”</strong>.
                  </li>
                  <li>Confirma la instalación.</li>
                </ol>
              </div>
            )}

            {installPrompt && (
              <button
                className="install-modal__install"
                type="button"
                onClick={handleInstall}
              >
                ¡Sí, quiero la app!
              </button>
            )}
            <button
              className="install-modal__later"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Ahora no
            </button>
          </>
        )}
      </section>
    </div>
  );
};

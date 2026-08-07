// Modo claro / oscuro — por defecto "Automático" (sigue la preferencia del
// sistema operativo/navegador). El botón del header permite forzarlo a
// Claro u Oscuro; un clic más vuelve a Automático. La preferencia se guarda
// en localStorage aparte del autoguardado del proyecto (clave propia), así
// que es independiente de "Guardar"/"Guardar como" y no se mezcla con los
// datos del proyecto.
//
// El atributo data-theme="auto|light|dark" se pone en <html> y todo el
// cambio visual lo resuelve el CSS (ver :root[data-theme="dark"] y
// @media (prefers-color-scheme: dark) en styles.css). Este módulo solo se
// encarga de: leer/guardar la preferencia, actualizar el ícono/título del
// botón, actualizar <meta name="theme-color"> (color de la barra del
// navegador/PWA), y reaccionar si el sistema cambia de tema mientras la
// preferencia está en "Automático".
//
// Nota: el atributo data-theme ya se pone una vez, muy temprano, en un
// <script> chiquito dentro de <head> (antes de este archivo) para evitar el
// parpadeo de tema claro al cargar en modo oscuro — acá se repite la misma
// lectura para no depender de ese script y además completar lo que falta
// (meta theme-color, botón).
const TEMA_CLAVE_STORAGE = "cf-hilti-tema";
const TEMA_ORDEN = ["auto", "light", "dark"];
const TEMA_ICONOS = { auto: "#i-tema-auto", light: "#i-tema-claro", dark: "#i-tema-oscuro" };
const TEMA_TITULOS = {
  auto: "Tema: Automático (según el sistema) — clic para forzar Claro",
  light: "Tema: Claro (forzado) — clic para forzar Oscuro",
  dark: "Tema: Oscuro (forzado) — clic para volver a Automático",
};

function temaLeerPreferencia() {
  try { return localStorage.getItem(TEMA_CLAVE_STORAGE) || "auto"; } catch (e) { return "auto"; }
}
function temaGuardarPreferencia(valor) {
  try { localStorage.setItem(TEMA_CLAVE_STORAGE, valor); } catch (e) {}
}
function temaSistemaEsOscuro() {
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
function temaEstaOscuroActivo(pref) {
  return pref === "dark" || (pref === "auto" && temaSistemaEsOscuro());
}
function temaActualizarBoton(pref) {
  const btn = document.getElementById("btn-tema");
  if (!btn) return;
  const use = btn.querySelector("use");
  if (use) use.setAttribute("href", TEMA_ICONOS[pref] || TEMA_ICONOS.auto);
  btn.title = TEMA_TITULOS[pref] || TEMA_TITULOS.auto;
}
function temaAplicar(pref) {
  document.documentElement.setAttribute("data-theme", pref);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", temaEstaOscuroActivo(pref) ? "#1a1a1a" : "#ffffff");
  temaActualizarBoton(pref);
}

let temaActual = temaLeerPreferencia();
temaAplicar(temaActual);

// Si la preferencia es "Automático" y el sistema cambia de tema en vivo
// (ej. el celular pasa a modo oscuro al anochecer), la app lo sigue sin
// necesidad de recargar.
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (temaActual === "auto") temaAplicar("auto");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-tema");
  if (!btn) return;
  temaActualizarBoton(temaActual);
  btn.addEventListener("click", () => {
    const siguiente = TEMA_ORDEN[(TEMA_ORDEN.indexOf(temaActual) + 1) % TEMA_ORDEN.length];
    temaActual = siguiente;
    temaGuardarPreferencia(siguiente);
    temaAplicar(siguiente);
  });
});

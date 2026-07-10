export function initFixedOverlayPanel() {
  const drawer = document.getElementById("desktopOverlayDrawer");
  const toggleBtn = document.getElementById("toggleOverlayBtn");

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", function () {
    drawer.classList.toggle("is-collapsed");
  });
}

// Contagem regressiva até a festa (19/09/2026, 19h, horário de Brasília).
const DATA_FESTA = new Date("2026-09-19T19:00:00-03:00").getTime();

function atualizarContagem() {
  const dias = document.getElementById("cd-dias");
  const horas = document.getElementById("cd-horas");
  const min = document.getElementById("cd-min");
  const seg = document.getElementById("cd-seg");
  if (!dias) return;

  const restante = DATA_FESTA - Date.now();

  if (restante <= 0) {
    dias.textContent = "00";
    horas.textContent = "00";
    min.textContent = "00";
    seg.textContent = "00";
    return;
  }

  const d = Math.floor(restante / (1000 * 60 * 60 * 24));
  const h = Math.floor((restante / (1000 * 60 * 60)) % 24);
  const m = Math.floor((restante / (1000 * 60)) % 60);
  const s = Math.floor((restante / 1000) % 60);

  dias.textContent = String(d).padStart(2, "0");
  horas.textContent = String(h).padStart(2, "0");
  min.textContent = String(m).padStart(2, "0");
  seg.textContent = String(s).padStart(2, "0");
}

atualizarContagem();
setInterval(atualizarContagem, 1000);

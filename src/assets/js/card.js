// LUMÉA — static invitation card: draws the QR code back to the animated
// invitation (in the card's ink colour), prints the card alone as a PDF and
// shares the link on WhatsApp. Without the QR library the code is hidden.
(() => {
  const qr = document.querySelector("[data-qr]");
  const url = (path) => new URL(path, window.location.origin).href;

  if (qr) {
    if (window.QRCode) {
      const ink = getComputedStyle(document.querySelector(".print-card")).color;
      const paper = getComputedStyle(document.querySelector(".print-card")).backgroundColor;
      new window.QRCode(qr, {
        text: url(qr.dataset.qr),
        width: 240,
        height: 240,
        colorDark: toHex(ink) || "#15120f",
        colorLight: toHex(paper) || "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    } else {
      qr.closest(".print-qr").hidden = true;
    }
  }

  document.querySelector("[data-print]")?.addEventListener("click", () => window.print());

  const share = document.querySelector("[data-share]");
  if (share) {
    const text = `${share.dataset.share}\n${url(share.dataset.sharePath)}`;
    share.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  // qrcode.js wants hex colours; computed styles are rgb()/rgba().
  function toHex(color) {
    const m = color.match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3 || (m.length > 3 && Number(m[3]) === 0)) return null;
    return "#" + m.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
  }
})();

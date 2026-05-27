(() => {
  function downloadPDF() {
    const container = document.querySelector(".about-resume .resume-container");
    const actions = document.querySelector(".about-resume .header-actions");
    if (!container) return;

    if (typeof html2pdf === "undefined") {
      alert("PDF library is loading, please try again in a moment.");
      return;
    }

    if (actions) actions.style.display = "none";

    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: "Yanyi_Huang_Resume.pdf",
      image: { type: "jpeg", quality: 0.85 },
      html2canvas: { scale: 1.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] },
    };

    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .finally(() => {
        if (actions) actions.style.display = "flex";
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".about-resume .download-pdf-btn");
    if (btn) btn.addEventListener("click", downloadPDF);
  });
})();

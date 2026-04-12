export function createModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-close-icon">
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </div>
      <div class="modal-video-container">
        <video id="modal-video" loop muted playsinline></video>
      </div>
      <div class="modal-info">
        <div class="modal-title" id="modal-title">Project Title</div>
        <div class="modal-description" id="modal-description">Project description goes here...</div>
        <div class="modal-actions">
          <a href="#" target="_blank" class="modal-cta" id="modal-cta">View Project →</a>
          <button class="modal-close">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalVideo = document.getElementById("modal-video");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalCta = document.getElementById("modal-cta");
  const modalCloseBtn = modal.querySelector(".modal-close");
  const modalCloseIcon = modal.querySelector(".modal-close-icon");

  let originalVideo = null;

  function open(videoSrc, title, description, projectLink, originalVideoElement) {
    if (originalVideo && !originalVideo.paused) {
      originalVideo.pause();
    }
    
    originalVideo = originalVideoElement;

    modalVideo.src = videoSrc;
    modalVideo.load();
    modalVideo.play().catch((e) => console.log("Modal video play error:", e));

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    
    if (projectLink === '_blanc' || !projectLink || projectLink === '#') {
      modalCta.removeAttribute('href');
      modalCta.style.opacity = '0.5';
      modalCta.style.cursor = 'not-allowed';
      modalCta.textContent = 'Coming Soon';
    } else {
      modalCta.href = projectLink;
      modalCta.style.opacity = '1';
      modalCta.style.cursor = 'pointer';
      modalCta.style.pointerEvents = 'auto';
      modalCta.textContent = 'View Project →';
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.classList.remove("active");
    modalVideo.pause();
    modalVideo.src = "";
    document.body.style.overflow = "";

    if (originalVideo && originalVideo.paused === false) {
      originalVideo.play().catch((e) => console.log("Resume video error:", e));
    }
    originalVideo = null;
  }

  modalCloseBtn.addEventListener("click", close);
  modalCloseIcon.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      close();
    }
  });

  modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    close();
  } else {
    e.stopPropagation();
  }
});
function update(title, description) {
  modalTitle.textContent = title;
  modalDescription.textContent = description;
}

return { open, update };

}
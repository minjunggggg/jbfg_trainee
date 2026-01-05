window.addEventListener("SITE_INIT", () => {
  const kvMotionVals = { borderRadius: 0, yPercent: 0 };
  const mainKVEl = document.querySelector("#mainKV");
  const videoEl = mainKVEl ? mainKVEl.querySelector(".visual video") : null;
  const videoControllerEl = mainKVEl
    ? mainKVEl.querySelector(".__video-controller")
    : null;

  if (mainKVEl) {
    ScrollTrigger.create({
      trigger: mainKVEl,
      start: "top top",
      end: "bottom bottom",
      pin: mainKVEl.querySelector(".visual"),
      pinSpacing: false,
    });

    ScrollTrigger.create({
      trigger: mainKVEl,
      start: "bottom bottom",
      end: "bottom top",
      onUpdate: ({ progress }) => {
        const visualImgs = mainKVEl.querySelectorAll(".visual .__img");
        gsap.set(visualImgs, { yPercent: progress * 50 });
      },
    });

    ScrollTrigger.create({
      trigger: mainKVEl,
      start: "bottom 80%",
      end: "bottom top",
      onUpdate: window._throttle(({ progress }) => {
        kvMotionVals.borderRadius =
          window.MAX_BORDER_RADIUS * Math.min(1, progress * 1.25);
        gsap.set(mainKVEl.querySelector(".__bg"), {
          borderBottomRightRadius: `${kvMotionVals.borderRadius}px`,
          borderBottomLeftRadius: `${kvMotionVals.borderRadius}px`,
        });
      }, 1000 / 24),
      onEnter: () => {
        if (videoEl) videoEl.pause();
      },
      onEnterBack: () => {
        if (videoEl) videoEl.pause();
      },
      onLeaveBack: () => {
        if (videoEl) videoEl.play();
      },
    });

    const kvTitleEl = mainKVEl.querySelector(".__kv-title");
    const kvTitleStrong = kvTitleEl.querySelector("strong");
    const kvTitleDesc = new SplitText(kvTitleStrong, {
      type: "lines,words",
      linesClass: "__line",
      wordsClass: "__word",
    });

    gsap.set(kvTitleDesc.words, { yPercent: 120 });
    gsap.set(kvTitleEl.querySelector("small span"), { y: "2em", opacity: 0 });
    gsap.set(mainKVEl.querySelectorAll(".__widget"), { opacity: 0, y: "4rem" });
    gsap.set(videoControllerEl, { opacity: 0, y: "4rem" });
    const TL_kvTitle = gsap.timeline({
      onComplete: () => {
        kvTitleDesc.revert();
      },
    });
    TL_kvTitle.to(
      kvTitleEl.querySelector("small span"),
      { y: 0, opacity: 1, duration: 1, ease: Quart.easeOut },
      0
    );
    kvTitleDesc.lines.forEach((line, i) => {
      TL_kvTitle.to(
        line.querySelectorAll(".__word"),
        { yPercent: 0, duration: 1.6, ease: Quart.easeOut },
        i * 0.2 + 0.2
      );
    });
    TL_kvTitle.to(
      videoControllerEl,
      { opacity: 1, y: 0, duration: 1.4, ease: Quart.easeOut },
      "-=1.6"
    );
    TL_kvTitle.to(
      mainKVEl.querySelectorAll(".__widget"),
      { opacity: 1, y: 0, duration: 1.4, ease: Quart.easeOut, stagger: 0.125 },
      "-=1.6"
    );
  }

  if (videoControllerEl) {
    const togglePlay = videoControllerEl.querySelector(".__toggle-play");
    const progressBar = videoControllerEl.querySelector(".__bar");
    let videoDuration = videoEl.duration;

    videoEl.addEventListener("loadedmetadata", () => {
      videoDuration = videoEl.duration;
    });
    function checkVideoState() {
      if (videoEl.paused) {
        togglePlay.classList.remove("playing");
      } else {
        togglePlay.classList.add("playing");
      }
    }
    togglePlay.addEventListener("click", () => {
      if (videoEl.paused) {
        videoEl.play();
      } else {
        videoEl.pause();
      }
    });

    videoEl.addEventListener("play", checkVideoState);
    videoEl.addEventListener("pause", checkVideoState);
    checkkVideoState();

    function checkVideoProgress() {
      const progress = videoEl.currentTime / videoDuration;
      gsap.set(progressBar, { width: `${progress * 100}%` });
      requestAnimationFrame(checkVideoProgress);
    }
    requestAnimationFrame(checkVideoProgress);
  }

  const mainESGEl = document.querySelector("#mainEsg");
  if (mainESGEl) {
    ScrollTrigger.create({
      trigger: mainESGEl,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: ({ progress }) => {
        gsap.set(mainESGEl.querySelector(".__bg"), {
          yPercent: (1 - progress) * -20,
        });
      },
    });

    ScrollTrigger.create({
      trigger: mainESGEl,
      start: "top 80%",
      end: "bottom bottom",
      onEnter: () => {
        mainESGEl.querySelector(".__bg").classList.add(".__active");
      },
    });

    let esgSwiperInstance = null;
    const esgMM = gsap.matchMedia();

    esgMM.add("(min-width: 1025px)", () => {
      if (esgSwiperInstance) {
        esgSwiperInstance.destroy(true, true);
        esgSwiperInstance = null;
      }
      return () => {};
    });

    esgMM.add("(max-width: 1024px", () => {
      if (!esgSwiperInstance) {
        esgSwiperInstance = newSwiper("#mainEsg .swiper", {
          slidesPerView: "auto",
          freeMode: true,
        });
      }
      return () => {};
    });
  }

  const mainGlobalEl = document.querySelector("#mainGlobal");
  if (mainGlobalEl) {
    ScrollTrigger.create({
      trigger: mainGlobalEl,
      start: "top top",
      end: "bottom bottom",
      pin: mainGlobalEl.querySelector(".visual"),
      pinSpacing: false,
    });

    let globalSwiperInstance = null;
    const globalMM = gsap.matchMedia();
    globalMM.add("(min-width: 1025px)", () => {
      if (globalSwiperInstance) {
        globalSwiperInstance.destroy(true, true);
        globalSwiperInstance = null;
      }
      return () => {};
    });
    globalMM.add("(max-width: 1024px)", () => {
      if (!globalSwiperInstance) {
        globalSwiperInstance = newSwiper("#mainGlobal .swiper", {
          slidesPerView: "auto",
          freeMode: true,
        });
      }
      return () => {};
    });
  }
});

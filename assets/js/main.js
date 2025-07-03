window.addEventListener("SITE_INIT", () => {
  // ---------------------------
  // 기본 변수 및 DOM 캐싱
  // ---------------------------
  const kvMotionVals = { borderRadius: 0, yPercent: 0 };
  const mainKVEl = document.querySelector("#mainKV");
  const videoEl = mainKVEl ? mainKVEl.querySelector(".visual video") : null;
  const videoControllerEl = mainKVEl
    ? mainKVEl.querySelector(".__video-controller")
    : null;
  // ---------------------------
  // MAIN KV: Visual 핀 및 이미지 yPercent 애니메이션
  // ---------------------------
  if (mainKVEl) {
    // 핀 처리
    ScrollTrigger.create({
      trigger: mainKVEl,
      start: "top top",
      end: "bottom bottom",
      pin: mainKVEl.querySelector(".visual"),
      pinSpacing: false,
    });

    // 이미지 yPercent 애니메이션
    ScrollTrigger.create({
      trigger: mainKVEl,
      start: "bottom bottom",
      end: "bottom top",
      onUpdate: ({ progress }) => {
        // #mainKV 내 모든 .visual .__img 요소 캐싱
        const visualImgs = mainKVEl.querySelectorAll(".visual .__img");
        gsap.set(visualImgs, { yPercent: progress * 50 });
      },
    });

    // 배경 borderRadius 및 비디오 제어
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

    // ---------------------------
    // MOTION KV: 타이틀, 위젯 애니메이션
    // ---------------------------

    const kvTitleEl = mainKVEl.querySelector(".__kv-title");
    const kvTitleStrong = kvTitleEl.querySelector("strong");
    const kvTitleDesc = new SplitText(kvTitleStrong, {
      type: "lines,words",
      linesClass: "__line",
      wordsClass: "__word",
    });

    // 초기 상태
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

  // ---------------------------
  // Video Controller: 비디오 컨트롤러
  // ---------------------------
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
    checkVideoState();

    function checkVideoProgress() {
      const progress = videoEl.currentTime / videoDuration;
      gsap.set(progressBar, { width: `${progress * 100}%` });
      requestAnimationFrame(checkVideoProgress);
    }
    requestAnimationFrame(checkVideoProgress);
  }

  // ---------------------------
  // MAIN ESG: Visual 핀, 이미지 yPercent, 그리고 반응형 Swiper 처리
  // ---------------------------
  const mainESGEl = document.querySelector("#mainEsg");
  if (mainESGEl) {
    // 핀 처리
    // ScrollTrigger.create({
    //   trigger: mainESGEl,
    //   start: 'top top',
    //   end: 'bottom bottom',
    //   pin: mainESGEl.querySelector('.visual'),
    //   pinSpacing: false,
    // });

    // 스크롤에 따른 yPercent 애니메이션 (기본: top bottom ~ top top)
    // ScrollTrigger.create({
    //   trigger: mainESGEl,
    //   start: 'top bottom',
    //   end: 'top top',
    //   onUpdate: ({ progress }) => {
    //     // 단일 이미지 요소 캐싱
    //     const esgVisualImg = mainESGEl.querySelector('.visual img');
    //     if (esgVisualImg) {
    //       gsap.set(esgVisualImg, { yPercent: (1 - progress) * -50 });
    //     }
    //   },
    // });

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

    // 배경 도형 인모션
    ScrollTrigger.create({
      trigger: mainESGEl,
      start: "top 80%",
      end: "bottom bottom",
      onEnter: () => {
        mainESGEl.querySelector(".__bg").classList.add("__active");
      },
    });

    // 반응형 처리: 화면 너비에 따라 Swiper 인스턴스 생성 또는 파괴
    let esgSwiperInstance = null;
    const esgMM = gsap.matchMedia();

    esgMM.add("(min-width: 1025px)", () => {
      if (esgSwiperInstance) {
        esgSwiperInstance.destroy(true, true);
        esgSwiperInstance = null;
        console.log("ESG Swiper destroyed for desktop (min-width: 1025px)");
      }
      // 데스크탑일 때 추가 스크롤 애니메이션 (하단 영역)
      // ScrollTrigger.create({
      //   trigger: mainESGEl,
      //   start: 'bottom bottom',
      //   end: 'bottom top',
      //   onUpdate: ({ progress }) => {
      //     const esgVisualImg = mainESGEl.querySelector('.visual img');
      //     if (esgVisualImg) {
      //       gsap.set(esgVisualImg, { yPercent: progress * 50 });
      //     }
      //   }
      // });
      return () => {};
    });

    esgMM.add("(max-width: 1024px)", () => {
      if (!esgSwiperInstance) {
        esgSwiperInstance = new Swiper("#mainEsg .swiper", {
          slidesPerView: "auto",
          freeMode: true,
        });
      }
      return () => {};
    });
  }

  // ---------------------------
  // MAIN GLOBAL: Visual 핀 처리 및 (주석 처리된) 애니메이션 예시
  // ---------------------------
  const mainGlobalEl = document.querySelector("#mainGlobal");
  if (mainGlobalEl) {
    ScrollTrigger.create({
      trigger: mainGlobalEl,
      start: "top top",
      end: "bottom bottom",
      pin: mainGlobalEl.querySelector(".visual"),
      pinSpacing: false,
    });

    // 아래 주석 코드는 예시로 남겨두었음 (필요 시 활성화)
    /*
    ScrollTrigger.create({
      trigger: mainGlobalEl,
      start: 'top bottom',
      end: 'top top',
      onUpdate: ({ progress }) => {
        const width = window.innerWidth * 0.5 + window.innerWidth * 0.5 * progress;
        const left = window.innerWidth * 0.5 - width * 0.5;
        const borderRadius = window.MAX_BORDER_RADIUS * (1 - progress);
        gsap.set(mainGlobalEl, { width: `${width}px`, left: `${left}px`, borderRadius: `${borderRadius}px` });
      }
    });
    */
    // ---------------------------
    // 추가 글로벌 matchMedia 처리 (예: MAIN GLOBAL)
    // ---------------------------
    let globalSwiperInstance = null;
    const globalMM = gsap.matchMedia();
    globalMM.add("(min-width: 1025px)", () => {
      if (globalSwiperInstance) {
        globalSwiperInstance.destroy(true, true);
        globalSwiperInstance = null;
        console.log("Global Swiper destroyed for desktop (min-width: 1025px)");
      }
      // 필요 시 데스크탑 전용 스크롤 애니메이션 등 추가 처리 가능
      return () => {};
    });
    globalMM.add("(max-width: 1024px)", () => {
      if (!globalSwiperInstance) {
        globalSwiperInstance = new Swiper("#mainGlobal .swiper", {
          slidesPerView: "auto",
          freeMode: true,
        });
      }
      return () => {};
    });
  }

  // ---------------------------
  // MAIN NEWS: 배경 borderRadius 애니메이션
  // ---------------------------
  const mainNewsEl = document.querySelector("#mainNews");
  if (mainNewsEl) {
    ScrollTrigger.create({
      trigger: mainNewsEl,
      start: "bottom bottom",
      end: "bottom top",
      onUpdate: window._throttle(({ progress }) => {
        const borderRadius =
          window.MAX_BORDER_RADIUS * Math.min(1, progress * 1.25);
        gsap.set(mainNewsEl, {
          borderBottomRightRadius: `${borderRadius}px`,
          borderBottomLeftRadius: `${borderRadius}px`,
        });
      }, 1000 / 24),
    });
  } else {
    if (mainGlobalEl) {
      ScrollTrigger.create({
        trigger: mainGlobalEl,
        start: "bottom bottom",
        end: "bottom top",
        onUpdate: window._throttle(({ progress }) => {
          const borderRadius =
            window.MAX_BORDER_RADIUS * Math.min(1, progress * 1.25);
          gsap.set(mainGlobalEl, {
            borderBottomRightRadius: `${borderRadius}px`,
            borderBottomLeftRadius: `${borderRadius}px`,
          });
        }, 1000 / 24),
      });
    }
  }

  // ---------------------------
  // MAIN FAMILY: Swiper 및 카테고리 필터 처리
  // ---------------------------
  const mainFamilyEl = document.querySelector("#mainFamily");
  if (mainFamilyEl) {
    const familySwiper = new Swiper("#mainFamily .swiper", {
      freeMode: true,
      slidesPerView: "auto",
    });

    document
      .querySelectorAll("#mainFamily .__categories a")
      .forEach((filterEl) => {
        filterEl.addEventListener("click", (e) => {
          e.preventDefault();
          // 모든 필터 버튼 active 상태 토글
          document
            .querySelectorAll("#mainFamily .__categories a")
            .forEach((aEl) => {
              aEl.classList.toggle("active", aEl === filterEl);
            });
          const cat = filterEl.dataset.cat;
          document
            .querySelectorAll("#mainFamily .family-loops [data-cat]")
            .forEach((item) => {
              item.classList.toggle(
                "__hidden",
                cat !== "all" && item.dataset.cat !== cat
              );
              item.classList.remove("__last");
            });
          const visibleItems = document.querySelectorAll(
            "#mainFamily .family-loops [data-cat]:not(.__hidden)"
          );
          if (visibleItems.length) {
            visibleItems[visibleItems.length - 1].classList.add("__last");
          }
          familySwiper.update();
        });
      });
  }

  // ---------------------------
  // 기타 Swiper 초기화: IR Calendar, Result
  // ---------------------------
  new Swiper("#mainKV .__ir-calendar .swiper", {
    pagination: { el: "#mainKV .__ir-calendar .__pagination" },
  });
  new Swiper("#mainKV .__result .swiper", {
    pagination: { el: "#mainKV .__result .__pagination" },
  });

  // ---------------------------
  // MAIN NOTICE: 배경 애니메이션
  // ---------------------------
  const mainNoticeEl = document.querySelector("#mainNotice");
  if (mainNoticeEl) {
    ScrollTrigger.create({
      trigger: mainNoticeEl,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: ({ progress }) => {
        gsap.set(mainNoticeEl.querySelector(".__bg"), {
          yPercent: (1 - progress) * -80,
        });
      },
    });
  }

  // ---------------------------
  // MOTION: 메인 섹션 헤딩 애니메이션 처리
  // ---------------------------
  document
    .querySelectorAll(".main-section .main-section-heading")
    .forEach((headingEl) => {
      gsap.set(headingEl.querySelector(".__title span"), { yPercent: 120 });
      gsap.set(headingEl.querySelector(".__cta a"), { opacity: 0, y: "2rem" });

      const desc = new SplitText(headingEl.querySelector(".__desc p"), {
        type: "lines,words",
        linesClass: "__line",
        wordsClass: "__word",
      });
      gsap.set(desc.words, { yPercent: 120 });

      const runSectionAnim = () => {
        const tl = gsap.timeline({
          onComplete: () => {
            desc.revert();
          },
        });
        tl.to(headingEl.querySelector(".__title span"), {
          yPercent: 0,
          duration: 1,
          ease: Quart.easeOut,
        });
        desc.lines.forEach((line, i) => {
          tl.to(
            line.querySelectorAll(".__word"),
            { yPercent: 0, duration: 1.6, ease: Quart.easeOut },
            i * 0.2 + 0.2
          );
        });
        tl.to(
          headingEl.querySelector(".__cta a"),
          { opacity: 1, y: 0, duration: 1.6, ease: Quart.easeOut },
          "-=1.2"
        );
      };

      ScrollTrigger.create({
        trigger: headingEl,
        start: "top 80%",
        end: "top top",
        once: true,
        onEnter: runSectionAnim,
        onEnterBack: runSectionAnim,
      });
    });

  // loading 완료
  gsap.to(".loading-splash", {
    autoAlpha: 0,
    duration: 1,
    onComplete: () => {
      document.querySelector(".loading-splash").remove();
    },
  });
});

window.addEventListener("SITE_INIT", () => {
  const lang = document.documentElement.lang
    ? document.documentElement.lang
    : "ko";
  const apiURL = `https://ir.gsifn.io/jbfg/ir2_main_json.php`;
  const irData = fetch(apiURL)
    .then((res) => res.json())
    .then((data) => {
      const stockInfo = data.stockInfo;
      const currentPrice = stockInfo.currentPrice;
      document.querySelector(
        "#mainKV .__stock-info .__jb .__price strong"
      ).innerHTML = convertMoney(currentPrice.price);
      const change = currentPrice.change;
      document
        .querySelector("#mainKV .__stock-info .__jb .__changed span")
        .classList.add(`__${change.direction}`);
      document.querySelector(
        "#mainKV .__stock-info .__jb .__changed span"
      ).innerHTML =
        (change.direction === "up"
          ? "▲"
          : change.direction === "down"
          ? "▼"
          : "- ") +
        convertMoney(Math.abs(change.amount)) +
        " (" +
        change.percent +
        "%)";
      const indices = stockInfo.indices;
      const KOSPI = indices.KOSPI;
      const KOSDAQ = indices.KOSDAQ;
      document
        .querySelector(
          '#mainKV .__stock-info [data-stock="KOSPI"] .__changed span'
        )
        .classList.add(`__${KOSPI.change.direction}`);
      document.querySelector(
        '#mainKV .__stock-info [data-stock="KOSPI"] .__price strong'
      ).innerHTML = convertMoney(KOSPI.indexValue);
      document.querySelector(
        '#mainKV .__stock-info [data-stock="KOSPI"] .__changed span'
      ).innerHTML =
        (KOSPI.change.direction === "up"
          ? "▲"
          : KOSPI.change.direction === "down"
          ? "▼"
          : "- ") +
        convertMoney(Math.abs(KOSPI.change.amount)) +
        " (" +
        KOSPI.change.percent +
        "%)";
      document
        .querySelector(
          '#mainKV .__stock-info [data-stock="KOSDAQ"] .__changed span'
        )
        .classList.add(`__${KOSDAQ.change.direction}`);
      document.querySelector(
        '#mainKV .__stock-info [data-stock="KOSDAQ"] .__price strong'
      ).innerHTML = convertMoney(KOSDAQ.indexValue);
      document.querySelector(
        '#mainKV .__stock-info [data-stock="KOSDAQ"] .__changed span'
      ).innerHTML =
        (KOSDAQ.change.direction === "up"
          ? "▲"
          : KOSDAQ.change.direction === "down"
          ? "▼"
          : "- ") +
        convertMoney(Math.abs(KOSDAQ.change.amount)) +
        " (" +
        KOSDAQ.change.percent +
        "%)";
    });
});

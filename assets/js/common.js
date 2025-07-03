window._throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

window._throttleRAF = (callback) => {
  let ticking = false;
  return function (...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
};

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);
ScrollTrigger.defaults({
  // invalidateOnRefresh: true
});

window.addEventListener("DOMContentLoaded", () => {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    initCommonScroll();
    initCommonHeader();
    initCommonFooter();
    initCommonAnim();
    initCommonSitemap();
    initLazyLoad();
    dispatchEvent(new Event("SITE_INIT"));
    window.domPurify = domPurify;
    domPurify();
  };
  window.addEventListener("load", start);
  setTimeout(start, 1000);
});

window.disableWindowScroll = function () {
  if (window.lenis) window.lenis.stop();
  else document.documentElement.classList.add("prevent-scroll");
};
window.enableWindowScroll = function () {
  if (window.lenis) window.lenis.start();
  else document.documentElement.classList.remove("prevent-scroll");
};

function initLenis() {
  window.lenis = new Lenis();
  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function initCommonScroll() {
  const $header = document.querySelector("#header");

  initLenis();
  let lastScrollY = 0;
  let scrollDirection = 0;
  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY;

    if (window.lenis) {
      scrollDirection = lenis.direction;
    } else {
      scrollDirection =
        scrollY > lastScrollY ? 1 : scrollY < lastScrollY ? -1 : 0;
      lastScrollY = scrollY;
    }

    $header.classList.toggle("opaque", scrollY > window.innerHeight * 0.3);
    if (!$header.classList.contains("show-sitemap")) {
      $header.classList.toggle(
        "hide",
        scrollDirection === 1 && scrollY > window.innerHeight * 0.6
      );
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
}

function initCommonHeader() {
  // 주요 DOM 요소 캐싱 및 null 체크
  const $header = document.querySelector("#header");
  if (!$header) return;

  const $submenus = $header.querySelectorAll(".submenu");
  const $jbFamily = $header.querySelector("#jbFamily");
  const $btnFamily = $header.querySelector(".utils .family a");
  const $sitemap = $header.querySelector("#sitemap");
  const $btnSitemap = $header.querySelector(".utils .sitemap a");
  const $nav = $header.querySelector("#nav");

  // [data-theme] 요소에 대해 ScrollTrigger 생성 (header 자체는 제외)
  const themeElements = document.querySelectorAll("[data-theme]");
  themeElements.forEach(($el, index) => {
    if ($el !== $header) {
      const theme = $el.dataset.theme;
      ScrollTrigger.create({
        trigger: $el,
        start: "top top",
        end: "bottom top",
        onEnter: () => {
          $header.dataset.theme = theme;
        },
        onEnterBack: () => {
          $header.dataset.theme = theme;
        },
      });
      // 첫 번째 요소의 테마를 기본값으로 설정
      if (index === 1) {
        //console.log('index', index);
        $header.dataset.theme = theme;
      }
    }
  });

  // 서브메뉴 높이를 계산하여 CSS 변수에 반영하는 함수
  function onResize() {
    if (window.innerWidth > 1279) {
      // tablet에서 gnb 오류로 인해 추가
      let submenuHeight = 0;
      $submenus.forEach(($submenu) => {
        const ul = $submenu.querySelector("ul");
        if (!ul) return;
        // 임시로 auto를 설정해 자연 높이를 구한 후 원래 값으로 되돌림
        ul.style.height = "auto";
        submenuHeight = Math.max(submenuHeight, ul.clientHeight);
        ul.style.height = "";
      });
      $header.style.setProperty("--submenu-height", submenuHeight + "px");
    }
  }

  // 내비게이션 영역에 마우스 진입/이탈 시 메뉴 표시/숨김 처리
  if ($nav) {
    $nav.addEventListener("mouseenter", () => {
      onResize();
      $header.classList.add("show-menu");
    });
    $nav.addEventListener("mouseleave", () => {
      $header.classList.remove("show-menu");
    });
  }

  // jbFamily 토글 처리
  if ($btnFamily && $jbFamily) {
    $btnFamily.addEventListener("click", (e) => {
      const windowHeight = window.innerHeight;
      e.preventDefault();
      $header.classList.add("show-jb-family");
      gsap.delayedCall(0.5, () => {
        window.disableWindowScroll();
        $jbFamily.classList.add("active");
        gsap.to($jbFamily, {
          height: windowHeight,
          duration: 0.5,
          ease: "power2.out",
        });
      });
    });

    const $jbFamilyToggle = $jbFamily.querySelector(".toggle");
    if ($jbFamilyToggle) {
      $jbFamilyToggle.addEventListener("click", (e) => {
        e.preventDefault();
        $header.classList.remove("show-jb-family");
        $jbFamily.classList.remove("active");
        window.enableWindowScroll();
        // 필요시 gsap.delayedCall로 후속 작업 추가 가능
        gsap.delayedCall(0.3, () => {
          gsap.to($jbFamily, { height: 0, duration: 0.5, ease: "power2.out" });
        });
      });
    }
  }

  // sitemap 토글 처리
  if ($btnSitemap && $sitemap) {
    $btnSitemap.addEventListener("click", (e) => {
      e.preventDefault();
      $header.classList.add("show-sitemap");
      const windowHeight = window.innerHeight;
      gsap.delayedCall(0.5, () => {
        window.disableWindowScroll();
        document.documentElement.classList.add("prevent-scroll");
        $sitemap.classList.add("active");
        gsap.to($sitemap, {
          height: windowHeight,
          duration: 0.5,
          ease: "power2.out",
        });
      });
    });

    const $sitemapToggle = $sitemap.querySelector(".toggle");
    if ($sitemapToggle) {
      $sitemapToggle.addEventListener("click", (e) => {
        e.preventDefault();
        $header.classList.remove("show-sitemap");
        $sitemap.classList.remove("active");
        document.documentElement.classList.remove("prevent-scroll");
        window.enableWindowScroll();
        // 필요시 gsap.delayedCall로 후속 작업 추가 가능
        gsap.delayedCall(0.3, () => {
          gsap.to($sitemap, { height: 0, duration: 0.5, ease: "power2.out" });
        });
      });
    }
  }

  // resize 이벤트 리스너 등록 및 초기 호출
  window.addEventListener("resize", onResize);
  onResize();

  if (
    document.querySelector(".subpage-content-wrapper") &&
    document
      .querySelector(".subpage-content-wrapper")
      .classList.contains("no-page-header")
  ) {
    $header.classList.add("force-opaque");
  }
}

function initCommonFooter() {
  // 주요 DOM 요소 캐싱 및 유효성 검사
  const $footer = document.querySelector("#footer");
  if (!$footer) return;

  // 상단으로 스크롤하는 버튼과 footer 내부 요소 캐싱
  const $topButton = $footer.querySelector(".top");
  const $footerInner = $footer.querySelector(".footer-inner");

  // [상단 스크롤] 클릭 시 애니메이션 처리
  $topButton &&
    $topButton.addEventListener("click", (e) => {
      e.preventDefault();
      const scrollY = window.scrollY;
      gsap.killTweensOf(window);
      // 스크롤 거리에 따라 duration 조절 (최대 1초)
      const duration = Math.min(1, Math.abs(scrollY / 1000));
      gsap.to(window, {
        scrollTo: 0,
        duration: duration,
        ease: Quad.easeInOut,
      });
    });

  // body의 data-page 값에 따라 footer 애니메이션 처리
  const bodyPage = document.body.dataset.page;
  // family sites 토글/드롭다운은 아래에서 캐싱하므로 미리 선언
  const $familySitesDropdown = $footer.querySelector(".family-sites-dropdown");
  const $familySitesToggle = $footer.querySelector(".family-sites-toggle");

  if (document.querySelector("#mainNotice") === null) {
    ScrollTrigger.create({
      trigger: $footer,
      start: "top bottom",
      end: "bottom bottom",
      onLeaveBack: () => {
        // family sites 관련 active 클래스를 제거
        $familySitesToggle && $familySitesToggle.classList.remove("active");
        $familySitesDropdown && $familySitesDropdown.classList.remove("active");
      },
      onUpdate: (self) => {
        const progress = self.progress;
        // $footerInner는 미리 캐싱한 요소 사용
        $footerInner &&
          gsap.set($footerInner, {
            yPercent: (1 - progress) * -50,
            opacity: progress * 2,
          });
      },
    });

    // 게시글 페이지에서 느리게 불러와졌을때 시간차로인해 refresh 추가
    const editorContent = document.querySelector(".editor-content");
    if (editorContent) {
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
      resizeObserver.observe(editorContent);
    }
  }

  // 최대 border-radius 값을 전역 변수에 저장 (resize 시 업데이트)
  window.MAX_BORDER_RADIUS = 0;
  let resizeRaf;
  function updateMaxBorderRadius() {
    if ($footerInner) {
      const styles = getComputedStyle($footerInner);
      window.MAX_BORDER_RADIUS = parseFloat(styles.borderTopRightRadius) || 0;
    }
  }
  function onResize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(updateMaxBorderRadius);
  }
  window.addEventListener("resize", onResize);
  onResize();

  // family sites 드롭다운을 body로 이동하여 레이어 최상단에 배치
  $familySitesDropdown && document.body.append($familySitesDropdown);

  // family sites 드롭다운 숨김 처리 이벤트 핸들러
  function hideFamilySitesDropdownEvent(e) {
    if (
      $familySitesToggle &&
      $familySitesDropdown &&
      ($familySitesToggle.contains(e.target) ||
        $familySitesDropdown.contains(e.target))
    ) {
      return;
    }
    $familySitesToggle && $familySitesToggle.classList.remove("active");
    $familySitesDropdown && $familySitesDropdown.classList.remove("active");
    // 이벤트 핸들러 제거
    window.removeEventListener("mouseup", hideFamilySitesDropdownEvent);
    window.removeEventListener("touchstart", hideFamilySitesDropdownEvent);
    window.removeEventListener("wheel", hideFamilySitesDropdownEvent);
  }

  // family sites 토글 클릭 이벤트 처리
  $familySitesToggle &&
    $familySitesToggle.addEventListener("click", (e) => {
      e.preventDefault();
      $familySitesToggle.classList.toggle("active");
      $familySitesDropdown &&
        $familySitesDropdown.classList.toggle(
          "active",
          $familySitesToggle.classList.contains("active")
        );
      if ($familySitesToggle.classList.contains("active")) {
        // 드롭다운 위치 업데이트 시작
        checkFamilySitesDropdown();
        // 드롭다운 외부 클릭, 터치, 휠 이벤트 발생 시 드롭다운 숨김 처리
        window.addEventListener("mouseup", hideFamilySitesDropdownEvent, {
          passive: true,
        });
        window.addEventListener("touchstart", hideFamilySitesDropdownEvent, {
          passive: true,
        });
        window.addEventListener("wheel", hideFamilySitesDropdownEvent, {
          passive: true,
        });
      }
    });

  // family sites 토글의 위치/크기 정보를 CSS 변수로 지속 업데이트
  function checkFamilySitesDropdown() {
    if (!$familySitesToggle || !$familySitesDropdown) return;
    const rect = $familySitesToggle.getBoundingClientRect();
    // CSS 변수로 top, left, width 값 업데이트
    $familySitesDropdown.style.setProperty("--top", rect.top + "px");
    $familySitesDropdown.style.setProperty("--left", rect.left + "px");
    $familySitesDropdown.style.setProperty("--width", rect.width + "px");
    // 토글이 active 상태이면 계속 업데이트 (애니메이션이 있을 경우 실시간 반영)
    if ($familySitesToggle.classList.contains("active")) {
      requestAnimationFrame(checkFamilySitesDropdown);
    }
  }
}

function initCommonAnim() {
  // data-anims 속성을 가진 모든 요소에 대해 초기화 및 ScrollTrigger 생성
  document.querySelectorAll("[data-anims]").forEach(($el) => {
    const offset = $el.dataset.offset || "80%";
    initAnim($el);
    ScrollTrigger.create({
      trigger: $el,
      start: `top ${offset}`,
      end: "top top",
      once: true,
      onEnter: () => execAnim($el),
      onEnterBack: () => execAnim($el),
    });
  });

  // 각 요소 내부의 data-anim 애니메이션 초기화
  function initAnim($el) {
    gsap.set($el, { opacity: 1 });
    const animItems = $el.querySelectorAll("[data-anim]");
    animItems.forEach(($animItem, index) => {
      const anim = $animItem.dataset.anim;
      if (anim === "fadein") {
        gsap.set($animItem, { opacity: 0 });
      } else if (anim === "count") {
        // count 애니메이션의 경우 SplitText를 사용하여 문자 단위로 분리 후, 숫자인 문자에 data-num 속성을 부여
        const splitText = new SplitText($animItem, {
          type: "chars",
          tag: "span",
        });
        const nums = [];
        splitText.chars.forEach((char) => {
          if (!isNaN(char.textContent)) {
            const num = parseInt(char.textContent, 10);
            nums.push(num);
            char.setAttribute("data-num", num);
          }
        });
        // originValue에 원래의 숫자 문자열을 저장
        $animItem.originValue = nums.join("");
        // count 애니메이션의 초기 상태로 opacity 0 설정 (필요한 경우)
        gsap.set($animItem, { opacity: 0 });
      } else if (anim === "from-right-o") {
        gsap.set($animItem, { xPercent: 100, scale: 2 });
      } else {
        gsap.set($animItem, { opacity: 0, y: "2rem" });
      }
    });
  }

  // 실제 애니메이션 실행 (타임라인으로 처리)
  function execAnim($el) {
    const tl = gsap.timeline({
      onComplete: () => {
        // 애니메이션 완료 후 data-anims와 data-anim 속성을 제거하여 재실행 방지
        $el.removeAttribute("data-anims");
        $el.querySelectorAll("[data-anim]").forEach(($animItem) => {
          gsap.set($animItem, { clearProps: "all" });
          $animItem.removeAttribute("data-anim");
        });
      },
    });
    const animItems = $el.querySelectorAll("[data-anim]");
    animItems.forEach(($animItem, index) => {
      // data-delay가 설정되어 있으면 사용, 없으면 인덱스에 따른 기본 지연값 적용
      const delay = parseFloat($animItem.dataset.delay) || index * 0.125;
      const anim = $animItem.dataset.anim;
      if (anim === "count") {
        // count 애니메이션: 먼저 opacity 애니메이션 추가
        tl.to(
          $animItem,
          { opacity: 1, duration: 1.4, ease: Quint.easeOut },
          delay
        );
        // originValue의 길이만큼 0으로 채운 배열 생성, 첫 번째 숫자만 1로 초기화
        const len = $animItem.originValue.length;
        const startValueArr = Array(len).fill(0);
        startValueArr[0] = 1;
        $animItem.animValue = parseInt(startValueArr.join(""), 10);

        // [data-num] 요소들을 미리 캐싱하여 onUpdate 내부에서 반복 DOM 조회를 줄임
        const $numEls = $animItem.querySelectorAll("[data-num]");
        gsap.to($animItem, {
          animValue: parseInt($animItem.originValue, 10),
          duration: 2,
          delay: delay,
          ease: Quad.easeOut,
          onUpdate: () => {
            // animValue의 현재 값을 문자열로 변환하여 각 data-num 요소에 적용
            const currentValueStr = $animItem.animValue.toString();
            $numEls.forEach(($num, i) => {
              $num.textContent = currentValueStr[i] || "";
            });
          },
        });
      } else if (anim === "from-right-o") {
        tl.to(
          $animItem,
          { xPercent: 0, scale: 1, duration: 2, ease: Quart.easeOut },
          delay
        );
      } else {
        tl.to(
          $animItem,
          { opacity: 1, y: 0, duration: 1.4, ease: Quint.easeOut },
          delay
        );
      }
    });
  }

  // 페이지 헤더 애니메이션: 스크롤 진행에 따라 이미지의 yPercent 값을 변경
  const $pageHeader = document.querySelector(".section.page-header");
  if ($pageHeader) {
    const visualImg = $pageHeader.querySelector(".visual .img");
    if (visualImg) {
      ScrollTrigger.create({
        trigger: $pageHeader,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(visualImg, { yPercent: progress * 50 });
        },
      });
    }
  }

  document.querySelectorAll('[data-btn="label-flip"]').forEach(($el) => {
    $el.addEventListener("mouseenter", () => {
      $el.classList.add("active");
    });
    $el.addEventListener("mouseleave", () => {
      $el.classList.remove("active");
    });
  });
}

function initCommonSitemap() {
  const sitemap = document.getElementById("sitemap");
  if (!sitemap) return;

  // menu-group 요소들을 미리 캐싱합니다.
  const menuGroups = Array.from(sitemap.querySelectorAll(".menu-group"));

  // breadcrumb에서 메뉴명 찾아서 해당페이지 active (존재하는 경우)
  const depth1 = document.querySelector(".breadcrumb ul li:nth-child(3)");
  const depth2 = document.querySelector(".breadcrumb ul li:nth-child(5)");
  let foundActiveMenu = false;

  if (depth1) {
    const depth1Text = depth1.querySelector("span")?.textContent.trim() || "";
    const depth2Text = depth2
      ? depth2.querySelector("span")?.textContent.trim()
      : "";

    // 각 menuGroup 순회
    menuGroups.forEach((menuGroup) => {
      const menuName = menuGroup.querySelector(".__menu-name");

      if (menuName && menuName.textContent.trim() === depth1Text) {
        menuGroup.classList.add("active");

        // 해당 menuGroup의 메뉴 항목들을 순회
        const menuItems = menuGroup.querySelectorAll(".__menu > li");
        menuItems.forEach((item) => {
          const itemText =
            item.querySelector("a > span")?.textContent.trim() || "";
          if (itemText === depth2Text) {
            item.classList.add("active");

            // 탭 메뉴에서 활성화된 depth3 요소를 찾음
            const depth3Elem = document.querySelector(".tab-menu .active");
            if (depth3Elem) {
              const depth3Text =
                depth3Elem.querySelector("span")?.textContent.trim() || "";
              // menuGroup 내의 depth3 항목들 순회
              const depth3Items = menuGroup.querySelectorAll(
                ".__menu > li > ul > li"
              );
              depth3Items.forEach((depth3Item) => {
                const depth3ItemText =
                  depth3Item.querySelector("a > span")?.textContent.trim() ||
                  "";
                if (
                  !depth3ItemText.startsWith("#") &&
                  depth3ItemText === depth3Text
                ) {
                  depth3Item.classList.add("active");
                }
              });
            }
          }
        });
        foundActiveMenu = true;
      } else {
        menuGroup.classList.remove("active");
      }
    });
  }

  if (!foundActiveMenu && menuGroups.length) {
    menuGroups[0].classList.add("active");
  }

  // 각 메뉴 그룹의 메뉴 이름(__menu-name) 클릭 이벤트 처리
  menuGroups.forEach((menuGroup) => {
    const menuName = menuGroup.querySelector(".__menu-name");
    if (menuName) {
      menuName.addEventListener("click", (e) => {
        e.preventDefault();
        // 미리 캐싱한 menuGroups 배열을 사용하여 active 클래스 토글
        menuGroups.forEach((item) => {
          item.classList.toggle("active", item === menuGroup);
        });
      });
    }
  });

  // __has-children > a 요소의 클릭 이벤트는 이벤트 위임을 사용하여 한 번에 처리합니다.
  sitemap.addEventListener("click", (e) => {
    const target = e.target;
    // 클릭된 요소가 __has-children > a 인지 체크
    if (target.matches(".__has-children > a")) {
      e.preventDefault();
      // 부모 요소의 active 클래스 토글
      target.parentElement.classList.toggle("active");
    }
  });
}

function initLazyLoad() {
  const handleLazyLoad = (config = {}) => {
    // lazy 속성이 "lazy"인 모든 이미지 배열 생성
    const lazyImages = gsap.utils.toArray("img[loading='lazy']");

    // lazy 이미지가 없다면 즉시 ScrollTrigger를 갱신
    if (!lazyImages.length) {
      ScrollTrigger.refresh();
      return;
    }

    // 설정 값 및 모드
    const timeoutDuration = config.timeout || 1;
    const lazyMode = config.lazy !== false;
    let remainingImages = lazyImages.length;

    // lazy 모드일 경우, 마지막 이미지 로드 후 일정 시간 뒤 ScrollTrigger.refresh()를 호출하는 타이머
    const refreshTimeout = gsap
      .delayedCall(timeoutDuration, ScrollTrigger.refresh)
      .pause();

    // 이미지가 로드될 때마다 호출되는 콜백 함수
    const onImageLoad = () => {
      if (lazyMode) {
        // lazy 모드인 경우, 타이머를 재시작하여 이미지 로드가 끝난 후 일정 시간이 지나면 갱신
        refreshTimeout.restart(true);
      } else {
        // eager 모드인 경우, 모든 이미지가 로드되면 갱신
        remainingImages--;
        if (remainingImages <= 0) {
          ScrollTrigger.refresh();
        }
      }
    };

    // 각 이미지에 대해 처리
    lazyImages.forEach((img) => {
      // lazy 모드가 아니라면 로딩 방식을 eager로 변경
      if (!lazyMode) {
        img.loading = "eager";
      }
      // 이미지가 이미 로드되었으면 바로 콜백 호출, 아니면 load 이벤트에 등록 (once 옵션 사용)
      if (img.naturalWidth) {
        onImageLoad();
      } else {
        img.addEventListener("load", onImageLoad, { once: true });
      }
    });
  };

  // 예시: lazy 모드를 끄고(timeout: 1초) eager 로딩하도록 처리
  handleLazyLoad({ lazy: true, timeout: 1 });
}

function convertMoney(money) {
  return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/*** detail 페이지 style reset 처리 ***/
function domPurify() {
  if (document.querySelector(".editor-content")) {
    const target = document.querySelector(".editor-content");
    const allowedTags = [
      "h1",
      "h2",
      "h3",
      "h4",
      "div",
      "p",
      "span",
      "img",
      "br",
      "strong",
      "em",
      "li",
      "ol",
      "table",
      "colgroup",
      "col",
      "caption",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "iframe",
      "sub",
      "sup",
      "a",
    ];
    const allowedCssProps = [
      "color",
      "font-weight",
      "text-decoration",
      "text-align",
    ];

    const originalContent = target.innerHTML;
    const cleanData = sanitizeHtmlContent(
      originalContent,
      allowedTags,
      allowedCssProps
    );
    target.innerHTML = cleanData;

    function sanitizeHtmlContent(htmlData, allowedTags, allowedCssProps) {
      if (typeof window === "undefined") {
        return;
      }
      const storedStyles = new WeakMap();
      const storedAttributes = new WeakMap();

      // 원본 스타일과 속성 저장
      DOMPurify.addHook("beforeSanitizeElements", (node) => {
        if (node.nodeType === 1) {
          // 스타일 저장
          if (node.hasAttribute("style")) {
            storedStyles.set(node, node.getAttribute("style"));
          }

          // 이미지 태그 속성 저장
          if (node.tagName === "IMG") {
            const attrs = {
              src: node.getAttribute("src"),
              alt: node.getAttribute("alt"),
            };
            storedAttributes.set(node, attrs);
          }
        }
      });

      // 허용된 스타일과 속성 복원
      DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if (node.nodeType === 1) {
          // 스타일 복원
          if (storedStyles.has(node)) {
            const originalStyle = storedStyles.get(node);
            const filteredStyles = originalStyle
              .split(";")
              .map((style) => style.trim())
              .filter((style) => {
                const [key] = style
                  .split(":")
                  .map((item) => item.trim().toLowerCase());
                return allowedCssProps.includes(key) || key.startsWith("--");
              })
              .join("; ");

            if (filteredStyles) {
              node.setAttribute("style", filteredStyles);
            } else {
              node.removeAttribute("style");
            }
          }

          // 미디어 태그 속성 복원
          if (storedAttributes.has(node)) {
            const attrs = storedAttributes.get(node);

            // src와 alt 속성 복원
            if (attrs.src) {
              node.setAttribute("src", attrs.src);
            }
            if (attrs.alt) {
              node.setAttribute("alt", attrs.alt);
            }
          }
        }
      });

      const domPurifyOptions = {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: [
          "style",
          "id",
          "class",
          "href",
          "target",
          "title",
          "src",
          "alt",
          "type",
          "width",
          "height",
          "colspan",
          "rowspan",
        ],
      };

      return DOMPurify.sanitize(htmlData, domPurifyOptions);
    }
  }
}

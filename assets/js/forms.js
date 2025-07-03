document.addEventListener("DOMContentLoaded", () => {
  initCustomSelect();
  initFiles();
});

/**
 * 커스텀 셀렉트 초기화
 */
function initCustomSelect() {
  document.querySelectorAll("select").forEach((selectEl) => {
    // 커스텀 셀렉트 구조 생성
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";

    const selectedOption = document.createElement("div");
    selectedOption.className = "custom-select-selected";
    selectedOption.textContent = selectEl.options[selectEl.selectedIndex].text;

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "custom-select-options";
    const optionsBox = document.createElement("div");
    optionsBox.className = "custom-select-options-box";
    optionsContainer.appendChild(optionsBox);
    const optionsContainerInner = document.createElement("div");
    optionsContainerInner.className = "custom-select-options-inner";
    optionsContainerInner.setAttribute("data-lenis-prevent", "true");
    optionsBox.appendChild(optionsContainerInner);
    const optionsList = document.createElement("ul");
    optionsContainerInner.appendChild(optionsList);

    // 원본 select의 각 옵션을 커스텀 옵션으로 생성
    Array.from(selectEl.options).forEach((optionEl) => {
      const optionDiv = document.createElement("li");
      optionDiv.textContent = optionEl.text;
      optionDiv.dataset.value = optionEl.value;
      optionDiv.addEventListener("click", () => {
        // 선택 시 텍스트 갱신 및 change 이벤트 트리거
        selectedOption.textContent = optionDiv.textContent;
        selectEl.value = optionDiv.dataset.value;
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        wrapper.classList.remove("open");
      });
      optionsList.appendChild(optionDiv);
    });

    // 선택된 옵션 클릭 시 열림/닫힘 토글
    selectedOption.addEventListener("click", (e) => {
      // 클릭 이벤트가 다른 곳으로 전파되지 않도록 함
      e.stopPropagation();
      // 다른 열린 커스텀 셀렉트를 닫음
      document.querySelectorAll(".custom-select").forEach((cs) => {
        if (cs !== wrapper) cs.classList.remove("open");
      });
      wrapper.classList.toggle("open");
    });

    // 구조 조립 및 원본 select 숨김 처리
    wrapper.appendChild(selectedOption);
    wrapper.appendChild(optionsContainer);
    selectEl.style.display = "none";
    selectEl.parentNode.insertBefore(wrapper, selectEl);
  });

  // 문서 클릭 시 열린 커스텀 셀렉트 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select")) {
      document
        .querySelectorAll(".custom-select")
        .forEach((cs) => cs.classList.remove("open"));
    }
  });
}

/**
 * __files 토글 초기화
 */
function initFiles() {
  // 각 .__files 요소 내부의 토글 버튼에 클릭 이벤트 등록
  document.querySelectorAll(".__files").forEach((fileEl) => {
    const toggle = fileEl.querySelector(".__toggle");
    if (toggle) {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        // 다른 열린 파일 영역은 닫기
        document.querySelectorAll(".__files").forEach((el) => {
          if (el !== fileEl) el.classList.remove("open");
        });
        fileEl.classList.toggle("open");
      });
    }
  });

  // 문서 클릭 시 .__files 영역 외부를 클릭하면 모든 영역 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".__files")) {
      document
        .querySelectorAll(".__files")
        .forEach((el) => el.classList.remove("open"));
    }
  });
}

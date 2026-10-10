
document.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.getElementById("registerButton");
  const registerOverlay = document.getElementById("registerOverlay");
  const closeRegister = document.getElementById("closeRegister");
  const overlayBackdrop = document.querySelector(".overlay-backdrop");

  const registerLink = document.getElementById("registerLink");
  const registerPhoto = document.getElementById("registerPhoto");
  const photoInput = document.getElementById("photoInput");

  // ==========================================
  // REGISTER MENU
  // ==========================================

  if (registerButton && registerOverlay && closeRegister) {
    let previousFocus = null;

    function openRegisterMenu() {
      previousFocus = document.activeElement;

      registerOverlay.classList.add("is-open");
      registerOverlay.setAttribute("aria-hidden", "false");
      registerButton.setAttribute("aria-expanded", "true");
      registerButton.style.visibility = "hidden";

      closeRegister.focus();
    }

    function closeRegisterMenu() {
      registerOverlay.classList.remove("is-open");
      registerOverlay.setAttribute("aria-hidden", "true");
      registerButton.setAttribute("aria-expanded", "false");
      registerButton.style.visibility = "visible";

      previousFocus?.focus();
    }

    registerButton.addEventListener("click", openRegisterMenu);
    closeRegister.addEventListener("click", closeRegisterMenu);

    overlayBackdrop?.addEventListener(
      "click",
      closeRegisterMenu
    );

    document.addEventListener("keydown", (event) => {
      if (!registerOverlay.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeRegisterMenu();
      }

      if (event.key === "Tab") {
        const focusable = [
          registerLink,
          registerPhoto,
          closeRegister
        ].filter(Boolean);

        const currentIndex = focusable.indexOf(
          document.activeElement
        );

        if (event.shiftKey && currentIndex <= 0) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (
          !event.shiftKey &&
          currentIndex === focusable.length - 1
        ) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    });

    // 링크 클릭 → link.html 이동
    registerLink?.addEventListener("click", () => {
      window.location.href = "./link.html";
    });

    // 사진/카메라 → 파일 선택
    registerPhoto?.addEventListener("click", () => {
      closeRegisterMenu();
      photoInput?.click();
    });

    photoInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      // 선택된 파일을 추후 업로드 기능에 연결
      console.log("선택한 이미지:", file);

      photoInput.value = "";
    });
  }

  // ==========================================
  // RANKING CAROUSEL
  // ==========================================

  const rankingTrack = document.getElementById("rankingTrack");

  if (!rankingTrack) return;

  // 임시 랭킹 데이터
  // 실제 API 연동 시 이 배열을 서버 응답으로 교체
  const rankings = [
    "디올 어딕트 립 글로우",
    "샤넬 루쥬 코코 밤",
    "맥(MAC) 러스터글래스 샤인 립스틱",
    "롬앤 쥬시 래스팅 틴트",
    "탬버린즈 퍼퓸",
    "이솝 레저렉션 핸드 밤",
    "조말론 잉글리쉬 페어 앤 프리지아",
    "입생로랑 러브샤인 립스틱",
    "논픽션 젠틀 나잇",
    "헤라 센슈얼 누드 글로스"
  ];

  const rankingItems = rankings.map((name, index) => ({
    rank: index + 1,
    name
  }));

  // 마지막 → 첫 번째 전환을 자연스럽게 하기 위한 복제
  const displayItems = [
    ...rankingItems,
    rankingItems[0]
  ];

  rankingTrack.innerHTML = displayItems
    .map(
      (item) => `
        <div class="ranking-slide">
          <span class="ranking-number">${item.rank}</span>
          <p class="ranking-product">${item.name}</p>
        </div>
      `
    )
    .join("");

  let currentIndex = 0;
  const interval = 2000;
  const animationDuration = 500;

  function moveRanking() {
    currentIndex += 1;

    rankingTrack.style.transition =
      `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    rankingTrack.style.transform =
      `translateY(-${currentIndex * 100}%)`;

    // 10위 → 1위 자연스러운 무한 반복
    if (currentIndex === rankingItems.length) {
      setTimeout(() => {
        rankingTrack.style.transition = "none";
        rankingTrack.style.transform = "translateY(0)";
        currentIndex = 0;
      }, animationDuration);
    }
  }

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(moveRanking, interval);
  }
});

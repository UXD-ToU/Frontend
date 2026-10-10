document.addEventListener("DOMContentLoaded", async () => {
  const navbarRoot = document.getElementById("navbar-root");

  if (!navbarRoot) return;

  try {
    const response = await fetch(
      "../components/navbar/navbar.html"
    );

    if (!response.ok) {
      throw new Error("NavBar HTML 로딩 실패");
    }

    const html = await response.text();

    navbarRoot.innerHTML = html;

    // 현재 페이지 확인
    const currentPage =
      window.location.pathname.split("/").pop();

    const pageMap = {
      "Home.html": "home"
    };

    const activePage = pageMap[currentPage];

    const navItems = navbarRoot.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
      const isActive = item.dataset.page === activePage;

      item.classList.toggle("active", isActive);

      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }

      // 홈 이외의 메뉴
      if (item.dataset.page !== "home") {
        item.addEventListener("click", () => {
          alert("준비 중인 기능입니다.");
        });
      }
    });

  } catch (error) {
    console.error("NavBar 오류:", error);
  }
});
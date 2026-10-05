document.addEventListener("DOMContentLoaded", () => {

  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const homeBtn =
    document.getElementById(
      "homeBtn"
    );

  const continueBtn =
    document.getElementById(
      "continueBtn"
    );


  backBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "./Present-List.html";

    }
  );


  homeBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "./Present-List.html";

    }
  );


  continueBtn.addEventListener(
    "click",
    () => {

      sessionStorage.removeItem(
        "presentDraft"
      );

      sessionStorage.removeItem(
        "presentMode"
      );

      sessionStorage.removeItem(
        "editPresent"
      );


      window.location.href =
        "./Present-Photo.html";

    }
  );

});
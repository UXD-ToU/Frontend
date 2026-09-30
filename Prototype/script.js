const button = document.getElementById("button");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  message.textContent = "버튼이 정상적으로 작동합니다!";
});
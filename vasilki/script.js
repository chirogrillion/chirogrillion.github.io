function burgerMenu() {
  document.getElementById("burger-button").classList.toggle("pressed");
  document.getElementById("burger-menu").classList.toggle("visible");
}

function scrollToTop() {
  document.getElementById("burger-button").classList.remove("pressed");
  document.getElementById("burger-menu").classList.remove("visible");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
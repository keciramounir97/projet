document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("orderForm");
  const emailInput = document.getElementById("emailInput");
  const formFeedback = document.getElementById("formFeedback");

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();

      if (email) {
        // Mocking successful elite lead submission
        formFeedback.style.color = "#00d2ff";
        formFeedback.textContent =
          "Merci ! Votre accès privilège a été enregistré. Un conseiller vous contactera sous peu.";
        orderForm.reset();
      } else {
        formFeedback.style.color = "#ff4d4d";
        formFeedback.textContent = "Veuillez saisir une adresse email valide.";
      }
    });
  }
});

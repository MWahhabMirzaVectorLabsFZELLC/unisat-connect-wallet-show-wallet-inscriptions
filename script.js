document.addEventListener("DOMContentLoaded", () => {
  const connectWalletBtn = document.getElementById("connectWalletBtn");
  const walletAddressSpan = document.getElementById("walletAddress");
  const walletBalanceSpan = document.getElementById("walletBalance");
  const inscriptionsList = document.getElementById("inscriptionsList");
  const unisatPopup = document.getElementById("unisatPopup");
  const closePopupBtn = document.getElementById("closePopupBtn");

  connectWalletBtn.addEventListener("click", async () => {
    try {
      if (typeof window.unisat !== 'undefined') {
        const accounts = await window.unisat.requestAccounts();
        const address = accounts[0]; // Assuming the first account is the active one
        walletAddressSpan.textContent = address;

        const balance = await window.unisat.getBalance();
        walletBalanceSpan.textContent = balance.total;

        const inscriptions = await window.unisat.getInscriptions(0, 10);
        inscriptions.list.forEach(inscription => {
          const li = document.createElement("li");
          li.textContent = `Inscription ID: ${inscription.inscriptionId}, Content: ${inscription.content}`;
          inscriptionsList.appendChild(li);
        });
      } else {
        unisatPopup.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error connecting to UniSat Wallet:', error);
    }
  });

  closePopupBtn.addEventListener("click", () => {
    unisatPopup.style.display = 'none';
  });
});

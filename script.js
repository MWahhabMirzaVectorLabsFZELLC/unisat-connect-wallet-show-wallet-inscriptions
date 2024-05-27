document.addEventListener("DOMContentLoaded", () => {
  const connectWalletBtn = document.getElementById("connectWalletBtn");
  const walletAddressSpan = document.getElementById("walletAddress");
  const walletBalanceSpan = document.getElementById("walletBalance");
  const inscriptionsList = document.getElementById("inscriptionsList");
  const noInscriptionsMessage = document.getElementById("noInscriptionsMessage");
  const popup = document.getElementById("popup"); // Reference to the popup

  let connectedAddress = null; // Store the connected address

  connectWalletBtn.addEventListener("click", async () => {
    try {
      if (typeof window.unisat !== 'undefined') {
        const accounts = await window.unisat.requestAccounts();
        const address = accounts[0]; // Assuming the first account is the active one
        walletAddressSpan.textContent = address;
        connectedAddress = address; // Store the connected address

        const balance = await window.unisat.getBalance();
        walletBalanceSpan.textContent = balance.total;

        // Clear previous inscriptions and messages before fetching new ones
        inscriptionsList.innerHTML = '';
        noInscriptionsMessage.style.display = 'none';
        
        // Hide the popup if it's currently displayed
        popup.style.display = 'none';

        displayConnectedAccountInscriptions();
      } else {
        // Show the popup if UniSat Wallet is not installed
        popup.style.display = 'block';
      }
    } catch (error) {
      if (error.code === 4001) {
        // User rejected the connection request
        console.log('User rejected the connection request.');
        // Optionally, display a message to the user explaining why access to the wallet is needed
      } else {
        // Other errors
        console.error('Error connecting to UniSat Wallet:', error);
      }
    }
  });

  // Call the function to display inscriptions when the page loads
  displayConnectedAccountInscriptions();

  async function displayConnectedAccountInscriptions() {
    try {
      if (typeof window.unisat !== 'undefined' && connectedAddress) {
        // Clear previous inscriptions and messages before fetching new ones
        inscriptionsList.innerHTML = '';
        noInscriptionsMessage.style.display = 'none';

        const inscriptions = await window.unisat.getInscriptions(0, 10);
        if (inscriptions.list.length === 0) {
          // Show message when there are no inscriptions
          noInscriptionsMessage.style.display = 'block';
        } else {
          for (const inscription of inscriptions.list) {
            const inscriptionDetails = await fetchInscriptionDetails(inscription.inscriptionId);
            displayInscription(inscriptionDetails);
          }
        }
      } else {
        console.log('UniSat Wallet is not installed or no account connected.');
      }
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
    }
  }

  async function fetchInscriptionDetails(inscriptionId) {
    try {
      const response = await fetch(`https://open-api.unisat.io/v1/indexer/inscription/info/${inscriptionId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer c59bac93894b3c67296fbf4e656bda301c2bf09b9a296a8dd7f46667b08938de'
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error fetching inscription details:', error);
    }
  }

  function displayInscription(data) {
    const li = document.createElement("li");
    const inscription = data.data;
    
    // Display image if available
    if (inscription.contentType && inscription.contentType.startsWith('image/')) {
      const img = document.createElement("img");
      img.src = `data:${inscription.contentType};base64,${inscription.content}`;
      img.alt = `Inscription ID: ${inscription.inscriptionId}`;
      img.style.width = "100px"; // Adjust the size as needed
      li.appendChild(img);
    }

    // Display details in a table
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    
    // Add UTXO data
    const utxoData = inscription.utxo;
    for (const key in utxoData) {
      const row = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = key;
      const td = document.createElement('td');
      td.textContent = utxoData[key];
      row.appendChild(th);
      row.appendChild(td);
      tbody.appendChild(row);
    }

    // Add other data
    const otherData = { ...inscription };
    delete otherData.utxo;
    for (const key in otherData) {
      const row = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = key;
      const td = document.createElement('td');
      td.textContent = otherData[key];
      row.appendChild(th);
      row.appendChild(td);
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    li.appendChild(table);
    inscriptionsList.appendChild(li);
  }
});

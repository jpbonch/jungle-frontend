import { abi, contractAddress } from "./constants.js"
import { ethers } from "./ethers-5.1.esm.min.js"


const connectButton = document.getElementById("connectButton")
const donateButton = document.getElementById("donateButton")
if (typeof window.ethereum !== "undefined") {
    connectButton.innerHTML = "Connected";
}

connectButton.onclick = async function () {
    if (typeof window.ethereum !== "undefined") {
        try {
          await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
          console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts);
        updateText();
      } else {
        connectButton.innerHTML = "Please install MetaMask"
      }
}

donateButton.onclick = async function () {
    const ethAmountInput = document.getElementById("ethAmount");
    const ethAmount = ethAmountInput.value;
    ethAmountInput.value = "";
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum === "undefined") {
        alert("Please connect your wallet first.");
        return;
    }
    if (ethAmount <= document.getElementById("highestDonation").innerHTML) {
        alert("Amount must be higher than highest donation.");
        return;
    }
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
        const transactionResponse = await contract.donate({
            value: ethers.utils.parseEther(ethAmount),
        })
        console.log("eokok");
        const loading = document.getElementById("loading");
        const highestdonator = document.getElementById("highestDonator");
        const highestdonation = document.getElementById("highestDonation");
        loading.style.display = "inline-block";
        highestdonation.style.display = "none";
        highestdonator.style.display = "none";
        await listenForTransactionMine(transactionResponse, provider)
        await updateText();
        loading.style.display = "none";
        highestdonator.style.display = "block";
        highestdonation.style.display = "block";
        } catch (error) {
        console.log(error)
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )            
                resolve();
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function updateText() {
    const loading = document.getElementById("loading");
    loading.style.display = "inline-block";
    const RPC = "https://endpoints.omniatech.io/v1/eth/sepolia/public";
    const provider = new ethers.providers.JsonRpcProvider(RPC);

    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    const highestDonator = await contract.highestDonator();
    const highestDonation = await contract.highestDonation() / (10**18) + " ETH";
    loading.style.display = "none";
    document.getElementById("highestDonator").innerHTML = highestDonator
    document.getElementById("highestDonation").innerHTML = highestDonation
    
}
updateText();
import { abi, contractAddress } from "./constants.js"
import { ethers } from "./ethers-5.1.esm.min.js"


const connectButton = document.getElementById("connectButton")
const donateButton = document.getElementById("donateButton")

connectButton.onclick = async function () {
    if (typeof window.ethereum !== "undefined") {
        try {
          await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
          console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
      } else {
        connectButton.innerHTML = "Please install MetaMask"
      }
}

donateButton.onclick = async function () {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
        const transactionResponse = await contract.donate({
            value: ethers.utils.parseEther(ethAmount),
        })
        await listenForTransactionMine(transactionResponse, provider)
        await updateText();
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
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function updateText() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    document.getElementById("highestDonator").innerHTML = await contract.highestDonator()
    document.getElementById("highestDonation").innerHTML = await contract.highestDonation() / (10**18) + " ETH"
}
updateText();
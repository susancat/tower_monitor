import Web3 from 'web3'
import polygonAbi from '../../abi/polygon_abi.json'
import ethAbi from '../../abi/eth_abi.json'
import ethWallets from '../../data/ethWallets.json'
import polygonWallets from '../../data/polygonWallets.json'
import NodeCache from "node-cache"

const cache = new NodeCache({ checkperiod: 10 });

export default async function handler(req, res) {
  const polygonRpc = process.env.POLYGON_RPC
  const ethRpc = process.env.ETH_RPC
  const totalSupply = process.env.TOTAL_SUPPLY
  const ethContractAdd = process.env.ETH_ADDRESS
  const polygonContractAdd = process.env.POLYGON_ADDRESS

  try {
    const web3Eth = new Web3(ethRpc)
    const web3Polygon = new Web3(polygonRpc)

    const ethContract = new web3Eth.eth.Contract(ethAbi, ethContractAdd)
    const polygonContract = new web3Polygon.eth.Contract(polygonAbi, polygonContractAdd)

    let totalTowerEthWei = await ethWallets.reduce(async (balance, wallet) => {
      const walletAddress = wallet.toLowerCase();
      let balanceOf = cache.get(walletAddress);
      if (balanceOf == null) {
          balanceOf = await ethContract.methods.balanceOf(walletAddress).call();
          let randomCacheTTL = Math.random() * 20 + 300;
          console.log(`${walletAddress}: ${balanceOf} Wei, cache: ${randomCacheTTL} secs`);
          cache.set(walletAddress, balanceOf, randomCacheTTL);
      }
      return (await balance) - (balanceOf)
    },0)

    let totalTowerPolygonWei = await polygonWallets.reduce(async (balance, wallet) => {
      const walletAddress = wallet.toLowerCase();
      let balanceOf = cache.get(walletAddress);
      if (balanceOf == null) {
          balanceOf = await polygonContract.methods.balanceOf(walletAddress).call();
          let randomCacheTTL = Math.random() * 20 + 300;
          console.log(`${walletAddress}: ${balanceOf} Wei, cache: ${randomCacheTTL} secs`);
          cache.set(walletAddress, balanceOf, randomCacheTTL);
      }
      return (await balance) - (balanceOf)
    },0)

    const totalTowerInEth = web3Eth.utils.fromWei(Math.abs(totalTowerEthWei).toLocaleString('fullwide', {useGrouping:false}), 'ether')
    const totalTowerInPolygon = web3Polygon.utils.fromWei(Math.abs(totalTowerPolygonWei).toLocaleString('fullwide', {useGrouping:false}), 'ether')

    res.status(200).send(totalSupply - parseFloat(totalTowerInEth) - parseFloat(totalTowerInPolygon))
  } catch(err) {
    res.status(500).json(err);
  }
}

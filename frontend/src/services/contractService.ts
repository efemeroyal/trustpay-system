import { createPublicClient, createWalletClient, custom, http, parseAbi, type Hex } from 'viem'
import { polygonAmoy } from 'viem/chains'

export const TRUSTPAY_ABI = parseAbi([
  'function mint(address to, uint256 tokenId, string memory tokenURI) external',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function locked(uint256 tokenId) view returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function isVerified(address student, uint256 tokenId) view returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Locked(uint256 tokenId)',
])

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as Hex
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc-amoy.polygon.technology'

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(RPC_URL),
})

export function getWalletClient() {
  if (!window.ethereum) throw new Error('No wallet provider found')
  return createWalletClient({
    chain: polygonAmoy,
    transport: custom(window.ethereum),
  })
}

export async function getTokenOwner(tokenId: number): Promise<`0x${string}`> {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: TRUSTPAY_ABI,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
  }) as Promise<`0x${string}`>
}

export async function getTokenURI(tokenId: number): Promise<string> {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: TRUSTPAY_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  }) as Promise<string>
}

export async function isTokenLocked(tokenId: number): Promise<boolean> {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: TRUSTPAY_ABI,
    functionName: 'locked',
    args: [BigInt(tokenId)],
  }) as Promise<boolean>
}

export async function getStudentBalance(address: `0x${string}`): Promise<number> {
  const bal = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: TRUSTPAY_ABI,
    functionName: 'balanceOf',
    args: [address],
  }) as bigint
  return Number(bal)
}

export async function verifyStudentReceipt(
  studentAddress: `0x${string}`,
  tokenId: number
): Promise<boolean> {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: TRUSTPAY_ABI,
    functionName: 'isVerified',
    args: [studentAddress, BigInt(tokenId)],
  }) as Promise<boolean>
}

export async function watchMintEvents(
  onMint: (from: `0x${string}`, to: `0x${string}`, tokenId: bigint) => void
) {
  return publicClient.watchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: TRUSTPAY_ABI,
    eventName: 'Transfer',
    onLogs: (logs) => {
      logs.forEach(log => {
        const args = log.args as { from: `0x${string}`; to: `0x${string}`; tokenId: bigint }
        onMint(args.from, args.to, args.tokenId)
      })
    },
  })
}

export async function connectWallet(): Promise<`0x${string}`> {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
  return accounts[0] as `0x${string}`
}

export async function switchToAmoy(): Promise<void> {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13882' }],
    })
  } catch (err: unknown) {
    if ((err as { code: number }).code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x13882',
          chainName: 'Polygon Amoy Testnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://rpc-amoy.polygon.technology'],
          blockExplorerUrls: ['https://amoy.polygonscan.com'],
        }],
      })
    }
  }
}

<template>
	<div>
		<h1>Proposals</h1>
		<div id="proposals">
			<div
				v-for="proposal in proposals"
				:key="proposal.id"
				class="proposal"
			>
				<div class="header">
					<div>
						Proposal #{{ proposal.id }}
					</div>
					<div>
						{{ formatState(proposal.state) }}
						(👍 {{ formatVotes(proposal.votes.for) }} / 👎 {{ formatVotes(proposal.votes.against) }})
					</div>
				</div>
				<div class="changes">
					<div
						v-for="change in proposal.changes"
						:key="change.id"
						class="change"
					>
						<div>
							{{ formatTarget(change.target) }}: {{ formatSignature(change.signature) }}
						</div>
						<div>
							{{ formatCalldata(change.signature, change.calldata) }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ethcall from 'ethcall';
import { ethers } from 'ethers';

import governorAbi from '../abi/governor.json';

import Formatter from '../utils/formatter.js';
import Converter from '../utils/converter.js';

const infuraKey = '2c010c2fdb8b4ef1a7617571553fc982';
const provider = new ethers.providers.InfuraProvider('ropsten', infuraKey);

const addresses = {
	comptroller: '0xe03718b458a2E912141CF3fC8daB648362ee7463',
	timelock: '0x18646F4a178404b1c986390Ac808236D37229A11',
	governor: '0xc5BFEd3Bb38a3C4078d4f130F57Ca4c560551d45',
	tokens: {
		cBAT: '0xA253295eC2157B8b69C44b2cb35360016DAa25b1',
		cDAI: '0x6CE27497A64fFFb5517AA4aeE908b1E7EB63B9fF',
		cETH: '0x1d70B01A2C3e3B2e56FcdcEfe50d5c5d70109a5D',
		cREP: '0x5D4373F8C1AF21C391aD7eC755762D8dD3CCA809',
		cSAI: '0xCCaF265E7492c0d9b7C2f0018bf6382Ba7f0148D',
		cTBTC: '0xB40d042a65Dd413Ae0fd85bECF8D722e16bC46F1',
		cUSDC: '0x20572e4c090f15667cF7378e16FaD2eA0e2f3EfF',
		cWBTC: '0x4D15eE7DE1f86248c986f5AE7dCE855b1c1A8806',
		cZRX: '0x3A728dD027AD6F76Cdea227d5Cf5ba7ce9390A3d',
		BAT: '0x9636246bf34E688c6652Af544418B38eB51D2c43',
	},
};

export default {
	data() {
		return {
			proposals: [],
		};
	},
	mounted() {
		this._loadProposals();
	},
	methods: {
		formatTimestamp(timestamp) {
			const date = new Date(timestamp * 1000);
			const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
			return date.toLocaleString('en-US', options);
		},
		formatState(state) {
			const states = [
				'Pending',
				'Active',
				'Canceled',
				'Defeated',
				'Succeeded',
				'Queued',
				'Expired',
				'Executed',
			];
			return states[state];
		},
		formatAddress(value) {
			return Formatter.formatAddress(value);
		},
		formatVotes(votes) {
			return Formatter.formatMultiplier(Converter.fromWad(votes), 0);
		},
		formatTarget(value) {
			for (const contract in addresses) {
				if (contract == 'tokens') {
					const tokenAddresses = addresses.tokens;
					for (const token in tokenAddresses) {
						const tokenAddress = tokenAddresses[token];
						if (tokenAddress == value) {
							return token;
						}
					}
				}
				const contractAddress = addresses[contract];
				if (contractAddress == value) {
					return contract;
				}
			}
		},
		formatSignature(value) {
			const signatureMap = {
				'_addReserves(uint256)': 'Add reserves',
				'_reduceReserves(uint256)': 'Reduce reserves',
				'_setBorrowPaused(bool)': 'Set borrow paused',
				'_setCollateralFactor(address,uint256)': 'Set collateral factor',
				'_setLiquidationIncentive(uint256)': 'Set liquidation incentive',
				'_setMaxAssets(uint256)': 'Set max assets',
				'_setPriceOracle(address)': 'Set price oracle',
				'_setReserveFactor(uint256)': 'Set reserve factor',
				'_supportMarket(address)': 'Add market',
				'accrueInterest()': 'Accrue interest',
				'transfer(address,uint256)': 'Transfer token',
			};
			return signatureMap[value] || value;
		},
		formatCalldata(signature, calldata) {
			const signatureMap = {
				'_addReserves(uint256)': ['uint256'],
				'_reduceReserves(uint256)': ['uint256'],
				'_setBorrowPaused(bool)': ['bool'],
				'_setCollateralFactor(address,uint256)': ['address', 'uint256'],
				'_setLiquidationIncentive(uint256)': ['uint256'],
				'_setMaxAssets(uint256)': ['uint256'],
				'_setPriceOracle(address)': ['address'],
				'_setReserveFactor(uint256)': ['uint256'],
				'_supportMarket(address)': ['address'],
				'accrueInterest()': [],
				'transfer(address,uint256)': ['address', 'uint256'],
			};

			const abiCoder = new ethers.utils.AbiCoder();
			const inputs = signatureMap[signature].map(param => {
				return {
					name: '',
					type: param,
				};
			});

			const params = abiCoder.decode(inputs, calldata);
			const paramStrings = params.map(param => param.toString());
			return paramStrings.join(',');
		},
		getEtherscanLink(txHash) {
			return `https://etherscan.io/tx/${txHash}`;
		},
		async _loadProposals() {
			const proposalCount = await this._getProposalCount();
			this.proposals = await this._getProposals(proposalCount);
		},
		async _getProposalCount() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const governor = new ethcall.Contract(addresses.governor, governorAbi);

			const proposalCountCall = governor.proposalCount();
			const data = await ethcallProvider.all([proposalCountCall]);

			const proposalCount = data[0].toNumber();
			return proposalCount;
		},
		async _getProposals(proposalCount) {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const governor = new ethcall.Contract(addresses.governor, governorAbi);

			const calls = [];
			for (let i = 1; i <= proposalCount; i++) {
				const actionsCall = governor.getActions(i);
				const proposalCall = governor.proposals(i);
				const stateCall = governor.state(i);

				calls.push(actionsCall);
				calls.push(proposalCall);
				calls.push(stateCall);
			}

			const data = await ethcallProvider.all(calls);

			const proposals = [];
			for (let i = 0; i < proposalCount; i++) {
				const actions = data[3 * i];
				const proposalData = data[3 * i + 1];
				const state = data[3 * i + 2];

				const id = proposalData.id.toNumber();
				const votes = {
					'for': proposalData.forVotes.toString(),
					'against': proposalData.againstVotes.toString(),
				};

				const changes = [];
				const actionCount = actions[0].length;
				for (let i = 0; i < actionCount; i++) {
					const target = actions[0][i];
					const signature = actions[2][i];
					const calldata = actions[3][i];

					const change = {
						target,
						signature,
						calldata,
					};
					changes.push(change);
				}

				const proposal = {
					id,
					state,
					votes,
					changes,
				};
				proposals.push(proposal);
			}

			proposals.reverse();
			return proposals;
		}
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

#proposals {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.proposal {
	width: 80%;
	border: 1px solid #dedede;
	background: white;
	margin-top: 1rem;
}

.header {
	display: flex;
	justify-content: space-between;
	font-size: 18px;
	padding: 0.5rem 0.5rem 0 0.5rem;
}

.changes {
	margin-top: 1rem;
}

.change {
	padding: 0.5rem;
	font-size: 14px;
	display: flex;
	justify-content: space-between;
}

.change:nth-child(even) {
	background: #eceff1;
}

@media all and (max-width: 768px) {
	.change {
		flex-direction: column;
	}
}
</style>

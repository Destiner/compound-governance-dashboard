<template>
	<div>
		<h1>Changelog</h1>
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
					</div>
				</div>
				<div class="changes">
					<div
						v-for="change in proposal.changes"
						:key="change.id"
						class="change"
					>
						<div class="target">
							{{ formatAddress(change.target) }}
						</div>
						<div class="signature">
							{{ change.signature }}
						</div>
						<div class="calldata">
							{{ formatCalldata(change.calldata) }}
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

const infuraKey = '2c010c2fdb8b4ef1a7617571553fc982';
const provider = new ethers.providers.InfuraProvider('ropsten', infuraKey);

const governorAddress = '0xc5BFEd3Bb38a3C4078d4f130F57Ca4c560551d45';

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
		formatCalldata(value) {
			if (value.length <= 66) {
				return value;
			}
			return `${value.substr(0, 66)}…`;
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

			const governor = new ethcall.Contract(governorAddress, governorAbi);

			const proposalCountCall = governor.proposalCount();
			const data = await ethcallProvider.all([proposalCountCall]);

			const proposalCount = data[0].toNumber();
			return proposalCount;
		},
		async _getProposals(proposalCount) {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const governor = new ethcall.Contract(governorAddress, governorAbi);

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

				const startBlock = proposalData.startBlock.toNumber();

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
					id: i + 1,
					startBlock,
					state,
					changes,
				};
				proposals.push(proposal);

				proposals.sort((a, b) => {
					const aStartBlock = a.startBlock;
					const bStartBlock = b.startBlock;

					return aStartBlock > bStartBlock
						? -1
						: aStartBlock < bStartBlock
							? 1
							: 0;
				});
			}

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
	display: flex;
	font-size: 14px;
}

.change:nth-child(even) {
	background: #eceff1;
}

.target {
	flex: 1;
}

.signature {
	flex: 2;
}

.calldata {
	flex: 5;
}

@media all and (max-width: 768px) {
	.change {
		flex-direction: column;
	}
}
</style>

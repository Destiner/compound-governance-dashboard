<template>
	<div>
		<h1>System parameters</h1>

		<div id="sections">
			<div class="section">
				<h2>
					Comptroller
					<EtherscanIcon :link="getEtherscanLink('comptroller')" />
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ maxAssets }}
						</div>
						<div class="param">
							<div>Max assets</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatLiquidationIncentive(liquidationIncentiveMantissa) }}
						</div>
						<div class="param">
							<div>Liquidation incentive</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatCloseFactor(closeFactorMantissa) }}
						</div>
						<div class="param">
							<div>Close factor</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(comptrollerAdmin) }}
						</div>
						<div class="param">
							<div>Admin</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(pauseGuardian) }}
						</div>
						<div class="param">
							<div>Pause guardian</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(comptrollerImplementation) }}
						</div>
						<div class="param">
							<div>Implementation</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(oracle) }}
						</div>
						<div class="param">
							<div>Oracle</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Timelock
					<EtherscanIcon :link="getEtherscanLink('timelock')" />
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatDuration(delay) }}
						</div>
						<div class="param">
							<div>Delay</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(gracePeriod) }}
						</div>
						<div class="param">
							<div>Grace period</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(timelockAdmin) }}
						</div>
						<div class="param">
							<div>Timelock admin</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Governor
					<EtherscanIcon :link="getEtherscanLink('governor')" />
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ proposalMaxOperations }}
						</div>
						<div class="param">
							<div>Max operations in proposal</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatBlockDuration(votingPeriod) }}
						</div>
						<div class="param">
							<div>Voting period</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(proposalThreshold) }}
						</div>
						<div class="param">
							<div>Proposal threshold</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(quorumVotes) }}
						</div>
						<div class="param">
							<div>Quorum votes</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>cTokens</h2>
				<div class="cards">
					<div
						v-for="token in tokens"
						:key="token.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ token.title }}</span>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatWadRate(token.collateralFactorMantissa) }}
							</div>
							<div class="row-label">
								Collateral factor
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatWadRate(token.reserveFactorMantissa) }}
							</div>
							<div class="row-label">
								Reserve factor
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatAmount(token.totalReserve) }}
							</div>
							<div class="row-label">
								Total reserve
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatAddress(token.interestRateModel) }}
							</div>
							<div class="row-label">
								Interest rate model
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatAddress(token.comptroller) }}
							</div>
							<div class="row-label">
								Comptroller
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import ethcall from 'ethcall';

import comptrollerAbi from '../abi/comptroller.json';
import cTokenAbi from '../abi/cToken.json';
import governorAbi from '../abi/governor.json';
import timelockAbi from '../abi/timelock.json';

import Formatter from '../utils/formatter.js';
import Converter from '../utils/converter.js';

import EtherscanIcon from '../components/EtherscanIcon.vue';

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
	},
};

export default {
	components: {
		EtherscanIcon,
	},
	data() {
		return {
			tokens: [],

			maxAssets: 0,
			liquidationIncentiveMantissa: '0',
			closeFactorMantissa: '0',
			comptrollerAdmin: '',
			pauseGuardian: '',
			comptrollerImplementation: '',
			oracle: '',

			delay: 0,
			gracePeriod: 0,
			timelockAdmin: '',

			proposalMaxOperations: 0,
			votingPeriod: 0,
			proposalThreshold: '0',
			quorumVotes: '0',
		};
	},
	mounted() {
		this._loadToken();
		this._loadComptroller();
		this._loadTimelock();
		this._loadGovernor();
	},
	methods: {
		formatAmount(value) {
			return Formatter.formatMultiplier(Converter.fromWad(value));
		},
		formatLiquidationIncentive(value) {
			return Formatter.formatRate(Converter.fromWad(value));
		},
		formatCloseFactor(value) {
			return Formatter.formatRatio(Converter.fromWad(value));
		},
		formatAddress(value) {
			return Formatter.formatAddress(value);
		},
		formatDuration(value) {
			return Formatter.formatDuration(value);
		},
		formatBlockDuration(value) {
			return Formatter.formatDuration(Converter.fromBlockCount(value));
		},
		getEtherscanLink(contract) {
			const contractAddress = addresses[contract];
			return `https://ropsten.etherscan.io/address/${contractAddress}`;
		},
		async _loadToken() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);
			const calls = [];

			const comptroller = new ethcall.Contract(addresses.comptroller, comptrollerAbi);
			const tokenAddresses = addresses.tokens;
			const tokens = Object.keys(tokenAddresses);

			for (const token in tokenAddresses) {
				const tokenAddress = tokenAddresses[token];
				const cToken = new ethcall.Contract(tokenAddress, cTokenAbi);
				const marketCall = comptroller.markets(tokenAddress);
				const reserveFactorMantissaCall = cToken.reserveFactorMantissa();
				const totalReserveCall = cToken.totalReserves();
				const interestRateModelCall = cToken.interestRateModel();
				const comptrollerCall = cToken.comptroller();
				calls.push(marketCall);
				calls.push(reserveFactorMantissaCall);
				calls.push(totalReserveCall);
				calls.push(interestRateModelCall);
				calls.push(comptrollerCall);
			}

			const data = await ethcallProvider.all(calls);

			this.tokens = tokens.map(token => {
				const index = tokens.indexOf(token);
				const tokenTitle = tokens[index];

				const market = data[5 * index];
				const collateralFactorMantissa = market.collateralFactorMantissa.toString();
				const reserveFactorMantissa = data[5 * index + 1].toString();
				const totalReserve = data[5 * index + 2].toString();
				const interestRateModel = data[5 * index + 3];
				const comptroller = data[5 * index + 4];

				return {
					title: tokenTitle,
					collateralFactorMantissa,
					reserveFactorMantissa,
					totalReserve,
					interestRateModel,
					comptroller,
				};
			});
		},

		async _loadComptroller() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);
			
			const comptroller = new ethcall.Contract(addresses.comptroller, comptrollerAbi);
			const maxAssetsCall = comptroller.maxAssets();
			const liquidationIncentiveMantissaCall = comptroller.liquidationIncentiveMantissa();
			const closeFactorMantissaCall = comptroller.closeFactorMantissa();
			const adminCall = comptroller.admin();
			const pauseGuardianCall = comptroller.pauseGuardian();
			const comptrollerImplementationCall = comptroller.comptrollerImplementation();
			const oracleCall = comptroller.oracle();

			const calls = [
				maxAssetsCall,
				liquidationIncentiveMantissaCall,
				closeFactorMantissaCall,
				adminCall,
				pauseGuardianCall,
				comptrollerImplementationCall,
				oracleCall,
			];
			const data = await ethcallProvider.all(calls);

			const maxAssets = data[0].toNumber();
			const liquidationIncentiveMantissa = data[1].toString();
			const closeFactorMantissa = data[2].toString();
			const comptrollerAdmin = data[3];
			const pauseGuardian = data[4];
			const comptrollerImplementation = data[5];
			const oracle = data[6];

			this.maxAssets = maxAssets;
			this.liquidationIncentiveMantissa = liquidationIncentiveMantissa;
			this.closeFactorMantissa = closeFactorMantissa;
			this.comptrollerAdmin = comptrollerAdmin;
			this.pauseGuardian = pauseGuardian;
			this.comptrollerImplementation = comptrollerImplementation;
			this.oracle = oracle;
		},
		async _loadTimelock() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const timelock = new ethcall.Contract(addresses.timelock, timelockAbi);
			const delayCall = timelock.delay();
			const gracePeriodCall = timelock.GRACE_PERIOD();
			const adminCall = timelock.admin();

			const calls = [
				delayCall,
				gracePeriodCall,
				adminCall,
			];
			const data = await ethcallProvider.all(calls);

			const delay = data[0].toNumber();
			const gracePeriod = data[1].toNumber();
			const timelockAdmin = data[2];

			this.delay = delay;
			this.gracePeriod = gracePeriod;
			this.timelockAdmin = timelockAdmin;
		},
		async _loadGovernor() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const governor = new ethcall.Contract(addresses.governor, governorAbi);
			const proposalMaxOperationsCall = governor.proposalMaxOperations();
			const votingPeriodCall = governor.votingPeriod();
			const proposalThresholdCall = governor.proposalThreshold();
			const quorumVotesCall = governor.quorumVotes();

			const calls = [
				proposalMaxOperationsCall,
				votingPeriodCall,
				proposalThresholdCall,
				quorumVotesCall,
			];
			const data = await ethcallProvider.all(calls);

			const proposalMaxOperations = data[0].toNumber();
			const votingPeriod = data[1].toNumber();
			const proposalThreshold = data[2].toString();
			const quorumVotes = data[3].toString();

			this.proposalMaxOperations = proposalMaxOperations;
			this.votingPeriod = votingPeriod;
			this.proposalThreshold = proposalThreshold;
			this.quorumVotes = quorumVotes;
		},
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

h2 {
	font-size: 18px;
	margin: 0.5rem 0 0 0.5rem;
}

#sections {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.section {
	width: 90%;
	background: white;
	border: 1px solid #dedede;
	margin-top: 1rem;
}

.stats {
	display: flex;
	margin: 1rem 0 1rem 0;
	flex-wrap: wrap;
}

.stat {
	display: flex;
	margin: 1rem 0 0 1.5rem;
}

.value {
	font-size: 24px;
}

.param {
	font-size: 12px;
	margin-left: 0.5rem;
	display: flex;
	align-items: center;
}

.term {
	color: #818da4;
}

.cards {
	display: flex;
	margin: 1em 0;
	justify-content: space-evenly;
	flex-wrap: wrap;
}

.card {
	width: 240px;
	border: 1px solid #dedede;
	padding: 0.25em 0.5em;
	margin: 0.25em;
}

.card-header {
	display: flex;
	justify-content: center;
	margin-bottom: 0.5em;
	font-size: 16px;
}

.row {
	display: flex;
	font-size: 14px;
}

.row-number {
	flex: 1;
}

.row-label {
	flex: 2;
}
</style>

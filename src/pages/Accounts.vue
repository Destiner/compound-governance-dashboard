<template>
	<div>
		<h1>Accounts</h1>
		<div id="holders">
			<table>
				<tr>
					<th>Account</th>
					<th>Balance</th>
					<th>Weight</th>
				</tr>
				<tr
					v-for="holder in holders"
					:key="holder.address"
				>
					<td>
						{{ formatAddress(holder.address) }}
						<span
							v-if="holder.name"
							class="name"
						>
							({{ holder.name }})
						</span>
					</td>
					<td class="number">
						{{ formatAmount(holder.balance) }}
					</td>
					<td class="number">
						{{ formatAmount(holder.weight) }}
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
import Formatter from '../utils/formatter.js';

export default {
	data() {
		return {
			holders: [],
		};
	},
	mounted() {
		this._loadHolders();
	},
	methods: {
		formatAddress(address) {
			return Formatter.formatAddress(address, 8);
		},
		formatAmount(value) {
			return Formatter.formatAmount(value);
		},
		async _loadHolders() {
			const url = 'https://api.compound.finance/api/v2/governance/accounts?network=ropsten&page_size=1000';
			const data = await fetch(url);
			const json = await data.json();
			const accounts = json.accounts;
			const holders = accounts.map((account) => {
				const { address, display_name, balance, votes } = account;
				const holder = {
					address,
					name: display_name,
					balance,
					weight: votes,
				};
				return holder;
			});
			this.holders = holders;
		},
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

#holders {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 3rem 0 1rem 0;
}

table {
	border: 1px solid #dedede;
	background: white;
	margin: 1em;
	border-collapse: collapse;
}

td,
th {
	border: 1px solid #dedede;
	padding: 0.25em;
	min-width: 2em;
}

th {
	color: #818da4;
	font-weight: normal;
}

th > a {
	color: #818da4;
	text-decoration: none;
}

td > div > a {
	color: #3a4359;
	text-decoration: none;
}

.name {
	color: #818da4;
}

.number {
	text-align: right;
}
</style>
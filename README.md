# Compound Governance Dashboard

An app to keep track of Compound governance process, currently for Ropsten.

1. System parameters: govern-able parameters for each of the contract.
2. Proposals: list of proposals, with their statuses and proposed changes.
3. Accounts: list of accounts, with their token balance and vote weight.

Fetches data from the blockchain (params and proposals) and Compound API (accounts).

## TODO

- [x] voters page (balances + delegations)
- [ ] filter by proposal status (e.g. show only executed)
- [ ] port to mainnet
- [ ] use Compound Governance API to fetch proposal metadata

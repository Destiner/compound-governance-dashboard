class Formatter {
	static formatFee(fee) {
		const apy = fee ** (60*60*24*365) - 1;
		return `${apy.toFixed(6) * 100}%`;
	}

	static formatRatio(ratio) {
		const percentage = 100 * ratio;
		return `${percentage.toFixed(0)}%`;
	}

	static formatRate(rate) {
		const percentage = rate == 0
			? 100 * rate
			: 100 * (rate - 1);
		return `${percentage.toFixed(2)}%`;
	}

	static formatAddress(address) {
		if (!address) {
			return '';
		}
		const ellipsizedAddress = `${address.substr(0, 4)}…${address.substr(40)}`;
		return ellipsizedAddress;
	}

	static formatDuration(duration) {
		const mins = duration / 60;
		if (duration % (60 * 60) != 0) {
			return `${mins} mins`;
		}
		const hours = mins / 60;
		if (duration % (24 * 60 * 60) != 0) {
			return `${hours} hrs`;
		}
		const days = hours / 24;
		return `${days} days`;
	}

	static formatAmount(amount) {
		const amountNumber = new Number(amount.toString());
		const options = {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		};
		return amountNumber.toLocaleString(undefined, options);
	}

	static formatMultiplier(amount) {
		if (amount > 1e6) {
			const shortAmount = amount/1e6;
			return `${shortAmount.toFixed(2)}M`;
		}
		if (amount > 1e3) {
			const shortAmount = amount/1e3;
			return `${shortAmount.toFixed(2)}K`;
		}
		return amount.toFixed(2);
	}
}

export default Formatter;

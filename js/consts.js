export const GA = 'UA-119717465-15';

export const env = (location.hostname === 'localhost' || location.hostname.endsWith('.netlify.live'))
	? 'development'
	: 'production';

export const dev = env === 'development';

export const site = {
	title: 'Isabella Lake Fishing Derby',
};

export const supportedInstruments = [{
	supportedMethods: 'basic-card',
	data: {
		supportedNetworks: ['visa', 'mastercard','discover']
	}
}];

export const shippingOptions = [{
	id: 'standard',
	label: 'Standard shipping',
	amount: {
		currency: 'USD',
		value: '0.00'
	},
	selected: true
}];

import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { supportedInstruments, shippingOptions, registrationCost } from './consts.js';

// @SEE https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/PaymentRequest
export async function buy(displayItems) {
	const details = {
		total: {
			label: 'Total',
			amount: {
				currency: 'USD',
				value: getTotal(displayItems),
			}
		},
		displayItems,
		shippingOptions
	};

	try {
		const request = new PaymentRequest(supportedInstruments, details, { requestShipping: true });
		// Add event listeners here.
		// Call show() to trigger the browser's payment flow.
		return await request.show().catch(console.error);
	} catch (e) {
		console.error(e);
	}
}

function getTotal(items, shipping = { amount: { value: 0 }}) {
	return [...items, shipping].reduce((sum, { amount: { value }}) => sum + value, 0).toFixed(2);
}

export async function submitPhoto(data) {
	if (! (data instanceof FormData)) {
		throw new TypeError('submitPhoto() only accepts FormData objects');
	} else {
		console.log(data.get('image'));
		return {
			'@context': 'https://schema.org',
			'@type': 'ImageObject',
			'@id': uuidv6(),
			'caption': data.get('caption'),
			'author': {
				'@type': 'Person',
				'name': data.get('name'),
				'telephone': data.get('telephone'),
				'email': data.get('email'),
				'address': {
					'@type': 'PostalAddress',
					'streetAddress': data.get('streetAddress'),
					'addressLocality': data.get('addressLocality'),
					'addressRegion': data.get('addressRegion'),
					'postalCode': data.get('postalCode'),
					'addressCountry': data.get('addressCountry') || 'US',
				}
			}
		};
	}
}

export async function derbyRegister({ adults = 1, children = 0 } = {}) {
	if (! (Number.isInteger(adults) && Number.isInteger(children))) {
		throw new TypeError('Adults and children must be integers');
	} else {
		return await buy([{
			label: `Adults (16+): ${adults}`,
			amount: {
				currency: 'USD',
				value: Math.max(adults, 1) * registrationCost.adults,
			}
		}, {
			label: `Children: ${children}`,
			amount: {
				currency: 'USD',
				value: Math.max(children, 0) * registrationCost.children,
			}
		}]);
	}
}

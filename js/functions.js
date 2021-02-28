import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { supportedInstruments, shippingOptions } from './consts.js';

// @SEE https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/PaymentRequest
export async function buy({ label, price }) {
	const details = {
		total: {
			label,
			amount: {
				currency: 'USD',
				value: price.toFixed(2),
			}
		},
		displayItems: [{
			label,
			amount: {
				currency: 'USD',
				value:price.toFixed(2),
			}
		}],
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

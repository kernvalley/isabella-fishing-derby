import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { supportedInstruments, registrationCost } from './consts.js';
import { getCustomElement } from 'https://cdn.kernvalley.us/js/std-js/custom-elements.js';
import { preload, loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { create } from 'https://cdn.kernvalley.us/js/std-js/dom.js';

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
	const PayRequest = await new Promise(resolve => {
		if ('PaymentRequest' in window) {
			resolve(window.PaymentRequest);
		} else {
			Promise.all([
				getCustomElement('payment-request'),
				loadScript('https://cdn.kernvalley.us/components/payment/request.js', { type: 'module' }),
				preload('https://cdn.kernvalley.us/components/payment/request.html', { as: 'fetch' }),
				preload('https://cdn.kernvalley.us/components/payment/request.css', { as: 'style' }),
			]).then(([HTMLPaymentRequestElement]) => {
				console.log(HTMLPaymentRequestElement);
				window.PaymentRequest = HTMLPaymentRequestElement;
				resolve(HTMLPaymentRequestElement);
			}).catch(console.error);
		}
	});

	if (! (Number.isInteger(adults) && Number.isInteger(children))) {
		throw new TypeError('Adults and children must be integers');
	} else {
		const displayItems = [{
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
		}];

		const req = new PayRequest(supportedInstruments, {
			total: {
				label: 'Registration Total',
				amount: {
					currency: 'USD',
					value: displayItems.reduce((total, { amount: { value }}) => total + value, 0).toFixed(2),
				}
			},
			displayItems,
		}, {
			requestPayerName: true,
			requestPayerEmail: true,
			requestPayerPhone: true,
		});

		const resp = await req.show();
		const dialog = create('dialog', {
			children: [
				create('pre', {
					children: [
						create('code', { text: JSON.stringify(resp, null, 4 )}),
					]
				})
			],
			events: {
				click: ({ target }) => target.closest('dialog').close(),
				close: ({ target }) => target.remove(),
			}
		});

		document.body.append(dialog);
		resp.complete('success');
		dialog.showModal();
	}
}

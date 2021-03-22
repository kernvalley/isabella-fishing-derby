import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { supportedInstruments, registrationCost } from './consts.js';
import { getCustomElement } from 'https://cdn.kernvalley.us/js/std-js/custom-elements.js';
import { preload, loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { create, on, off, attr } from 'https://cdn.kernvalley.us/js/std-js/dom.js';

async function getRegistered({ adults, children }) {
	if (! (Number.isInteger(adults) && Number.isInteger(children) && adults > 0 && children >= 0)) {
		throw new TypeError('Number of adults and children for registration must be an integer');
	} else {
		return await new Promise((resolve, reject) => {
			const regDialog = document.getElementById('registration-details-dialog');
			const regForm = document.getElementById('registration-details');
			const adultTmp = document.getElementById('register-adult-template').content;
			const childTmp = document.getElementById('register-child-template').content;
			const adultSection = document.getElementById('register-adult-section');
			const childSection = document.getElementById('register-child-section');

			childSection.hidden = children === 0;

			const handlers = {
				submit:  event => {
					event.preventDefault();
					const form = event.target;
					const data = new FormData(form);
					const names = data.getAll('reg[][name]');
					const ages = data.getAll('reg[][age]');

					if (names.length !== ages.length) {
						throw new TypeError('Name/age mismatch');
					} else {
						const entries = names.map((name, i) => {
							return { name, age: parseInt(ages[i]) };
						});

						resolve(entries);

						form.closest('dialog').close();
					}
				},
				reset: event => {
					event.target.closest('dialog').close();
					Array.from(event.target.querySelectorAll('.derby-reg-details')).forEach(el => el.remove());
					reject(new DOMException('User cancelled registration'));
				},
			};

			on(regDialog, {
				close: ({ target }) => {
					Array.from(target.querySelectorAll('.derby-reg-details')).forEach(el => el.remove());
					off(target.querySelectorAll('form'), handlers);
				}
			});

			for (let n = 0; n < adults; n++) {
				const base = adultTmp.cloneNode(true);
				Promise.allSettled([
					attr('.reg-name-label', { for: `reg-name-child-${n}`}, { base }),
					attr('.reg-age-label', { for: `reg-age-child-${n}`}, { base }),
					attr('.reg-name-input', { id: `reg-name-child-${n}`}, { base }),
					attr('.reg-age-label', { id: `reg-age-child-${n}`}, { base }),
				]).then(() => adultSection.append(base));
			}

			for (let n = 0; n < children; n++) {
				const base = childTmp.cloneNode(true);
				Promise.allSettled([
					attr('.reg-name-label', { for: `reg-name-child-${n}`}, { base }),
					attr('.reg-age-label', { for: `reg-age-child-${n}`}, { base }),
					attr('.reg-name-input', { id: `reg-name-child-${n}`}, { base }),
					attr('.reg-age-label', { id: `reg-age-child-${n}`}, { base }),
				]).then(() => childSection.append(base));
			}

			on(regForm, handlers);
			regDialog.showModal();
		});

	}
}

export async function pay(details, opts = {}, fallback = false) {
	if ('PaymentRequest' in window && fallback === false) {
		const req = new window.PaymentRequest(supportedInstruments, details, opts);
		if (await req.canMakePayment()) {
			return req;
		} else {
			return await pay(details, opts, true);
		}
	} else if (typeof customElements.get('payment-request') === 'undefined') {
		const [HTMLPaymentRequestElement] = await Promise.all([
			getCustomElement('payment-request'),
			loadScript('https://cdn.kernvalley.us/components/payment/request.js', { type: 'module' }),
			preload('https://cdn.kernvalley.us/components/payment/request.html', { as: 'fetch' }),
			preload('https://cdn.kernvalley.us/components/payment/request.css', { as: 'style' }),
		]);

		window.PaymentRequest = HTMLPaymentRequestElement;
		const req = new HTMLPaymentRequestElement(supportedInstruments, details, opts);

		if (await req.canMakePayment()) {
			return req;
		} else {
			throw new DOMException('No payment methods supported');
		}
	} else {
		const HTMLPaymentRequestElement = customElements.get('payment-request');
		const req = new HTMLPaymentRequestElement(supportedInstruments, details, opts);

		if (await req.canMakePayment()) {
			return req;
		} else {
			throw new DOMException('No payment methods supported');
		}
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

export async function derbyRegister({ adults = 1, children = 0 } = {}) {
	if (! (Number.isInteger(adults) && Number.isInteger(children))) {
		throw new TypeError('Adults and children must be integers');
	} else {
		const reg = await getRegistered({ adults, children });
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

		const req = await pay({
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
						create('code', { text: JSON.stringify({ reg, resp }, null, 4 )}),
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

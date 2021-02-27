import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';

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

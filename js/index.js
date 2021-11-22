import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/share-to-button/share-to-button.js';
import 'https://cdn.kernvalley.us/components/slide-show/slide-show.js';
import 'https://cdn.kernvalley.us/components/notification/html-notification.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/bacon-ipsum.js';
import 'https://cdn.kernvalley.us/components/install/prompt.js';
import 'https://cdn.kernvalley.us/components/ad/block.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import 'https://cdn.kernvalley.us/components/app/stores.js';
import 'https://cdn.kernvalley.us/components/weather/current.js';
import { $ } from 'https://cdn.kernvalley.us/js/std-js/esQuery.js';
import { ready } from 'https://cdn.kernvalley.us/js/std-js/dom.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { ShoppingCart } from 'https://cdn.kernvalley.us/js/std-js/ShoppingCart.js';
import { submitPhoto, derbyRegister } from './functions.js';
import { GA } from './consts.js';
import 'https://cdn.kernvalley.us/components/shopping-cart.js';

$(':root').css({'--viewport-height': `${window.innerHeight}px`});

requestIdleCallback(() => {
	$(window).debounce('resize', () => $(':root').css({'--viewport-height': `${window.innerHeight}px`}));

	$(window).on('scroll', () => {
		requestAnimationFrame(() => {
			$('#header').css({
				'background-position-y': `${-0.5 * scrollY}px`,
			});
		});
	}, { passive: true });
});

$(document.documentElement).toggleClass({
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

if (typeof GA === 'string' && GA.length !== 0) {
	requestIdleCallback(() => {
		importGa(GA).then(async ({ ga, hasGa }) => {
			if (hasGa()) {
				ga('send', 'pageview');

				await ready();

				$('a[rel~="external"]').click(externalHandler, { passive: true, capture: true });
				$('a[href^="tel:"]').click(telHandler, { passive: true, capture: true });
				$('a[href^="mailto:"]').click(mailtoHandler, { passive: true, capture: true });
			}
		});
	});
}

Promise.allSettled([
	ready(),
]).then(async () => {
	init();

	customElements.whenDefined('install-prompt').then(() => {
		const InstallPrompt = customElements.get('install-prompt');
		const install = document.getElementById('install-btn');
		install.addEventListener('click', () => new InstallPrompt().show());
		install.hidden = false;
	});

	if (location.pathname.startsWith('/map')) {
		loadScript('https://cdn.kernvalley.us/components/leaflet/map.min.js');
	} else if (location.pathname.startsWith('/shop/') && location.pathname !== '/shop/') {
		const cart = new ShoppingCart();

		$('.purchase-btn').click(async function() {
			await cart.addItem({
				uuid: this.id,
				name: this.dataset.label,
				price: parseFloat(this.dataset.price),
				quantity: 1,
			}).catch(err => alert(err));
		});
	} else if (location.pathname.startsWith('/submit')) {
		$('#submission-form').submit(async event => {
			event.preventDefault();
			const target = event.target;
			await customElements.whenDefined('html-notification');
			const HTMLNotification = customElements.get('html-notification');
			const notification = new HTMLNotification('Thanks for the submission!', {
				body: 'Your photo and info have been submitted',
				icon: '/img/favicon.svg',
				requireInteraction: true,
				lang: 'en',
				data: await submitPhoto(new FormData(target)),
				vibrate: [200, 0, 200],
				actions: [{
					title: 'Dismiss',
					action: 'dismiss',
					icon: '/img/octicons/x.svg',
				}],
			});

			notification.addEventListener('notificationclick', ({ action, notification }) => {
				console.log(notification.data);
				switch(action) {
					case 'dismiss':
						notification.close();
						target.reset();
						break;
				}
			});
		});
	}

	$('#derby-registration-form .register-qty').on('focus', ({ target }) => {
		target.select();
	});

	$('#derby-registration-form').submit(async event => {
		event.preventDefault();
		const target = event.target;
		const data = new FormData(target);
		const result = derbyRegister({
			adults: parseInt(data.get('adults')),
			children: parseInt(data.get('children')),
		});
		target.closest('dialog[open]').close();

		result.then(console.log);
	});
});

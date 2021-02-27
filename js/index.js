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
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/ad/block.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import 'https://cdn.kernvalley.us/components/app/stores.js';
import { $ } from 'https://cdn.kernvalley.us/js/std-js/esQuery.js';
import { ready } from 'https://cdn.kernvalley.us/js/std-js/dom.js';
import { loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { submitPhoto } from './functions.js';
import { GA } from './consts.js';

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
		importGa(GA).then(async ({ ga }) => {
			if (ga instanceof Function) {
				ga('create', GA, 'auto');
				ga('set', 'transport', 'beacon');
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
]).then(() => {
	init().catch(console.error);

	if (location.pathname.startsWith('/map')) {
		loadScript('https://cdn.kernvalley.us/components/leaflet/map.min.js');
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
});

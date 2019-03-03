import { createElement } from './elements';

const Notification = ({ text, title, node }) =>
	createElement(
		'x-notification',
		{
			onClick: () => {
				node.setHidden(false);
			},
		},
		createElement('x-notification-drawable', {}, [
			createElement('header', {}, title),
			text,
		])
	);
class Notifications {
	constructor({ $rootContainer }) {
		this.$wrapper = createElement('x-notifications', []);
		$rootContainer.append(this.$wrapper);
	}
	add(props) {
		const $notification = Notification(props);
		this.$wrapper.append($notification);

		setTimeout(() => {
			$notification.dataset.out = true;
			setTimeout(() => {
				$notification.remove();
			}, 1000);
		}, 6000);
	}
}

export { Notifications };

import frappe


def get_secure_url(url):
	"""
	Ensure HTTPS is used in production environment
	"""
	if frappe.conf.developer_mode:
		return url
	# Force HTTPS in production
	if url.startswith('http://'):
		return 'https://' + url[7:]
	return url


def send_notification_to_user(user_id, title, message, data=None, user_image_id=None):
	"""
	Send a push notification to a user
	"""

	try:
		from frappe.push_notification import PushNotification

		push_notification = PushNotification("raven")

		if data is None:
			data = {
				"base_url": get_secure_url(frappe.utils.get_url()),
			}
		else:
			data["base_url"] = get_secure_url(frappe.utils.get_url())

		if push_notification.is_enabled():
			icon_url = None
			if user_image_id:
				icon = frappe.get_cached_value("Raven User", user_image_id, "user_image")
				if icon:
					icon_url = get_secure_url(frappe.utils.get_url() + icon)

			link = None
			if data.get("channel_id"):
				link = get_secure_url(frappe.utils.get_url() + "/raven/channel/" + data.get("channel_id", ""))
			push_notification.send_notification_to_user(
				user_id=user_id, title=title, body=message, icon=icon_url, data=data, link=link
			)
	except ImportError:
		# push notifications are not supported in the current framework version
		pass
	except Exception:
		frappe.log_error("Failed to send push notification")


def send_notification_to_topic(channel_id, title, message, data=None, user_image_id=None):
	"""
	Send a push notification to a channel
	"""

	try:
		from frappe.push_notification import PushNotification

		push_notification = PushNotification("raven")

		if data is None:
			data = {
				"base_url": get_secure_url(frappe.utils.get_url()),
			}
		else:
			data["base_url"] = get_secure_url(frappe.utils.get_url())

		if push_notification.is_enabled():
			icon_url = None
			if user_image_id:
				icon = frappe.get_cached_value("Raven User", user_image_id, "user_image")
				if icon:
					icon_url = get_secure_url(frappe.utils.get_url() + icon)
			if data.get("channel_id"):
				link = get_secure_url(frappe.utils.get_url() + "/raven/channel/" + data.get("channel_id", ""))
			push_notification.send_notification_to_topic(
				topic_name=channel_id, title=title, body=message, icon=icon_url, data=data, link=link
			)
	except ImportError:
		# push notifications are not supported in the current framework version
		pass
	except Exception:
		frappe.log_error("Failed to send push notification")


def subscribe_user_to_topic(channel_id, user_id):
	"""
	Subscribe a user to a topic (channel name)
	"""

	try:
		from frappe.push_notification import PushNotification

		push_notification = PushNotification("raven")

		if push_notification.is_enabled():
			push_notification.subscribe_topic(user_id=user_id, topic_name=channel_id)
	except ImportError:
		# push notifications are not supported in the current framework version
		pass
	except Exception:
		frappe.log_error("Failed to subscribe user to channel")


def unsubscribe_user_to_topic(channel_id, user_id):
	"""
	Unsubscribe a user to a topic (channel name)
	"""

	try:
		from frappe.push_notification import PushNotification

		push_notification = PushNotification("raven")

		if push_notification.is_enabled():
			push_notification.unsubscribe_topic(user_id=user_id, topic_name=channel_id)
	except ImportError:
		# push notifications are not supported in the current framework version
		pass
	except Exception:
		frappe.log_error("Failed to unsubscribe user to channel")

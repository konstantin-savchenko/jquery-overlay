/**
 * jQuery Overlay plugin
 */
(function (window, jQuery, undefined)
{
	var ADD_TO_JQUERY = true;
	var MAIN_SELECTOR = ".overlay-trigger";
	var TYPE_UNDEFINED = "undefined";
	var PREFIX = "";
	var DATA_KEY = PREFIX ? (PREFIX + "-") : ("") + "overlay";
	var DATA_INIT_KEY = (PREFIX) ? (PREFIX + "Overlay") : "overlay";

	var defaults =
	{
		trigger: "hover",
		target: null
	};
	var binder =
	{
		"click": { bindTrigger: bindClick },
		"hover": { bindTrigger: bindHover }
	};

	function Overlay(node, options)
	{
		var opts = {};
		var $node = $(node);
		options = options || {};
		for (var key in defaults)
		{
			opts[key] = isUndefined(options[key]) ? defaults[key] : options[key];
		}
		this.$trigger = $(node);
		this.$target = null;
		this.state = {
			showing: false,
			shown: false,
			hiding: false,
			hidden: false,
			none: true
		};
		this.displayTimeout = null;
		this.init(opts);
	}
	Overlay.prototype.init = function (options)
	{
		this.$target = $(options.target).hide();
		var triggers = (options.trigger || "").split(" ") || [];
		var usedKeys = {};
		for (var i = 0; i < triggers.length; i++)
		{
			var key = triggers[i];
			if (key && binder[key] && !usedKeys[key])
			{
				usedKeys[key] = true;
				binder[key].bindTrigger(this);
			}
		}
		this.setState("hidden");
		return this;
	};
	Overlay.prototype.displayDelayed = function (show, done)
	{
		var self = this;
		var t = this.displayTimeout;
		if (t) { window.clearTimeout(t); }
		show = (show === true);
		this.displayTimeout = window.setTimeout(function ()
		{
			var method = (show) ? self.show : self.hide;
			method.apply(self, [done]);
		}, 500);
		return this;
	};
	Overlay.prototype.setState = function (state)
	{
		var self = this;
		for (var key in self.state)
		{
			self.state[key] = (key === state);
		}
		return this;
	};
	Overlay.prototype.getState = function ()
	{
		var state = "";
		var self = this;
		for (var key in self.state)
		{
			if (self.state[key])
			{
				state = key;
				break;
			}
		}
		return state;
	};

	Overlay.prototype.raiseEvent = function (name, data)
	{
		var $triggerNode = this.$trigger;
		//console.log(name);
		$triggerNode.trigger(name, data);
		return this;
	};
	Overlay.prototype.show = function (done)
	{
		var overlay = this;
		var $target = overlay.$target;
		var s = overlay.state;
		var perform = !s.showing && !s.shown;
		var t = this.displayTimeout;
		if (t) { window.clearTimeout(t); }
		if (perform)
		{
			overlay.setState("showing");
			$target.fadeIn(function ()
			{
				overlay.setState("shown");
				overlay.raiseEvent("shown",
				{
					overlay: overlay
				});
				(done || nil).apply(overlay, []);
			});
		}
		return this;
	};
	Overlay.prototype.hide = function (done)
	{
		var overlay = this;
		var $target = overlay.$target;
		var s = overlay.state;
		var perform = !s.hiding && !s.hidden;
		if (perform)
		{
			overlay.setState("hiding");
			$target.fadeOut(function ()
			{
				overlay.setState("hidden");
				overlay.raiseEvent("hidden",
				{
					overlay: overlay
				});
				(done || nil).apply(overlay, []);
			});
		}
		return this;
	};

	function bindClick(overlay)
	{
		var $trigger = overlay.$trigger;
		var $target = overlay.$target;
		var evData = {
			overlay: overlay
		};
		var handleLeave = function (ev)
		{
			overlay.hide(false);
			ev.preventDefault();
		};
		var handleClickTrigger = function ()
		{
			overlay.show();
			window.setTimeout(function ()
			{
				$(document.body).one("click", handleLeave);
			}, 0);
		};
		$trigger.on("click", evData, handleClickTrigger);
	}

	function bindHover(overlay)
	{
		var $trigger = overlay.$trigger;
		var $target = overlay.$target;
		var evData = {
			overlay: overlay
		};
		var handleEnterTrigger = function ()
		{
			overlay.show();
		};
		var handleEnterTarget = function ()
		{
			overlay.displayDelayed(true);
		};
		var handleLeave = function ()
		{
			overlay.displayDelayed(false);
		};
		$trigger.on("mouseenter", evData, handleEnterTrigger).on("mouseleave", evData, handleLeave);
		$target.on("mouseenter", evData, handleEnterTarget).on("mouseleave", evData, handleLeave);
	}

	function initOverlays()
	{
		$(MAIN_SELECTOR).each(function (idx, node)
		{
			var overlay = $makeOverlay.apply(node, []);
		});
	}

	function $makeOverlay()
	{
		var $node = $(this);
		var data = $node.data() ||	{};
		var settings = {};
		var overlay = $node.data(DATA_KEY);
		if (!overlay)
		{
			for (var longKey in data)
			{
				var key = null;
				var value = data[longKey];
				var strIdx = longKey.indexOf(DATA_INIT_KEY);
				if (!isUndefined(value) && strIdx === 0)
				{
					key = longKey.substring(DATA_INIT_KEY.length);
					key = key.charAt(0).toLowerCase() + key.substring(1);

					if (key && !isUndefined( defaults[key] ))
					{
						settings[key] = value;
					}
				}
			}
			overlay = new Overlay(this, settings);
			$node.data(DATA_KEY, overlay);
		}
		return overlay;
	}

	if (ADD_TO_JQUERY)
	{
		jQuery.fn[DATA_INIT_KEY] = $makeOverlay;
	}

	function isUndefined(item)
	{
		return typeof (item) === TYPE_UNDEFINED;
	}
	function nil() { return null; }
	$(document).ready(initOverlays);
}(window, jQuery));

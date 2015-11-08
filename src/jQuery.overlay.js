/**
* jQuery Overlay plugin
*/
(function(window, jQuery, undefined)
{
	var MAIN_SELECTOR = ".overlay-trigger";
	var TYPE_UNDEFINED = "undefined";
	var PREFIX = "xn";
	var DATA_KEY = "xn-overlay";
	var DATA_ITEM_KEY = "xnOverlay";

	var defaults =
	{
		runMode : "hover",
		target : null
	};

	var binder =
	{
		"click" : { bindTrigger : bindClick },
		"hover" : { bindTrigger : bindHover }
	};

	function Overlay(node, options)
	{
		var opts = {};
		var $node = $(node);
		options = options || {};
		for (var key in defaults)
		{
			opts[key] = isUndefined(options[key]) ?
				defaults[key] :
				options[key] ;
		}

		this.$trigger = $(node);
		this.$target = null;
		this.state = {
			showing : false,
			shown : false,
			hiding : false,
			hidden : false,
			none : true
		};

		this.displayTimeout = null;
		this.init(opts);
	}

	Overlay.prototype.displayDelayed = function(show)
	{
		var self = this;
		var t = this.displayTimeout;
		if (t) { window.clearTimeout(t); }

		show = (show === true);
		this.displayTimeout = window.setTimeout(function()
		{
			var method = (show) ? self.show : self.hide;
			method.apply(self);
		}, 500);

	};
	Overlay.prototype.setState = function(state)
	{
		var self = this;
		for (var key in self.state)
		{
			self.state[key] = (key === state);
		}
	};
	Overlay.prototype.getState = function()
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

	Overlay.prototype.init = function (options)
	{
		this.$target = $(options.target).hide();
		var runModes = (options.runMode || "").split(" ") || [];

		var usedKeys = {};
		for (var i = 0; i < runModes.length; i++)
		{
			var key = runModes[i];
			if (key && binder[key] && !usedKeys[key])
			{
				usedKeys[key] = true;
				binder[key].bindTrigger(this);
			}
		}
	};
	Overlay.prototype.raiseEvent = function(name, data)
	{
		console.log(name);
	};

	Overlay.prototype.show = function(ev)
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
			$target.fadeIn(function()
			{
				overlay.setState("shown");
				overlay.raiseEvent("shown", {overlay: overlay});

			});

		}
	};

	Overlay.prototype.hide = function(ev)
	{
		var overlay = this;
		var $target = overlay.$target;
		var s = overlay.state;
		var perform = !s.hiding && !s.hidden;

		if (perform)
		{
			overlay.setState("hiding");
			$target.fadeOut(function()
			{
				overlay.setState("hidden");
				overlay.raiseEvent("hidden", {overlay: overlay});
			});

		}
	};


	function bindClick(overlay)
	{
		var $trigger = overlay.$trigger;
		var $target = overlay.$target;
		var evData = { overlay: overlay };
		var handleLeave = function(ev)
		{
			overlay.hide(false);
			ev.preventDefault();
		};

		var handleClickTrigger = function()
		{
			overlay.show();
			window.setTimeout(function(){
				$(document.body).one("click", handleLeave);

			},0);
		};

		$trigger.on("click", evData, handleClickTrigger);

	}
	function bindHover(overlay)
	{
		var $trigger = overlay.$trigger;
		var $target = overlay.$target;
		var evData = { overlay: overlay };

		var handleEnterTrigger = function()
		{
			overlay.show();
		};
		var handleEnterTarget = function()
		{
			overlay.displayDelayed(true);
		};
		var handleLeave = function()
		{
			overlay.displayDelayed(false);
		};

		$trigger
			.on("mouseenter", evData, handleEnterTrigger)
			.on("mouseleave", evData, handleLeave);

		$target.on("mouseenter", evData, handleEnterTarget)
			.on("mouseleave", evData, handleLeave);
	}

	function initOverlays()
	{
		$(MAIN_SELECTOR).each(function(idx, node)
		{
			var overlay = $(node).xnOverlay();
		});
	}


	function isUndefined(item)
	{
		return typeof(item) === TYPE_UNDEFINED;
	}

	jQuery.fn.xnOverlay = function()
	{
		var $node = $(this);
		var data = $node.data() || {};
		var settings = {};
		var overlay = $node.data(DATA_KEY);
		if (!overlay)
		{
			for (var longKey in data)
			{
				var key = null;
				var value = data[longKey];
				if (!isUndefined( value ))
				{
					key = longKey.substring(DATA_ITEM_KEY.length);
					key = key.charAt(0).toLowerCase() + key.substring(1);

					settings[key] = value;
				}
			}

			overlay = new Overlay(this, settings);
			$node.data(DATA_KEY, overlay);
		}
		return overlay;
	};

	$(document).ready(initOverlays);

}(window, jQuery));

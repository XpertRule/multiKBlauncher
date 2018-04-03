/*	XpertRule Knowledge Builder UI Custom Control
	Control Name : mStars
	Object Type(s) : Numeric
	Version : 1.1
	Author(s) : John, Safa
	Created : 22-JUN-2012
	Last Modified: 09-AUG-1012

	The following xml defines the plugin properties for inclusion into the XpertRule Knowledge Builder Design Environment.

	<xrui name="mstars" descr="Visual Stars Count" icon="icon.png" mobile="true">
		<tieditem type="tied" typeaccept="numeric" />
	</xrui>

	This is the end of the property definitions
*/
(function($) {

	var methods = {

		init : function(options) {
			this.each(function() {
				var data = {
					definition: null,
					changeCB: null,
					tiedDlgObj: 0,
					kb: null,               // hold reference to dictionary object
					currentVal: null	// hold current star value
				};
				$.extend(data, options);       // extend our data object with the passed options

				var $this = $(this)
					.addClass("xrui-mstars");	// general class for container div

				var aCntrl = data.definition;
				data.kb = dictionary.GetObject(aCntrl.tieditem || (data.tiedDlgObj ? data.tiedDlgObj.aID : 0));      // work out which dictionary object we are tied to

				var $fieldset = $("<fieldset></fieldset>");
				$fieldset
					.attr("data-role", "controlgroup")
					.appendTo($this);

				if (aCntrl.showlabel) {
					var aDescr = "";
					if (aCntrl.label != "") {
						aDescr = aCntrl.dialog.expandEmbedded(aCntrl.label);
					} else {
						aDescr = data.kb ? data.kb.GetDescription(true) : "";
					}
					var $legend = $("<legend></legend>");
					aCntrl.dialog.populateLabel($legend, aDescr);
					$legend
						.appendTo($fieldset);
				}else {
					$this.addClass("xrui-nocaption");
				}

				if (data.kb) {
					var n1 = data.kb.flatProps.minvalue;	// object control property
					var n2 = data.kb.flatProps.maxvalue;	// object control property
					if ((n1 < n2) && (n2 - n1 < 20)) {	// some sanity checks for number of stars
						for (var c = n1; c <= n2; c++) {
							(function() {
								var cc = c;
								var $star = $("<span></span>")	// each star is a span
									.addClass("xrui-mstar")
									.data("xrui_ctrl", cc)	// data item of each star span to hold value
									.click(function(e) {
										if (!data.kb.flatProps.isenabled) {	// manually disable if appropriate
											return;
										}
										data.currentVal = cc;	// click to set the value
										if ($.isFunction(data.changeCB)) {
											data.changeCB(aCntrl);
										}
									})
									.appendTo($fieldset);
							})();
						}
					} else {
						$this.html("Invalid minvalue maxvalue for " + data.kb.aName);	// error if no or too many stars
					}
					data.$helpDiv = aCntrl.dialog.renderHelp($this, data.kb);
				}

				$this.data("xrui_ctrl", data);
			});
			return this;
		},

		// return the tied object
		gettied : function() {
			var $this = $(this.get(0));
			var data = $this.data("xrui_ctrl");
			return data.kb;
		},

                // populate the control (reflect current dictionary object value, enabled state, visibility and validity
		populate : function() {
			this.each(function() {
				var $this = $(this);
				var data = $this.data("xrui_ctrl");
				var aCntrl = data.definition;
				var $stars = $("fieldset", $this);
				if ($stars.length != 1) {
					return;
				}

				var disabled = !data.kb.flatProps.isenabled || aCntrl.readonly;

				if (data.kb) {
					data.currentVal = data.kb.GetValue();	// get current value of dictionary object

					$(".xrui-mstar", $this).each(function() {	// all the stars
						var $this = $(this);
						var idx = $this.data("xrui_ctrl");	// retrieve star value
						if (idx <= data.currentVal)	{		// is this star <= current value?
							$this.removeClass("xrui-mstar-off");
						} else {
							$this.addClass("xrui-mstar-off");
						}

						if (disabled) {
							$this.attr("onclick", "").unbind("click");
						} else {
							$this.attr("onclick", "").bind("click");
						}
					});

					// visibility
					if (!data.kb.flatProps.isvisible) {
						$this.hide();
						if (data.$helpDiv) {		// 03-06-13
							data.$helpDiv.hide();	// Hide the help div if applicable  03-06-13
						}
					} else {
						$this.show();
						if (data.$helpDiv) {		// 03-06-13
							data.$helpDiv.show();	// Show the help div if applicable  03-06-13
						}
					}

					// enabled
					if (disabled) {
						$this.addClass("ui-state-disabled");
					} else {
						$this.removeClass("ui-state-disabled");
					}
				}
				// invalidity
				if (aCntrl.invalid) {		// this is set in the validate method
					$this.addClass("xrui-number-invalid");
				} else {
					$this.removeClass("xrui-number-invalid");
				}
			});
			return this;
		},

		// internal function to get the current value of the control
		_selection : function() {
			var $this = $(this.get(0));
			var data = $this.data("xrui_ctrl");
			return data.currentVal;	// current value stored in data object
		},

                // update the tied dictionary object with the current selection
		setselection : function() {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data("xrui_ctrl");
				var value = $this.xrui_mstars("_selection");
				if (data.kb) {
					replayStack.Add(data.definition.dialog.aID, REPLAY_CHANGEEVENT, data.kb.aID, value);
				}
			});
		},

		// perform validation based on current selection
		isvalid : function() {
			var valid = true;
			this.each(function() {
				var $this = $(this);
				var data = $this.data("xrui_ctrl");
				if (data.kb) {
					if (data.currentVal == null) {
						if (!data.kb.flatProps.allowblank) {
							valid = false;
						}
					}
				}
			});
			return valid;
		},

		focus : function() {
			return false;	// no input focus supported
		},

		designtime : function() {
			return {
				tieditem: {atype: "tied", accepted: [TYPE_NUMERIC], adefault: 0},
				showlabel: {atype: "bool", adefault: true},
				readonly: {atype: "bool", adefault: false},
				label: "str"
			};
		},

		destroy : function() {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data("xrui_ctrl");
				$this.removeData("xrui_ctrl");
			});
		}
	};

	$.fn.xrui_mstars = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " +  method + " does not exist on jQuery.xrui_mstars");
		}
	};

})(jQuery);

/*	XpertRule Knowledge Builder UI Control
	Control Type : Pie Chart (Utilising RGraph)
	Object Types : Arrays
	Version : 1.0
	Author(s) : John
	Created : 16-AUG-2012

	Licence
	-------
	This plugin utilises the RGraph HTML5 graphing component. If you wish to use this plugin on your web site, you must purchase a licence.
	For more information see the RGraph web site...
	http://www.rgraph.net/

	<xrui name="mpiechart" descr="Visual Pie Chart" icon="icon.png" mobile="true">
		<data type="tied" typeaccept="numvar" />
		<labels type="tied" typeaccept="strvar" />
	</xrui>

*/
(function($) {

	var CreateGradient = function(obj, color, opts) {
		return RGraph.RadialGradient(obj, opts.x, opts.y, opts.r - 5, opts.x, opts.y, opts.r + 25, color, "black");
	};

	var methods = {

		init : function(options) {
			this.each(function() {
				var data = {
					definition: null
				};
				$.extend(data, options);

				data.kb = dictionary.GetObject(data.definition.data);
				data.labels = dictionary.GetObject(data.definition.labels);

				var $this = $(this);

				var cid = data.definition.dialog.editing ? "cvs1" : "cvs";
				var $cvs = $("<canvas id='" + cid + "'></canvas>")
					.attr("width", $this.parent().width() + "px")
					.attr("height", data.definition.height + "px")
					.appendTo($this);

				$this.data("xrui_ctrl", data);
			});
			return this;
		},

		resize: function() {
			var $this = $(this.get(0));
			var data = $this.data("xrui_ctrl");
			$this.find("canvas").attr("width", $this.parent().width() + "px");
			if (data.pie) {
				data.pie.Draw();
			}
		},

		populate : function() {
			this.each(function() {
				var $this = $(this);
				var data = $this.data("xrui_ctrl");

				// visibility
				if (!data.definition.visible  && !data.definition.dialog.editing) {
					$this.hide();
				} else {
					$this.show();

					var w = $this.width();
					var h = $this.height();
					if (h < 100) {
						h = 100;
					}
					var r = ((w < h ? w : h) - 80) / 2;
					var grad = {x : w / 2 , y : h / 2 , r : r};
					var nums = [22, 33, 45];
					var lbls = ["Chart 22%", "Chart 33%", "Chart 45%"];

					if (!data.definition.dialog.editing) {
						nums = [];
						lbls = [];
						if (data.kb && data.kb.data) {
							var cc = 1, n = -1, t = "";
							do {
								n = data.kb.GetValue(cc, 1);
								if (n >= 0) {
									nums.push(n);
									if (data.labels) {
										t = data.labels.GetValue(cc, 1);
										if (t && (t.length > 0)) {
											lbls.push(t);
										}
									}
								}
								cc++;
							} while ((n >= 0) && (cc <= data.kb.dim1));
						}
					}
					data.pie = new RGraph.Pie($this.find("canvas").attr("id"), nums);
					data.pie.Set("chart.colors", [
						CreateGradient(data.pie, "#ABD874", grad),
						CreateGradient(data.pie, "#E18D87", grad),
						CreateGradient(data.pie, "#599FD9", grad),
						CreateGradient(data.pie, "#F4AD7C", grad),
						CreateGradient(data.pie, "#D5BBE5", grad),
						CreateGradient(data.pie, "#EEF38F", grad),
						CreateGradient(data.pie, "#8BE9E7", grad),
						CreateGradient(data.pie, "#C6FFC6", grad)
					]);
					data.pie.Set("chart.shadow", true);
					data.pie.Set("chart.shadow.offsetx", 5);
					data.pie.Set("chart.shadow.offsety", 5);
					data.pie.Set("chart.shadow.blur", 15);
					data.pie.Set("chart.shadow.color", "#bbb");
					data.pie.Set("chart.labels.sticks", true);
					data.pie.Set("chart.labels.sticks.length", 15);
					if (lbls.length > 0) {
						data.pie.Set("chart.tooltips", lbls);
						data.pie.Set("chart.labels", lbls);
					}
					data.pie.Set("chart.radius", r);
					data.pie.Set("chart.strokestyle", "rgba(0,0,0,0.1)");
					data.pie.Draw();
				}
			});
			return this;
		},

		designtime : function() {
			return {
				data: {atype: "tied", accepted: [TYPE_VARIABLE_NUM_ARRAY], adefault: []},
				labels: {atype: "tied", accepted: [TYPE_VARIABLE_STR_ARRAY], adefault: []},
				height: {atype: "int", adefault: 200},
				visible: {atype: "bool", adefault: true}
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

	$.fn.xrui_mpiechart = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " +  method + " does not exist on jQuery.xrui_mpiechart");
		}
	};

})(jQuery);

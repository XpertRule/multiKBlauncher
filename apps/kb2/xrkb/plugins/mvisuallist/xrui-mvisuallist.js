/*	XpertRule Knowledge Builder UI Control
	Control Type : Mobile Visual List
	Object Types : logical
	Version : 1.2
	Author(s) : John
	Created : 26-AUG-2012
	Last Modified: 08-JUL-2014

	<xrui name="mvisuallist" descr="Visual Select List" icon="icon.png" mobile="true">
		<tieditem type="tied" typeaccept="list,multisel" />
		<imageprop type="string" value="image" />
		<padding type="int" value="10" />
		<align type="enum" values="left,right,center,justified" value="left" />
		<displaytype type="enum" values="images,imagesAndCaptions,captions" value="images" />
		<tilewidth type="int" value="64" />
		<tileheight type="int" value="64" />
		<htmlcaptions type="boolean" value="false" />
	</xrui>

*/
(function( $ ){

	var methods = {
		
		init : function(options){
			this.each(function(){
				var data = {
					definition: null,
					kb: null,
					changeCB: null,
					selectedID: 0,
					tiedDlgObj: 0
				};
				$.extend( data, options);

				var $this = $(this);

				data.kb = dictionary.GetObject(data.definition.tieditem||(data.tiedDlgObj? data.tiedDlgObj.aID : 0));				

				if ( data.kb ) {
					$this
						.addClass("xrui-mvisuallist");
					data.resizeFn = function(){
						$this.xrui_mvisuallist("populate");
					};
					$(window).bind("throttledresize",data.resizeFn);
				}
				$this.data('xrui_ctrl',data);
			});
			return this;
		},

		gettied : function(){
			var $this = $(this.get(0)) ;
			var data = $this.data('xrui_ctrl');
			return data.kb;
		},

		populate : function(){
			this.each(function(){
				var $this = $(this);
				var $container = $this;
				var data = $this.data('xrui_ctrl');
				$this.empty();
				if (data.kb) {
					data.selectedID = data.kb.GetValue();
					var x = 0 , y = 0 , w = $this.width() , pad = data.definition.padding ;
					if ( ! $this.is(":visible") ) {
						$p = $this.parent();
						while ( ! $p.is(":visible") )
							$p = $p.parent();
						w = $p.width();
					}
					var aVal = data.kb.GetValue();
					// build value list
					var c, vals = [];
					for (c=0; c < data.kb.aValues.length; c++ ) {
						var value = data.kb.aValues[c];						
						if (value.visible && (value.valid || data.kb.flatProps.showinvalid) && !data.kb.IsValueIndexHidden(c))
							vals.push(value);
					}
					// sort any invalids if required
					var swapped;
					if ( data.kb.flatProps.sortinvalid ) {
						do {
							swapped = false ;
							for ( c=0; c<vals.length-1; c++ )
								if (!vals[c].valid && vals[c+1].valid){
									var v = vals[c];
									vals[c] = vals[c+1];
									vals[c+1] = v;
									swapped = true ;
								}
						} while ( swapped ) ;
					}
					// render
					var lastBottom = 0;
					var dispMode = data.definition.displaytype.toLowerCase();
					var align = (data.definition.tilewidth == 0) ? "left" : data.definition.align;
					var $container = $this;
					for (c = 0; c < vals.length; c++)
						(function(){
							var value = vals[c];
							var $div = $("<div></div>")
								.addClass("xrui-mvisuallist-item" + (data.definition.tilewidth == 0 ? " xrui-mvisuallist-rows" : ""))
								.attr("vid",value.aID)
								.css("left","-1000px")
								.width(data.definition.tilewidth > 0 ? data.definition.tilewidth : w - 5)
								.height(data.definition.tileheight)
								.click(function(){
									var $this = $(this);
									if ( data.kb.flatProps.isenabled && (value.valid || data.kb.flatProps.allowinvalid)) {										
										if ($this.hasClass("xrui-mvisuallist-item-selected")) {
											if (!data.kb.isMultiSel)
												if (!data.kb.flatProps.allowdeselect)
													return;											
											$this.removeClass("xrui-mvisuallist-item-selected");
										} else {
											if (!data.kb.isMultiSel)
												$(".xrui-mvisuallist-item-selected",$container).removeClass("xrui-mvisuallist-item-selected");
											$this.addClass("xrui-mvisuallist-item-selected");
										}
										var $sel = $(".xrui-mvisuallist-item-selected", $container);
										if ($sel.length == 0)
											data.selectedID = PSEUDO_VALUE_EMPTY ;
										else if ($sel.length == 1)
											data.selectedID = parseInt($sel.attr("vid"), 10);
										else {
											var r = [];
											$sel.each(function(){
												r.push(parseInt($(this).attr("vid"), 10));
											});
											data.selectedID = r;
										}
										if ($.isFunction(data.changeCB))
											data.changeCB(data.definition);
									}
								})
								.appendTo($container);
							$img = $("<div></div>")
								.addClass("xrui-mvisuallist-img " + (value.valid ? " xrui-mvisuallist-tickimg" : " xrui-mvisuallist-crossimg"))
								.appendTo($div)
								.click(function(){
									$div.click();
								});
							if ( ( (dispMode == "imagesandcaptions") || (dispMode == "images") ) && value.hasOwnProperty(data.definition.imageprop) ) {
								var i = value[data.definition.imageprop];
								i = LabelDecode(i); // we must use resources here
								$div.css("background-image","url("+i+")");
								if ((dispMode == "images") && (data.definition.tilewidth == 0))
									$div.css("background-position","center");
							}
							// first item, measure and optional center
							if ((c == 0) && ((align == "center") || (align == "justified"))) {
								var tw = ( data.definition.tilewidth + data.definition.padding ) * vals.length - data.definition.padding ;
								if ( tw < w ) {
									if ( ( data.definition.align == "center" ) || ( vals.length == 1 ) )
										x = ( w - tw ) / 2 ;
									else
										pad = ( ( w - ( data.definition.tilewidth * vals.length ) ) / ( vals.length - 1 ) ) ;
								}
							}
							//disable
/*
							if (!data.kb.flatProps.allowinvalid) {
								if (!vals[c].valid) {
									$div.addClass("xrui-mvisuallist-item-invalid");
								} else {
									$div.removeClass("xrui-mvisuallist-item-invalid");
								}
							}							
*/
							if (!value.valid) {
								$div.addClass("xrui-mvisuallist-item-invalid");
							} else {
								$div.removeClass("xrui-mvisuallist-item-invalid");
							}
							if ( ( dispMode == "imagesandcaptions" ) || ( dispMode == "captions" ) ) {
								var $cap = $("<div></div>")
									.addClass("xrui-mvisuallist-item-caption");
								if ( data.definition.htmlcaptions )
									//$cap.html(value.aText);
									$cap.html(data.kb.GetValueDescr(data.kb.ValueIDtoIndex(value.aID)));
								else
									//$cap.text(value.aText);
									$cap.text(data.kb.GetValueDescr(data.kb.ValueIDtoIndex(value.aID)));
								$cap.appendTo($div);
								if ( dispMode == "imagesandcaptions" ) {
									// $div.height($div.height()+$cap.outerHeight()); // auto stretch
									$cap.addClass("xrui-mvisuallist-item-captionbottom");
								} else {
									if ( $cap.outerHeight() < $div.height() )
										$cap.css("top",($div.height()-$cap.outerHeight())/2 + "px");
									else
										$cap.css("top","0");
								}
							}
							if ( ((data.definition.tilewidth == 0) && (c > 0)) || ((x > data.definition.padding) && (x + data.definition.tilewidth > w)) ) {
								x = 0 ;
								y += data.definition.tileheight + data.definition.padding ;
							}
							var xx = x ;
							if (data.definition.align == "right")
								xx = w-data.definition.tilewidth-xx;
							$div
								.css("top",y+"px")
								.css("left", xx+"px");
							var bot = y + $div.outerHeight(true) ;
							if ( bot > lastBottom )
								lastBottom = bot ;
							x += data.definition.tilewidth + pad ;
							if ( ( $.isArray(aVal) && ( $.inArray(value.aID,aVal) != -1 ) ) || ( aVal == value.aID) )
								$div.addClass("xrui-mvisuallist-item-selected");
						}());
					$this.height(lastBottom);
					if (!data.kb.flatProps.isenabled) {
						$this.addClass("xrui-mvisuallist-disabled");
					} else {
						$this.removeClass("xrui-mvisuallist-disabled");
					}
					if (!data.kb.flatProps.isvisible) {
						$this.hide();
					} else {
						$this.show();
					}
				}
				if ( data.definition.invalid )
					$this.addClass("xrui-mvisuallist-invalid");
				else
					$this.removeClass("xrui-mvisuallist-invalid");
			});
			return this;
		},

		_selection : function(){
			var $this = $(this.get(0)) ;
			var data = $this.data('xrui_ctrl');
			return data.selectedID;
		},

		setselection : function(){
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('xrui_ctrl');
				var value = $this.xrui_mvisuallist("_selection");
				if ( data.kb )
					replayStack.Add(data.definition.dialog.aID, REPLAY_CHANGEEVENT, data.kb.aID, value);
			});
		},

		isInteractiveValid : function() {
			return false;
		},

		isvalid : function() {
			var valid = true ;
			this.each(function(){
				var $this = $(this);
				var data = $this.data('xrui_ctrl');
				var value = $this.xrui_mvisuallist("_selection");
				if (data.kb && !data.kb.isMultiSel)
					if (!data.kb.flatProps.allowblank)
						if (!value || value == PSEUDO_VALUE_EMPTY) // TODO : Multi select
							valid = false ;
			});
			return valid ;
		},

		designtime : function(){
			return {
				tieditem: {atype: "tied", accepted: [TYPE_LIST], adefault: 0},
				imageprop: {atype: "str", adefault: "image"},
				padding: {atype: "int", adefault: 10},
				align: {atype: "enum", vals: ["left", "right", "center", "justified"], adefault: "center"},
				displaytype: {atype: "enum", vals: ["images", "imagesAndCaptions", "captions"], adefault: "imagesAndCaptions"},
				tilewidth: {atype: "int", adefault: 64},
				tileheight: {atype: "int", adefault: 64},
				htmlcaptions: {atype: "bool", adefault: false}
			};
		},

		destroy : function(){
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('xrui_ctrl');
				$(window).unbind("throttledresize",data.resizeFn);
				$this.removeData('xrui_ctrl');
			});
		}
	};

	$.fn.xrui_mvisuallist = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.xrui_mvisuallist' );
		}    
	};

})( jQuery );
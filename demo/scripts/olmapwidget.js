/*$.Cow.ConnectWidget = {
init: function(){
var widget = $('#connect');
var cow = $('#cow').data('cow');
cow.events.bind('connected',{}, this._onConnect);
},
_onConnect: function() {
}
}
*/


/**
	TT: copied from featureswidget.js and adapted for map purpose
**/

(function($) {
$.widget("cow.OlMapWidget", {
	options: {
        // The cow.core instance
        core: undefined
    },
 _create: function() {
        var core;
        var self = this;		
        var element = this.element;
        
        core = $(this.options.core).data('cow');
		this.core=core;
        core.bind("dbloaded", {widget: self}, self._onLoaded);
		core.bind("storeChanged", {widget: self}, self._onLoaded);
		element.delegate('.owner','click', function(){
			var key = $(this).attr('owner');
			self.core.featureStores[0].removeItem(key);
			self.core.trigger('storeChanged');
		});
		
		//openlayers stuff
		this.map = new OpenLayers.Map("map");
		var osmlayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
		   transitionEffect: 'resize'
		});
		this.map.addLayer(layer = new OpenLayers.Layer.Stamen("toner-lite", {opacity:0.5}));
		this.map.addLayer(osmlayer);
		//this.map.setCenter(new OpenLayers.LonLat(768708,6849389), 10);//Enschede
		this.map.setCenter(new OpenLayers.LonLat(546467,6862526),10);//Amsterdam
		this.map.addControl(new OpenLayers.Control.LayerSwitcher());
		
		
		
		this.handlers = {
			// Triggers the jQuery events, after the OpenLayers events
			// happened without any further processing
			simple: function(data) {
				core.trigger(data.type);
			}
        };
		this._createLayers(this.map);
		
				
		this.map.events.on({
			scope: this,
			moveend: this.handlers.simple		
		});
		core.map = this.map; //Set global :(
    },
    _destroy: function() {
        this.element.removeClass('ui-dialog ui-widget ui-widget-content ' +
                                 'ui-corner-all')
            .empty();
    },
	_onLoaded: function(evt) {
		//console.log('_onLoaded');
		var self = evt.data.widget;
		self._updateMap(evt);
	},
	_onNewFeature: function(evt) {
		//console.log('_onNewFeature');
		var self = evt.data.widget;
		self._updateMap(evt);
	},
	_updateMap: function(evt) {		
		var self = evt.data.widget;
		var features = core.featureStores[0].getAllFeatures();		//TT: we only use 1 store anyway... 
        var element = self.element;
	},
	//TODO: dit moet vast mooier kunnen, al die stylen kunnen vast elders
	_createLayers: function(map) {
		var s = new OpenLayers.StyleMap({
			'strokeColor':  '#00397C',
			'fillColor':  '#00397C',
			strokeWidth: 2,
			fillOpacity: 0.05,
			label: "${label}",
			labelAlign: "lb",
			fontColor: '#00397C'
		});
		var viewlayer = new OpenLayers.Layer.Vector('Other views',{styleMap: s});
		map.addLayer(viewlayer);
		this.viewLayer = viewlayer;
		core.viewLayer = viewlayer;
		var self = this;
		
		var myLocationStyle = new OpenLayers.Style({
		  pointRadius: 15, 
		  externalGraphic: "${icon}",
		  fillColor: "blue",
		  fillOpacity: 1, 
		  strokeColor: "blue",
		  label: "${owner}",
		  labelAlign: "lb",
		  labelXOffset: "15",
          labelYOffset: "0",
		  fontColor: '#00397C'
		}); 
		var myLocationStyleMap = new OpenLayers.StyleMap(myLocationStyle);
		var context = {
			getStrokeWidth: function(feature) {
				if (feature.layer && feature.layer.map.getZoom() > 15)
					return 3;
				return 1;
			},
			getLabel: function(feature) {
				if (feature.attributes.name && feature.layer.map.getZoom() > 13)
                    return feature.attributes.name;
                return "";
			},
            getIcon: function(feature) {
            	if (feature.attributes.icon && feature.attributes.icon != null){
            		//addition for larger scale icons IMOOV
            		str = feature.attributes.icon;
            		var patt=new RegExp("imoov");
            		if (str && feature.layer && feature.layer.map.zoom < 15 && patt.test(str))
            		{
            			return str.replace(/-g.png/g,'k.png');
            		}
                    return feature.attributes.icon;
                }
                return "./mapicons/notvisited.png";
            },
            getLineColor: function(feature){
            	if (feature.attributes.linecolor)
            		return feature.attributes.linecolor;
            	return "black";
            },
            getPolyColor: function(feature){
            	if (feature.attributes.polycolor)
            		return feature.attributes.polycolor;
            	return null;
            },
            getFillOpacity: function(feature){
            	if (feature.geometry && feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon')
            		return 0.5;
            	return 1;
            },
            getZindex: function(feature){
            	if (feature.geometry && feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon')
            		return 0;
            	if (feature.geometry && feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.LineString')
            		return 10;
            	return 20;
            }
        };
        
		var template = {
		  pointRadius: 20,
		  strokeWidth: "${getStrokeWidth}",
		  label: "${getLabel}",
		  title: "${getLabel}",
		  labelAlign: "tl",
		  labelXOffset: "15",
          labelYOffset: "0",
		  fontColor: '#00397C',
		  fontSize: '12pt',
		  labelOutlineColor: "white", 
          labelOutlineWidth: 1,
		  graphicZIndex: "${getZindex}",
		  fillOpacity: "${getFillOpacity}",
		  externalGraphic: "${getIcon}",
		  fillColor: "${getPolyColor}",
		  strokeColor: "${getLineColor}"
        };
        var selecttemplate = {
          pointRadius: 40,
		  strokeWidth:6,
		  graphicZIndex: "${getZindex}",
		  fillOpacity: "${getFillOpacity}",
		  externalGraphic: "${getIcon}",
		  fillColor: "${getPolyColor}",
		  strokeColor: "${getLineColor}"
        };
		var style = new OpenLayers.Style(template,{
        		context: context
        });
        var selectstyle = new OpenLayers.Style(selecttemplate,{
        		context: context
        }); 

		
		var editLayerStylemap = new OpenLayers.StyleMap({
			default:style,
			select: selectstyle 
		});
		var editlayer = new OpenLayers.Layer.Vector('Features layer',{
			
			styleMap:editLayerStylemap,
			// add a special openlayers renderer extension that deals better with markers on touch devices
			renderers: ["SVG"],
			// enable the indexer by setting zIndexing to true
			rendererOptions: {zIndexing: true},
			eventListeners:{
				featureselected:function(evt){
					
					var feature = evt.feature;
					var name = feature.attributes.name || "";
					var desc = feature.attributes.desc || "";
					var innerHtml = ''
						//+'<input onBlur="">Title<br>'
						//+'<textarea></textarea><br>'
						+ 'You can remove or change this feature using the buttons below<br/>'
						+ 'Label: <input name="name" value ="'+name+'" onBlur="changeFeature(this.name,this.value);"><br/>'
						+ 'Description: <br> <textarea name="desc" onBlur="changeFeature(this.name, this.value)" rows="4" cols="25">'+desc+'</textarea><br/>'
						+ '<button class="popupbutton" onTouch="editfeature();" onClick="editfeature();" id="editButton">edit</button><br>'
						+ '<button class="popupbutton" onTouch="deletefeature();" onClick="deletefeature();">delete</button>'
						+ '<button class="popupbutton" onTouch="closepopup();" onClick="closepopup();">Done</button>';
					var anchor = {'size': new OpenLayers.Size(0,0), 'offset': new OpenLayers.Pixel(100, -100)};
					var popup = new OpenLayers.Popup.Anchored("popup",
						OpenLayers.LonLat.fromString(feature.geometry.getCentroid().toShortString()),
						null,
						innerHtml,
						anchor,
						true,
						null
					);
					popup.autoSize = true;
					popup.maxSize = new OpenLayers.Size(800,1000);
					popup.relativePosition = "br";
					popup.fixedRelativePosition = true;
					feature.popup = popup;
					map.addPopup(popup);
				},
				featureunselected:function(evt){
					var feature = evt.feature;
					//TODO TT: check first if feature attributes have been changed
					var store = feature.attributes.store || "store1";
					core.getFeaturestoreByName(store).updateLocalFeat(feature);
					map.removePopup(feature.popup);
					//TODO TT: this goes wrong first time... 
					//Uncaught TypeError: Cannot call method 'destroy' of null 
					feature.popup.destroy();
					feature.popup = null;
					controls.modify.deactivate();
					controls.select.activate();
				}
		}});
		var mylocationlayer = new OpenLayers.Layer.Vector('My location',{styleMap:myLocationStyleMap});
		
		controls = {
			modify: new OpenLayers.Control.ModifyFeature(editlayer),
			//add: new OpenLayers.Control.EditingToolbar(editlayer),
			select: new OpenLayers.Control.SelectFeature(editlayer)
		};
		for(var key in controls) {
                this.map.addControl(controls[key]);
        }
        controls.select.activate();
		
		this.map.addLayer(editlayer);
		this.map.addLayer(mylocationlayer);
		this.editLayer = editlayer;
		core.editLayer = editlayer;
		this.mylocationLayer = mylocationlayer;
		core.mylocationLayer = mylocationlayer;
		/*this.editLayer.events.on({
			scope: this,
			sketchcomplete: this.handlers.includeFeature//this.handlers.simple		
		})*/;		
		this.editLayer.events.register('sketchcomplete',{'self':this,layer:layer},function(evt){core.trigger('sketchcomplete',evt.feature)});
		this.editLayer.events.register('afterfeaturemodified',{'self':this,layer:layer},function(evt){core.trigger('afterfeaturemodified',evt.feature)});
		//this.editLayer.events.on({'featureselected': function(){
		//		alert('Feat selected');
		//}});
		
	}
	
	
	});
})(jQuery);


var columnchart_store_template = {
	extend : 'Ext.data.Store',
	autoLoad : true,
	proxy : {
		type : 'memory',
		reader : {
			type : 'json',
			root : 'result'
		}
	}
};

function genChartStore(template, fields) {
	template.fields = mergeFields(fields);
	template.data = mergeDimensions(Datanium.GlobalData.QueryResult);
	// console.log("ColumnChartStore = Ext.create('Ext.data.Store'," +
	// Ext.encode(template) + ");");
	eval("ColumnChartStore = Ext.create('Ext.data.Store'," + Ext.encode(template) + ");");
	ColumnChartStore.load();
	return ColumnChartStore;
}

function mergeDimensions(queryResult) {
	if (queryResult != null && queryResult.result != null && xFields.length > 1) {
		for ( var i = 0; i < queryResult.result.length; i++) {
			for ( var j = 0; j < xFields.length; j++) {
				if (xFields[j] in queryResult.result[i]) {
					if (queryResult.result[i][xFieldsLabel] == null) {
						queryResult.result[i][xFieldsLabel] = queryResult.result[i][xFields[j]]
					} else {
						queryResult.result[i][xFieldsLabel] = queryResult.result[i][xFieldsLabel] + "/"
								+ queryResult.result[i][xFields[j]]
					}
				}
			}
		}
	}
	return queryResult;
}

function mergeFields(fields) {
	if (xFields.length > 1) {
		fields = [];
		fields.push(xFieldsLabel);
		fields.push.apply(fields, yFields);
	}
	return fields;
}

var fields = [];
var xFields = [];
var yFields = [];
var xFieldsLabel = "";

Ext.define('Datanium.view.charts.ColumnChart', {
	extend : 'Ext.chart.Chart',
	alias : 'widget.columnchart',
	initComponent : function() {
		Ext.apply(this, {
			style : 'background:#fff',
			animate : true,
			insetPadding : 50,
			shadow : true,
			hidden : true
		});
		fields = [];
		xFields = [];
		yFields = [];
		xFieldsLabel = "";
		var fields_json = null;
		var results_json = null;
		if (Datanium.GlobalData.enableQuery) {
			if (Datanium.GlobalData.queryParam != null) {
				fields_json = Datanium.GlobalData.queryParam;
				if (Datanium.GlobalData.QueryResult != null) {
					this.hidden = false;
					results_json = Datanium.GlobalData.QueryResult;
				}
			} else {
				fields = [];
			}
		}
		if (fields_json != null) {
			if ("dimensions" in fields_json) {
				for ( var i = 0; i < fields_json.dimensions.length; i++) {
					var f = fields_json.dimensions[i];
					f.field_type = 'xField';
					if (f.display) {
						fields.push(f.uniqueName);
						xFields.push(f.uniqueName);
						if (xFieldsLabel.length > 0) {
							xFieldsLabel = xFieldsLabel + "/" + f.uniqueName;
						} else {
							xFieldsLabel = f.uniqueName;
						}
					}
				}
				for ( var i = 0; i < fields_json.measures.length; i++) {
					var f = fields_json.measures[i];
					f.field_type = 'yField';
					if (f.display) {
						fields.push(f.uniqueName);
						yFields.push(f.uniqueName);
					}
				}
			}
		}
		// console.log(fields);
		// console.log(xFields);
		// console.log(xFieldsLabel);
		// console.log(yFields);
		// console.log(fields_json);
		// console.log(results_json);
		var store = genChartStore(columnchart_store_template, fields);
		this.store = store;
		this.axes = [ {
			type : 'Numeric',
			position : 'left',
			fields : yFields,
			label : {
				renderer : Ext.util.Format.numberRenderer('0,0.###')
			},
			grid : true,
			minimum : 0
		}, {
			type : 'Category',
			position : 'bottom',
			fields : xFieldsLabel
		} ], this.series = [ {
			type : 'column',
			axis : 'left',
			highlight : true,
			tips : {
				style : 'background:#fff; text-align: center;',
				trackMouse : true,
				width : 140,
				height : 28,
				renderer : function(storeItem, item) {
					this.setTitle(item.yField + ': ' + storeItem.get(item.yField)
							+ ' $');
					this.width = this.title.length * 7.8;
				}
			},
			/*
			 * label : { display : 'insideEnd', 'text-anchor' : 'middle', field : [
			 * 'China', 'US' ], renderer : Ext.util.Format.numberRenderer('0'),
			 * orientation : 'horizontal', color : '#fff' },
			 */
			xField : xFields,
			yField : yFields
		} ]
		this.callParent();
		this.addEvents('refreshColumnChart');
		this.on('refreshColumnChart',
				function() {
					console.log('refreshColumnChart');
					if (Datanium.util.CommonUtils.getCmpInActiveTab('columnchart') != null) {
						var activeItemId = Datanium.util.CommonUtils.getCmpInActiveTab('datapanel').getLayout()
								.getActiveItem().id;
						destoryGrid('columnchart');
						Datanium.util.CommonUtils.getCmpInActiveTab('datachartview').insert(0,
								Ext.create('Datanium.view.charts.ColumnChart', {
									xtype : 'columnchart',
									itemId : Datanium.util.CommonUtils.genItemId('columnchart'),
									region : 'center',
									floatable : false,
									collapsible : false,
									header : false,
									hidden : true
								}));
					}
				});
	}
});

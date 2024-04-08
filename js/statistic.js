function barVIS(){
	var layerCol=map.getLayers();
	var layer;
	map.getOverlays().clear();
	RemoveHeatmap();
	var data;
	layerCol.forEach(function(layer,index,array){
		layer=array[index];
		var pro=layer.getProperties()
		if(pro.title=="Basin"){
			var vs=layer.getSource();
			var feats=vs.getFeatures();
			var feat;
			var featPros;
			for(var i=0;i<feats.length;i++){
				feat=feats[i];
				featPros=feat.getProperties();
				var featGeo=feat.getGeometry();
				var pt=new ol.extent.getCenter(featGeo.getExtent());
				var data=new Array();
				data.push({name:'male',value:featPros['area_sq_km']});
				data.push({name:'female',value:featPros['area_sq_mi']});
				var color=d3.scaleOrdinal(d3.schemeCategory10)
				var chartDIV=document.createElement("div");
				chartDIV.id="chart"+i;
				chartDIV.style.width="80px";
				chartDIV.style.height="80px";
				var width = 80;
          		var height = 80;
				var svg = d3.select(chartDIV)
		            .append("svg")
		            .attr("width", width)
		            .attr("height", height);
		        var padding = {left:30, right:30, top:20, bottom:20};

		          //x-axis scale
		          var xScale = d3.scaleBand()
		            .domain(data.map(function(d){return d.name}))
		            //.domain(["Male","Female"])
		            .range([0, width - padding.left - padding.right]);

		          //y-axis scale
		          var yScale = d3.scaleLinear()
		            .domain([0,d3.max(data, function(d) {return d.value; })])
		            .range([height - padding.top - padding.bottom, 0]);

		          //x-axis
		          var xAxis = d3.axisBottom(xScale);
		            
		          //y-axis
		          var yAxis = d3.axisLeft(yScale);

		          //Gap between two rectangles
		          var rectPadding = 2;

		          //add rectangles
		          var rects = svg.selectAll(".MyRect")
		            .data(data)
		            .enter()
		            .append("rect")
			            .attr("class","MyRect")
			            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
			            .attr("x", function(d){
				              return xScale(d.name) + rectPadding/2;
				            } )
			            .attr("y",function(d){
			              return yScale(d.value);
			            })
			            .attr("width", xScale.bandwidth() - rectPadding )
			            .attr("height", function(d){
			              return height - padding.top - padding.bottom - yScale(d.value);
			            })
			            .attr('fill',function(d,i){
			              return color(i);
			            });

		          //add tooltip
		          var tooltip = d3.select("body")
		                    .append("div")
		                    .attr("class","tooltip")
		                    .style("opacity",0.0);
		          
		          rects.on("mouseover",function(d){
		              tooltip.html(d.name + ":" + "<br />" + d.value)
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY + 20) + "px")
		                .style("opacity",1.0);
		            })
		            .on("mousemove",function(d){  
		              tooltip.style("left", (d3.event.pageX) + "px")
		                  .style("top", (d3.event.pageY + 20) + "px");
		            })
		            .on("mouseout",function(d){
		              tooltip.style("opacity",0.0);
		            });
				var bar=new ol.Overlay({
					position:pt,
					positioning:'center-center',
					element:chartDIV
				})
				map.addOverlay(bar);
				//return; 								 
			}
			map.renderSync(); 
			return; 	
		}
	})
}

function pieVIS(){
	var layerCol=map.getLayers();
	var layer;
	var color=d3.scaleOrdinal(d3.schemeCategory10);
	map.getOverlays().clear();
	RemoveHeatmap();
	var data;
	layerCol.forEach(function(layer,index,array){
		layer=array[index];
		var pro=layer.getProperties()
		if(pro.title=="Basin"){
			var vs=layer.getSource();
			var feats=vs.getFeatures();
			var feat;
			var featPros;			
			for(var i=0;i<feats.length;i++){
				feat=feats[i];
				featPros=feat.getProperties();
				var featGeo=feat.getGeometry();
				var pt=new ol.extent.getCenter(featGeo.getExtent());
				var data=new Array();
				data.push({name:'Income',value:featPros['area_sq_km']});
				data.push({name:'Expenditure',value:featPros['area_sq_mi']});
				var chartDIV=document.createElement("div");
				chartDIV.id="chart"+i;
				chartDIV.style.width="30px";
				chartDIV.style.height="30px";
				var width = 30;
		        var height = 30;
		        var svg = d3.select(chartDIV)
	                .append("svg")
	                .attr("width", width)
	                .attr("height", height);
		          
		        var pie = d3.pie()
		            .value(function(d){ return d.value; });

		        var piedata = pie(data);
		        var fontsize = 10;
		        var outerRadius = width/2;  
		        var innerRadius = 0;  

		        var arc = d3.arc()  
	                .innerRadius(innerRadius) 
	                .outerRadius(outerRadius); 

		        var arcs = svg.selectAll("g")
                    .data(piedata)
                    .enter()
                    .append("g")
                    .attr("transform","translate("+ (width/2) +","+ (width/2) +")");
		                  
		        arcs.append("path")
		            .attr("fill",function(d,i){
		              return color(i);
		            })
		            .attr("d",function(d){
		              return arc(d);
		            });
		          
		        arcs.append("text")
		            .attr("transform",function(d){
		              var x = arc.centroid(d)[0] * 1.4;   
		              var y = arc.centroid(d)[1] * 1.4;   
		              return "translate(" + x + "," + y + ")";
		            })
		            .attr("text-anchor","middle")
		            .style("font-size",fontsize)
		            .text(function(d){              
		              var percent = Number(d.value)/d3.sum(data,function(d){ return d.value; }) * 100;              
		              return percent.toFixed(1) + "%";
		            });
		          //add tooltip
		        var tooltip = d3.select("body")
		                    .append("div")
		                    .attr("class","tooltip")
		                    .style("opacity",0.0);
		          
		        arcs.on("mouseover",function(d){
		              tooltip.html(d.data.name + ":" + "<br />" + d.value)
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY + 20) + "px")
		                .style("opacity",1.0);
		            })
		            .on("mousemove",function(d){  
		              tooltip.style("left", (d3.event.pageX) + "px")
		                  .style("top", (d3.event.pageY + 20) + "px");
		            })
		            .on("mouseout",function(d){
		              tooltip.style("opacity",0.0);
		            });
				var pie=new ol.Overlay({
					position:pt,
					positioning:'center-center',
					element:chartDIV
				})
				map.addOverlay(pie);										 
			}
			map.renderSync(); 	
			return; 	
		}
	})
}

function lineVIS(){
	var layerCol=map.getLayers();
	var layer;
	map.getOverlays().clear();
	RemoveHeatmap();
	var data;
	layerCol.forEach(function(layer,index,array){
		layer=array[index];
		var pro=layer.getProperties()
		if(pro.title=="Basin"){
			var vs=layer.getSource();
			var feats=vs.getFeatures();
			var feat;
			var featPros;
			for(var i=0;i<feats.length;i++){
				feat=feats[i];
				featPros=feat.getProperties();
				var featGeo=feat.getGeometry();
				var pt=new ol.extent.getCenter(featGeo.getExtent());
				var data=new Array();
				data.push({name:'Male',value:featPros['area_sq_km']});
				data.push({name:'Female',value:featPros['area_sq_mi']});				
				var chartDIV=document.createElement("div");
				chartDIV.id="chart"+i;
				chartDIV.style.width="150px";
				chartDIV.style.height="80px";
		        var width = 150;
		        var height = 80;
		        var svg = d3.select(chartDIV)
		                .append("svg")
		                .attr("width", width)
		                .attr("height", height);
		        var margin = {top: 20, right: 20, bottom: 30, left: 50};
		        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		          //x-axis scale
		        xScale = d3.scaleBand()
		            //.domain([showdata[0].Gender,showdata[1].Gender])
		            //.domain(d3.extent(showdata, function(d) { return d.Gender;}))
		            .domain(data.map(function(d){return d.name;}))
		            .paddingOuter(0.1)
		            .range([0, width - margin.left - margin.right]);

		          //y-axis scale
		        yScale = d3.scaleLinear()
		            .domain([0,d3.max(data, function(d) {return d.value; })])
		            .range([height - margin.top - margin.bottom, 0]);
		            

		          //x-axis
		        var xAxis = d3.axisBottom(xScale);
		            
		          //y-axis
		        var yAxis = d3.axisLeft(yScale);


		        var area = d3.area()
		              .x(function(d) { return xScale(d.name); })
		              .y1(function(d) { return yScale(d.value); })
		              .y0(yScale(0));
		        var c=d3.rgb(148,0,211);
		        c.opacity=0.7;
		        g.append("path")
		              .datum(data)
		              .attr("fill", c)
		              .attr("d", area);

				var lineLay=new ol.Overlay({
					element:chartDIV,
					position:pt,
					positioning:'center-center'
				})
				map.addOverlay(lineLay);				
				//return; 								 
			}
			map.renderSync(); 
			return; 	
		}
	})
}

function heatmapVIS(){
	map.getOverlays().clear();
    RemoveHeatmap();
	$("#heatPar").show("Blind","swing",500);
	var blur = document.getElementById('blur');
    var radius = document.getElementById('radius');    
	var vector = new ol.layer.Heatmap({
		title:"heatmap",
	    source: new ol.source.Vector({
		    url: './data/clowns_sql.geojson',
       		format: new ol.format.GeoJSON(),
	    }),
	    blur: parseInt(blur.value, 10),
	    radius: parseInt(radius.value, 10)
	  });

	  // vector.getSource().on('addfeature', function(event) {
	  //   // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
	  //   // standards-violating <magnitude> tag in each Placemark.  We extract it from
	  //   // the Placemark's name instead.
	  //   var name = event.feature.get('name');
	  //   var magnitude = parseFloat(name.substr(2));
	  //   event.feature.set('weight', magnitude - 5);
	  // });

	  map.addLayer(vector);

	  blur.addEventListener('input', function() {
	    vector.setBlur(parseInt(blur.value, 10));
	  });

	  radius.addEventListener('input', function() {
	    vector.setRadius(parseInt(radius.value, 10));
	  });
}

function RemoveHeatmap(){
	var layerCol=map.getLayers();
    var LayerArr=layerCol.getArray();
    var heatLayer;
    LayerArr.some(function(heatLayer){
      if(heatLayer instanceof ol.layer.Heatmap){
        map.removeLayer(heatLayer);
      }
      $("#heatPar").hide();
    });    
}

$(function() {
    $("#popup-content").tabs();
    $("#heatPar").hide();
});



function loadLineChart(datas, field_Name) {
    if (datas.length <= 1) return;
	
	
	
    var div = d3.select("#" + field_Name);
	
	
	var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
	
	
	var svg = div.append("svg")  
				 .style("width", 1500)
				 .style("height", 200);
				 
		margin = {top: 10, right: 20, bottom: 20, left: 60},
		width = 1500 - margin.left - margin.right,
		height = 200 - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	//scale
	var x = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]);

	//Axis
	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y);
	
	
	var area = d3.area()
        .curve(d3.curveLinear)
        //.interpolate("monotone")
        .x(function (d) { return x( parseTime(d[0]) ); })
		.y0(y(0))
        .y1(function (d) { return y(d[1]); });
	
	//定义直线类型
	var line = d3.line()
		.curve(d3.curveLinear)
		.x(function(d) { return x( parseTime(d[0]) ); })
		.y(function(d) { return y( d[1] ); });
		

    // Select the svg element, if it exists.
    var svg = div.selectAll('svg').data([datas]);

    //Scale宽度所对应的值
	x.domain([ parseTime(time_from),parseTime(time_to) ]);

	y.domain([
		d3.min(datas, function(d) { return d[1]; }),
		d3.max(datas, function(d) { return d[1]; })
	]);

	
	
	
	g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	g.append("g")
		.attr("class", "axis axis--y")
		.call(yAxis)
		.append("text")
		.text("Count")
		.attr("transform", "rotate(-90)")
		.attr("y", 10)
		.attr("dy", "2em")
		.attr("fill", "#000");
	
	
	g.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
	
	//添加画线的画布
	g.selectAll("time")
		.data([datas])
		.enter().append("g")
		.append("path")
		.attr("class", "line")
		.attr("clip-path", "url(#clip)")
        .attr("width",width)
        .attr("height", height)
		.attr("d", line(datas));
		
	var gradient = svg.append("defs").append("linearGradient")
        .attr("id", "gradient")
        .attr("x2", "0%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr("offset", "70%")
        .attr("stop-color", "#007399")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);
	
	g.selectAll("time")
		.data([datas])
		.enter().append("g")
		.append("path")
		.attr("class", "area")
        .attr("clip-path", "url(#clip)")
        .style("fill", "url(#gradient)")
		.attr("width",width)
        .attr("height", height)
		.attr("d", area(datas));;
	
   g.append("text")
      .attr("x", width/2 )
      .attr("y", margin.top)
      .attr("dy", "1em")
      .text("Timeline");
	
	
	var zoom = d3.zoom()
		.scaleExtent([1 / 4, 8])
		.on("zoom", draw)
		.on("end",update_linechart);
	
	g.append("rect")
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "none")
		.attr("pointer-events", "all")
		.call(zoom);
		
		
	function draw() {
	
		var xz = d3.event.transform.rescaleX(x);

		svg.select("g.axis.axis--x").call(xAxis.scale(xz));
		svg.select("path.line").attr("d", line.x(function(d) { return xz(parseTime(d[0]))}));
		svg.select("path.area").attr("d", area.x(function(d) { return xz(parseTime(d[0]))}));
	}
	
	function update_linechart() {
		var lower_bound = xAxis.scale().domain()[0];
            upper_bound = xAxis.scale().domain()[1];
		
		time_from = moment(lower_bound).format("YYYY-MM-DD HH:mm:ss");
		time_to = moment(upper_bound).format("YYYY-MM-DD HH:mm:ss");
		
		var sw = map.getBounds().getSouthWest();
		var ne = map.getBounds().getNorthEast(); 
		var bounds = sw.lng.toFixed(4)+","+ sw.lat.toFixed(4)+","+ne.lng.toFixed(4)+","+ne.lat.toFixed(4);

	
		getTimeseries();

		heatmap.redraw();
	}
	

}
function main(){
    d3.csv("data/train_reduced.csv").then(function(data) {

        data.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
            d.label = +d.label;
        });

        const classes = ['plane', 'car', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck'];
        
        // Set up canvas
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 1200 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;
    
        var svg = d3.select("#scatterPlot")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
        var xScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.x; }))
            .range([0, width]);
    
        var yScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.y; }))
            .range([height, 0]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
    
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Tooltip
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("display", "none")
            .style("pointer-events", "none")
            .style("background-color", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("padding", "5px")
            .style("border-radius", "5px");        

        // Plot points
        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
                .attr("cx", function(d) { return xScale(d.x); })
                .attr("cy", function(d) { return yScale(d.y); })
                .attr("r", 3)
                // .attr("fill-opacity", 0.7)
                .style("fill", function(d){ return colorScale(d.label); })
                .on("mouseover", (event, d) => {
                    // Neighbors
                    const distances = data.map((point) => {
                        const dx = xScale(d.x) - xScale(point.x);
                        const dy = yScale(d.y) - yScale(point.y);
                        return Math.sqrt(dx * dx + dy * dy);
                    });
                    const indices = distances
                        .map((distance, index) => ({distance, index}))
                        .sort((a, b) => a.distance - b.distance)
                        .slice(1, 8)
                        .map((item) => item.index);
                    
                    console.log(indices);

                    svg.selectAll("circle")
                        .style("stroke", (d, i) => {
                            return indices.includes(i) ? "black" : "none";
                        })
                        .style("stroke-width", (d, i) => {
                            return indices.includes(i) ? 2 : 0;
                    });

                    // Tooltip
                    const label = classes[d.label]
                    const imgFile = `images/${label}.jpeg`
                    const neighborLabels = indices.map((index) => classes[data[index].label]);
                    const list = neighborLabels.join(", ");
                    tooltip.style("display", "block")
                        .style("left", "1300px")
                        .style("top", "400px")
                        .html(`
                            <p>point label: ${label}</p>
                            <img src="${imgFile}" width="100" height="100">
                            <p>neighbor labels: ${list}</p>
                            `
                        );
                })
                .on("mouseout", () => {
                    tooltip.style("display", "none");
                });
        
        // Display Legend
        var legend = svg.selectAll(".legend")
            .data(colorScale.domain())
            .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colorScale);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return classes[d]; });

    });
}
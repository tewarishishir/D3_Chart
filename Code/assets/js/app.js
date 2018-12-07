
var svgWidth = 960;
var svgHeight = 500;

var margin ={
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// intial params
var chosenXAxis = "poverty";
var chosenYAxis = "noHealthInsurance";

// function used to update x-scale upon click on axis label
function xScale(peopleData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(peopleData, d => d[chosenXAxis]) * 0.9,
        d3.max(peopleData, d=> d[chosenXAxis]) * 1.1
    ])
    .range([0,width]);

    return xLinearScale;
}

// function used to update y-scale upon click on axis label
function yScale(peopleData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(peopleData, d =>d[chosenYAxis]) * 0.88,
        d3.max(peopleData, d=> d[chosenYAxis]) * 1.1
    ])
    .range([height,0]);

    return yLinearScale;
}

//function used for updating xAxis upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

//function used for updating yAxis upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

// function used for updating circle group with a transition to new 
function renderXCircles(circleGroup, newXScale, chosenXAxis, circletext) {

    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        ;

    circletext.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis])-8);

    return circleGroup;
}

// function used for updating circle group with a transition to new 
function renderYCircles(circleGroup, newYScale, chosenYAxis, circletext) {

    circleGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    circletext.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));

    return circleGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext) {

    if (chosenXAxis === "poverty") {
      var xlabel = "Poverty: ";
    }
    else if (chosenXAxis === "age"){
      var xlabel = "Age: ";
    }
    else {
        var xlabel = "Income: ";
    }
    
    if (chosenYAxis === "obesity") {
      var ylabel = "Obesity: ";
    }
    else if (chosenYAxis === "smokes"){
      var ylabel = "Smokes: ";
    }
    else {
        var ylabel = "Insurance: ";
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .style("background", "black")
      .style("color", "white")
      .style("font-size", "11px")
      .attr("opacity", ".5")
      .style("text-align", "center")
      .style("padding","4px")
      .style("opacity", .2)
      .style("border-radius","5px")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${chosenXAxis=="poverty" ? "%":""} <br>${ylabel} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
    circletext.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    
      circletext.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
  
    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below
  d3.csv("data/data.csv", function(peopleData) {
  
    // parse data
    peopleData.forEach(function(data) {

      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.noHealthInsurance = +data.noHealthInsurance;

    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(peopleData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(peopleData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(peopleData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "#37778b")
      .attr("opacity", ".5");

    var circletext = chartGroup.selectAll("cxtext")
      .data(peopleData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]) -8 )
      .attr("y", d => yLinearScale(d[chosenYAxis]) )
      .text(function(d) { return d.abbr;})
      .style("font-size", 10)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("dy", ".35em");

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
    
    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    var healthLabel = labelsGroup.append("text")
       .attr("y", 0 -(svgWidth/2)+46)
       .attr("x", svgHeight/2)
      .attr("transform", "rotate(-90)")
      .attr("value", "noHealthInsurance") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokeLabel = labelsGroup.append("text")
      .attr("y", 0 - (svgWidth / 2) +27 )
      .attr("x", svgHeight/2 )
      .attr("transform", "rotate(-90)")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = labelsGroup.append("text")
    .attr("y", 0 - (svgWidth / 2) +10 )
    .attr("x", svgHeight/2 )
    .attr("transform", "rotate(-90)")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log("0000000");
        console.log(value);
        console.log("1111111");
        if (value === "poverty" || value === "age" || value === "income") {
  
            console.log("X axis clicked");
            console.log(value);
          // replaces chosenXAxis with value
          chosenXAxis = value;

          // updates x scale for new data
          xLinearScale = xScale(peopleData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis, circletext);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }

        if (value === "obesity" || value === "smokes" || value === "noHealthInsurance") {
            console.log("*************");
            console.log(value);

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // updates x scale for new data
            yLinearScale = yScale(peopleData, chosenYAxis);
    
            // updates x axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);
    
            // updates circles with new x values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis, circletext);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext);
    
            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokeLabel
                  .classed("active", false)
                  .classed("inactive", true);
                  healthLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenYAxis === "smokes") {
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                  smokeLabel
                  .classed("active", true)
                  .classed("inactive", false);
                  healthLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
    
              else {
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
                smokeLabel
                .classed("active", false)
                .classed("inactive", true);
                healthLabel
                .classed("active", true)
                .classed("inactive", false);
              }
            
        }
      });

  });
  
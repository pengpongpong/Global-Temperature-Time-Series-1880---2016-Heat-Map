import { data } from "./data.js";
// import * as d3 from "d3";

// filter data
const gcag = data.filter(a => {if (a["Source"] === "GCAG") {return a}});
// const gistemp = data.filter(a => {if (a["Source"] === "GISTEMP") {return a}});

// console.log(typeof(gcag[1]["Mean"]))

const min = -0.78;
const max = 1.35;

// console.log(gistemp)
// let date = data[23]["Date"]

const regexMonth = /(?<=-)\d+(?=-)/
const regexYear = /\d{4}(?=-)/

// const resultYear = Number(date.match(regexYear))
// const resultMonth = Number(date.match(regexMonth))

// console.log(typeof(resultMonth))
// console.log(typeof(resultYear))
// console.log(resultYear)

// let test = Number(data[23]["Date"].match(regexYear))

// console.log(test)

function convertMonth(a) {
    let month;
    if (a === 1) {month = "January"};
    if (a === 2) {month = "February"};
    if (a === 3) {month = "March"};
    if (a === 4) {month = "April"};
    if (a === 5) {month = "Mai"};
    if (a === 6) {month = "June"};
    if (a === 7) {month = "July"};
    if (a === 8) {month = "August"};
    if (a === 9) {month = "September"};
    if (a === 10) {month = "October"};
    if (a === 11) {month = "November"};
    if (a === 12) {month = "December"}

    return month;
}

// console.log(resultMonth)
// console.log(convertMonth(resultMonth))

// custom tooltip
const tooltip = d3.select("#chart")
                .append("div")
                .style("background-color", "#d3d3d3")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("box-shadow", "0 0 4px 2px #d3d3d3")


const mouseover = function(e) {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "black")
        .style("cursor", "pointer")
}

const mousemove = function(e) {
    tooltip
        .html(
            `${e.toElement.__data__["Date"]}<br>
            ${(e.toElement.__data__["Mean"])}°C`
            
        )
        .style("left", `${e.offsetX + 40}px`)
        .style("top", `${e.offsetY - 7}px`)
}

const mouseleave = function(e) {
    tooltip
        .style("opactiy", 0)
    d3.select(this)
        .style("stroke", "none")
}

const margin = {
    top: 20,
    right: 10, 
    bottom: 130,
    left: 60
}

const width = 1000;
const height = 600;

// x = [margin.left, width - margin.right];
// y = [height - margin.bottom, margin.top];

// y-axis
const y = d3.scaleBand()
            .domain(gcag.map(d => convertMonth(Number(d["Date"].match(regexMonth)))))
            .range([height - margin.bottom, margin.top])
// x-axis
const x = d3.scaleBand()
            .domain(gcag.map(d => Number(d["Date"].match(regexYear))))
            .range([margin.left, width - margin.right])

// heatmap colors
const cold = ["#25316D", "#277BC0", "#89CFFD", "#C1EFFF"]
const neutral = ["#EEEEEE"]
const hot = ["#FAF4B7", "#F2D388", "#FFAE6D", "#FD841F", "#E14D2A", "#D2001A", "#820000"]
const tempValue = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4];
const heatColor = [cold[0], cold[1], cold[2], cold[3], neutral[0], hot[0], hot[1], hot[2], hot[3], hot[4], hot[5], hot[6]];

// heatmap color scale to tempearture
const color = d3.scaleLinear()
                .domain(tempValue)
                .range(heatColor)

// scale for legend
const colorScale = d3.scaleLinear()
                    .domain([d3.min(tempValue, d => d), d3.max(tempValue, d => d)])
                    .range([margin.left, width - 510])


// chart
const svg = d3.select("#chart")
                .append("svg")
                .attr("viewbox", [0, 0, width, height])
                .attr("width", width)
                .attr("height", height)

svg.append("g")
    .selectAll("rect")
    .data(gcag)
    .join("rect")
        .attr("fill", d => color(d["Mean"]))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("x", d => x(Number(d["Date"].match(regexYear))))
        .attr("y", d => y(convertMonth(Number(d["Date"].match(regexMonth)))))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

// x-axis scale
svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("font-weight", "bold")
    .call(d3.axisBottom(x)
    .tickFormat(d => {if (d % 10 === 0) {return d}}))

// y-axis scale
svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("font-weight", "bold")
    .call(d3.axisLeft(y));

// legend
let size = (width - 500 - margin.left) / tempValue.length - 1
svg.selectAll("legend")
    .data(tempValue)
    .enter()
    .append("rect")
        .style("width", size)
        .style("height", size)
        .attr("x", (d, i) => (103 + i*(size + 3.3)))
        .attr("y", `${height - 85}`)
        .style("fill", d => color(d))
        .style("border", "solid")
        .style("stroke", "black")

svg.append("g")
    .attr("transform", `translate(${margin.left}, ${height - 50})`)
    .call(d3.axisBottom(colorScale))
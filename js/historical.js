/* global d3 */
const allGroup = ['cases', 'deaths', 'recovered'];
const legendLabels = { cases: 'Số ca', deaths: 'Tử vong', recovered: 'Khỏi' };
// TODO: set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 50, left: 30 };
const _width = 960 - margin.left - margin.right;
const _height = 400 - margin.top - margin.bottom;
// append the svg object to the body of the page

const svg = d3
	.select('#historicalChart')
	.append('svg')
	// .attr("width", width + margin.left + margin.right)
	//  .attr("height", height + margin.top + margin.bottom)
	.attr('preserveAspectRatio', 'xMidYMid slice')
	.attr('viewBox', '0 0 960 400')
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// TODO: Read the data
d3.json('./data/historical.json').then((data) => {
	console.log(data);
	var groupedData = allGroup.map(function(grpName) {
		return {
			name: grpName,
			values: data.map(function(d) {
				return { date: d3.timeParse('%Y-%m-%d')(d.date), value: +d[grpName] };
			}),
		};
	});

	const colorSchema = d3
		.scaleOrdinal()
		.domain(allGroup)
		.range(d3.schemeSet2);

	// Add X axis
	const x = d3
		.scaleTime()
		.domain([
			d3.timeParse('%Y-%m-%d')(data[0].date),
			d3.timeParse('%Y-%m-%d')(data[data.length - 1].date),
		])
		.range([0, _width]);
	const xAxis = d3
		.axisBottom(x)
		.ticks(d3.timeDay)
		.tickFormat(d3.timeFormat('%m/%d'));
	svg
		.append('g')
		.attr('transform', 'translate(0,' + _height + ')')
		.call(xAxis)
		.selectAll('text')
		.attr('y', 0)
		.attr('x', 9)
		.attr('dy', '.35em')
		.attr('transform', 'rotate(90)')
		.style('text-anchor', 'start');

	// Add Y axis
	const y = d3
		.scaleLinear()
		.domain([0, 280])
		.range([_height, 0]);
	svg.append('g').call(d3.axisLeft(y));

	// Add the lines
	const line = d3
		.line()
		.x(function(d) {
			return x(+d.date);
		})
		.y(function(d) {
			return y(+d.value);
		});

	svg
		.selectAll('lines')
		.data(groupedData)
		.enter()
		.append('path')
		.attr('class', function(d) {
			return d.name;
		})
		.attr('d', function(d) {
			return line(d.values);
		})
		.attr('stroke', function(d) {
			return colorSchema(d.name);
		})
		.style('stroke-width', 2)
		.style('fill', 'none');

	// Add the points
	svg
		.selectAll('dots')
		.data(groupedData)
		.enter()
		.append('g')
		.style('fill', function(d) {
			return colorSchema(d.name);
		})
		.attr('class', function(d) {
			return d.name;
		})
		.selectAll('dots')
		.data(function(d) {
			return d.values;
		})
		.enter()
		.append('circle')
		.attr('class', 'dotHovering')
		.attr('cx', function(d) {
			return x(d.date);
		})
		.attr('cy', function(d) {
			return y(d.value);
		})
		.attr('r', 5)
		.attr('stroke', 'white');

	svg
		.selectAll('legends')
		.data(groupedData)
		.enter()
		.append('g')
		.append('text')
		.attr('x', function(d, i) {
			return 30 + i * 90;
		})
		.attr('y', 30)
		.text(function(d) {
			return `${legendLabels[d.name]} ${d.values[d.values.length - 1].value}`;
		})
		.style('fill', function(d) {
			return colorSchema(d.name);
		})
		.style('font-size', 15)
		.on('click', function(d) {
			const currentOpacity = d3.selectAll('.' + d.name).style('opacity');
			d3.selectAll('.' + d.name)
				.transition()
				.style('opacity', currentOpacity == 1 ? 0 : 1);
		});
});

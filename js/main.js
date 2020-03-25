/* global d3 */
const width = 900;
const radius = width / 2;

const dotScale = d3.scaleLog([1, 100], [3, 15]);
const sepScale = d3.scaleLog([1, 100], [1, 2]);

const radialTree = d3
	.tree()
	.size([2 * Math.PI, radius])
	.separation((a, b) => {
		let sep = 2;
		if (a.parent == b.parent) {
			// same parent
			if (a.children) {
				sep = sepScale(a.children.length);
			} else if (b.children) {
				sep = sepScale(b.children.length);
			} else {
				sep = 1;
			}
		}

		return sep / a.depth;
	});

d3.json('data/patients.json').then((patients) => {
	const keys = Object.keys(patients);
	// ID should only listed once
	const countryIds = new Set();

	// collect sources that in global `countries` object
	keys.forEach((no) => {
		const patient = patients[no];
		const sourceId = patient.source && patient.source[0];
		/* global countries */
		if (countries[sourceId]) {
			countryIds.add(sourceId);
		}
	});

	// only pick the country that's in the source of patients collection
	const sourcesTable = [];
	for (const id of countryIds) {
		sourcesTable.push({
			id,
			parent: 'sars-cov-2',
			label: countries[id].label,
		});
	}

	const patientsTable = keys.map((id) => {
		const item = patients[id];

		return Object.assign(
			{
				id: id,
				parent: item.source && item.source[0],
				label: item.label || id, // add label for patients
			},
			item
		);
	});

	// console.log(sourcesTable);

	const table = [
		{
			id: 'sars-cov-2',
			parent: null,
			label: 'SARS-CoV-2',
		},
		...sourcesTable,
		...patientsTable,
	];

	const hierarchyData = d3
		.stratify()
		.id(function(d) {
			return d.id;
		})
		.parentId(function(d) {
			return d.parent;
		})(table);
	// console.log(hierarchyData);

	renderChart(hierarchyData);
});

function renderChart(hierarchyData) {
	// create a single root tree object with shape: {
	//   children: Array(16) [ {…}, {…}, {…}, … ]
	//   data: Object { id: "sars-cov-2", parent: null, label: "SARS-CoV-2", … }
	//   depth: 0
	//   height: 4
	//   id: "sars-cov-2"
	//   parent: null
	//   x: 3.3146464862027902
	//   y: 0
	// }
	const root = radialTree(hierarchyData);
	// console.log(root);

	const svg = d3.create('svg');

	const links = svg
		.append('g')
		.attr('fill', 'none')
		.attr('stroke', '#555')
		.attr('stroke-opacity', 0.4)
		.attr('stroke-width', 1.5)
		.selectAll('path')
		.data(root.links())
		.join('path');

	// only draw the radial link from depth 1++
	links
		.filter(({ source }) => source.depth > 0)
		.attr(
			'd',
			d3
				.linkRadial()
				.angle((d) => d.x)
				.radius((d) => d.y)
		);

	svg
		.append('g')
		.selectAll('circle')
		.data(root.descendants())
		.join('circle')
		.attr(
			'transform',
			(d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
		)
		.attr('fill', ({ data }) =>
			!data.gender ? '#999' : data.gender === 'male' ? '#0066ff' : '#ff0000'
		)
		.attr('stroke', 'black')
		.attr('stroke-width', 1)
		.attr('r', (d) => (d.children ? dotScale(d.children.length) : 3));

	const labels = svg
		.append('g')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 10)
		.attr('stroke-linejoin', 'round')
		.attr('stroke-width', 3)
		.selectAll('text')
		.data(root.descendants())
		.join('text');

	labels
		.filter((d) => d.depth > 0)
		.attr(
			'transform',
			(d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
        rotate(${d.x >= Math.PI ? 180 : 0})
      `
		)
		.attr('dy', '0.31em')
		.attr('x', (d) => (d.x < Math.PI ? 6 : -6))
		.attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
		.text((d) => d.data.label)
		.clone(true) // create stroke effect on text
		.lower()
		.attr('stroke', 'white');

	const chart = svg.attr('viewBox', autoBox).node();

	document.getElementById('chart').appendChild(chart);
}

function autoBox() {
	document.body.appendChild(this);
	const { x, y, width, height } = this.getBBox();
	document.body.removeChild(this);
	return [x, y, width, height];
}

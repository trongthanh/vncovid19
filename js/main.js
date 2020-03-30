/* global d3 */
// prettier-ignore
const countries = {"AU":{"label":"Úc","icon":"icon-au.png"},"CN":{"label":"Trung Quốc","icon":"icon-cn.png"},"DE":{"label":"Đức","icon":"icon-de.png"},"DK":{"label":"Đan Mạch","icon":"icon-dk.png"},"ES":{"label":"Tây Ban Nha","icon":"icon-es.png"},"EU":{"label":"Châu Âu","icon":"icon-eu.png"},"FR":{"label":"Pháp","icon":"icon-fr.png"},"GB":{"label":"Anh","icon":"icon-gb.png"},"HU":{"label":"Hungary","icon":"icon-hu.png"},"JP":{"label":"Nhật","icon":"icon-jp.png"},"KH":{"label":"Campuchia","icon":"icon-kh.png"},"KR":{"label":"Hàn Quốc","icon":"icon-kr.png"},"MY":{"label":"Malaysia","icon":"icon-my.png"},"NL":{"label":"Hà Lan","icon":"icon-nl.png"},"RU":{"label":"Nga","icon":"icon-ru.png"},"SG":{"label":"Singapore","icon":"icon-sg.png"},"TH":{"label":"Thái Lan","icon":"icon-th.png"},"US":{"label":"Mỹ","icon":"icon-us.png"},"VN":{"label":"Việt Nam","icon":"icon-vn.png"}};
const width = 900;
const radius = width / 2;

const radiusScale = d3.scaleLog([1, 100], [3, 15]);
const sepScale = d3.scaleLog([1, 100], [1, 2]);

function getDotScale(d) {
	if (d.data.label === 'Trung Quốc') {
		console.log(d);
	}
	return radiusScale(d.children ? d.children.length : 1);
}

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
		if (countries[sourceId]) {
			countryIds.add(sourceId);
		}
	});

	// only pick the country that's in the source of patients collection
	const sourcesTable = [];
	for (const id of countryIds) {
		sourcesTable.push(
			Object.assign(
				{
					id,
					parent: 'sars-cov-2',
				},
				countries[id]
			)
		);
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
		.selectAll('path')
		.data(root.links())
		.join('path')
		.attr('fill', 'none')
		.attr('stroke', ({ target }) => (target.data.status === 'negative' ? 'green' : '#555'))
		.attr('stroke-opacity', 0.4)
		.attr('stroke-width', 1.5);

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

	const dots = svg
		.append('g')
		.selectAll('g')
		.data(root.descendants())
		.join('g')
		.attr(
			'transform',
			(d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
		);

	// drag the center
	dots
		.filter((d) => d.depth === 0)
		.append('circle')
		.attr('fill', '#f0f0f0')
		.attr('stroke', 'black')
		.attr('stroke-width', 1)
		.attr('r', (d) => `${d.children[0].y}`);

	// patients and countries with scale based on children.length
	dots
		.filter((d) => d.depth > 0)
		.append('circle')
		.attr('fill', ({ data }) =>
			!data.gender ? '#999' : data.gender === 'male' ? '#0066ff' : '#ff0000'
		)
		.attr('stroke', (d) => (d.data.status === 'negative' ? 'green' : 'black'))
		.attr('stroke-width', (d) => (d.data.status === 'negative' ? 1.5 : 1))
		.attr('r', (d) => getDotScale(d))
		.classed('tippy', true);

	// flag image for countries
	dots
		.filter((d) => d.depth === 1)
		.append('svg:image')
		.attr('xlink:href', (d) => `img/${d.data.icon}`)
		.attr('height', 3)
		.attr('width', 3)
		.attr('x', -1.5)
		.attr('y', -1.5)
		.attr(
			'transform',
			(d) => `
        rotate(${90 - (d.x * 180) / Math.PI})
        scale(${getDotScale(d) * 1.2})
      `
		);

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

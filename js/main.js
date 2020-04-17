/* global d3 */
// inline from sources.json
// prettier-ignore
const countries = {"AU":{"label":"Úc","icon":"icon-au.png"},"CA":{"label":"Canada","icon":"icon-ca.png"},"CH":{"label":"Thụy Sĩ","icon":"icon-ch.png"},"CN":{"label":"Trung Quốc","icon":"icon-cn.png"},"CZ":{"label":"CH Séc","icon":"icon-cz.png"},"DE":{"label":"Đức","icon":"icon-de.png"},"DK":{"label":"Đan Mạch","icon":"icon-dk.png"},"ES":{"label":"Tây Ban Nha","icon":"icon-es.png"},"EU":{"label":"Châu Âu","icon":"icon-eu.png"},"FR":{"label":"Pháp","icon":"icon-fr.png"},"GB":{"label":"Anh","icon":"icon-gb.png"},"GR":{"label":"Hy Lạp","icon":"icon-gr.png"},"HU":{"label":"Hungary","icon":"icon-hu.png"},"JP":{"label":"Nhật","icon":"icon-jp.png"},"KH":{"label":"Campuchia","icon":"icon-kh.png"},"KR":{"label":"Hàn Quốc","icon":"icon-kr.png"},"MY":{"label":"Malaysia","icon":"icon-my.png"},"NL":{"label":"Hà Lan","icon":"icon-nl.png"},"RU":{"label":"Nga","icon":"icon-ru.png"},"SG":{"label":"Singapore","icon":"icon-sg.png"},"TH":{"label":"Thái Lan","icon":"icon-th.png"},"US":{"label":"Mỹ","icon":"icon-us.png"},"VN":{"label":"Trong cộng đồng","icon":"icon-vn.png"},"IMPORT":{"label":"Nước Ngoài","icon":"icon-globe.svg"},"BVBM":{"label":"BV Bạch Mai","icon":"icon-bvbm.png"}};
const width = 1320;
const radius = width / 2;

const radiusScale = d3.scaleLog([1, 100], [3, 15]);
const sepScale = d3.scaleLog([1, 100], [1, 2]);

const getDotScale = (d) => radiusScale(d.children ? d.children.length : 1);

const tooltip = d3
	.select('body')
	.append('div')
	.attr('class', 'svg-tooltip')
	.style('position', 'absolute')
	.style('visibility', 'hidden');

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

// summary object, to be updated qhen data is fetched
const summary = {
	total: 0,
	positive: 0,
	negative: 0,
	deceased: 0,
	latestPositiveDate: '',
	latestDischargeDate: '',
};

const todayStr = new Date().toLocaleDateString('sv'); // this locale has format YYYY-MM-DD

d3.json(`data/patients.json?date=${todayStr}`).then(({ modified, data: patients = [] }) => {
	// update modified time
	d3.select('#modified-time').text(`Cập nhật lần cuối: ${new Date(modified).toLocaleString()}.`);

	// ID should only listed once
	const countryIds = new Set();

	// collect sources that in global `countries` object
	patients.forEach((patient) => {
		const sourceId = patient.source && patient.source[0];
		if (countries[sourceId]) {
			countryIds.add(sourceId);
		}
	});

	// only pick the country that's in the source of patients collection
	const sourcesTable = [];
	for (const id of countryIds) {
		// these sources need a single root, that is sars-cov-2
		sourcesTable.push(
			Object.assign(
				{
					id,
					parent: 'root',
				},
				countries[id]
			)
		);
	}

	const patientsTable = patients.map((patient) => {
		return Object.assign(
			{
				id: patient.id,
				parent: patient.source && patient.source[0],
				label: patient.label || patient.id, // add label for patients
			},
			patient
		);
	});

	summary.total = patientsTable.length;
	summary.negative = patientsTable.reduce(
		(negTotal, patient) => (patient.status === 'negative' ? negTotal + 1 : negTotal),
		0
	);
	summary.deceased = patientsTable.reduce(
		(dieTotal, patient) => (patient.status === 'deceased' ? dieTotal + 1 : dieTotal),
		0
	);
	summary.positive = summary.total - summary.negative - summary.deceased;

	// find latest positive date to highlight
	summary.latestPositiveDate = patientsTable.reduce((latestDate, patient) => {
		// the format YYYY-MM-DD allows to sort the string directly
		return patient.positiveDate > latestDate ? patient.positiveDate : latestDate;
	}, '0000-00-00');

	summary.latestDischargeDate = patientsTable.reduce((latestDate, patient) => {
		// the format YYYY-MM-DD allows to sort the string directly
		return patient.dischargeDate > latestDate ? patient.dischargeDate : latestDate;
	}, '0000-00-00');

	// console.log('latest', summary.latestPositiveDate);

	// console.log(sourcesTable);

	const table = [
		{
			id: 'root',
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
		.attr('stroke', ({ target: { data } }) => {
			if (data.status === 'negative') {
				return data.dischargeDate === summary.latestDischargeDate ? '#51cf66' : '#2b8a3e';
			}
			// console.log('latestPositiveDate', data.positiveDate === summary.latestPositiveDate);
			return data.positiveDate === summary.latestPositiveDate ? '#000' : '#999';
		})
		.attr('stroke-opacity', 1)
		.attr('stroke-width', 1);

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

	// draw the center
	const centerDot = dots
		.filter((d) => d.depth === 0)
		.append('g')
		.attr('transform', (d) => `rotate(${90 - (d.x * 180) / Math.PI})`);

	centerDot
		.append('circle')
		.attr('fill', '#f0f0f0')
		.attr('stroke', 'black')
		.attr('stroke-width', 1)
		.attr('r', (d) => `${d.children[0].y}`);

	const summaryLines = [
		`Tổng số ca: ${summary.total}`,
		`Số ca dương tính: ${summary.positive}`,
		`Số ca chữa khỏi: ${summary.negative}`,
		`Số ca tử vong: ${summary.deceased}`,
	];

	centerDot
		.selectAll('text')
		.data(summaryLines)
		.join('text')
		.attr('x', -70)
		.attr('y', (d, i) => -20 + i * 20)
		.text((d) => d);

	// patients and countries with scale based on children.length
	dots
		.filter((d) => d.depth > 0)
		.append('circle')
		.attr('fill', dotColor)
		.attr('stroke', (d) => (d.data.status === 'negative' ? '#226633' : 'black'))
		.attr('stroke-width', 1)
		.attr('r', (d) => getDotScale(d));

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

	dots
		.filter((d) => d.depth > 0)
		.on('mouseover', function(d) {
			return tooltip.style('visibility', 'visible').text(tooltipText(d));
		})
		.on('mousemove', tooltipPosition)
		.on('mouseout', function() {
			return tooltip.style('visibility', 'hidden');
		});

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
		.style('cursor', 'default')
		.attr('dy', '0.31em')
		.attr('x', (d) => (d.x < Math.PI ? 6 : -6))
		.attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
		.text((d) => d.data.label)
		.clone(true) // create stroke effect on text
		.lower()
		.attr('stroke', 'white');

	labels
		.on('mouseover', function(d) {
			tooltip.style('visibility', 'visible').text(tooltipText(d));
		})
		.on('mousemove', tooltipPosition)
		.on('mouseout', function() {
			tooltip.style('visibility', 'hidden');
		});

	const chart = svg.attr('viewBox', autoBox).node();

	document.getElementById('chart').appendChild(chart);

	renderLegend(svg);

	const latestPositiveLinks = links.filter(
		({ target: { data } }) => data.positiveDate === summary.latestPositiveDate
	);

	// blinking negative links makes the chart chaotic
	const latestNegativeLinks = links.filter(
		({ target: { data } }) => data.dischargeDate === summary.latestDischargeDate
	);

	// animations
	function tick() {
		// this value oscillate from 0 to 1 at 1 second interval
		const osc = (Math.sin(Date.now() / 250) + 1) * 0.5;

		if (osc >= 0.5) {
			latestPositiveLinks.attr('stroke', '#999');
			latestNegativeLinks.attr('stroke', '#999');
		} else {
			latestPositiveLinks.attr('stroke', '#000');
			latestNegativeLinks.attr('stroke', '#51cf66');
		}

		// this updates too much, only use it when we need smooth animation
		// requestAnimationFrame(tick);
	}

	setInterval(tick, 250);
}

function renderLegend(svg) {
	// prettier-ignore
	const patientColorScale = d3.scaleOrdinal(
		['Nữ < 60 tuổi', 'Nữ ≥ 60 tuổi', 'Nam < 60 tuổi', 'Nam ≥ 60 tuổi', 'Người < 60 tuổi', 'Người ≥ 60 tuổi'],
		['#fa5252', '#991111', '#339af0', '#2244ee', '#999', '#666']
	);
	const dotsLegend = d3
		.legendColor()
		.scale(patientColorScale)
		.shape('circle')
		.shapeRadius(5);

	const linkColorScale = d3.scaleOrdinal(
		[
			'Ca dương tính',
			'Ca dương tính mới nhất',
			'Ca đã âm tính và xuất viện',
			'Ca đã xuất viện mới nhất',
		],
		['#999', '#000', '#2b8a3e', '#51cf66']
	);

	const linksLegend = d3
		.legendColor()
		.scale(linkColorScale)
		.shape('line');

	const legendPanel = svg
		.append('g')
		.classed('legend-panel', true)
		.attr('text-anchor', 'start')
		.attr('transform', 'translate(-400,-400)')
		.style('font-size', '12px');

	legendPanel.append('g').call(dotsLegend);
	legendPanel
		.append('g')
		.attr('transform', 'translate(150,0)')
		.call(linksLegend);
}

function autoBox() {
	document.body.appendChild(this);
	const { x, y, width, height } = this.getBBox();
	document.body.removeChild(this);
	return [x, y, width, height];
}

function dotColor({ data: { gender, age } = { gender: '', age: -1 } }) {
	if (age >= 60) {
		// colors f60or senior patients
		return !gender ? '#666' : gender === 'male' ? '#2244ee' : '#991111';
	}

	// colors for younger patients
	return !gender ? '#aaa' : gender === 'male' ? '#339af0' : '#fa5252';
}

function tooltipPosition() {
	tooltip
		.style('top', d3.event.pageY - 10 + 'px')
		.style(
			'left',
			(d3.event.pageX > window.innerWidth - 320 ? d3.event.pageX - 340 : d3.event.pageX + 10) + 'px'
		);
}

function tooltipText(d) {
	const {
		id,
		parent,
		children = [],
		data: { label, desc = '' },
	} = d;

	// tooltip for root
	if (!parent) {
		return `Tổng số ca: ${summary.total}.\nSố ca âm tính ${summary.negative}.`;
	}

	const childrenCount = children.length;
	const descendantsCount = countDescendants(d);

	// tooltip for source or cluster
	if (parent.id === 'root') {
		return `Nguồn lây: ${label}
- Lây trực tiếp cho ${childrenCount} người
- Lây cho tất cả: ${descendantsCount} người`;
	}
	// tooltip for patients
	let patientTooltip = `BN${id} - Nguồn lây từ: ${parent.data.label}`;
	if (childrenCount) {
		patientTooltip += `\n- Lây trực tiếp cho: ${childrenCount} người`;
	}
	if (descendantsCount > childrenCount) {
		patientTooltip += `\n- Lây cho tất cả: ${descendantsCount} người`;
	}

	patientTooltip += `\n[${desc}]`;

	return patientTooltip;
}

/**
 *
 * @param {Object<{children, data}>} node the node object of the hierachy tree
 * @param {boolean} notRoot=false use to skip the first node during recursive calls
 * @return {number} the number of descendants from the node
 */
function countDescendants(node, notRoot = false) {
	// only count people, not sources or cluster
	let childrenCount = notRoot && node.data && node.data.positiveDate ? 1 : 0;
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			// console.log('count child', child);
			childrenCount += countDescendants(child, true);
		}
	}
	return childrenCount;
}

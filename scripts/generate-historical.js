#!/usr/local/bin/node
// Script to convert from patients.json to historical.json
// Should be run with local time GMT+7

const fs = require('fs');
const path = require('path');
const d3 = require('../js/d3.min.js');
const patientsJson = require('../data/patients.json');

const patients = patientsJson.data;

const dateRange = [patients[0].positiveDate, patients[0].dischargeDate];
// find the date range
patients.forEach((patient) => {
	const pd = patient.positiveDate;
	const dd = patient.dischargeDate;

	if (pd < dateRange[0]) dateRange[0] = pd;
	if (pd > dateRange[1]) dateRange[1] = pd;
	if (dd < dateRange[0]) dateRange[0] = dd;
	if (dd > dateRange[1]) dateRange[1] = dd;
});

console.log('Generate historical date for', dateRange);

const dateScale = d3
	.scaleTime()
	.domain([d3.timeParse('%Y-%m-%d')(dateRange[0]), d3.timeParse('%Y-%m-%d')(dateRange[1])]);

const dateArr = dateScale.ticks(d3.timeDay).map(d3.timeFormat('%Y-%m-%d'));

// console.log(dateArr);

const dailyChanges = dateArr.map((date) => {
	return patients.reduce(
		(row, patient) => {
			if (patient.positiveDate === date) {
				row.dailyCases += 1;
			}
			if (patient.dischargeDate === date) {
				if (patient.status === 'deceased') {
					row.dailyDeaths += 1;
				} else {
					row.dailyRecovered += 1;
				}
			}
			return row;
		},
		{ date, dailyCases: 0, dailyDeaths: 0, dailyRecovered: 0 }
	);
});

let cases = 0;
let deaths = 0;
let recovered = 0;
const historicalData = dailyChanges.map((row) => {
	cases += row.dailyCases;
	deaths += row.dailyDeaths;
	recovered += row.dailyRecovered;
	row.cases = cases;
	row.deaths = deaths;
	row.recovered = recovered;
	return row;
});

// to keep each row on the same line
const historicalRows = historicalData.map((row) => {
	return JSON.stringify(row);
});

const historicalJson = `[
	${historicalRows.join(',\n\t')}
]`;

// console.log(historicalData);
fs.writeFileSync(path.resolve(__dirname, '../data/historical.json'), historicalJson);

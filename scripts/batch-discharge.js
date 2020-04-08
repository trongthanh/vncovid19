// Quick script to insert dischargeDate and turn status to "negative"
// Example: Run the script with following params
// node scripts/batch-discharge.js 2020-04-07 12,14,156
const fs = require('fs');
const path = require('path');
const patientsJson = require('../data/patients.json');

const dateStr = process.argv[2];
const patientIds = process.argv[3].split(',');

console.log('Discharge date:', dateStr);
console.log('Changing status for patients:', patientIds);

patientIds.forEach((id) => {
	const p = patientsJson.data[id];
	if (!p) return;
	// overwrite with new dischargeDate
	patientsJson.data[id] = {
		positiveDate: p.positiveDate,
		dischargeDate: dateStr,
		gender: p.gender,
		age: p.age,
		treatLoc: p.treatLoc,
		from: p.from,
		nationality: p.nationality,
		status: 'negative',
		flights: p.flights,
		source: p.source,
		desc: p.desc,
	};
});

// these 2 steps to keep Array items the same line, for e.g: ["45", "34"]
const jsonStep1 = JSON.stringify(
	patientsJson,
	(key, value) => {
		if (Array.isArray(value)) {
			return JSON.stringify(value);
		}

		return value;
	},
	'\t'
);

// turn "[\"45\",\"34\"]" back to Array literal
const jsonStep2 = jsonStep1
	.replace(/"\[/g, '[')
	.replace(/\]"/g, ']')
	.replace(/\\"/g, '"')
	.replace(/,"/g, ', "');

fs.writeFileSync(path.resolve(__dirname, '../data/patients.json'), jsonStep2);

console.log('Batch task done');

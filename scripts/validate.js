const patients = require('../data/patients.json');

function validatePatients() {
	const keys = Object.keys(patients);
	const count = keys.length;

	for (let num = 1; num <= count; num++) {
		const patient = patients[num];
		if (patient == null) {
			throw new Error(`Patient ${num} is undefined`);
		}

		if (patient.positiveDate == null) {
			throw new Error(`Patient ${num} doesn't have positiveDate`);
		}

		if (patient.source == null || patient.source[0] == null) {
			throw new Error(`Patient ${num} doesn't have source`);
		}
	}

	return true;
}

if (validatePatients()) console.log('OK');
else console.log('Errors');

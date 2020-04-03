const Ajv = require('ajv');

const ajv = new Ajv();
const validatePatientsSchema = ajv.compile(require('../data/patients-schema.json'));

const patientsJson = require('../data/patients.json');

function validatePatientsData(patientsJson) {
	if (validatePatientsSchema(patientsJson)) {
		// check total
		const patientIds = Object.keys(patientsJson.data);
		if (patientIds.length !== patientsJson.total) {
			console.error(`Errors: meta total expect to be ${patientIds.length}`);
			return false;
		}
		return true;
	}

	console.error('Errors:', validatePatientsSchema.errors);
	return false;
}

if (validatePatientsData(patientsJson)) console.log('patients.json OK');
else {
	process.exit(1);
}

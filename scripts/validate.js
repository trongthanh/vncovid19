const Ajv = require('ajv');

const ajv = new Ajv();
const validate = ajv.compile(require('../data/patients-schema.json'));

const patientsJson = require('../data/patients.json');

if (validate(patientsJson)) console.log('patients.json OK');
else console.log('Errors:', validate.errors);

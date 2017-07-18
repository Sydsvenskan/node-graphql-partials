#!/usr/bin/env node
'use strict';

const dashdash = require('dashdash');

const options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.'
  }
];

const parser = dashdash.createParser({ options });

let opts;

try {
  opts = parser.parse(process.argv);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

if (opts.help) {
  const help = parser.help().trimRight();
  process.stdout.write(
    '\n' +
    'Usage: graphql-partials <path to schema>\n\n' +
    'Options:\n' +
    help +
    '\n\n'
  );
  process.exit(0);
}

const fs = require('fs');
const renderSchemaWithPartials = require('./');

const schemaFile = opts._args[0];

if (!schemaFile) {
  console.error('You need to specify the schema to transform');
  process.exit(1);
}

let extendedSchema, rendered;

try {
  extendedSchema = fs.readFileSync(schemaFile, { encoding: 'utf8' });
} catch (err) {
  console.error('Failed to read schema file');
  process.exit(1);
}

try {
  rendered = renderSchemaWithPartials(extendedSchema);
} catch (err) {
  console.error('Failed to transform schema');
  process.exit(1);
}

process.stdout.write('# WARNING: THIS OUTPUT HAS BEEN AUTOMATICALLY GENERATED\n' + rendered + '\n');

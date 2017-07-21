'use strict';

const schemaParser = require('./schema-parser');

const removeBeginningNewLine = (function () {
  const pattern = /^[\r\n]+/;
  return text => text.replace(pattern, '');
}());

const removeTrailingNewLine = (function () {
  const pattern = /[\r\n]+$/;
  return text => text.replace(pattern, '');
}());

const trimNewLine = (text) => removeBeginningNewLine(removeTrailingNewLine(text));

const getExtensions = (item) => (item.extensions || []).reduce((map, item) => {
  map[item.type] = item.names;
  return map;
}, {});

const resolveContent = function (item, parentItem) {
  if (item.contentResolved) { return item.content; }
  if (item.contentResolveInProgress) {
    throw new Error(`Circular "${item.name}" partial on "${parentItem.name}" partial`);
  }

  item.contentResolveInProgress = true;

  let content = item.content || '';

  const partialContent = item.partials
    .map(partialObject => removeTrailingNewLine(resolveContent(partialObject, item)))
    .join('\n');

  if (partialContent) {
    content = '\n' + trimNewLine(partialContent) + '\n' + content;
  }

  content = '\n' + trimNewLine(content) + '\n';

  item.content = content;
  item.contentResolved = true;
  delete item.contentResolveInProgress;

  return content;
};

const renderSchemaWithPartials = function (schema) {
  const parsedSchema = schemaParser.parse(schema);

  const partials = parsedSchema
    .filter(item => typeof item === 'object' && item.type === 'partial' && item.name)
    .reduce((map, item) => {
      map[item.name] = item;
      return map;
    }, {});

  parsedSchema.forEach(item => {
    if (typeof item === 'string') { return; }

    const extensions = getExtensions(item);

    item.partials = (extensions.using || []).map(partial => {
      const partialObject = partials[partial];

      if (!partialObject) {
        throw new Error(`Missing "${partial}" partial`);
      }

      return partialObject;
    });
  });

  return parsedSchema
    .map(item => {
      if (typeof item === 'string') {
        return '# ' + item;
      }

      if (item.type === 'partial') { return; }

      const extensions = getExtensions(item);
      delete extensions.using;
      const extensionList = Object.keys(extensions)
        .map(extension => ' ' + extension + ' ' + extensions[extension].join(', '));

      const name = item.name ? ' ' + item.name : '';

      const content = resolveContent(item);

      const result = `${item.type}${name}${extensionList} {${content}}\n`;

      return result;
    })
    .filter(item => !!item)
    .join('\n');
};

module.exports = renderSchemaWithPartials;

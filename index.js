'use strict';

const schemaParser = require('./schema-parser');

const removeTrailingNewLine = (function () {
  const pattern = /[\r\n]+$/;
  return text => text.replace(pattern, '');
}());

const getExtensions = (item) => (item.extensions || []).reduce((map, item) => {
  map[item.type] = item.names;
  return map;
}, {});

const renderSchemaWithPartials = function (schema) {
  const parsedSchema = schemaParser.parse(schema);

  const partials = parsedSchema
    .filter(item => typeof item === 'object' && item.type === 'partial' && item.name)
    .reduce((map, item) => {
      map[item.name] = item;
      return map;
    }, {});

  return parsedSchema
    .map(item => {
      if (typeof item === 'string') {
        return '# ' + item;
      }

      if (item.type === 'partial') { return; }

      const extensions = getExtensions(item);

      let content = item.content || '';

      if (extensions.using) {
        // TODO: Throw error on missing partial?
        const partialContent = extensions.using
          .map(partial => {
            const partialObject = partials[partial];
            if (!partialObject) {
              throw new Error(`Missing "${partial}" partial`);
            }
            return removeTrailingNewLine(partialObject.content || '');
          })
          .join('\n');

        content = partialContent + '\n' + content;

        delete extensions.using;
      }

      content = removeTrailingNewLine(content) + '\n';

      const extensionList = Object.keys(extensions)
        .map(extension => ' ' + extension + ' ' + extensions[extension].join(', '));

      const name = item.name ? ' ' + item.name : '';

      const result = `${item.type}${name}${extensionList} {${content}}\n`;

      return result;
    })
    .filter(item => !!item)
    .join('\n');
};

module.exports = renderSchemaWithPartials;

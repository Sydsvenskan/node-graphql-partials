'use strict';

const chai = require('chai');

const should = chai.should();

const baseSchema = `# Foobar

schema {
  query: Query
}

partial FooFields {
  # This is a documentation of the field 👌
  foo: String
}

partial ContentFields {
  content: [String]
}

interface ContentInterface using ContentFields {
}

# Wow 😧 Is this real?
# 🚀 Very much so!

interface Document implements ContentInterface using FooFields & ContentFields {
  uuid: ID!
}
`;

const baseRendering = `# Foobar
schema {
  query: Query
}

interface ContentInterface {
  content: [String]
}

# Wow 😧 Is this real?
# 🚀 Very much so!
interface Document implements ContentInterface {
  # This is a documentation of the field 👌
  foo: String

  content: [String]

  uuid: ID!
}
`;

describe('renderSchemaWithPartials', function () {
  const renderSchemaWithPartials = require('../../');

  describe('main', () => {
    it('should include partial definitions into other definitions', () => {
      renderSchemaWithPartials(baseSchema).should.equal(baseRendering);
    });

    it('should throw on missing partial', () => {
      should.Throw(() => {
        renderSchemaWithPartials(`interface Document using ContentField {}`);
      }, /Missing "ContentField" partial/);
    });

    it('should support partials on partials', () => {
      renderSchemaWithPartials(
        'partial FooFields {\n' +
        '  foo: String\n' +
        '}\n' +
        'partial BarFields using FooFields {\n' +
        '  bar: String\n' +
        '}\n' +
        'type Document using BarFields {}\n'
      ).should.equal(
        'type Document {\n' +
        '  foo: String\n' +
        '\n' +
        '  bar: String\n' +
        '}\n'
      );
    });

    it('should throw on circular partials', () => {
      should.Throw(() => {
        renderSchemaWithPartials(`
          partial FooFields using BarFields { foo: String }
          partial BarFields using FooFields { bar: String }
          type Document using BarFields {}
        `);
      }, /Circular "BarFields" partial on "FooFields" partial/);
    });
  });
});

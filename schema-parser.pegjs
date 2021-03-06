// Very simple schema parser
// TODO: Add support for multiline descriptions

Expression
  = data:(SingleLineDescription / Comment / Type)* _* { return data; }

Type
  = _? type:String name:SpacePrefixedString? extensions:Extension* _? "{" content:TypeContent "}" {
    return { type, name, extensions, content };
  }

TypeContent
  = [^}]* { return text(); }

Extension
  = _ type:String _ names:AmpersandSeparatedString {
    return { type, names };
  }

Implements
  = _ "implements" _ interfaces:AmpersandSeparatedString { return interfaces; }

Uses
  = _ "using" _ traits:AmpersandSeparatedString { return traits; }

SingleLineDescription
  = _? '"' description:SingleLineString '"' sp* nl {
    return { type: 'description', content: description };
  }

Comment
  = _? "#" comment:EverythingButNewline sp* nl {
    return { type: 'comment', content: comment };
  }

AmpersandSeparatedString
  = head:String tail:(AmpersandPrefixedString)* {
    return [head].concat(tail);
  }

AmpersandPrefixedString
  = _? "&" _? value:String { return value; }

SpacePrefixedString
  = _ value:String { return value; }

EverythingButNewline
  = (sp* [^\r\n])+ { return text().trim(); }

SingleLineString
  = (sp* [^\r\n\"])+ { return text(); }

String "string"
  = [a-zA-Z0-9]+ { return text(); }

sp "space"
  = [ \t]+

_ "whitespace"
  = [ \t\n\r]+

nl "newline"
  = [\r\n]+

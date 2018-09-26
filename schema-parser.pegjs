// Very simple schema parser

Expression
  = data:(Comment / Type)* _* { return data; }

Type
  = _? type:String name:SpacePrefixedString? extensions:Extension* _? "{" content:TypeContent "}" {
    return { type,  name, extensions, content };
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

Comment
  = _? "#" comment:EverythingButNewline sp* nl { return comment.trim(); }

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

String "string"
  = [a-zA-Z0-9]+ { return text(); }

sp "space"
  = [ \t]+

_ "whitespace"
  = [ \t\n\r]+

nl "newline"
  = [\r\n]+

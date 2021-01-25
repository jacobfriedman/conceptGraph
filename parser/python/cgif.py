"""
Module:  cgif

Imports from modules:  cgif, string, types

A recursive-descent parser for the Conceptual Graph Interchange Form.
Each syntactic category X of CGIF is parsed by a function X().
Each parsing function is preceded by a comment, which contains
the corresponding CGIF syntax rule from the CG standard.

The input to be parsed is a tokenized list, which is created by the
function Tokenize(string) in the module cgiftok.py.  During the parse,
the list to be parsed is stored in a global variable named tokens.  The
current token is tokens[cursor], where cursor is also a global variable.

For each syntactic cateory X, the function X() begins parsing at
tokens[cursor] and advances cursor as it goes.  The output returned
is a tuple containing nested tuples.  When the category X is found,
the function X() returns a tuple of the form ("X",c1,c2,...) where the
constituents of X are represented by nested tuples c1, c2, etc.  After
X() finds an X, tokens[cursor] is the token following the last token
of X.  When the list of tokens has been exhausted, cursor>=len(tokens).

If X() fails to find an occurrence of category X, two kinds of failures
are possible:  recoverable and unrecoverable.  In a recoverable failure,
cursor has not been advanced, and function X() returns a value considered
as Boolean false:  0, None, "", (), or [].  A recoverable failure usually
indicates an option not taken, but an unrecoverable failure indicates a
syntactic error in the input string.

This software is copyright (c) 2000 by John F. Sowa and distributed
free of charge according to the provisions of the GPL license.
"""

from cgiftok import Tokenize
from string import lower, digits, letters, join
from types import *
letterUnder = letters + "_"
letterDigitUnder = letterUnder + digits
specialConLabels = "if", "then", "either", "or", "sc", "else"
reservedLabels = specialConLabels + ("lambda", "else")

global tokens, cursor                        # Global to cgif.py
tokens=[]                                    # Default list of tokens
cursor=0                                     # Default parsing position

"""
When an unrecoverable failure is found, the function errMsg(target)
returns a string saying that an error was found while looking for target.
The error message includes eight tokens surrounding the point where the
error was detected.  Variables CGIFerr and TokErr represent the error type.
"""
CGIFerr = "CGIF"                            # Error in parsing CGIF list
Tokerr = "Token"                            # Error in tokenizing input

def errMsg(target):
   "Report error found while searching for target"
   global tokens, cursor
   return ("CGIF error in %s near input string: %s"
      % (target,`join(tokens[cursor-4:cursor+4])`))

"""
The LookFor(chars) function checks whether the current token begins
with any character in the string named chars.  If not, it returns None.
If so, it advances cursor and returns the current token.
"""
def LookFor(chars):
   "Check whether tok[0] of curent token is in chars"
   global tokens, cursor
   if cursor>=len(tokens): return None
   tok=tokens[cursor]
   if tok[0] not in chars: return None
   cursor=cursor+1
   return tok

"""
The ListOf(X) function looks for a list of zero or more occurrences
of the constituent X with no separators between X's.  When it finishes,
it returns a list containing the X's that were found, and cursor points
to the token following the last X.  If no X is found, it returns [],
and cursor is left unchanged.
"""
def ListOf(X):
   global tokens, cursor
   c1=[]
   while cursor<len(tokens):
      c=X()
      if not c: break
      c1.append(c)
   return c1

"""
The CommaListOf(X) function looks for a list of zero or more occurrences
of the constituent X with commas between X's.  If there is no occurrence
of an X after some comma, the CommaListOf(X) raises an error exception.
When CommaListOf(X) finishes successfully, it returns a list containing
the X's that were found, and cursor points to the token following the
last X.  If no X is found, [] is returned, and cursor is unchanged.
"""
def CommaListOf(X):
   global tokens, cursor
   c=X()
   if not c: return []
   c1=[c]
   while cursor<len(tokens) and LookFor(","):
      c=X()
      if not c: raise CGIFerr, errMsg("missing something after comma")
      c1.append(c)
   return c1

"""
An actor begins with "<" followed by a type.  It continues with zero
or more input arcs, a separator "|", zero or more output arcs, and
an optional comment.  It ends with ">".

Actor  ::=  "<" Type Arc* "|" Arc* Comment? ">"
"""
def Actor():
   if not LookFor("<"): return None
   c1=Type()
   if not c1: raise CGIFerr, errMsg("actor type")
   c2=ListOf(Arc)
   if not LookFor("|"): raise CGIFerr, errMsg("actor separator")
   c3=ListOf(Arc)
   c4=LookFor(";")
   if not LookFor(">"): raise CGIFerr, errMsg("actor ending")
   return "Actor", c1,c2,c3,c4

"""
An arc is a concept or a bound label.

Arc  ::=  Concept | BoundLabel
"""
def Arc():
   c1=Concept() or BoundLabel()
   if not c1: return None
   return "Arc", c1

"""
A bound label (BoundLabel) is a question mark "?" followed by an identifier.

BoundLabel  ::=  "?" Identifier
"""
def BoundLabel():
   if not LookFor("?"): return None
   c1=LookFor(letterUnder)
   if not c1: raise CGIFerr, errMsg("bound label")
   return "BoundLabel", c1

"""
A conceptual graph (CG) is a list of zero or more concepts,
conceptual relations, actors, special contexts, or comments.

CG  ::=  (Concept | Relation | Actor | SpecialContext | Comment)*
"""
def CG():
   c1 = ListOf(CGstuff)
   if not c1: return None
   return "CG", c1

def CGstuff():
   return Concept() or Relation() or Actor() or SpecialContext() or LookFor(";")

"""
A concept begins with a left bracket "[" and an optional monadic type
followed by optional coreference links and an optional referent in either
order.  It ends with an optional comment and a required "]".

Concept  ::=  "[" Type(1)? {CorefLinks?, Referent?} Comment? "]"
"""
def Concept():
   global tokens, cursor
   if not LookFor("["): return None
   if SpecialConLabel():
      cursor=cursor-2                       # Make cursor point to "["
      return None
   c1=Type(1)                               # Type must have valence=1
   c2=CorefLinks()
   c3=Referent()
   c=CorefLinks()
   if c:
      if c2: raise CGIFerr, errMsg("too many coreference links")
      else: c2=c
   c4=LookFor(";")
   if not LookFor("]"): raise CGIFerr, errMsg("concept ending")
   return "Concept", c1,c2,c3,c4

"""
A conjunction list (Conjuncts) consists of one or more type terms
separated by "&".

Conjuncts(N)  ::=  TypeTerm(N) ("&" TypeTerm(N))*

The conjunction list must have the same valence N as every type term.
"""
def Conjuncts(N):
   global tokens, cursor
   c=TypeTerm(N)
   if not c: return None
   c1=[c]
   while cursor<len(tokens) and LookFor("&"):
      c=TypeTerm(N)
      if not c: raise CGIFerr, errMsg('missing something after "&"')
      c1.append(c)
   return "Conjuncts", c1

"""
Coreference links (CorefLinks) are either a single defining
coreference label or a sequence of zero or more bound labels.

CorefLinks  ::=  DefLabel | BoundLabel*
"""
def CorefLinks():
   c=DefLabel()
   if c: c1=[c]
   else: c1=ListOf(BoundLabel)
   if not c1: return None
   return "CorefLinks", c1

"""
A defining label (DefLabel) is an asterisk "*" followed by an identifier.

DefLabel  ::=  "*" Identifier
"""
def DefLabel():
   if not LookFor("*"): return None
   c1=LookFor(letterUnder)
   if not c1: raise CGIFerr, errMsg("defining label")
   return "DefLabel", c1

"""
A descriptor is a structure or a nonempty CG.

Descriptor  ::=  Structure | CG
"""
def Descriptor():
   global tokens, cursor
   c1=Structure() or CG()
   if not c1: return None
   if c1[0]=="CG":                          # Check for comment before "]"
      c=c1[1][-1]                           # Extract last element of CG
      if type(c)==StringType and c[0]==";" and tokens[cursor]=="]":
         c1="CG",c1[1][:-1]                 # Remove final comment from CG
         cursor=cursor-1                    # Point cursor at comment
      if not c1[1]: return None             # Nothing left in CG
   return "Descriptor", c1

"""
A designator is a literal, a locator, or a quantifier.

Designator  ::=  Literal | Locator | Quantifier
"""
def Designator():
   c1=Literal() or Locator() or Quantifier()
   if not c1: return None
   return "Designator", c1

"""
A disjunction list consists of one or more conjunction lists separated by "|".

Disjuncts(N)  ::=  Conjuncts(N) ("|" Conjuncts(N))*

The disjunction list must have the same valence N as every
conjunction list.
"""
def Disjuncts(N):
   global tokens, cursor
   c=Conjuncts(N)
   if not c: return None
   c1=[c]
   while cursor<len(tokens) and LookFor("|"):
      c=Conjuncts(N)
      if not c: raise CGIFerr, errMsg('missing something after "|"')
      c1.append(c)
   return "Disjuncts", c1

"""
A formal parameter is a monadic type followed by a optional defining label.

FormalParameter  ::=  Type(1) [DefLabel]
"""
def FormalParameter():
   c1=Type(1)
   if not c1: return None
   c2=DefLabel()
   return "FormalParameter", c1,c2

"""
An indexical is the character "#" followed by an optional identifier.

Indexical  ::=  "#" Identifier?

An individual marker is the character "#" followed by an integer.

IndividualMarker  ::=  "#" UnsignedInt

The category IndexIndiv is either an indexical or an individual marker.

IndexIndiv  ::= "#" (UnsignedInt | Identifier?)
"""
def IndexIndiv():
   if not LookFor("#"): return None
   c1=LookFor(digits)
   if c1:
      Category="Individual"
   else:
      Category="Indexical"
      c1=LookFor(letterUnder)
   return Category, c1

"""
A literal is a number or a quoted string.

Literal  ::=  Number | QuotedStr
"""
def Literal():
   c1 = LookFor('+-"')
   if not c1: return None
   return "Literal", c1

"""
A locator is a name, an individual marker, or an indexical.

Locator  ::=  Name | IndividualMarker | Indexical
"""
def Locator():
   c1 = LookFor("'") or IndexIndiv()
   if not c1: return None
   return "Locator", c1

"""
A negation begins with a tilde "~" and a left bracket
"[" followed by a conceptual graph and a right bracket "]".

Negation  ::=  "~[" CG "]"

"""
def Negation():
   if not LookFor("~"): return None
   if not LookFor("["): raise CGIFerr, errMSG("negation")
   c1=CG()
   if not LookFor("]"): raise CGIFerr, errMSG("negation")
   return "Negation", c1

"""
A quantifier consists of an at sign "@" followed by an unsigned integer or
an identifier and an optional list of zero or more arcs enclosed in braces.

Quantifier  ::=  "@" (UnsignedInt | Identifier ("{" Arc* "}")?)
"""
def Quantifier():
   if not LookFor("@"): return None
   c1=LookFor(letterDigitUnder)             # UnsignedInt or Identifier
   if not c1: raise CGIFerr, errMsg("defined quantifier")
   if c1[0] in digits:
      c2=c1
      c1="count"
   else:
      if LookFor("{"):
         c2=ListOf(Arc)
         if not LookFor("}"): raise CGIFerr, errMsg("quantifier")
      else: c2=None
   return "Quantifier", c1,c2

"""
A referent consists of a colon ":" followed by an optional designator
and an optional descriptor in either order.

Referent  ::=  ":" {Designator?, Descriptor?}
"""
def Referent():
   if not LookFor(":"): return None
   c1=Designator()
   c2=Descriptor()
   c=Designator()
   if c:
      if c1: raise CGIFerr, errMsg("too many designators")
      else: c1=c
   if not (c1 or c2): return None
   return "Referent", c1,c2

"""
A conceptual relation begins with a left parenthesis "(" followed
by an N-adic type, N arcs, and an optional comment.
It ends with a right parenthesis ")".

Relation  ::=  "(" Type(N) Arc* Comment? ")"
"""
def Relation():
   if not LookFor("("): return None
   c1=Type()
   if not c1: raise CGIFerr, errMsg("relation type")
   c2=ListOf(Arc)
   c3=LookFor(";")
   if not LookFor(")"): raise CGIFerr, errMsg("relation ending")
   return "Relation", c1,c2,c3

"""
A signature is a parenthesized list of zero or more
formal parameters separated by commas.

Signature  ::=  "(" (FormalParameter ("," FormalParameter)*)? ")"

"""
def Signature(N):
   if not LookFor("("): return None
   c1=CommaListOf(FormalParameter)
   if N!=None and N!=len(c1):
      raise CGIFerr, errMsg("valence of lambda expression")
   if not LookFor(")"): raise CGIFerr, errMsg("signature ending")
   return "Signature", c1

"""
A special context label (SpecialConLabel) is one of the five
identifiers "if", "then", "either", "or", and "sc".

SpecialConLabel  ::=  "if" | "then" | "either" | "or" | "sc"

None of the special context labels or the identifiers "else" and "lambda"
may be used as a type label.
"""
def SpecialConLabel():
   global tokens, cursor
   c1=LookFor(letterUnder)
   if not c1: return None
   if lower(c1) not in specialConLabels:
      cursor=cursor-1                       # Back up value of cursor
      return None
   return c1

"""
A special context is either a negation or a left bracket,
a special context label, an optional colon, a CG, and a right bracket.

SpecialContext  ::=  Negation | "[" SpecialConLabel ":"? CG "]"

"""
def SpecialContext():
   global tokens, cursor
   c1=Negation()
   if c1: return c1
   if not LookFor("["): return None
   c1=SpecialConLabel()
   if not c1:                               # Must be an ordinary concept
      cursor=cursor-1                       # Make cursor point to "["
      return None
   LookFor(":")
   c2=CG()
   if not LookFor("]"): raise CGIFerr, errMsg("special context")
   return "SpecialContext", c1,c2

"""
A structure consists of an optional percent sign "%" and identifier
followed by a list of zero or more arcs enclosed in braces.

Structure  ::=  ("%" Identifier)? "{" Arc* "}"
"""
def Structure():
   if LookFor("%"):
      c1=LookFor(letterUnder)
      if not c1 or not LookFor("{"): raise CGIFerr, errMsg("structure")
   elif LookFor("{"):
      c1="set"
   else: return None
   c2=ListOf(Arc)
   if not LookFor("}"): raise CGIFerr, errMsg("missing } in structure")
   return "Structure", c1,c2

"""
A type is a type expression or an identifier other than the reserved
labels:  "if", "then", "either", "or", "sc", "else", "lambda".

Type(N)  ::=  TypeLabel(N) | TypeExpression(N)

A concept type must have valence N=1.  A relation type must have valence
N equal to the number of arcs of any relation or actor of that type.
The type label or type expression must have the same valence as the type.
"""
def Type(N=None):                           # Default valence is None
   c1=TypeLabel(N) or TypeExpression(N)
   if not c1: return None
   return "Type", c1

"""
A type expression is either a lambda expression or a disjunction list
enclosed in parentheses; the lambda expression consists of the keyword
"lambda", a signature, and a conceptual graph.

TypeExpression(N)  ::=  "(" ("lambda" Signature(N) CG | Disjuncts(N)) ")"

The type expression must have the same valence N as the signature
or the disjunction list.
"""
def TypeExpression(N):
   global tokens, cursor
   if not LookFor("(") or cursor>=len(tokens): return None
   if lower(tokens[cursor])=="lambda":
      cursor=cursor+1
      c1=Signature(N)
      if c1==None: raise CGIFerr, errMsg("missing signature")
      c2=CG()
   else:
      c1=Disjuncts(N)
      if not c1: raise CGIFerr, errMsg("type expression")
      c2=()
   if not LookFor(")"): raise CGIFerr, errMsg("ending of type expression")
   return ("TypeExpression", c1)+c2

"""
A type label is an identifier.

TypeLabel(N)  ::=  Identifier

The type label must have a associated valence N.
"""
def TypeLabel(N):
   global tokens, cursor
   c1=LookFor(letterUnder)
   if c1 and lower(c1) in reservedLabels:
      cursor=cursor-1                       # Back up value of cursor
      return None
   return c1

"""
A type term (TypeTerm) is an optional tilde "~" followed by a type.

TypeTerm(N)  ::=  "~"? Type(N)

The type term must have the same valence N as the type.
"""
def TypeTerm(N):
   if LookFor("~"):
      c1=Type(N)
      if not c1: raise errMsg("type expression")
      return "TypeTerm", "~",c1
   c1=Type(N)
   if not c1: return None
   return "TypeTerm", c1

# Functions for testing and using the parser.

def test(str=" ",i=0):
   "Initialize tokens and cursor"
   global tokens, cursor
   tokens=Tokenize(str,i)
   cursor=0
   return

def parseCG(str,i=0):
   "Try to parse str as a CG"
   global tokens, cursor
   try: tokens=Tokenize(str,i)
   except TokErr, result: return result
   cursor=0
   try: result=CG()
   except CGIFerr, result: pass
   if not result: result = "CG was empty"
   if cursor>=len(tokens): return result    # Input was completely parsed
   return "Parsed", result, ("Unparsed leftovers:", join(tokens[cursor:]))
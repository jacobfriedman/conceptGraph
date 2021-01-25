"""
Module:  cgifTok

Imports from:  string

Tokenize lexical categories.
Unlike syntactic categories, no white space is permitted
between the constituents of a lexical category.

This software is copyright (c) 2000 by John F. Sowa and distributed
free of charge according to the provisions of the GPL license.
"""

from string import whitespace, letters, digits, hexdigits, find, lower
letterUnder = letters + "_"
letterDigitUnder = letterUnder + digits
singleChars = "[]()<>{}:~,*?#@%|&!"         # Single character tokens

global source, cursor
source = " "                                # Default input string
cursor = 0                                  # Current parsing position

"""
In a recoverable failure, each lexical function returns None and leaves
the cursor unchanged.  In an unrecoverable failure, the function calls
errMsg(target) to indicate an error while looking for target.
"""
TokErr = "Token"                            # Error in tokenizing input

def errMsg(target):
   "Report error found while searching for target"
   global source, cursor
   return ("Tokenizer error in %s near input string: %s"
      % (target,`source[cursor-6:cursor+6]`))

"""
A comment is a delimited string with a semicolon ";" as the delimiter.

Comment  ::=  DelimitedStr(";")
"""
def Comment():
   return DelimitedStr(";")

"""
A delimited string is a sequence of two or more characters that
begin and end with a single character D called the delimiter.  Any
occurrence of D other than the first or last character must be doubled.

DelimitedStr(D)  ::=  D (AnyCharacterExcept(D) | D D)* D

The function DelimitedStr(D) assumes the default value '"' for D.
Any other value for D must be specified by the calling program.
"""
def DelimitedStr(D='"'):
   global source, cursor
   c=cursor
   if c>=len(source) or source[c]!=D: return None
   while 1:                                 # Loop until ending delimiter
      cursor=cursor+1
      i=find(source,D,cursor)               # Search for delimiter
      if i<0: raise TokErr, errMsg("no ending delimiter")
      cursor=i+1
      if cursor>=len(source) or source[cursor]!=D: break  # End if not DD
   return source[c:cursor]

"""
An exponent (Exponent) is the letter E in upper or lower case,
an optional sign ("+" or "-"), and an unsigned integer.

Exponent ::= ("e" | "E") ("+" | "-")? UnsignedInt
"""
def Exponent():
   global source, cursor
   c=cursor
   if c>=len(source) or source[c] not in "eE": return None
   cursor=c+1
   if cursor<len(source) and source[cursor] in "+-": cursor=cursor+1
   if not UnsignedInt(): raise TokErr, errMsg("number")
   return source[c:cursor]

"""
A floating-point number (Floating) is a sign ("+" or "-") followed
by one of three options:  (1) a decimal point ".", an unsigned integer,
and an optional exponent; (2) an unsigned integer, a decimal point ".",
an optional unsigned integer, and an optional exponent; or
(3) an unsigned integer and an exponent.

Floating ::= ("+" | "-") ("." UnsignedInt Exponent?
                           | UnsignedInt ("." UnsignedInt? Exponent?
                                           | Exponent ) )
"""
def Floating():
   global source, cursor
   c=cursor
   if source[c] not in "+-": return None
   cursor=c+1
   if cursor<len(source) and source[cursor]==".":
      cursor=cursor+1
      if UnsignedInt():                     # Required integer
         Exponent()                         # Optional exponent
         return source[c:cursor]
   elif UnsignedInt():
      if cursor<len(source) and source[cursor]==".":
         cursor=cursor+1
         UnsignedInt()                      # Optional integer
         Exponent()                         # Optional exponent
         return source[c:cursor]
      elif Exponent():
         return source[c:cursor]
      else:                                 # Must be a signed integer
         cursor=c                           # Restore original value
         return None                        # Not floating point
   raise TokErr, errMsg("number")

"""
An identifier (Identifier) is a string beginning with a letter or
underscore "_" and continuing with zero or more letters, digits,
or underscores.

Identifier  ::=  (Letter | "_") (Letter | Digit | "_")*
"""
def Identifier():
   global source, cursor
   c=cursor
   if source[c] not in letterUnder: return None
   cursor=c+1
   while cursor<len(source):
      if source[cursor] not in letterDigitUnder: break
      cursor=cursor+1
   return source[c:cursor]

"""
An integer is a sign ("+" or "-") followed by an unsigned integer.

Integer ::= ("+" | "-") UnsignedInt
"""
def Integer():
   global source, cursor
   c=cursor
   if source[c] not in "+-": return None
   cursor=c+1
   if not UnsignedInt():
      raise TokErr, errMsg("number")
   return source[c:cursor]

"""
A name is a delimited string with a single quote "'" as the delimiter.

Name  ::=  DelimitedStr("'")
"""
def Name():
   return DelimitedStr("'")

"""
A number is an integer or a floating-point number.

Number ::= Floating | Integer
"""
def Number():
   global source, cursor
   if source[cursor] not in "+-": return None
   return Floating() or Integer()           # Check for float before int

"""
A quoted string is a delimited string with a double quote '"' as
the delimiter.

QuotedStr  ::=  DelimitedStr('"')
"""
def QuotedStr():
   return DelimitedStr('"')

"""
An unsigned integer (UnsignedInt) is a string of one or more digits.

UnsignedInt ::= Digit+

The function UnsignedInt() returns the longest string of digits
starting at the cursor.  If there are no digits, it returns the
empty string.
"""
def UnsignedInt():
   global source, cursor
   c=cursor
   while cursor<len(source):
      if source[cursor] not in digits: break
      cursor=cursor+1
   return source[c:cursor]

"""
Convert the input string to a list of tokens, ignoring white space
except inside comments and quoted strings.  Raise an error message
if a token is incorrectly formed or if an illegal character is found.
"""
def Tokenize(str,i=0):
   global source, cursor
   source=str; cursor=i; result=[]
   while cursor<len(source):
      c=source[cursor]
      if c in whitespace:
         cursor=cursor+1
         continue                           # Ignore and take next char
      elif c in singleChars:
         tok=c
         cursor=cursor+1                    # Single character token
      elif c in letterUnder:
         tok=Identifier()
      elif c in "+-":
         tok=Number()
         if not tok: raise TokErr, errMsg("number")
      elif c=='"':
         tok=QuotedStr()
         if not tok: raise TokErr, errMsg("quoted string")
      elif c=="'":
         tok=Name()
         if not tok: raise TokErr, errMsg("name")
      elif c==";":
         tok=Comment()
         if not tok: raise TokErr, errMsg("comment")
      elif c in digits:
         tok=UnsignedInt()
      else:
         raise TokErr, errMsg("illegal character")
      result.append(tok)                    # Append to tokenized list
   return result

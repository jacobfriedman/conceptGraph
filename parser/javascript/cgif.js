/*
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

/* 	Concept Graph Interchange Format Class
		Parses an incoming CGIF-formatted string to an object
*/
class CGIF {


	constructor(string) {
    
  }

		/*
		* Store a Literal
		* @param {string} value - the 'value' of the literal
		* @param {string} type - The designator type. This can be :
									+ literalNumber, literalString, literalEncoded
									+ locatorIndividualMarker, locatorIndexical, locatorName
									+ undetermined
		*/

}
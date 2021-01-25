/*

Translated from 


Module:  cgifTok

Tokenize lexical categories.
Unlike syntactic categories, no white space is permitted
between the constituents of a lexical category.

*/

const letters 									= 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
			lettersUnderscore 			= letters + '_',
			digits 										= '1234567890',
			lettersUnderscoreDigits 	= letters+digits+'_',
			symbols 									= '[]()<>{}:~,*?#@%|&!';

let source = ' ',
		cursor = 0;


function tokenize(string) {

	let result = [];
			source = string;

	while (cursor < source.length) {

		let character = source[cursor],
				token 		= null

		// Ignore whitespace & move to next character
		if (character === ' ') {
			cursor++;
			continue;
		} else 

			// Search for Symbols ... []()<>{}:~,*?#@%|&!
			if(symbols.indexOf(character)) {
				token = character
				cursor++
			} else

			// Search for 
			if(lettersUnderscore.indexOf(character)) {
				token = Identifier()
			} else
			// Number Handler
			if(['+','-'].indexOf(character)) {
				token = Number()
				token === null ? new Error(errorMessage('number'))
			} else
			// Quoted String
			if(['"'].indexOf(character)) {
				token = QuotedStr()
				token === null ? new Error(errorMessage('quoted string'))
			} else
			// Apostraphe (Name)
			if(["'"].indexOf(character)) {
				token = Name()
				token === null ? new Error(errorMessage('name'))
			} else

			if([";"].indexOf(character)) {
				token = Comment()
				token === null ? new Error(errorMessage('comment'))
			} else 

			if(digits.indexOf(character)) {
				token = UnsignedInt()
			} else {

			new Error(errorMessage('illegal character'))
		}

		result.append(token)

	} // End the while loop over the input string

	return result

}


	errorMessage(target) {
		return Error(target,'ERROR')
	},

	/*
	A delimited string is a sequence of two or more characters that
	begin and end with a single character D called the delimiter.  Any
	occurrence of D other than the first or last character must be doubled.

	EBNF... DelimitedStr(D)  ::=  D (AnyCharacterExcept(D) | D D)* D

	The function DelimitedStr(D) assumes the default value '"' for D.
	Any other value for D must be specified by the calling program.
	*/

	delimitedString(delimeter = '\"') {

		let { cursor, source } = this;

		if (cursor >= source.length )
		/*
	 
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
 */




}


/*
 * Tiny tokenizer
 *
 * - Accepts a subject string and an object of regular expressions for parsing
 * - Returns an array of token objects
 *
 * tokenize('this is text.', { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid');
 * result => [{ token="this", type="word" },{ token=" ", type="whitespace" }, Object { token="is", type="word" }, ... ]
 *
 */

 /*
function tokenize ( s, parsers, deftok ) {
  var m, r, l, cnt, t, tokens = [];
  while ( s ) {
    t = null;
    m = s.length;
    for ( var key in parsers ) {
      r = parsers[ key ].exec( s );
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      if ( r && ( r.index < m ) ) {
        t = {
          token: r[ 0 ],
          type: key,
          matches: r.slice( 1 )
        }
        m = r.index;
      }
    }
    if ( m ) {
      // there is text between last token and currently 
      // matched token - push that out as default or "unknown"
      tokens.push({
        token : s.substr( 0, m ),
        type  : deftok || 'unknown'
      });
    }
    if ( t ) {
      // push current token onto sequence
      tokens.push( t ); 
    }
    s = s.substr( m + (t ? t.token.length : 0) );
  }
  return tokens;
}
 @klappy
 */




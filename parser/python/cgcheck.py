"""
Module:  cgcheck

Imports from modules: sys, types, string, cgif (which imports from cgiftok)

Parse a file of conceptual graphs, and print a parse tree for each CG
that is syntactically correct.  Otherwise, print an error message.
Separator between CGs must be a line containing nothing but "."

To run this program on an input file f1 and send output to a file f2,
type the following input on the command line:

   python cgcheck.py <f1 >f2

where f1 is the name of a file containing CGIF strings in ASCII format
and f2 is the name of a file that will be created (or overwritten).

This software is copyright (c) 2000 by John F. Sowa and distributed
free of charge according to the provisions of the GPL license.
"""

from sys import *
from types import *
from string import strip
from cgif import parseCG

# Print parse tree
def prTree(tree,i=0):
   if tree:
      if type(tree)==TupleType:             # Category + constituents
         print " "*i + tree[0]              # Category name
         for subTree in tree[1:]:
            prTree(subTree,i+3)             # Indent the constituent
      elif type(tree)==ListType:            # List of constituents
         for subTree in tree:
            prTree(subTree,i)               # Don't indent constituent
      else: print " "*i + tree              # Category name or data

# Read input file, break into input strings, parse them, and print them.
lines = stdin.readlines()
input=""
for line in lines:
   if strip(line)==".":                     # Separator between CGs
      print "INPUT STRING:\n"
      print input                           # Print CGIF source
      print "RESULT OF PARSING:\n"
      prTree(parseCG(input))                # Print parsed result
      input=""
      print "\n" + ("-"*72) + "\n"
   else:
      input=input+line
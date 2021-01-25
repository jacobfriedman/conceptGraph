/*

http://www.lrec-conf.org/proceedings/lrec2018/pdf/1056.pdf

For our purposes, a state is a set
of propositions with assignments to variables at a specific
frame. We can think of atomic programs as input/output
2The resulting structure is equivalent to a Labeled Transition
System (van Benthem, 1991), and is consistent with the approach
developed in (Fernando, 2009; Fernando, 2013).
58
relations, i.e., relations from states to states, and hence interpreted over an input/output state-state pairing (cf. (Naumann, 2001)).
The model encodes three kinds of representations: (i) predicative content of a frame; (ii) programs that move from
frame to frame; and tests that must be satisfied for a program to apply. These include: pre-tests, while-tests, and
result-tests.

5.2. Change of State
The representations for changes of state have two basic patterns, depending on whether the change is between absolute
states or along a value continuum. The first is illustrated in
(15), the representation for the Die-42.4 class.
(15) John died.
alive(e1, Patient)
¬alive(e2, Patient)

For less semantically coherent classes, such as the
Other cos-45.4 class, the type of state must be underspecified, as in (16). In that case, the opposition between the
initial and the result states must be explicitly shown.

(16) The balloon burst.
has state(e1, Patient, Initial State)
opposition(Initial State, V Result)
has state(e2, Patient, V Result)

Like the underspecificity of the do predicate, has state allows us to reference initial states and final states general
enough to apply to all the verbs in a class. The do predicate
is used in situations in which the Agent’s action causes another subevent but we really can’t determine what that action is without further context. In many of change of state
classes, however, we can further identify the final state by
extracting information from the verb itself. In (16), the verb
’burst’ tells us the final state of the Patient. The same holds
for the other verbs from the class, such as dry, blacken or
triple. We have introduced V Result both as an indicator
that the semantic representation can be further refined in
context using the lexical features of the specific verb and as
a placeholder for that information.
V Result also allows us to distinguish between the change
of state introduced by the verb and a further change of state
introduced by a resultative construction.

*/

// STATE
// State (S): a single event, which is evaluated relative to no other event
// S -> E
// e.g. love, know

// PROCESS
// Process (P): a sequence of events identifying the same semantic expression
// e.g. run, push, drag
// p -> E1....En
/*
Following Dowty (1979) and others, we will assume that when P is a process verb, then
if the semantic expression P0 identified with P is true at an interval I, then P0 is true for
all subintervals of I larger than a moment:
*/


// TRANSITIONS

// SEE DISPATCHER

// TODO: HOOK INTO GRAPH CREATION.
// 
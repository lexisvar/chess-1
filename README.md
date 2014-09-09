Chess
====

JavaScript chess rules library
---------------------

This library implements the rules of chess.  It should probably be considered
incorrect/incomplete, as it hasn't been put through a thorough suite of tests.

###Overview of the modules

####Board

Represents a board -- keeps track of the locations of pieces, but doesn't know
anything else about the position.  Used in the Position class, which holds all
the same information as a FEN string.

This class also has methods for detecting certain things about a position which
can be known only from looking at the board, for example, whether a move from one square
to another is blocked, or what squares a pawn could theoretically move to from
a given square.

####CastlingRights

Represents the castling rights part of a FEN string, with methods for setting and
checking the different castling possibilities and obtaining the FEN or X-FEN string.

####Clock

Given a Game, a TimingStyle and an optional callback for obtaining the current time,
keeps track of the time situation and fires an event when someone's time runs out.

If no callback is supplied, the Clock uses `new Date().valueOf()`.  One use-case for
supplying the callback is if you have a function that returns an estimate of the
current time on a server, and you want a chess-playing client to reflect the server's
time situation as accurately as possible.

####Colour

All code that deals with colours deals with instances of this class, which is closed
behind the module interface.  To get a Colour, use `Colour.fromFenString` passing
`"w"` or `"b"`, or `Colour.white` or `Colour.black`.  There are exactly two instances of
the Colour class at any one time, so you can be sure that `colourA === colourB` if they
are the same colour.

Colours have a `name` property, which is either `"white"` or `"black"`, and a `fenString`
property, which is either `"w"` or `"b"`.

####Coords

An object with `x`, `y` and `isOnBoard`.  This is used for calculations which are easier
to do with numeric coordinate pairs than other square representations (algebraic etc).  The
x/y properties refer to the rank and file of a square -- x goes from 0-7 ("a" - "h") and y goes
from 0-7 ("1" - "8").  `isOnBoard` indicates whether the coordinate pair is within the bounds
of a normal chessboard.

###Module format

This library can be used on the browser and in node, but the modules are only
defined to the AMD specification, so they must be required through requirejs.

To enable requiring them through Node's built-in `require`, use [amdefine/intercept](https://github.com/jrburke/amdefine#amdefineintercept).
# Live Test

This is UI experiment to explore making a REPL-like environment that can encourage test-driven development. The tests and the code editor are on the same canvas, next to each other. There are some nice key bindings so you can go back and forth without too much mental context-switching.

This environment is browser-based and not tested at massive scale.

That said, there are some cool things going on here:

 * Tests are run continuously, as you type.
 * Tests are evaluated on web workers.
 * It includes Chai, so you can write assertions in many different ways.
 * It uses Istanbul to do test coverage computations.
 * (I had to hack the Instanbul source code so it could run on a web worker.)

This little app was developed using Ace, Esprima, Escodegen, and Istanbul. It does not use Bootstrap, React, or any kind of framework. It's straight-up Vanilla JS. I don't need a framework, but I'm happy to pass on writing my own editor, parser, code generator, and instrumenter.

# Live Test

This is UI experiment to explore making a REPL-like environment that can encourage test-driven development. The tests and the code editor are on the same canvas, next to each other.

This environment is browser-based and not tested at massive scale.

That said, there are some cool things going on here:

 * Write tests using Chai for your assertions.
 * Tests are evaluated on web workers.
 * It uses Istanbul to do test coverage computations.

This little app was developed using Ace, Esprima, Escodegen, and Istanbul. It does not use Bootstrap, React, or any kind of framework. It's straight-up Vanilla JS.

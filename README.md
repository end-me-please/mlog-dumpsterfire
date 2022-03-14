# mlog-dumpsterfire

a MLOG compiler for [Dumpster Fire](https://esolangs.org/wiki/Dumpster_Fire) written in JavaScript.

allows you to toss pages of your notebook into dumpsters and set them on fire.

## Usage:

```node dumpsterfire.js inputfile.txt outputfile.txt```

## The language:

Instructions:
* `find [name]`: find a container with a specific name.
* `open [name]`: open the container you found.
* `write [page] [text]`: write something on a page of your notebook.
* `toss [page] [name]`: toss a page of your notebook into the container.
* `burn [name]`: set a container on fire.
* `close [name]`: close a container.

you can only work with one container at a time. you cannot re-open a container after closing it.

You can write multiple things on the same page, but you cannot use it after throwing it away.



container names are converted to processor links.

note: dumpster Fire is not turing complete.

#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [[ "$#" -gt 0 ]]; then
	format="-l $1"
fi
eval "pygmentize -f latex $format -O full $DIR/sourcecode.py > $DIR/pygmentized.tex"

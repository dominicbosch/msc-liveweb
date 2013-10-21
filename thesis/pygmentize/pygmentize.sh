#!/bin/bash
if [[ "$#" -gt 0 ]]; then
	format="-f $1"
fi
eval "pygmentize $format -O full sourcecode.py > pygmentized.tex"
#!/bin/bash
trap ctrl_c INT

EXIT=0
function ctrl_c() {
  EXIT=1
}

for ((i=0;i<=$1;i++))
do
	if [ $EXIT -eq 1 ]
		then
			echo 'Bye!'
			break
	fi
  java BenchmarkingCallback "$i"
done

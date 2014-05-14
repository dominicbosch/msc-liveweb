#!/bin/bash
trap ctrl_c INT

EXIT=0
function ctrl_c() {
  EXIT=1
}

rm bm_deferred.txt
for ((j=1;j<=$1;j=j*2))
do
	echo "Running benchmark for $j variables in scope"
	RUNNING=1
	i=0
	while [ $RUNNING -eq 1 ]
	do
		if [ $EXIT -eq 1 ]
			then
				echo 'Bye!'
				break
		fi
		 # --max-old-space-size=900 
	  node jsDeferred.js "$((i++))" "$j" >> bm_deferred.txt
		if [ $? -ne 0 ]; then # exit code not 0
			RUNNING=0
			echo 'Out of memory... exiting loop!'
		fi
	done
done

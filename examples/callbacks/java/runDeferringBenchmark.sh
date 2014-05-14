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
		# We need to use taskset in order to get node.js single process behaviour
		 # -verbose:gc 
		  # -XX:OnOutOfMemoryError="kill -9 %p"
	  taskset 0x1 java BenchmarkingDeferred "$((i++))" "$j" >> bm_deferred.txt
		if [ $? -ne 0 ]; then # exit code not 0
			RUNNING=0
			echo 'Out of memory... exiting loop!'
		fi
	done
done

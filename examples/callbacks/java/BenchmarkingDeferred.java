import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.HashMap;

public class BenchmarkingDeferred {

  private static Runtime runtime = Runtime.getRuntime();
	private static final ScheduledExecutorService worker = 
		Executors.newSingleThreadScheduledExecutor();


	private static void deferFunctionCall( int numScopeVars, int delay, String scopeId ) {
		HashMap<String, String> mapVars = new HashMap<String, String>();
		for( int i = 0; i < numScopeVars; i++ ) {
			mapVars.put( "id" + i, "12345678" ); // 8 bytes per stored scope variable
		}
		Object context = new TimeoutContext( "TimeoutFunction" );
		Runnable task = new RunnableCallbackFunction( mapVars, context );
		worker.schedule( task, delay, TimeUnit.SECONDS );
	}

	public static void main( String[] args ) {
		long startTime, stopTime;
		long deltaMem;
		int numVars = 10, firstArg = 0;
		if ( args.length > 1 ) {
			try {
				firstArg = Integer.parseInt( args[0] );
				numVars = Integer.parseInt( args[1] );
			} catch ( NumberFormatException e ) {
				System.err.println( "Arguments " + args[0] + " and " + args[1] + " must be integers." );
				System.exit(1);
			}
			startTime = System.nanoTime();
			int j = 0, numFuncs = 1 << firstArg;
			while( j++ < numFuncs) {
				deltaMem = ( runtime.maxMemory() - runtime.totalMemory() ) / 1024 / 1024;
				// We had to build this in order to exit the benchmarking since the OutOfMemoryError isn't
				// fired consistently within useful time
				if( deltaMem < 50 ) {
					System.out.println( "Out of memory ("+deltaMem+"MB left) during numScopeVars " + numVars + ", functions 2^" + firstArg + ". Exiting!" );
					System.err.println( "Out of memory ("+deltaMem+"MB left) during numScopeVars " + numVars + ", functions 2^" + firstArg + ". Exiting!" );
					System.exit(1);
				}
				deferFunctionCall( numVars, numFuncs * 10, numFuncs + "(" + j + ")" );
			}

			stopTime = System.nanoTime();
			System.out.println (
				"#variables in scope\t" + numVars
				+ "\ti\t" + firstArg
				+ "\t#deferred functions\t" + numFuncs 
				+ "\tTotal Memory (MB)\t" + ( (float) runtime.totalMemory() / 1024 / 1024 )
				+ "\tMemory Used (MB)\t" + ( (float) ( runtime.totalMemory() - runtime.freeMemory() ) / 1024 / 1024 )
				+ "\tElapsed (ms)\t" + ( stopTime - startTime ) / 1e6
			);
			worker.shutdownNow();

		} else {
			System.out.println( "Please provide number of callbacks and number of variables in scope" );
		}
	}
}
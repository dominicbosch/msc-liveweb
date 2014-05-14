import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.HashMap;

public class BenchmarkingDeferred {

	private static final ScheduledExecutorService worker = 
		Executors.newSingleThreadScheduledExecutor();

	private static void deferFunctionCall( int numScopeVars, int delay, String scopeId ) {
		HashMap<String, String> mapVars = new HashMap<String, String>();
		for( int i = 0; i < numScopeVars; i++ ) {
			mapVars.put( "id" + i, "id:" + scopeId + ", value" + i );
		}

		Runnable task = new RunnableCallbackFunction( mapVars );
		worker.schedule(task, delay, TimeUnit.SECONDS);
	}

	public static void main( String[] args ) {

		long startTime, stopTime;
		int numVars = 10, firstArg = 0;
		if ( args.length > 1 ) {
			try {
				firstArg = Integer.parseInt(args[0]);
				numVars = Integer.parseInt(args[1]);
			} catch ( NumberFormatException e ) {
				System.err.println("Arguments " + args[0] + " and " + args[1] + " must be integers.");
				System.exit(1);
			}
			startTime = System.nanoTime();
			int j = 0, numFuncs = 1 << firstArg;
			while( j++ < numFuncs) {
				deferFunctionCall( numVars, numFuncs * 10, numFuncs + "(" + j + ")" );
			}

			stopTime = System.nanoTime();
			System.out.println ( "i\t" + firstArg
				+ "\t#deferred functions\t" + numFuncs 
				+ "\t#variables in scope\t" + numVars
				+ "\tMemory (Kb)\t" + Runtime.getRuntime().totalMemory() / 1024
				+ "\tElapsed (ms)\t" + ( stopTime - startTime ) / 1e6
			);
			worker.shutdownNow();

		} else {
			System.out.println( "Please provide number of callbacks and number of variables in scope" );
		}
	}
}
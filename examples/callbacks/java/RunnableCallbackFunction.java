import java.util.HashMap;

/*
 * The Callback function instance.
 */
public class RunnableCallbackFunction implements Runnable {
	
	// The hashhmap is used to store variables and their value as the scope
	private HashMap<String, String> mapScope;
	private Object context;

	public RunnableCallbackFunction( HashMap<String, String> scope, Object context ) {
		this.mapScope = scope;
		this.context = context;
	}

	// If this is executing, we didn't wait long enough and the
	// benchmark time is compromised
	public void run() {
		System.out.println( mapScope.toString() );
	}

}

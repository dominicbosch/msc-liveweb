import java.util.HashMap;

public class Sandbox {

	public static void main( String[] args) {
		int numScopeVars = 10;
		HashMap<String, String> scp = new HashMap<String, String>();
		for( int i = 0; i < numScopeVars; i++ ) {
			scp.put( "id" + i, "value" + i );
		}
		System.out.println( "Scope:" );
		System.out.println( scp.get( "id2" ) );
	}

}
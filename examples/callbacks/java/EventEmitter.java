import java.util.HashMap;
import java.util.ArrayList;

/*
The EventEmitter class stores callback functions associated with events.
If an event is emitted it calls all registered callback functions.
*/
public class EventEmitter {
	private HashMap<String, ArrayList> mapEvents;
	
	public EventEmitter () { 
		mapEvents = new HashMap<String, ArrayList>();
	}

	public void on ( String event, EventCallback ecb ) {
		private ArrayList lst; 

		// We create a new array if the event was not registered yet ...
		if( ( lst = mapEvents.get( event ) ) == null ) {
			lst = new ArrayList<EventCallback>();
			// ... and add it to the hashmap, associated with the event
			mapEvents.put( event, lst );
		}
		// We add the callback function to the event
		lst.add( ecb );
	}
	
	public void emit ( String event ) {
		// Retain function scope
		// Emit event for existing listeners
		private ArrayList lst;
		if( ( lst = mapEvents.get( event ) ) != null ) {

		}

	}

}

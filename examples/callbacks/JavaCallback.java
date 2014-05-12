public interface InterestingEvent
{
    // This is just a regular method so it can return something or
    // take arguments if you like.
    public void interestingEvent ();
}

public class EventNotifier
{
    private InterestingEvent ie;
    private boolean somethingHappened; 
    public EventNotifier (InterestingEvent event)
    {
    // Save the event object for later use.
    ie = event; 
    // Nothing to report yet.
    somethingHappened = false;
    } 
    //...  
    public void doWork ()
    {
    // Check the predicate, which is set elsewhere.
    if (somethingHappened)
        {
        // Signal the even by invoking the interface's method.
        ie.interestingEvent ();
        }
    //...
    } 
    // ...
}
public class CallMe implements InterestingEvent
{
    private EventNotifier en; 
    public CallMe ()
    {
    // Create the event notifier and pass ourself to it.
    en = new EventNotifier (this);
    } 
    // Define the actual handler for the event.
    public void interestingEvent ()
    {
    // Wow!  Something really interesting must have occurred!
    // Do something...
    } 
    //...
}
class TaskExecutionWebServer {
    private static final int NTHREADS = 100;
    private static final Executor exec
        = Executors.newFixedThreadPool(NTHREADS);

    public static void main(String[] args) throws IOException {
        ServerSocket socket = new ServerSocket(80);
        while (true) {
            final Socket connection = socket.accept();
            Runnable task = new Runnable() {
                public void run() {
                    handleRequest(connection);
                }
            };
            exec.execute(task);
        }
    }
}

public class ThreadPerTaskExecutor implements Executor {
    public void execute(Runnable r) {
        new Thread(r).start();
    };
}
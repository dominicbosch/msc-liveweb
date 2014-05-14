public class TimeoutContext {
	private long idleTimeout = 1;
  private long idlePrev;
  private long idleNext;
  private long idleStart = 140000505;
  private String onTimeout = null;
  private boolean repeat = false;

	public TimeoutContext( String cb ) {
		this.onTimeout = cb;
	}
}

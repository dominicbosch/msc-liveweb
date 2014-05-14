
needle = require "needle"
options = {}

# # SOAP 1.2 Example
url = "www.w3schools.com/webservices/tempconvert.asmx?op=CelsiusToFahrenheit"
data = "
	<?xml version=\"1.0\" encoding=\"utf-8\"?>
	<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"
			xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"
			xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">
	  <soap12:Body>
	    <CelsiusToFahrenheit xmlns=\"http://www.w3schools.com/webservices/\">
	      <Celsius>10</Celsius>
	    </CelsiusToFahrenheit>
	  </soap12:Body>
	</soap12:Envelope>"
options =
	headers : 
		'Content-Type': 'application/soap+xml'

# REST Example
# url = "www.w3schools.com/webservices/tempconvert.asmx/CelsiusToFahrenheit"
# data = "Celsius=10"

needle.post url, data, options, ( err, resp, body ) ->
	console.log body.toString()

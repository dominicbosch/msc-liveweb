ruleset a2236x4 {
  meta {
  	name "ProBinder Flag Notification Handler"
  	description "This is a first example on how to react on ProBinder Events"
  	author "dominic.bosch"
    //ProBinder IDs:
    // userID: 10595
    // companyID: 643
    // contextID: 16694
    // followerID: 12613
    
  	logging on
  }
  
  dispatch {}
  
  global {}
  
  // Reset all entitiy variables
  rule resetAll {
    select when probinder resetall
      send_directive("Full Reset");
      fired {
        clear ent:userID;
        clear ent:companyID;
        clear ent:contextID;
        clear ent:credentials;
        clear ent:followers;
        clear ent:newContents;
        clear ent:summary;
        clear ent:temp;
      }
  }
  
  // reset the unread content data structures
  rule reset {
    select when probinder reset
      send_directive("Reset, user credentials and followers still kept");
      fired {
        clear ent:newContents;
        clear ent:summary;
        clear ent:temp;
      }
  }
  
  // The user registers himself with email and password for the ProBinder API... ewww
  rule register_user {
    select when probinder register
      if (event:attr('userID').as("str") neq 'null'
          && event:attr('companyID').as("str") neq 'null'
          && event:attr('contextID').as("str") neq 'null'
          && event:attr('email').as("str") neq 'null'
          && event:attr('password').as("str") neq 'null') then {
        send_directive("user registered");
      }
      fired {
        set ent:userID event:attr('userID');
        set ent:companyID event:attr('companyID');
        set ent:contextID event:attr('contextID');
        set ent:credentials uri:escape(event:attr('email')) + ":" + uri:escape(event:attr('password'));
      }
  }
  
  // The user sent an event that tells us he wants to follow somebody
  rule new_user_to_follow {
    select when probinder newfollower
      pre{
        listFollowers = ent:followers || {};
        newfollower = event:attr('followerID').as("str");
        listFollowers = listFollowers.put([newfollower], "true");
      }
      if (event:attr('userID') == ent:userID
          && newfollower neq "null") then {
            send_directive("New ProBinder User added to followers");
      }
      fired{
        set ent:followers listFollowers
      }
  }
  
  // Let the KRE check ProBinder for new unread content and process it immediately
  rule check_for_unread_content {
    select when probinder check
      pre {
        r = http:get("https://" + ent:credentials + "@probinder.com/service/36/unreadcontent");
        arr = r{"content"}.decode();
      }
      send_directive("Checked ProBinder for unread content, found: " + arr.length());
      fired {
        set ent:newContents arr;
        raise explicit event processnewcontents;
      }
    
  }
  
  // Work (new unread content) from ProBinder to process
  rule process_new_contents {
    select when explicit processnewcontents
    // Process only the unread contents from people we are following,
    // filter condition omits unnecessary rules invocation
    foreach ent:newContents.filter(
      function(d) {ent:followers.pick("$."+d.pick("$.userId")) != null}
    ) setting(nc)
      pre {
        s = ent:summary || {};
        cid = nc.pick("$.id");
        r = http:get("https://" + ent:credentials
          + "@probinder.com/service/2/get?id=" + cid
          + "&service=" + nc.pick("$.serviceId"));
        arr = r{"content"}.decode();
        
        userid = arr.pick("$.userId");
        storeKey = arr.pick("$.lastModified");
        truncStr = arr.pick("$.text");//.extract(re/^.{100}/gi); // should shorten the text...
        
      //TODO Process different kind of unread contents differently
        str = {"content": truncStr}; //[0]
        s = s.put([userid, storeKey], str);
      }
      //http:get("https://" + ent:credentials + "@probinder.com/service/2/setread?id=" + cid);
      always {
        set ent:summary s;
      }
    
  }
  
  rule send_summary{
    select when probinder heartbeat
    always {
      clear ent:temp;
      raise explicit event filltemp;
    }
  }
  
  rule fill_temp{
    select when explicit filltemp
    always {
      set ent:temp ent:summary;
      raise explicit event mergecontent;
    }
  }
  
  // When somebody sends a periodic heartbeat, this summary is produced
  // The periodic invocation of this rule might be possible to implement in the KRE
  rule merge_content {
    select when explicit mergecontent
    foreach ent:temp setting (userID)
      pre {
        s = ent:temp;
        userBulk = s.pick("$."+userID);
        sumry = userBulk.pick("$..content").join(" ");
      }
      http:get("https://" + ent:credentials + "@probinder.com/service/27/save?companyId="
        + ent:companyID + "&context=" + ent:contextID + "&text=test");
      send_directive("Stored summary in your predefined binder:" + sumry);

  }
  
  rule print_summary {
    select when probinder printsum
      send_directive(ent:summary);
  }
}


// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.

import roulette_artifacts from '../../build/contracts/Roulette.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Roulette = contract(roulette_artifacts);


// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var priceforticket;

window.App = {
  start: function() {
    var self = this;
    document.getElementById("loader").style.visibility="hidden";   //visible
    // Bootstrap the MetaCoin abstraction for Use.
    Roulette.setProvider(web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");

        return;
      }
      accounts = accs;
      account = accounts[0];

      //self.refreshBalance();
      self.DataMessage();
      self.DataOfProcess();
    });

  },


  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  play: function() {
    var self = this;
    var amount = priceforticket;
    var nickname = ''+document.getElementById("nick").value;
    console.log(nickname);
    this.setStatus("Initiating transaction... (please wait)");
    document.getElementById("loader").style.visibility="visible";   //visible
    Roulette.deployed().then(function(instance) {
      return instance.participate(nickname, {
        from: account,
        value: web3.toWei(amount, "ether"),
        gas: 150000
      });
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
      //console.log(self.listenToEvents()[3]);
      self.DataMessage();
      //self.refreshStatus();
      console.log("oprueba");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },


  DataMessage: function() {
    var self = this;
    Roulette.deployed().then(function(instance){
      instance.MessageData({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          //console.log(event.args.msg.valueOf());
          //console.log("timeblock: "+event.args.time.valueOf());
          console.log("state: "+event.args.state.valueOf());
              document.getElementById("loader").style.visibility="hidden";   //visible
          if (!event.args.state.valueOf()) {
            //Call juego terminado function  and rendering
            console.log("game over");
            var hsta = document.getElementById("sta")                              // declaramos el porpietario
            hsta.innerHTML = "Game over";
            self.DataOfWinner();
          }
          var hstatus = document.getElementById("status")
          var stt;
          if(event.args.state.valueOf()){
            stt = "The game is enabled";
          }
          else {
            stt = "The game has finished";
            //document.getElementById("status").style.visibility="hidden";

            //document.getElementById("nicktag").style.visibility="hidden";

            document.getElementById("nick").style.visibility="hidden";
            document.getElementById("send").style.visibility="hidden";                         // declaramos el porpietario
          }
          hstatus.innerHTML = stt;
          //hstatus.innerHTML = "Transaction complete!   "+event.args.state.valueOf();
        } else {
          console.error(error);
        }
      });
    });
  },

  DataOfProcess: function() {
    Roulette.deployed().then(function(instance){
      instance.InitialData({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          document.getElementById("alertp").style.visibility="hidden";
          //console.log(event.args.basePrice.valueOf()/1000000000000000000);
          //console.log(event.args.playersTop.valueOf());
          //console.log(event.args.memberOfList.valueOf());
          var hplayers = document.getElementById("players")                             // declaramos el porpietario
          hplayers.innerHTML = event.args.playersTop.valueOf();
          var hprice = document.getElementById("price")                             // declaramos el porpietario
          hprice.innerHTML = event.args.basePrice.valueOf()/1000000000000000000 + " ETH";
          priceforticket = event.args.basePrice.valueOf()/1000000000000000000;
          console.log(priceforticket);
          var hdisp = document.getElementById("disp")                              // declaramos el porpietario
          hdisp.innerHTML = event.args.memberOfList.valueOf();
          var htickets = document.getElementById("tickets")                              // declaramos el porpietario
          htickets.innerHTML = event.args.playersTop.valueOf() - event.args.memberOfList.valueOf();

        } else {
          document.getElementById("alertp").style.visibility="visible";
          document.getElementById("alertp").style.class="alert alert-warning";
          console.error(error);
        }
      });
    });
  },

  DataOfWinner: function() {
    Roulette.deployed().then(function(instance){
      instance.WinnerData({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          console.log("who is win?");
          console.log(event);
          var hdisp = document.getElementById("disp")                              // declaramos el porpietario
          //hdisp.innerHTML = "The winner is: '"+event.args.name.valueOf()+"'   ";
          hdisp.innerHTML = "The winner is:  ";
          var hnicktag = document.getElementById("nicktag")                              // declaramos el porpietario
          hnicktag.innerHTML = event.args.adr.valueOf();
        } else {
          console.error(error);
        }
      });
    });
  },

};






window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }
  App.start();
});

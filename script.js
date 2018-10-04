$(".fehlendeEingabe").hide();
$("#schritt2").hide();
$("#schritt3").hide();
$("#hilfe").hide();
$("#footer").hide();

var euro;
var btcSum;
var ethSum;
var dcnSum;
var unconfirmedBTC;
var confirmedETH;
var unconfirmedETH;
var confirmationCountETH;
var confirmationSound = new Audio('confirmationSound.mp3');


//Admin Variablen
var biergartenBtcAdresse = "12A18amjUDqp72kHT5joY6mcfuYqQVS9xG";
var biergartenEthDcnAdresse = "0x2Aa4127610381420eA29FAdEAEc40Bc504C3EF2b";

// Get current prices

var bitcoin = new XMLHttpRequest();
bitcoin.open("GET", "https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=EUR", false);
// Add your code below!
bitcoin.send();
var json = JSON.parse(bitcoin.responseText);
var btcEUR = parseFloat(json[0].price_eur);


var ether = new XMLHttpRequest();
ether.open("GET", "https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=EUR", false);
// Add your code below!
ether.send();
var json2 = JSON.parse(ether.responseText);
var ethEUR = parseFloat(json2[0].price_eur);


var dentacoin = new XMLHttpRequest();
dentacoin.open("GET", "https://api.coinmarketcap.com/v1/ticker/dentacoin/?convert=EUR", false);
// Add your code below!
dentacoin.send();
var json3 = JSON.parse(dentacoin.responseText);
var dcnEUR = parseFloat(json3[0].price_eur);


$("#hilfe-btn").click(function(){
  $(".fehlendeEingabe").hide();
  $("#schritt1").hide();
  $("#hilfe").show();
});
$("#zurueck").click(function(){
  $(".fehlendeEingabe").hide();
  $("#schritt1").show();
  $("#hilfe").hide();
});



$("#submitEuro").click(function(){
  if (/^[0-9]{1,2}[,]?[0-9]{0,2}$/.test(String($("#summe").val()))) {   //Prüft ob Währung eingeben wird
    euro = parseFloat($("#summe").val().replace(",","."));
    document.getElementById("euro").innerHTML = euro.toFixed(2)+" €";

    $("#schritt1").hide();
    $("#schritt2").show();
  } else {
    $(".fehlendeEingabe").show();
  }


});


//Crypto-Währung auswählen

$("#chooseBitcoin").click(function(){
  btcSum = Number((euro/btcEUR).toFixed(6));
  document.getElementById("btcSum").innerHTML = btcSum+" BTC ≈ "+euro+" €";
  document.getElementById("btcAddress").innerHTML = biergartenBtcAdresse;
  var QrTextBTC = "bitcoin:"+biergartenBtcAdresse+"?amount="+btcSum;
  new QRCode(document.getElementById("qrcode"), QrTextBTC);
  $("#schritt2").hide();
  $("#schritt3").show();
  getBtcConfirm();
  startBtcRefresh()
});

$("#chooseEther").click(function(){
  ethSum = Number((euro/ethEUR).toFixed(6));
  document.getElementById("ethSum").innerHTML = ethSum+" ETH ≈ "+euro+" €";
  document.getElementById("ethAddress").innerHTML = biergartenEthDcnAdresse;
  new QRCode(document.getElementById("qrcode"), biergartenEthDcnAdresse);
  $("#schritt2").hide();
  $("#schritt3").show();
  getEthConfirm();
  startEthRefresh()
});

$("#chooseDentacoin").click(function(){
  dcnSum = Number((euro/dcnEUR).toFixed(0));
  document.getElementById("dcnSum").innerHTML = dcnSum+" DCN ≈ "+euro+" €";
  document.getElementById("dcnAddress").innerHTML = biergartenEthDcnAdresse;
  new QRCode(document.getElementById("qrcode"), biergartenEthDcnAdresse);
  $("#schritt2").hide();
  $("#schritt3").show();
  getDcnConfirm();
  startDcnRefresh()
});






//confirmation
function getBtcConfirm() {
  var btcConfirm = new XMLHttpRequest();
  btcConfirm.open("GET", "https://api.blockcypher.com/v1/btc/main/addrs/"+biergartenBtcAdresse, false);
  // Add your code below!
  btcConfirm.send();
  var json3 = JSON.parse(btcConfirm.responseText);
  var confSatToBTC = parseFloat(json3.unconfirmed_balance)/100000000;
  unconfirmedBTC = Number(confSatToBTC.toFixed(6));
}

function getEthConfirm() {
  var ethConfirm = new XMLHttpRequest();
  ethConfirm.open("GET", "https://api.blockcypher.com/v1/eth/main/addrs/"+biergartenEthDcnAdresse, false);
  // Add your code below!
  ethConfirm.send();
  var json4 = JSON.parse(ethConfirm.responseText);

  var confWeiToEth = parseFloat(json4.txrefs[0].value)/1000000000000000000;
  confirmedETH = Number(confWeiToEth.toFixed(7));

  confWeiToEth = parseFloat(json4.unconfirmed_balance)/1000000000000000000;
  unconfirmedETH = Number(confWeiToEth.toFixed(7));

  confirmationCountETH = parseInt(json4.txrefs[0].confirmations);
}

function getDcnConfirm() {
  var dcnConfirm = new XMLHttpRequest();
  dcnConfirm.open("GET", "https://api.blockcypher.com/v1/eth/main/addrs/"+biergartenEthDcnAdresse, false);
  // Add your code below!
  dcnConfirm.send();
  var json5 = JSON.parse(dcnConfirm.responseText);
  confirmationCountDCN = parseInt(json5.txrefs[0].confirmations);
}




// Check for confirmations every 5 seconds (nach 5-10 Minuten sperrt die API bis zum Ende der vollen Stunde)

//var refreshConfirmation = setInterval(function() {
function startBtcRefresh() {
  var refreshBTC = setInterval(function() {
    getBtcConfirm();
    if(unconfirmedBTC > 0) {

      $("#footer").show();
      document.getElementById("confirm").innerHTML = unconfirmedBTC+" / "+btcSum+" BTC erhalten";
      if (unconfirmedBTC >= btcSum) {
        document.getElementById("confirm").innerHTML = "Fertig!";
        confirmationSound.play();
        clearInterval(refreshBTC);
      }
    }
  }, 5000);
}

function startEthRefresh() {
  var refreshETH = setInterval(function() {
    getEthConfirm();
    if((confirmationCountETH < 10 && confirmedETH > 0) || unconfirmedETH > 0) {
      $("#footer").show();
      document.getElementById("confirm").innerHTML = confirmedETH+unconfirmedETH+" / "+ethSum+" ETH erhalten";
      if (confirmedETH >= ethSum) {
        document.getElementById("confirm").innerHTML = "Fertig!";
        confirmationSound.play();
        clearInterval(refreshETH);
      }
    }
  }, 5000);
}

function startDcnRefresh() {
  var refreshDCN = setInterval(function() {
    getDcnConfirm();
    if(confirmationCountDCN < 5) {
      $("#footer").show();
        document.getElementById("confirm").innerHTML = "Fertig!";
        confirmationSound.play();
        clearInterval(refreshDCN);
    }
  }, 5000);
}










// Euro submit via return key

$(document).ready(function() {
    $('#summe').keydown(function(event) {
        if (event.keyCode == 13) {
            $("#submitEuro").click();
            return false;
         }
    });
});


$('input.tel').keyup(function(event) {

  // skip for arrow keys
  if(event.which >= 37 && event.which <= 40) return;

  // format number
  $(this).val(function(index, value) {
    return value
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{2})+(?!\d))/i, ",")
    ;
  });
});
